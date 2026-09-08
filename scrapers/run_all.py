"""
SikshyaNepal — Run All Scrapers
Executes every scraper in sequence, collects totals,
triggers a Vercel redeploy if new records were inserted,
and optionally posts to Facebook if credentials are set.

Exit code: 0 = success (even if some scrapers had errors)
           1 = all scrapers failed
"""

import os
import sys
import logging
import requests
from dotenv import load_dotenv

# Allow running from any directory
sys.path.insert(0, os.path.dirname(__file__))

from tu_results import TUResultsScraper
from ku_results import KUResultsScraper
from pu_results import PUResultsScraper
from pou_notices import POUNoticesScraper
from ctevt_notices import CTEVTNoticesScraper
from tu_notices import TUNoticesScraper
from neb_notices import NEBNoticesScraper
from college_scraper import CollegeScraper
from college_newsroom import CollegeNewsroomScraper

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("RunAll")


def notify_subscribers(new_results: list[dict]) -> None:
    """
    POST newly inserted result records to the notify-subscribers API endpoint.
    Silently skips if SIKSHYANEPAL_URL or NOTIFICATION_SECRET are not set,
    or if there are no new results.
    """
    site_url = os.getenv("SIKSHYANEPAL_URL")
    secret   = os.getenv("NOTIFICATION_SECRET")
    if not site_url or not secret:
        logger.info("SIKSHYANEPAL_URL / NOTIFICATION_SECRET not set — skipping email notification")
        return
    if not new_results:
        logger.info("No new results — skipping email notification")
        return
    try:
        resp = requests.post(
            f"{site_url}/api/notify-subscribers",
            json={"results": new_results, "secret": secret},
            timeout=30,
        )
        if resp.status_code == 200:
            data = resp.json()
            logger.info(f"Email notifications sent: {data.get('sent', 0)}, errors: {data.get('errors', 0)}")
        else:
            logger.warning(f"notify-subscribers returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Email notification failed: {e}")


def trigger_vercel_deploy(total_inserted: int) -> None:
    hook_url = os.getenv("VERCEL_DEPLOY_HOOK_URL")
    if not hook_url:
        logger.info("VERCEL_DEPLOY_HOOK_URL not set — skipping redeploy trigger")
        return
    if total_inserted == 0:
        logger.info("No new records — skipping Vercel redeploy")
        return
    try:
        resp = requests.post(hook_url, timeout=10)
        if resp.status_code == 201:
            logger.info(f"Vercel deploy triggered ({total_inserted} new records)")
        else:
            logger.warning(f"Vercel deploy returned {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Vercel deploy trigger failed: {e}")


def post_to_facebook(message: str, link: str) -> None:
    """
    Post a message to the configured Facebook Page.
    Silently skips if FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN are not set.
    Never raises — failures are logged as warnings only.
    """
    page_id    = os.getenv("FB_PAGE_ID")
    page_token = os.getenv("FB_PAGE_ACCESS_TOKEN")
    if not page_id or not page_token:
        return
    try:
        resp = requests.post(
            f"https://graph.facebook.com/v19.0/{page_id}/feed",
            data={
                "message":      message,
                "link":         link,
                "access_token": page_token,
            },
            timeout=15,
        )
        if resp.status_code == 200:
            logger.info(f"Facebook post published: {message[:60]}")
        else:
            logger.warning(f"Facebook post failed ({resp.status_code}): {resp.text[:200]}")
    except Exception as e:
        logger.warning(f"Facebook post error: {e}")


def run() -> int:
    # Order: TU results → KU → PU → POU notices → CTEVT → TU notices → NEB
    scrapers = [
        ("College Newsroom", CollegeNewsroomScraper),
        ("TU Results",    TUResultsScraper),
        ("KU Results",    KUResultsScraper),
        ("PU Results",    PUResultsScraper),
        ("POU Notices",   POUNoticesScraper),
        ("CTEVT Notices", CTEVTNoticesScraper),
        ("TU Notices",    TUNoticesScraper),
        ("NEB Notices",   NEBNoticesScraper),
        # College scraper runs last — inserts go to pending_review, not live
        ("Colleges",      CollegeScraper),
    ]

    totals = {"inserted": 0, "skipped": 0, "errors": 0}
    failed_scrapers  = []
    per_scraper: list[tuple[str, dict]] = []
    new_result_records: list[dict] = []  # accumulate inserted result rows for email

    for label, ScraperClass in scrapers:
        logger.info(f"{'=' * 50}")
        logger.info(f"Starting: {label}")
        logger.info(f"{'=' * 50}")
        try:
            result = ScraperClass().scrape()
            totals["inserted"] += result.get("inserted", 0)
            totals["skipped"]  += result.get("skipped", 0)
            totals["errors"]   += result.get("errors", 0)
            per_scraper.append((label, result))
            # Collect new result records if the scraper returns them
            # Convention: scrape() may return {"inserted": N, "new_records": [...]}
            if "results" in label.lower() and result.get("new_records"):
                new_result_records.extend(result["new_records"])
        except Exception as e:
            logger.error(f"{label} scraper crashed entirely: {e}")
            failed_scrapers.append(label)
            per_scraper.append((label, {"inserted": 0, "skipped": 0, "errors": 1}))

    # Per-university summary
    logger.info("")
    logger.info("=" * 50)
    logger.info("PER-SCRAPER SUMMARY")
    logger.info(f"  {'Scraper':<20} {'New':>6}  {'Skipped':>8}  {'Errors':>7}")
    logger.info(f"  {'-'*20} {'-'*6}  {'-'*8}  {'-'*7}")
    for label, res in per_scraper:
        status = "CRASHED" if label in failed_scrapers else ""
        logger.info(
            f"  {label:<20} {res.get('inserted',0):>6}  "
            f"{res.get('skipped',0):>8}  {res.get('errors',0):>7}  {status}"
        )

    # Grand totals
    logger.info("")
    logger.info("SCRAPER RUN COMPLETE")
    logger.info(f"  New records inserted : {totals['inserted']}")
    logger.info(f"  Duplicates skipped   : {totals['skipped']}")
    logger.info(f"  Record-level errors  : {totals['errors']}")
    if failed_scrapers:
        logger.warning(f"  Scrapers that crashed: {', '.join(failed_scrapers)}")
    logger.info("=" * 50)

    trigger_vercel_deploy(totals["inserted"])

    # Email subscribers about new results
    notify_subscribers(new_result_records)

    # Facebook summary post (only when new records inserted)
    if totals["inserted"] > 0:
        post_to_facebook(
            message=(
                f"📢 {totals['inserted']} new update{'s' if totals['inserted'] > 1 else ''} just published on SikshyaNepal!\n"
                "Check the latest results and notices 👉"
            ),
            link="https://sikshyanepal.vercel.app",
        )

    # Exit 1 only if every single scraper crashed
    if len(failed_scrapers) == len(scrapers):
        logger.error("All scrapers failed")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(run())
