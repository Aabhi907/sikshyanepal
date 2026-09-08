"""College-first newsroom collector.

Crawls active, verified college websites, discovers recent student-relevant links,
creates an original explanatory brief, and sends every item through the auditable
ingestion queue. Only low-risk announcements may auto-publish. Rankings, awards,
named ranks, results and placement claims always wait for an editor.
"""

import re
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests

from base_scraper import BaseScraper

DISCOVERY_PATHS = ("", "news", "notices", "events", "admission", "blog")
RELEVANT = re.compile(r"admission|apply|deadline|scholarship|result|rank|award|hackathon|competition|event|workshop|seminar|placement|internship|entrance|orientation", re.I)
HIGH_RISK = re.compile(r"\bbest\b|top\s+college|rank(?:ed|ing)?|award|result|score|percent|pass rate|placement|salary|ioe|iom|merit list|topp?er", re.I)
BOT_NAME = "SikshyaNepalBot"


def classify(title: str) -> tuple[str, str]:
    text = title.lower()
    if HIGH_RISK.search(text):
        if "award" in text: return "award", "high"
        if re.search(r"result|rank|ioe|iom|merit|topp?er|score", text): return "entrance_result", "high"
        return "achievement", "high"
    if re.search(r"admission|apply|deadline|entrance|orientation", text): return "admission", "low"
    if "scholarship" in text: return "scholarship", "medium"
    if re.search(r"hackathon|event|workshop|seminar|competition", text): return "event", "low"
    return "college_news", "medium"


def brief(college: str, title: str, category: str, source_url: str) -> str:
    action = {
        "admission": "Students should confirm eligibility, the application deadline, required documents and fees on the official page before applying.",
        "event": "Interested students should check the official page for the date, venue, registration rules and any participation deadline.",
        "scholarship": "Applicants should verify the eligibility criteria, coverage, documents and deadline directly with the college.",
    }.get(category, "Students should read the original announcement for complete details and contact the institution if any point is unclear.")
    return (f"{college} has published an official update titled “{title}”. This SikshyaNepal brief helps +2 and Bachelor students understand that an update is available without reproducing the institution’s wording. "
            f"{action}\n\nSource check: the announcement was found on the college’s official website ({urlparse(source_url).netloc}). Details can change, so use the original source linked below as the final authority.")


class CollegeNewsroomScraper(BaseScraper):
    def __init__(self):
        super().__init__("CollegeNewsroom")
        self._robots: dict[str, RobotFileParser | None] = {}

    def robots_allows(self, url: str) -> bool:
        parsed = urlparse(url)
        origin = f"{parsed.scheme}://{parsed.netloc}"
        if origin not in self._robots:
            parser = RobotFileParser()
            parser.set_url(f"{origin}/robots.txt")
            try:
                response = requests.get(parser.url, timeout=10, headers={"User-Agent": f"{BOT_NAME}/1.0"})
                if response.status_code == 404:
                    self._robots[origin] = None
                else:
                    response.raise_for_status()
                    parser.parse(response.text.splitlines())
                    self._robots[origin] = parser
            except requests.RequestException as error:
                self.logger.info(f"Could not confirm robots rules for {origin}: {error}")
                self._robots[origin] = False  # type: ignore[assignment]
        rules = self._robots[origin]
        return rules is None or bool(rules and rules.can_fetch(BOT_NAME, url))

    @staticmethod
    def page_date(soup) -> datetime | None:
        candidates = []
        for key in ("article:published_time", "datePublished", "date", "publish-date", "pubdate"):
            tag = soup.find("meta", attrs={"property": key}) or soup.find("meta", attrs={"name": key}) or soup.find("meta", attrs={"itemprop": key})
            if tag and tag.get("content"):
                candidates.append(tag["content"])
        for tag in soup.find_all("time", datetime=True, limit=3):
            candidates.append(tag["datetime"])
        for value in candidates:
            raw = str(value).strip().replace("Z", "+00:00")
            try:
                parsed = datetime.fromisoformat(raw)
                return parsed.replace(tzinfo=parsed.tzinfo or timezone.utc).astimezone(timezone.utc)
            except ValueError:
                match = re.search(r"\b(20\d{2})[-/](\d{1,2})[-/](\d{1,2})\b", raw)
                if match:
                    try:
                        return datetime(*(int(part) for part in match.groups()), tzinfo=timezone.utc)
                    except ValueError:
                        pass
        return None

    @staticmethod
    def canonical_url(soup, fallback: str) -> str:
        tag = soup.find("link", rel=lambda value: value and "canonical" in value)
        href = str(tag.get("href") or "").strip() if tag else ""
        candidate = urljoin(fallback, href) if href else fallback
        return candidate if urlparse(candidate).netloc == urlparse(fallback).netloc else fallback

    def scrape(self) -> dict:
        response = self.supabase.table("colleges").select("id,name,slug,website,education_levels,verification_status,status").eq("status", "active").not_.is_("website", "null").limit(200).execute()
        for college in response.data or []:
            if college.get("verification_status") not in ("source_verified", "institution_verified"):
                continue
            website = str(college.get("website") or "").rstrip("/")
            if not website.startswith(("http://", "https://")):
                continue
            source_name = f"{college['name']} official website"
            try:
                self.supabase.table("content_sources").upsert({
                    "name": source_name, "base_url": website, "organization": college["name"],
                    "source_type": "institution", "college_focus": True, "trust_level": 90,
                    "requires_review": False, "auto_publish_low_risk": True, "is_active": True,
                    "permitted_targets": ["news"], "fetch_frequency_minutes": 300,
                    "last_checked_at": datetime.now(timezone.utc).isoformat(),
                }, on_conflict="name").execute()
            except Exception as error:
                self.logger.warning(f"Source setup failed for {college['name']}: {error}")
                continue

            links: dict[str, str] = {}
            for path in DISCOVERY_PATHS:
                page_url = f"{website}/{path}" if path else website
                if not self.robots_allows(page_url):
                    self.logger.info(f"Robots rules disallow: {page_url}")
                    continue
                soup = self.fetch_page(page_url)
                if not soup:
                    continue
                for anchor in soup.find_all("a", href=True):
                    title = re.sub(r"\s+", " ", anchor.get_text(" ", strip=True)).strip()
                    href = urljoin(page_url, anchor["href"])
                    if 12 <= len(title) <= 180 and RELEVANT.search(title) and urlparse(href).netloc == urlparse(website).netloc:
                        links[href.split("#", 1)[0]] = title
                if links:
                    break

            for source_url, source_title in list(links.items())[:8]:
                category, risk = classify(source_title)
                detail = self.fetch_page(source_url) if self.robots_allows(source_url) else None
                published_at = self.page_date(detail) if detail else None
                if detail:
                    source_url = self.canonical_url(detail, source_url)
                now = datetime.now(timezone.utc)
                is_recent = bool(published_at and now - timedelta(days=14) <= published_at <= now + timedelta(days=1))
                quality_flags = []
                if not published_at:
                    quality_flags.append("source_date_missing")
                elif not is_recent:
                    quality_flags.append("source_not_recent")
                if risk == "low" and not is_recent:
                    risk = "medium"
                article_title = f"{college['name']}: {source_title}"
                article = brief(college["name"], source_title, category, source_url)
                levels = college.get("education_levels") or ["plus_two", "bachelor"]
                record = {
                    "title": article_title, "slug": self.slugify_with_date(article_title), "content": article,
                    "source_url": source_url, "published_date": (published_at or now).isoformat(),
                    "content_category": category, "claim_risk": risk, "college_id": college["id"],
                    "education_levels": levels, "generation_version": "college-newsroom-v1",
                    "auto_publish_eligible": risk == "low" and is_recent, "source_name": source_name,
                    "source_type": "institution",
                    "quality_flags": quality_flags,
                }
                self.queue_record("news", record)
        return self.summary()


if __name__ == "__main__":
    CollegeNewsroomScraper().scrape()
