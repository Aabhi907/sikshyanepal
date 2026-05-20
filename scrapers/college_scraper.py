"""
SikshyaNepal — College Scraper
Scrapes affiliated college lists from TU, KU, and PU websites.
Inserts new colleges into the colleges table with status='pending_review'.

Sources:
  TU  — https://tribhuvan-university.edu.np/affiliated-colleges
        https://tribhuvan-university.edu.np/constituent-colleges
  KU  — https://ku.edu.np/affiliated-colleges
  PU  — https://pu.edu.np/affiliated-colleges
"""

import re
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from base_scraper import BaseScraper

SOURCES = [
    {
        "university_short": "TU",
        "university_full":  "Tribhuvan University",
        "affiliation":      "Tribhuvan University",
        "urls": [
            "https://tribhuvan-university.edu.np/affiliated-colleges",
            "https://tribhuvan-university.edu.np/constituent-colleges",
        ],
    },
    {
        "university_short": "KU",
        "university_full":  "Kathmandu University",
        "affiliation":      "Kathmandu University",
        "urls": [
            "https://ku.edu.np/affiliated-colleges",
            "https://ku.edu.np/component/content/article/34-affiliated-colleges",
        ],
    },
    {
        "university_short": "PU",
        "university_full":  "Pokhara University",
        "affiliation":      "Pokhara University",
        "urls": [
            "https://pu.edu.np/affiliated-colleges",
            "https://pu.edu.np/affiliated-college",
        ],
    },
]

# Selectors tried in order — first match wins
NAME_SELECTORS = [
    "table tbody tr td:first-child",   # plain table
    ".views-field-title",              # Drupal views
    ".college-name",
    ".institution-name",
    "h3.entry-title",
    "h2.college-title",
    ".college-list li",
    "ul.affiliated-list li",
    ".affiliated-college-name",
    "td.views-field-field-college-name",
    ".field-content",
]

# Noise words that indicate a row isn't a college name
SKIP_PATTERNS = re.compile(
    r"^(s\.?\s*no\.?|sn|#|serial|name of|college name|institution|sl\.?\s*no|"
    r"address|location|contact|phone|email|website|district|province|"
    r"affiliated|remarks|facult|program|department)$",
    re.IGNORECASE,
)

DISTRICT_KEYWORDS = [
    "kathmandu", "lalitpur", "bhaktapur", "pokhara", "chitwan", "butwal",
    "biratnagar", "birgunj", "dharan", "hetauda", "nepalgunj", "dhangadhi",
    "bharatpur", "itahari", "janakpur", "butwal", "siddharthanagar",
    "gorkha", "kaski", "kavrepalanchok", "makwanpur", "sunsari", "morang",
    "rupandehi", "nawalparasi", "parsa", "bara", "rautahat", "sarlahi",
    "siraha", "saptari", "mahottari", "dhanusha", "kapilbastu", "palpa",
    "syangja", "tanahu", "baglung", "myagdi", "parbat", "arghakhanchi",
    "gulmi", "dang", "surkhet", "banke", "bardiya", "kailali", "kanchanpur",
    "dadeldhura", "baitadi", "darchula", "achham", "bajura", "bajhang",
    "humla", "jumla", "kalikot", "mugu", "dolpa", "rukum", "rolpa", "salyan",
    "dailekh", "jajarkot", "sindhupalchok", "rasuwa", "nuwakot", "dhading",
    "gorkha", "lamjung", "manang", "mustang", "parbat", "solukhumbu",
    "okhaldhunga", "khotang", "udayapur", "bhojpur", "sankhuwasabha",
    "taplejung", "panchthar", "ilam", "jhapa",
]


def _clean(text: str) -> str:
    """Strip whitespace, collapse internal spaces."""
    return re.sub(r"\s+", " ", text.strip())


def _looks_like_college(text: str) -> bool:
    """Heuristic: a college name is 3–120 chars, not a header/label."""
    text = text.strip()
    if len(text) < 3 or len(text) > 120:
        return False
    if SKIP_PATTERNS.match(text):
        return False
    # Must contain at least one word of length ≥ 3
    words = text.split()
    if not any(len(w) >= 3 for w in words):
        return False
    # Reject pure numbers
    if text.isdigit():
        return False
    return True


def _extract_location(row_el) -> str | None:
    """
    Try to find location from sibling cells or text in the same row.
    Returns a string if found, else None.
    """
    # Sibling tds in the same <tr>
    tds = row_el.find_all("td")
    for td in tds[1:3]:  # check 2nd and 3rd cell
        txt = _clean(td.get_text())
        if txt and 2 < len(txt) < 60:
            low = txt.lower()
            if any(d in low for d in DISTRICT_KEYWORDS):
                return txt
    # Check for a <span> or <div> with class containing "location"/"district"
    for el in row_el.select("[class*=location],[class*=district],[class*=address]"):
        txt = _clean(el.get_text())
        if txt and len(txt) < 60:
            return txt
    return None


def _extract_website(row_el) -> str | None:
    for a in row_el.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith("http") and "tribhuvan-university" not in href \
                and "ku.edu.np" not in href and "pu.edu.np" not in href:
            return href
    return None


def _extract_phone(row_el) -> str | None:
    text = row_el.get_text()
    # Simple Nepali phone patterns: 01-XXXXXXX or 98XXXXXXXX
    m = re.search(r"(\d{2}-\d{6,7}|\+?977[-\s]?\d{9,10}|9[78]\d{8}|0\d{8,9})", text)
    return m.group(0).strip() if m else None


class CollegeScraper(BaseScraper):
    def __init__(self):
        super().__init__("CollegeScraper")
        self._seen_names: set[str] = set()  # dedup within a single run

    # ------------------------------------------------------------------
    # Core extraction logic
    # ------------------------------------------------------------------

    def _extract_colleges_from_soup(self, soup, affiliation: str) -> list[dict]:
        """
        Try every NAME_SELECTOR in order. Return a list of raw dicts
        with keys: name, location, phone, website.
        """
        colleges: list[dict] = []

        for selector in NAME_SELECTORS:
            elements = soup.select(selector)
            if not elements:
                continue

            self.logger.info(f"  Selector matched: '{selector}' → {len(elements)} elements")

            for el in elements:
                name = _clean(el.get_text())
                if not _looks_like_college(name):
                    continue

                # Try to find sibling data in the parent <tr>
                parent_row = el.find_parent("tr") or el.parent
                location = _extract_location(parent_row) if parent_row else None
                website  = _extract_website(parent_row)  if parent_row else None
                phone    = _extract_phone(parent_row)    if parent_row else None

                colleges.append({
                    "name":        name,
                    "location":    location or "",
                    "phone":       phone,
                    "website":     website,
                    "affiliation": affiliation,
                })

            if colleges:
                break  # first successful selector wins

        # If no structured selector worked, fall back to full-text heuristic
        if not colleges:
            colleges = self._fallback_text_extraction(soup, affiliation)

        return colleges

    def _fallback_text_extraction(self, soup, affiliation: str) -> list[dict]:
        """
        Last resort: look for lines that end with 'College', 'Campus',
        'Institute', 'Academy', 'School' etc.
        """
        COLLEGE_SUFFIXES = re.compile(
            r"\b(college|campus|institute|academy|polytechnic|school|"
            r"university|medical|engineering|management|technology|nursing)\b",
            re.IGNORECASE,
        )
        results = []
        for tag in soup.find_all(["li", "p", "div", "span", "td"]):
            if tag.find():            # skip elements that contain child tags
                continue
            text = _clean(tag.get_text())
            if _looks_like_college(text) and COLLEGE_SUFFIXES.search(text):
                results.append({
                    "name":        text,
                    "location":    "",
                    "phone":       None,
                    "website":     None,
                    "affiliation": affiliation,
                })
        self.logger.info(f"  Fallback extraction found {len(results)} candidates")
        return results

    # ------------------------------------------------------------------
    # Duplicate guard (within session + DB)
    # ------------------------------------------------------------------

    def _college_exists_by_name(self, name: str) -> bool:
        """Check if a college with this name already exists in DB."""
        try:
            result = self._execute_with_retry(
                lambda: (
                    self.supabase.table("colleges")
                    .select("id")
                    .ilike("name", name)
                    .limit(1)
                    .execute()
                ),
                f"name_exists:{name[:60]}",
            )
            return len(result.data) > 0
        except Exception as e:
            self.logger.warning(f"name_exists check failed: {e}")
            return False

    # ------------------------------------------------------------------
    # Insert one college
    # ------------------------------------------------------------------

    def _insert_college(self, name: str, location: str, phone: str | None,
                        website: str | None, affiliation: str,
                        university_id: str | None) -> bool:
        name_key = name.lower().strip()
        if name_key in self._seen_names:
            self.skipped += 1
            return False
        self._seen_names.add(name_key)

        if self._college_exists_by_name(name):
            self.logger.debug(f"Skip (exists): {name[:70]}")
            self.skipped += 1
            return False

        slug = self.slugify(name)
        # Append affiliation short form to avoid slug collisions
        aff_short = affiliation.split()[0].lower()[:3]
        full_slug  = f"{slug}-{aff_short}"

        row: dict = {
            "name":        name,
            "slug":        full_slug,
            "location":    location or "Nepal",
            "affiliation": affiliation,
            "is_featured": False,
            "status":      "pending_review",
            "source":      "scraped",
        }
        if phone:    row["phone"]   = phone
        if website:  row["website"] = website
        if university_id:
            row["university_id"] = university_id

        return self.insert_record("colleges", row)

    # ------------------------------------------------------------------
    # Per-source scrape
    # ------------------------------------------------------------------

    def _scrape_source(self, source: dict) -> int:
        short  = source["university_short"]
        full   = source["university_full"]
        aff    = source["affiliation"]
        uid    = self.get_university_id(short, full)

        inserted_this_source = 0

        for url in source["urls"]:
            self.logger.info(f"Fetching: {url}")
            soup = self.fetch_page(url, timeout=20, verify=False)
            if not soup:
                self.logger.warning(f"  Could not fetch: {url}")
                continue

            colleges = self._extract_colleges_from_soup(soup, aff)
            self.logger.info(f"  Extracted {len(colleges)} candidates from {url}")

            for c in colleges:
                ok = self._insert_college(
                    name=c["name"],
                    location=c["location"],
                    phone=c.get("phone"),
                    website=c.get("website"),
                    affiliation=c["affiliation"],
                    university_id=uid,
                )
                if ok:
                    inserted_this_source += 1

        return inserted_this_source

    # ------------------------------------------------------------------
    # Entry point
    # ------------------------------------------------------------------

    def scrape(self) -> dict:
        self.logger.info("Starting college scraper")
        for source in SOURCES:
            self.logger.info(f"=== {source['university_short']} ===")
            self._scrape_source(source)
        return self.summary()


if __name__ == "__main__":
    CollegeScraper().scrape()
