import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone

import httpx
from apscheduler.schedulers.background import BackgroundScheduler

from .database import SessionLocal
from .models import URL, Check

logger = logging.getLogger("uptime.scheduler")

CHECK_TIMEOUT_SECONDS = 5.0
CHECK_INTERVAL_MINUTES = 1
MAX_WORKERS = 10


def _ping_url(url: str):
    """Ping a single URL synchronously.

    Returns (status_code, response_time_ms, is_up). status_code is None
    when the request fails outright (timeout, DNS failure, connection
    refused, etc.) rather than returning an HTTP response.
    """
    start = time.perf_counter()
    try:
        with httpx.Client(timeout=CHECK_TIMEOUT_SECONDS, follow_redirects=True) as client:
            response = client.get(url)
        elapsed_ms = (time.perf_counter() - start) * 1000
        is_up = 200 <= response.status_code < 400
        return response.status_code, round(elapsed_ms, 2), is_up
    except httpx.RequestError as exc:
        elapsed_ms = (time.perf_counter() - start) * 1000
        logger.warning("Check failed for %s: %s", url, exc)
        return None, round(elapsed_ms, 2), False


def run_checks():
    """Fetch all registered URLs, ping them concurrently, and store the results.

    Runs on the scheduler's own thread with its own DB session -- it does
    not share a session with any in-flight HTTP request.
    """
    db = SessionLocal()
    try:
        urls = db.query(URL).all()
        if not urls:
            logger.info("No URLs registered, skipping check cycle")
            return

        results = {}
        with ThreadPoolExecutor(max_workers=min(MAX_WORKERS, len(urls))) as executor:
            future_to_url = {executor.submit(_ping_url, u.url): u for u in urls}
            for future in as_completed(future_to_url):
                url_obj = future_to_url[future]
                results[url_obj.id] = future.result()

        for url_id, (status_code, response_time_ms, is_up) in results.items():
            db.add(
                Check(
                    url_id=url_id,
                    status_code=status_code,
                    response_time_ms=response_time_ms,
                    is_up=is_up,
                )
            )
        db.commit()
        logger.info("Completed check cycle for %d URL(s)", len(urls))
    except Exception:
        logger.exception("Unhandled error during check cycle")
        db.rollback()
    finally:
        db.close()


def create_scheduler() -> BackgroundScheduler:
    """Build (but do not start) the background scheduler.

    The job is scheduled to fire once immediately on startup and then
    every CHECK_INTERVAL_MINUTES thereafter, so the dashboard has data
    within seconds of the stack coming up rather than waiting a full
    interval for the first result.
    """
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(
        run_checks,
        trigger="interval",
        minutes=CHECK_INTERVAL_MINUTES,
        id="ping_all_urls",
        next_run_time=datetime.now(timezone.utc),
        max_instances=1,
        coalesce=True,
    )
    return scheduler