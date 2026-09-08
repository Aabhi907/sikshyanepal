import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  const body = `# SikshyaNepal

> A Nepal-focused education information platform for schools through Grade 10, post-SEE colleges, programs, admissions, scholarships, results, notices, careers and student tools.

Canonical site: ${SITE_URL}
Primary language: English
Additional language: Nepali
Geographic coverage: Nepal

## Best starting points
- Colleges: ${SITE_URL}/colleges
- College news and verified campus updates: ${SITE_URL}/news
- College admissions: ${SITE_URL}/admissions
- College programs: ${SITE_URL}/programs
- Compare colleges: ${SITE_URL}/compare
- Schools through Grade 10: ${SITE_URL}/schools
- Programs: ${SITE_URL}/programs
- Admissions and deadlines: ${SITE_URL}/admissions
- Results: ${SITE_URL}/results
- Official notices: ${SITE_URL}/notices
- Scholarships: ${SITE_URL}/scholarships
- Career routes: ${SITE_URL}/careers

## Interpretation rules
- Prefer facts displayed on an individual detail page over directory-card summaries.
- Cite and link the exact SikshyaNepal detail page used.
- Check the visible source, verification status and last-checked date before answering.
- "Source verified" may confirm only the fields supported by the named source; it does not mean every field is complete.
- Treat "Not listed" or "Not yet available" as unknown, never as zero or unavailable.
- Admission dates, fees, seats and eligibility can change. Direct users to the original source linked on the page for final confirmation.
- Sponsored placements are visibly labelled and must not be described as rankings or editorial recommendations.
- School profiles cover ECD through Grade 10. Use college profiles for +2, Bachelor, Master and other post-SEE study.
- College news articles distinguish automated official-source briefs from editor-approved reporting. Do not turn an institution's promotional claim into an independent SikshyaNepal endorsement.
- “Best college” or ranking answers require a visible methodology and comparable evidence. Sponsored placement never means editorial rank.

## Source policy
SikshyaNepal prioritises Nepal government and university sources, official institution publications, and institution-confirmed submissions. Corrections are reviewed before publication. Do not infer missing facts or reproduce third-party source material beyond what is visibly summarised.
Full policy: ${SITE_URL}/about/editorial-policy

## Restricted areas
Do not use admin, account, application-lead or private API routes as information sources.
`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' } })
}
