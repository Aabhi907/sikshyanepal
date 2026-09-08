"""College-first newsroom collector.

Crawls active, verified college websites, discovers recent student-relevant links,
creates an original explanatory brief, and sends every item through the auditable
ingestion queue. Only low-risk announcements may auto-publish. Rankings, awards,
named ranks, results and placement claims always wait for an editor.
"""

import re
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

from base_scraper import BaseScraper

DISCOVERY_PATHS = ("", "news", "notices", "events", "admission", "blog")
RELEVANT = re.compile(r"admission|apply|deadline|scholarship|result|rank|award|hackathon|competition|event|workshop|seminar|placement|internship|entrance|orientation", re.I)
HIGH_RISK = re.compile(r"\bbest\b|top\s+college|rank(?:ed|ing)?|award|result|score|percent|pass rate|placement|salary|ioe|iom|merit list|topp?er", re.I)


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

            for source_url, source_title in list(links.items())[:12]:
                category, risk = classify(source_title)
                article_title = f"{college['name']}: {source_title}"
                article = brief(college["name"], source_title, category, source_url)
                levels = college.get("education_levels") or ["plus_two", "bachelor"]
                record = {
                    "title": article_title, "slug": self.slugify_with_date(article_title), "content": article,
                    "source_url": source_url, "published_date": datetime.now(timezone.utc).isoformat(),
                    "content_category": category, "claim_risk": risk, "college_id": college["id"],
                    "education_levels": levels, "generation_version": "college-newsroom-v1",
                    "auto_publish_eligible": risk == "low", "source_name": source_name,
                    "source_type": "institution",
                }
                self.queue_record("news", record)
        return self.summary()


if __name__ == "__main__":
    CollegeNewsroomScraper().scrape()
