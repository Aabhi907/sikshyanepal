# SikshyaNepal Scrapers

Automated collectors for college news, admissions, exam results and university notices.

## Editorial safety model

Collectors never republish scraped text. Every item is
stored in `content_ingestion_items` with its original URL, normalized payload,
quality flags, source registry entry, and a SHA-256 duplicate fingerprint. An editor
must open `/admin/ingestion`, compare the item with the original source, and choose
**Verify & publish** or **Reject**. The college newsroom has one narrow exception:
an original brief about a low-risk admission or campus-event announcement may publish
automatically when it is matched to an active, verified college and its official
website and the page exposes a publication date from the last 14 days. Rankings,
awards, result statistics, named student ranks, placements and
scholarship claims always require editor review.

Before running collectors, apply `supabase/migrations/20260905_content_ingestion_queue.sql`.

## Importing the 50-college research pack

Use `import_research_colleges.py` with the supplied JSON pack. It validates the
records and defaults to a dry run. With `--commit`, new records are inserted as
`pending_review`, never directly into the public directory. Review each record's
website, current programs, affiliation, fees and admissions before changing its
status to active and verification status to source/institution verified.

For the reviewed 50-college pack used by this project, apply
`supabase/migrations/20260923_research_college_profiles.sql`. It upserts the
static, source-reviewed profiles as active directory entries and deliberately
omits dynamic fees, deadlines, eligibility and scholarship amounts.

## Collectors

| File | Source | Review target | What it extracts |
|---|---|---|---|
| `tu_results.py` | tuexam.edu.np | Editorial queue → results | TU exam results with program, semester, result PDF URL |
| `ku_results.py` | kuexam.edu.np | Editorial queue → results | KU exam results with program, semester, result URL |
| `tu_notices.py` | tribhuvan-university.edu.np | Editorial queue → notices | TU official notices, admission notices, exam schedules |
| `neb_notices.py` | neb.gov.np | Editorial queue → notices | NEB exam notices, Grade 11/12 schedules, results |
| `college_newsroom.py` | Verified college websites | News or editorial queue | +2/Bachelor admissions, events, scholarships, achievements and results |

All collectors:
- Store every candidate and its evidence in the editorial queue
- Skip duplicate entries using a source fingerprint and preserve the original source URL
- Never crash the entire run if one record fails
- Log exactly how many records were inserted vs skipped

The scheduled workflow runs at 00:17, 05:17, 10:17, 15:17 and 20:17 UTC. GitHub
Actions schedules are best-effort and may start a few minutes late. Apply
`20261002_college_newsroom_automation.sql` before enabling the workflow.

## Ranking and “best college” articles

Never generate a “best college” list from promotional language or payment. Publish
one only after defining a dated methodology, the eligible college set, comparable
verified evidence, scoring weights, conflict disclosures and a correction route.
Sponsored placements must be visibly labelled and must not change editorial scores.

---

## Run locally

### 1. Set up environment

```bash
cd scrapers
cp .env.example .env
# Edit .env and fill in your values
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 3. Run a single scraper

```bash
cd scrapers
python tu_results.py
```

### 4. Run all scrapers

```bash
cd scrapers
python run_all.py
```

## Import the official school directory

Apply `supabase/migrations/20260903_verified_school_directory.sql`, then download an
official CEHRD/IEMIS school-detail CSV or XLSX export. Validate it without writing:

```bash
cd scrapers
python import_schools.py ~/Downloads/SchoolDetails.xlsx \
  --source-url "https://www.cehrd.gov.np/content/..."
```

If the detected columns and row count are correct, rerun with `--commit`. The importer
upserts by IEMIS code, records the original dataset URL, and marks imported rows as
`source_verified`. Never import a copied directory without an official source URL.

---

## GitHub Secrets required

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret name | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase dashboard → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Settings → API → `service_role` key (keep secret!) |
| `VERCEL_DEPLOY_HOOK_URL` | See below |
| `SIKSHYANEPAL_URL` | Final production URL, for subscriber notifications |
| `NOTIFICATION_SECRET` | Random secret matching the Vercel environment variable of the same name |

---

## How to get the Vercel Deploy Hook URL

1. Go to [vercel.com](https://vercel.com) → open your **sikshyanepal** project
2. Click **Settings** (top nav)
3. Click **Git** in the left sidebar
4. Scroll down to **Deploy Hooks**
5. Enter a name (e.g. `scrapers-cron`) and select branch `main`
6. Click **Create Hook**
7. Copy the generated URL — it looks like:
   `https://api.vercel.com/v1/integrations/deploy/prj_xxxx/yyyyyy`
8. Add it as the `VERCEL_DEPLOY_HOOK_URL` GitHub Secret

> **Note:** With `force-dynamic` on all pages, the site already fetches
> fresh data on every request. The deploy hook is only needed if you
> add statically generated pages in the future.

---

## Manual trigger

1. Go to your GitHub repo
2. Click **Actions** tab
3. Click **SikshyaNepal Data Scrapers** in the left sidebar
4. Click **Run workflow** → **Run workflow**

---

## Adding a new scraper

1. Create `scrapers/your_scraper.py` — inherit from `BaseScraper`:

```python
from base_scraper import BaseScraper

class YourScraper(BaseScraper):
    def __init__(self):
        super().__init__("YourScraperName")

    def scrape(self) -> dict:
        # fetch page, parse items, call self.insert_record(...)
        return self.summary()
```

2. Import and add it to the `scrapers` list in `run_all.py`:

```python
from your_scraper import YourScraper

scrapers = [
    ...
    ("Your Source", YourScraper),
]
```

3. That's it — the GitHub Actions workflow picks it up automatically.

---

## Troubleshooting

**"SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"**
→ Copy `.env.example` to `.env` and fill in your Supabase credentials.

**"University not found: TU"**
→ Make sure you've run the schema SQL in Supabase first (universities are seeded there).

**Scraper runs but inserts 0 records**
→ The target website may have changed its HTML structure.
   Run the scraper locally and check the debug output — you'll see
   which parse strategy was tried. Update the CSS selectors in the
   relevant `parse_*` method.

**GitHub Actions shows the run as failed**
→ Check the Actions log. If only some scrapers failed, the exit code
   is still 0. Exit code 1 only fires if every single scraper crashed.
