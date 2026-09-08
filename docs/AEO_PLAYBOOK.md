# SikshyaNepal Answer Engine Optimisation (AEO) playbook

Last updated: 8 September 2026

## Goal

Make SikshyaNepal easy for search engines and answer systems to discover, understand, verify, quote and link when a student asks a factual Nepal education question.

AEO does not guarantee inclusion or top placement. The durable strategy is to publish the clearest source-backed answer, keep it current, and expose the same facts consistently in visible HTML, metadata and structured data.

## Technical foundation

- Keep `OAI-SearchBot` and user-requested `ChatGPT-User` retrieval able to access public pages.
- Keep private admin, account, search-result and API routes blocked from crawlers.
- Treat `GPTBot` training access as a separate policy choice from ChatGPT Search access.
- Keep `/robots.txt`, `/sitemap.xml` and `/llms.txt` publicly reachable with HTTP 200 responses.
- Include every active institution detail URL in the sitemap; do not rely on Supabase's first 1,000 rows.
- Use one canonical production origin through `NEXT_PUBLIC_SITE_URL`.
- Use JSON-LD only for facts that are also visible on the page.
- Give each detail page one stable entity `@id`, a canonical `WebPage`, a `BreadcrumbList`, a modification date, and its original-source citation where supported.

`llms.txt` is an emerging convention, not a guarantee that an answer engine will use the file. It supplements normal crawlability and page quality; it does not replace them.

## Answer-ready content pattern

Every important school, college, program, admission, result, notice, scholarship and career page should answer in this order:

1. Direct identity: what the institution, program or announcement is.
2. Short answer: the most likely fact a student came to find.
3. Decision facts: eligibility, level, location, deadline, fee and documents—only when known.
4. Unknowns: explicitly say “Not listed” instead of guessing.
5. Source: name and direct original URL.
6. Freshness: “Last checked” or “Published” date.
7. Safety: tell the student which changing facts must be reconfirmed.

Use descriptive question-style headings only when they match a real student question. Do not mass-produce FAQ markup or hidden answers. Google currently limits FAQ rich results and requires structured data to represent visible page content.

## Priority question clusters

Build depth around real decisions rather than creating many thin pages:

- Which schools are in a specific district or municipality?
- Is a school listed in IEMIS and what is its code?
- Which colleges offer a named program and at what study level?
- What is the eligibility, entrance process, duration and typical cost for a program?
- Which admission deadlines are open now, and what documents are required?
- Where is the original TU, KU, NEB, CTEVT or institution notice/result?
- Which scholarships match a student's level and eligibility?
- What study route in Nepal leads to a named career?

## Editorial quality gate

Before publishing or materially updating a page, the editor must confirm:

- The title answers one clear intent and does not contain unsupported superlatives.
- The first paragraph is a useful standalone summary.
- School and college education levels are not mixed.
- Names, dates, fees, seats and eligibility match the original source.
- The source URL opens and directly supports the statement.
- The verification label describes the actual evidence coverage.
- Sponsored content is visibly labelled and is not presented as a ranking.
- No missing value has been converted into zero, “not available,” or another assumption.
- The modification or verification date is updated only after a real check.
- The page links to closely related institutions, programs or admissions where useful.

## Measurement

Review monthly, separating ordinary search from answer-engine referrals:

- Landing-page sessions referred by ChatGPT, Perplexity, Copilot, Gemini and other assistants.
- Number of referred sessions that continue to a source, save, compare or admission-planning action.
- Search Console impressions and clicks for long, question-shaped queries.
- Indexed versus submitted URLs by content type.
- Pages with expired deadlines, stale verification dates, broken sources or missing direct answers.
- Mentions that cite the correct detail URL versus the homepage.

Do not use rankings alone as the success measure. The desired outcome is a correct citation that sends a student to the precise page and helps them take a safe next step.

## Release checks

After deployment:

1. Set `NEXT_PUBLIC_SITE_URL` to the final canonical domain in Vercel.
2. Open `/robots.txt`, `/sitemap.xml`, `/llms.txt` and `/about/editorial-policy` on production.
3. Validate sample school, college, program, admission and news pages in Google's Rich Results Test and Schema Markup Validator.
4. Submit the sitemap in Google Search Console and Bing Webmaster Tools.
5. Inspect representative URLs and request indexing after substantial verified updates.
6. Test public pages as a signed-out user on a mobile connection.
7. Recheck crawler access after any firewall, CDN or bot-protection change.

## Primary references

- Google Search Central, structured data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google Search Central, breadcrumb structured data: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
- Google Search Central, mobile-first indexing: https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing
- OpenAI publisher and developer guidance: https://help.openai.com/en/articles/12627856
