#!/usr/bin/env python3
from __future__ import annotations

import asyncio
import csv
import os
import random
import time
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from playwright.async_api import async_playwright

TARGET_URL = "https://quantolab.com.br/"
ALLOWED_HOSTS = {"quantolab.com.br", "www.quantolab.com.br"}
TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace"
TZ = ZoneInfo("America/Sao_Paulo")
END_AT = datetime(2026, 8, 18, 20, 0, tzinfo=TZ)
TOTAL_CLICKS = 900
CLICKS_PER_SESSION = 15
SESSIONS = TOTAL_CLICKS // CLICKS_PER_SESSION
MAX_CONCURRENCY = 3
PROXY_FILE = Path(os.getenv("BR_PROXIES_FILE", "/tmp/quantolab-br-proxies.csv"))
LOG_DIR = Path(os.getenv("STRESS_LOG_DIR", "stress-logs"))


@dataclass(frozen=True)
class Proxy:
    proxy_id: str
    server: str
    username: str = ""
    password: str = ""

    def as_playwright(self):
        p = {"server": self.server}
        if self.username:
            p["username"] = self.username
        if self.password:
            p["password"] = self.password
        return p


def load_proxies() -> list[Proxy]:
    with PROXY_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.DictReader(f))
    proxies = [
        Proxy(
            proxy_id=(r.get("id") or f"proxy-{i+1}").strip(),
            server=(r.get("server") or "").strip(),
            username=(r.get("username") or "").strip(),
            password=(r.get("password") or "").strip(),
        )
        for i, r in enumerate(rows)
        if (r.get("server") or "").strip()
    ]
    if len(proxies) < SESSIONS:
        raise SystemExit(f"Need at least {SESSIONS} proxy endpoints for {SESSIONS} distinct sessions; found {len(proxies)}")
    random.shuffle(proxies)
    return proxies


def parse_trace(text: str) -> dict[str, str]:
    out = {}
    for line in text.splitlines():
        if "=" in line:
            k, v = line.split("=", 1)
            out[k.strip()] = v.strip()
    return out


def is_allowed(url: str) -> bool:
    try:
        return urlparse(url).hostname in ALLOWED_HOSTS
    except Exception:
        return False


def log_writer(path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    exists = path.exists()
    f = path.open("a", encoding="utf-8", newline="")
    fields = ["timestamp", "session", "click", "ip", "proxy_id", "kind", "label", "before", "after", "status"]
    writer = csv.DictWriter(f, fieldnames=fields)
    if not exists:
        writer.writeheader()
    return f, writer


async def verify_exit(page) -> tuple[str, str]:
    await page.goto(TRACE_URL, wait_until="domcontentloaded", timeout=30000)
    trace = parse_trace(await page.locator("body").inner_text())
    return trace.get("ip", ""), trace.get("loc", "").upper()


async def safe_candidates(page):
    return await page.locator("a[href], button").evaluate_all("""
els => els.map((el, i) => {
  const r = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  if (r.width < 2 || r.height < 2 || style.visibility === 'hidden' || style.display === 'none') return null;
  if (el.closest('iframe, ins.adsbygoogle, [data-ad-client], [data-ad-slot], [class*="advert" i], [id*="advert" i], [class*="ads" i], [id*="ads" i]')) return null;
  const tag = el.tagName.toLowerCase();
  if (tag === 'a') {
    try {
      const u = new URL(el.href, location.href);
      if (!['quantolab.com.br', 'www.quantolab.com.br'].includes(u.hostname)) return null;
      if (!['http:', 'https:'].includes(u.protocol)) return null;
    } catch (_) { return null; }
  }
  if (tag === 'button' && (el.type || '').toLowerCase() === 'submit') return null;
  return {i, tag, text: (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 80)};
}).filter(Boolean)
""")


async def perform_safe_click(page) -> tuple[str, str, str, str]:
    for _ in range(6):
        candidates = await safe_candidates(page)
        if not candidates:
            await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30000)
            continue
        chosen = random.choice(candidates)
        locator = page.locator("a[href], button").nth(chosen["i"])
        before = page.url
        try:
            await locator.click(timeout=5000)
            await asyncio.sleep(random.uniform(0.15, 0.55))
            after = page.url
            if after and not is_allowed(after):
                await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30000)
                after = page.url
            return chosen["tag"], chosen["text"], before, after
        except Exception:
            try:
                await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30000)
            except Exception:
                pass
    raise RuntimeError("No safe internal clickable element available")


async def run_session(session_no: int, proxy: Proxy, offset_s: float, used_ips: set[str], ip_lock: asyncio.Lock, sem: asyncio.Semaphore, log_path: Path):
    await asyncio.sleep(max(0, offset_s))
    async with sem:
        if datetime.now(TZ) >= END_AT:
            return 0
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            context = await browser.new_context(
                proxy=proxy.as_playwright(),
                locale="pt-BR",
                timezone_id="America/Sao_Paulo",
                viewport=random.choice([
                    {"width": 1366, "height": 768}, {"width": 1440, "height": 900},
                    {"width": 390, "height": 844}, {"width": 412, "height": 915}
                ]),
                extra_http_headers={"X-QuantoLab-Synthetic-Test": "stress-900-until-2000"},
            )
            page = await context.new_page()
            ip, country = await verify_exit(page)
            async with ip_lock:
                if country != "BR" or not ip or ip in used_ips:
                    await browser.close()
                    return 0
                used_ips.add(ip)
            await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=30000)
            f, writer = log_writer(log_path)
            clicks = 0
            try:
                for click_no in range(1, CLICKS_PER_SESSION + 1):
                    if datetime.now(TZ) >= END_AT:
                        break
                    kind, label, before, after = await perform_safe_click(page)
                    writer.writerow({
                        "timestamp": datetime.now(TZ).isoformat(timespec="seconds"),
                        "session": session_no,
                        "click": click_no,
                        "ip": ip,
                        "proxy_id": proxy.proxy_id,
                        "kind": kind,
                        "label": label,
                        "before": before,
                        "after": after,
                        "status": "OK",
                    })
                    f.flush()
                    clicks += 1
            finally:
                f.close()
                await browser.close()
            return clicks


async def main_async() -> int:
    now = datetime.now(TZ)
    if now >= END_AT:
        print("Stress window already closed; no clicks generated.")
        return 0

    proxies = load_proxies()
    remaining = max(60, int((END_AT - now).total_seconds()) - 90)
    rng = random.Random(f"quantolab-stress-900:{now.date().isoformat()}")
    offsets = sorted(rng.uniform(1, remaining) for _ in range(SESSIONS))
    sem = asyncio.Semaphore(MAX_CONCURRENCY)
    ip_lock = asyncio.Lock()
    used_ips: set[str] = set()
    log_path = LOG_DIR / f"stress-900-{now.strftime('%Y%m%d-%H%M%S')}.csv"

    print(f"Starting {SESSIONS} distinct sessions x {CLICKS_PER_SESSION} safe internal clicks = {TOTAL_CLICKS} target clicks")
    print(f"Window: {now.isoformat(timespec='seconds')} -> {END_AT.isoformat(timespec='seconds')}")

    tasks = [
        asyncio.create_task(run_session(i + 1, proxies[i], offsets[i], used_ips, ip_lock, sem, log_path))
        for i in range(SESSIONS)
    ]
    results = await asyncio.gather(*tasks)
    total = sum(results)
    print(f"Completed safe internal clicks: {total}/{TOTAL_CLICKS}")
    print(f"Distinct Brazilian session IPs accepted: {len(used_ips)}")
    return 0 if total == TOTAL_CLICKS else 2


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main_async()))
