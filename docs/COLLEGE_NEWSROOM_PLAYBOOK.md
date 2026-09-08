# College newsroom automation

## Publishing policy

The newsroom prioritises +2 and Bachelor students. It checks active, verified college
websites every five hours and discovers admissions, scholarships, campus events,
hackathons, achievements, entrance results, awards and student outcomes.

Low-risk official admissions and event notices can publish as short original briefs.
Every published brief links to the exact official page, states how it was prepared,
and is retained in the ingestion audit trail.

Automatic publication additionally requires a machine-readable publication date no
more than 14 days old. If the date is missing, future-dated or stale, the item stays
in the review queue. The collector follows each institution's `robots.txt` rules and
uses a same-domain canonical URL when the source declares one.

These claims always require a human editor:

- “best”, “top” or comparative ranking claims;
- awards and accreditation claims;
- named IOE, IOM or other entrance ranks;
- pass rates, marks, placements, salary and outcome statistics;
- scholarship value or eligibility claims;
- claims sourced only from social posts, advertisements or third-party media.

## Before enabling GitHub Actions

1. Apply `supabase/migrations/20261002_college_newsroom_automation.sql`.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as GitHub Actions secrets.
3. Ensure college profiles have `status = active`, a valid official `website`, and
   `verification_status = source_verified` or `institution_verified`.
4. Run the workflow manually once and review `/admin/ingestion`.
5. Keep the service-role key out of browser code and repository files.

## Editorial workflow for high-risk stories

Open the exact source, confirm the college and date, verify every number/name, rewrite
the brief in original language, add context useful to students, and record a reviewer
note. If evidence is ambiguous, reject or leave the item unpublished.
