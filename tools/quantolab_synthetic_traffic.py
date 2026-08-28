#!/usr/bin/env python3
"""Controlled synthetic traffic for QuantoLab monitoring tests.

Each successful access uses a fresh browser context and must leave through a
Brazilian public IP not previously recorded by this test state. Advertising
networks are blocked so synthetic traffic does not create ad impressions or
clicks.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import json
import os
import random
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from playwright.async_api import async_playwright

TARGET_URL = "https://quantolab.com.br/"
ALLOWED_HOSTS = {"quantolab.com.br", "www.quantolab.com.br"}
TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace"
TZ = ZoneInfo("America/Sao_Paulo")

STATE_DIR = Path(os.getenv("TRAFFIC_STATE_DIR", ".traffic_state"))
STATE_FILE = STATE_DIR / "state.json"
LOG_DIR = Path(os.getenv("TRAFFIC_LOG_DIR", "traffic-logs"))
PROXIES_FILE = Path(os.getenv("BR_PROXIES_FILE", "/tmp/quantolab-br-proxies.csv"))

MAX_CONCURRENCY = 4
MAX_PROXY_ATTEMPTS_PER_VISIT = 15
NAV_TIMEOUT_MS = 30_000

AD_HOST_FRAGMENTS = (
    "doubleclick.net",
    "googlesyndication.com",
    "googleadservices.com",
    "adservice.google.",
    "amazon-adsystem.com",
    "taboola.com",
    "outbrain.com",
    "criteo.com",
    "criteo.net",
    "adnxs.com",
    "adsrvr.org",
    "pubmatic.com",
    "rubiconproject.com",
    "openx.net",
)

DEVICE_PROFILES = [
    {
        "viewport": {"width": 1366, "height": 768},
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "is_mobile": False,
        "has_touch": False,
    },
    {
        "viewport": {"width": 1440, "height": 900},
        "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "is_mobile": False,
        "has_touch": False,
    },
    {
        "viewport": {"width": 390, "height": 844},
        "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1",
        "is_mobile": True,
        "has_touch": True,
    },
    {
        "viewport": {"width": 412, "height": 915},
        "user_agent": "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        "is_mobile": True,
        "has_touch": True,
    },
]


@dataclass(frozen=True)
class ProxyEntry:
    proxy_id: str
    server: str
    username: str = ""
    password: str = ""

    def playwright_proxy(self) -> dict[str, str]:
        value = {"server": self.server}
        if self.username:
            value["username"] = self.username
        if self.password:
            value["password"] = self.password
        return value


def load_proxies() -> list[ProxyEntry]:
    if not PROXIES_FILE.exists():
        raise SystemExit(f"Brazil proxy CSV not found: {PROXIES_FILE}")
    with PROXIES_FILE.open("r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))
    proxies: list[ProxyEntry] = []
    for index, row in enumerate(rows, start=1):
        server = (row.get("server") or "").strip()
        if not server:
            continue
        proxies.append(
            ProxyEntry(
                proxy_id=(row.get("id") or f"proxy-{index}").strip(),
                server=server,
                username=(row.get("username") or "").strip(),
                password=(row.get("password") or "").strip(),
            )
        )
    if not proxies:
        raise SystemExit("No usable proxy endpoints found in BR proxy CSV")
    return proxies


def load_used_ips() -> set[str]:
    if not STATE_FILE.exists():
        return set()
    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return {str(value) for value in data.get("used_ips", []) if value}
    except Exception:
        return set()


def save_used_ips(used_ips: set[str]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    temp = STATE_FILE.with_suffix(".tmp")
    temp.write_text(
        json.dumps(
            {
                "updated_at": datetime.now(TZ).isoformat(timespec="seconds"),
                "used_ips": sorted(used_ips),
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    temp.replace(STATE_FILE)


def parse_trace(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in text.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            result[key.strip()] = value.strip()
    return result


def allowed_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in {"http", "https"} and parsed.hostname in ALLOWED_HOSTS
    except Exception:
        return False


def init_log(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as file:
        csv.DictWriter(
            file,
            fieldnames=[
                "timestamp",
                "visit",
                "daily_target",
                "ip",
                "proxy_id",
                "device",
                "pages",
                "duration_ms",
                "status",
                "error",
            ],
        ).writeheader()


async def append_log(path: Path, lock: asyncio.Lock, row: dict[str, object]) -> None:
    async with lock:
        with path.open("a", encoding="utf-8", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=list(row.keys()))
            writer.writerow(row)


async def install_ad_blocking(context) -> None:
    async def handler(route):
        host = (urlparse(route.request.url).hostname or "").lower()
        if any(fragment in host for fragment in AD_HOST_FRAGMENTS):
            await route.abort()
        else:
            await route.continue_()

    await context.route("**/*", handler)


async def internal_links(page) -> list[str]:
    links = await page.locator("a[href]").evaluate_all(
        """
        els => els.map(el => el.href).filter(Boolean)
        """
    )
    unique: list[str] = []
    seen: set[str] = set()
    for link in links:
        if not isinstance(link, str) or not allowed_url(link):
            continue
        clean = link.split("#", 1)[0]
        if clean and clean not in seen and clean != page.url:
            seen.add(clean)
            unique.append(clean)
    return unique


async def verify_brazilian_exit(page) -> tuple[str, str]:
    await page.goto(TRACE_URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS)
    trace = parse_trace(await page.locator("body").inner_text())
    return trace.get("ip", ""), trace.get("loc", "").upper()


async def run_one_visit(
    browser,
    visit_no: int,
    daily_target: int,
    delay_seconds: float,
    proxies: list[ProxyEntry],
    used_ips: set[str],
    state_lock: asyncio.Lock,
    log_lock: asyncio.Lock,
    log_path: Path,
    semaphore: asyncio.Semaphore,
    rng_seed: str,
) -> bool:
    await asyncio.sleep(max(0.0, delay_seconds))
    rng = random.Random(f"{rng_seed}:{visit_no}")

    async with semaphore:
        last_error = "No unique Brazilian exit IP available"
        for _ in range(MAX_PROXY_ATTEMPTS_PER_VISIT):
            proxy = rng.choice(proxies)
            profile = rng.choice(DEVICE_PROFILES)
            context = None
            started = datetime.now(TZ)
            ip = ""
            try:
                context = await browser.new_context(
                    proxy=proxy.playwright_proxy(),
                    locale="pt-BR",
                    timezone_id="America/Sao_Paulo",
                    viewport=profile["viewport"],
                    user_agent=profile["user_agent"],
                    is_mobile=profile["is_mobile"],
                    has_touch=profile["has_touch"],
                )
                page = await context.new_page()
                ip, country = await verify_brazilian_exit(page)
                if country != "BR" or not ip:
                    last_error = f"Proxy exit rejected: country={country or 'unknown'} ip={ip or 'unknown'}"
                    await context.close()
                    continue

                async with state_lock:
                    if ip in used_ips:
                        last_error = f"Duplicate public IP rejected: {ip}"
                        await context.close()
                        continue
                    used_ips.add(ip)
                    save_used_ips(used_ips)

                await install_ad_blocking(context)
                await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS)
                pages = [page.url]

                await page.evaluate("window.scrollTo(0, Math.floor(document.body.scrollHeight * 0.45))")
                await asyncio.sleep(rng.uniform(0.8, 2.2))

                links = await internal_links(page)
                if links and rng.random() < 0.85:
                    next_url = rng.choice(links)
                    await page.goto(next_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS)
                    pages.append(page.url)
                    await asyncio.sleep(rng.uniform(0.8, 2.5))

                    second_links = await internal_links(page)
                    if second_links and rng.random() < 0.35:
                        second_url = rng.choice(second_links)
                        if second_url not in pages:
                            await page.goto(second_url, wait_until="domcontentloaded", timeout=NAV_TIMEOUT_MS)
                            pages.append(page.url)

                duration_ms = int((datetime.now(TZ) - started).total_seconds() * 1000)
                await append_log(
                    log_path,
                    log_lock,
                    {
                        "timestamp": datetime.now(TZ).isoformat(timespec="seconds"),
                        "visit": visit_no,
                        "daily_target": daily_target,
                        "ip": ip,
                        "proxy_id": proxy.proxy_id,
                        "device": "mobile" if profile["is_mobile"] else "desktop",
                        "pages": " | ".join(pages),
                        "duration_ms": duration_ms,
                        "status": "OK",
                        "error": "",
                    },
                )
                await context.close()
                return True
            except Exception as exc:
                last_error = str(exc)[:300]
                if context is not None:
                    try:
                        await context.close()
                    except Exception:
                        pass

        await append_log(
            log_path,
            log_lock,
            {
                "timestamp": datetime.now(TZ).isoformat(timespec="seconds"),
                "visit": visit_no,
                "daily_target": daily_target,
                "ip": ip,
                "proxy_id": "",
                "device": "",
                "pages": "",
                "duration_ms": 0,
                "status": "FAILED",
                "error": last_error,
            },
        )
        return False


async def main_async(args: argparse.Namespace) -> int:
    if args.visits <= 0:
        print("No visits assigned to this run.")
        return 0

    proxies = load_proxies()
    used_ips = load_used_ips()
    state_lock = asyncio.Lock()
    log_lock = asyncio.Lock()
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)

    run_id = os.getenv("GITHUB_RUN_ID", datetime.now(TZ).strftime("%Y%m%d%H%M%S"))
    rng_seed = f"quantolab:{datetime.now(TZ).date().isoformat()}:{datetime.now(TZ).hour}:{run_id}"
    rng = random.Random(rng_seed)
    window = max(1, args.window_seconds)
    offsets = sorted(rng.uniform(0, window) for _ in range(args.visits))

    log_path = LOG_DIR / f"traffic-{datetime.now(TZ).strftime('%Y%m%d-%H%M%S')}-{run_id}.csv"
    init_log(log_path)

    print(f"Hourly assigned visits: {args.visits}")
    print(f"Daily target: {args.daily_target}")
    print(f"Brazil proxy endpoints available: {len(proxies)}")
    print(f"Previously used public IPs: {len(used_ips)}")
    print(f"Distribution window: {window}s")

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        try:
            tasks = [
                asyncio.create_task(
                    run_one_visit(
                        browser,
                        index + 1,
                        args.daily_target,
                        offsets[index],
                        proxies,
                        used_ips,
                        state_lock,
                        log_lock,
                        log_path,
                        semaphore,
                        rng_seed,
                    )
                )
                for index in range(args.visits)
            ]
            results = await asyncio.gather(*tasks)
        finally:
            await browser.close()

    successes = sum(1 for result in results if result)
    print(f"Successful synthetic accesses: {successes}/{args.visits}")
    print(f"Total unique public IPs recorded by test: {len(used_ips)}")
    return 0 if successes == args.visits else 2


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--visits", type=int, required=True)
    parser.add_argument("--window-seconds", type=int, default=2400)
    parser.add_argument("--daily-target", type=int, required=True)
    return parser.parse_args()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main_async(parse_args())))
