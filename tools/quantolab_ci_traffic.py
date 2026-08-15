#!/usr/bin/env python3
"""Synthetic monitoring/load runner for QuantoLab.

Designed for GitHub Actions. Each hourly invocation deterministically computes
that day's target (30-200 visits), the number assigned to the current hour,
and spreads those visits randomly inside the run window.

Every successful visit must:
  * use a proxy endpoint not already consumed by this synthetic test;
  * exit through a public IP that has not already been used;
  * be geolocated to Brazil according to Cloudflare trace;
  * navigate only inside quantolab.com.br after the IP/country check.

Proxy credentials are never stored in the repository. The workflow writes the
secret-backed CSV to a temporary file and points BR_PROXIES_FILE at it.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import hashlib
import json
import math
import os
import random
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

TARGET_URL = "https://quantolab.com.br/"
ALLOWED_HOSTS = {"quantolab.com.br", "www.quantolab.com.br"}
CLOUDFLARE_TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace"

MIN_DAILY_VISITS = 30
MAX_DAILY_VISITS = 200
BASE_TARGET = 52
BASE_DATE = date(2026, 8, 14)
NORMAL_STEP_STDDEV = 15
SPIKE_PROBABILITY = 0.10
DIP_PROBABILITY = 0.08

NAVIGATION_TIMEOUT_MS = 30_000
MIN_SESSION_SECONDS = 6
MAX_SESSION_SECONDS = 22
MAX_INTERNAL_PAGES = 2
MAX_PROXY_ATTEMPTS_PER_VISIT = 12
DEFAULT_WINDOW_SECONDS = 48 * 60

STATE_DIR = Path(os.getenv("TRAFFIC_STATE_DIR", ".traffic_state"))
STATE_FILE = STATE_DIR / "state.json"
LOG_DIR = Path(os.getenv("TRAFFIC_LOG_DIR", "traffic-logs"))
PROXIES_FILE = Path(os.getenv("BR_PROXIES_FILE", "proxies.csv"))

DESKTOP_VIEWPORTS = [
    {"width": 1366, "height": 768},
    {"width": 1440, "height": 900},
    {"width": 1536, "height": 864},
    {"width": 1920, "height": 1080},
]

MOBILE_VIEWPORTS = [
    {"width": 360, "height": 800},
    {"width": 390, "height": 844},
    {"width": 393, "height": 852},
    {"width": 412, "height": 915},
]


@dataclass(frozen=True)
class ProxyEntry:
    proxy_id: str
    server: str
    username: str = ""
    password: str = ""
    city: str = ""
    state: str = ""

    def playwright_proxy(self) -> dict[str, str]:
        data = {"server": self.server}
        if self.username:
            data["username"] = self.username
        if self.password:
            data["password"] = self.password
        return data


def clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def stable_seed(text: str) -> int:
    return int.from_bytes(hashlib.sha256(text.encode("utf-8")).digest()[:8], "big")


def daily_target(day: date) -> int:
    if day <= BASE_DATE:
        return BASE_TARGET

    target = BASE_TARGET
    cursor = BASE_DATE + timedelta(days=1)
    while cursor <= day:
        rng = random.Random(stable_seed(f"quantolab-target:{cursor.isoformat()}"))
        roll = rng.random()
        if roll < SPIKE_PROBABILITY:
            target = rng.randint(max(100, target), MAX_DAILY_VISITS)
        elif roll < SPIKE_PROBABILITY + DIP_PROBABILITY:
            target = rng.randint(MIN_DAILY_VISITS, min(55, MAX_DAILY_VISITS))
        else:
            step = round(rng.gauss(0, NORMAL_STEP_STDDEV))
            target = clamp(target + step, MIN_DAILY_VISITS, MAX_DAILY_VISITS)
        cursor += timedelta(days=1)
    return target


def hourly_plan(day: date, target: int) -> list[int]:
    rng = random.Random(stable_seed(f"quantolab-hours:{day.isoformat()}:{target}"))
    curve = [
        0.25, 0.20, 0.17, 0.15, 0.16, 0.22,
        0.40, 0.65, 0.85, 1.00, 1.08, 1.12,
        1.05, 1.00, 1.06, 1.10, 1.12, 1.15,
        1.18, 1.12, 0.95, 0.78, 0.58, 0.40,
    ]
    weights = [max(0.02, base * rng.uniform(0.60, 1.45)) for base in curve]
    counts = [0] * 24
    for _ in range(target):
        hour = rng.choices(range(24), weights=weights, k=1)[0]
        counts[hour] += 1
    return counts


def load_state() -> dict:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        return {"used_ips": [], "used_proxy_ids": []}
    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        return {
            "used_ips": list(data.get("used_ips", [])),
            "used_proxy_ids": list(data.get("used_proxy_ids", [])),
        }
    except Exception:
        return {"used_ips": [], "used_proxy_ids": []}


def save_state(used_ips: set[str], used_proxy_ids: set[str]) -> None:
    STATE_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(
        json.dumps(
            {
                "updated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
                "used_ips": sorted(used_ips),
                "used_proxy_ids": sorted(used_proxy_ids),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def load_proxies() -> list[ProxyEntry]:
    if not PROXIES_FILE.exists():
        raise SystemExit(f"Proxy file not found: {PROXIES_FILE}")

    proxies: list[ProxyEntry] = []
    with PROXIES_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not {"id", "server"}.issubset(set(reader.fieldnames or [])):
            raise SystemExit("Proxy CSV must contain at least: id,server")
        for row in reader:
            server = (row.get("server") or "").strip()
            if not server:
                continue
            proxies.append(
                ProxyEntry(
                    proxy_id=(row.get("id") or f"proxy-{len(proxies)+1}").strip(),
                    server=server,
                    username=(row.get("username") or "").strip(),
                    password=(row.get("password") or "").strip(),
                    city=(row.get("city") or "").strip(),
                    state=(row.get("state") or "").strip(),
                )
            )
    if not proxies:
        raise SystemExit("Proxy CSV has no usable endpoints")
    return proxies


def parse_trace(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in text.splitlines():
        if "=" in line:
            key, value = line.split("=", 1)
            result[key.strip()] = value.strip()
    return result


def is_internal(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in {"http", "https"} and parsed.hostname in ALLOWED_HOSTS
    except Exception:
        return False


def run_log_file() -> Path:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().astimezone().strftime("%Y%m%d-%H%M%S")
    run_id = os.getenv("GITHUB_RUN_ID", "local")
    return LOG_DIR / f"visits-{stamp}-{run_id}.csv"


def append_log(path: Path, row: dict) -> None:
    fields = [
        "timestamp", "public_ip", "country", "proxy_id", "proxy_city", "proxy_state",
        "device", "start_url", "final_url", "internal_pages", "duration_s", "status", "error",
    ]
    exists = path.exists()
    with path.open("a", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        if not exists:
            writer.writeheader()
        writer.writerow({field: row.get(field, "") for field in fields})


async def discover_exit(page) -> tuple[str, str]:
    await page.goto(CLOUDFLARE_TRACE_URL, wait_until="domcontentloaded", timeout=NAVIGATION_TIMEOUT_MS)
    trace = parse_trace(await page.locator("body").inner_text())
    ip = trace.get("ip", "").strip()
    country = trace.get("loc", "").strip().upper()
    if not ip:
        raise RuntimeError("Cloudflare trace did not return an exit IP")
    return ip, country


async def choose_internal_url(page) -> str | None:
    links = page.locator("a[href]")
    count = min(await links.count(), 100)
    urls: list[str] = []
    for i in range(count):
        try:
            url = await links.nth(i).evaluate("a => a.href")
            if is_internal(url) and url.rstrip("/") != page.url.rstrip("/"):
                urls.append(url)
        except Exception:
            continue
    urls = list(dict.fromkeys(urls))
    return random.choice(urls) if urls else None


async def visit_once(playwright, proxy: ProxyEntry, used_ips: set[str], log_path: Path) -> tuple[bool, str | None]:
    started = time.monotonic()
    browser = None
    context = None
    public_ip = ""
    country = ""
    final_url = ""
    internal_pages = 0
    device = random.choice(["desktop", "desktop", "mobile"])

    try:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(
            proxy=proxy.playwright_proxy(),
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
            viewport=random.choice(MOBILE_VIEWPORTS if device == "mobile" else DESKTOP_VIEWPORTS),
            is_mobile=device == "mobile",
            has_touch=device == "mobile",
            extra_http_headers={"X-QuantoLab-Synthetic-Test": "monitoring-v1"},
        )
        page = await context.new_page()
        page.set_default_navigation_timeout(NAVIGATION_TIMEOUT_MS)

        public_ip, country = await discover_exit(page)
        if country != "BR":
            raise RuntimeError(f"Proxy exit is not in Brazil (country={country or 'unknown'})")
        if public_ip in used_ips:
            return False, public_ip

        response = await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=NAVIGATION_TIMEOUT_MS)
        if response is None or response.status >= 500:
            raise RuntimeError(f"QuantoLab returned invalid status: {getattr(response, 'status', 'none')}")

        await asyncio.sleep(random.uniform(1.0, 3.5))
        await page.mouse.wheel(0, random.randint(250, 1300))

        for _ in range(random.randint(0, MAX_INTERNAL_PAGES)):
            next_url = await choose_internal_url(page)
            if not next_url:
                break
            try:
                await page.goto(next_url, wait_until="domcontentloaded", timeout=NAVIGATION_TIMEOUT_MS)
                internal_pages += 1
                await asyncio.sleep(random.uniform(1.0, 3.5))
                await page.mouse.wheel(0, random.randint(200, 1000))
            except PlaywrightTimeoutError:
                break

        desired_duration = random.uniform(MIN_SESSION_SECONDS, MAX_SESSION_SECONDS)
        remaining = desired_duration - (time.monotonic() - started)
        if remaining > 0:
            await asyncio.sleep(remaining)

        final_url = page.url
        append_log(log_path, {
            "timestamp": datetime.now().astimezone().isoformat(timespec="seconds"),
            "public_ip": public_ip,
            "country": country,
            "proxy_id": proxy.proxy_id,
            "proxy_city": proxy.city,
            "proxy_state": proxy.state,
            "device": device,
            "start_url": TARGET_URL,
            "final_url": final_url,
            "internal_pages": internal_pages,
            "duration_s": round(time.monotonic() - started, 2),
            "status": "OK",
            "error": "",
        })
        return True, public_ip

    except Exception as exc:
        append_log(log_path, {
            "timestamp": datetime.now().astimezone().isoformat(timespec="seconds"),
            "public_ip": public_ip,
            "country": country,
            "proxy_id": proxy.proxy_id,
            "proxy_city": proxy.city,
            "proxy_state": proxy.state,
            "device": device,
            "start_url": TARGET_URL,
            "final_url": final_url,
            "internal_pages": internal_pages,
            "duration_s": round(time.monotonic() - started, 2),
            "status": "ERRO",
            "error": repr(exc),
        })
        return False, public_ip or None
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()


async def execute_visit(playwright, proxies: list[ProxyEntry], used_ips: set[str], used_proxy_ids: set[str], log_path: Path) -> bool:
    candidates = [p for p in proxies if p.proxy_id not in used_proxy_ids]
    random.shuffle(candidates)
    if not candidates:
        print("::warning::Proxy pool exhausted; no unused endpoints remain.")
        return False

    for proxy in candidates[:MAX_PROXY_ATTEMPTS_PER_VISIT]:
        ok, public_ip = await visit_once(playwright, proxy, used_ips, log_path)
        used_proxy_ids.add(proxy.proxy_id)
        if ok and public_ip:
            used_ips.add(public_ip)
            save_state(used_ips, used_proxy_ids)
            print(f"OK proxy={proxy.proxy_id} ip={public_ip}")
            return True
        if public_ip and public_ip in used_ips:
            print(f"Duplicate IP rejected: proxy={proxy.proxy_id} ip={public_ip}")
        else:
            print(f"Proxy rejected/failed: {proxy.proxy_id}")
        save_state(used_ips, used_proxy_ids)

    return False


async def run(visits: int, window_seconds: int) -> int:
    proxies = load_proxies()
    state = load_state()
    used_ips = set(state["used_ips"])
    used_proxy_ids = set(state["used_proxy_ids"])
    log_path = run_log_file()

    if visits <= 0:
        print("No visits assigned to this run.")
        save_state(used_ips, used_proxy_ids)
        return 0

    available = len([p for p in proxies if p.proxy_id not in used_proxy_ids])
    if available < visits:
        print(f"::warning::Only {available} unused proxy endpoints remain for {visits} assigned visits.")

    rng = random.Random(stable_seed(f"run:{datetime.now().astimezone().date()}:{datetime.now().astimezone().hour}:{os.getenv('GITHUB_RUN_ID', 'local')}"))
    if visits == 1:
        offsets = [rng.randint(0, min(window_seconds, 15 * 60))]
    else:
        offsets = sorted(rng.randint(0, max(1, window_seconds)) for _ in range(visits))

    started = time.monotonic()
    successes = 0
    async with async_playwright() as playwright:
        for index, offset in enumerate(offsets, 1):
            delay = offset - (time.monotonic() - started)
            if delay > 0:
                print(f"Visit {index}/{visits} scheduled in {math.ceil(delay)}s")
                await asyncio.sleep(delay)
            if await execute_visit(playwright, proxies, used_ips, used_proxy_ids, log_path):
                successes += 1
            else:
                print("::warning::Could not obtain a new Brazilian IP for this assigned visit.")

    print(f"Run complete: {successes}/{visits} successful synthetic visits")
    return 0 if successes == visits else 2


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force-visits", type=int, default=None)
    parser.add_argument("--window-seconds", type=int, default=DEFAULT_WINDOW_SECONDS)
    parser.add_argument("--show-plan", action="store_true")
    args = parser.parse_args()

    now = datetime.now().astimezone()
    target = daily_target(now.date())
    plan = hourly_plan(now.date(), target)
    visits = args.force_visits if args.force_visits is not None else plan[now.hour]

    print(f"QuantoLab synthetic monitoring | date={now.date()} target={target} hour={now.hour:02d} assigned={visits}")
    if args.show_plan:
        print("Hourly plan:", ",".join(f"{h:02d}:{count}" for h, count in enumerate(plan)))
        return 0

    return asyncio.run(run(max(0, visits), max(0, args.window_seconds)))


if __name__ == "__main__":
    raise SystemExit(main())
