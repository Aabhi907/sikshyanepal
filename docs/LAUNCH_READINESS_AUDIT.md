# Launch readiness audit

Checked against the 20-item launch list on 11 September 2026.

| # | Requirement | Status | SikshyaNepal implementation |
|---|---|---|---|
| 1 | Privacy policy | Implemented | `/privacy`, linked from the site footer and account/community flows. |
| 2 | Terms and conditions | Implemented | `/terms`, with separate community and child-safety rules. |
| 3 | Secrets off the frontend | Implemented | Private service and email keys are server-only environment variables. Only Supabase's intentionally public anon key uses a `NEXT_PUBLIC_` name. No real secret is tracked in Git. |
| 4 | Force HTTPS | Implemented | Production middleware redirects proxy HTTP requests to HTTPS; HSTS is sent site-wide. Vercel also provides TLS at the edge. |
| 5 | Cookie consent banner | Implemented | Granular functional, analytics, and advertising choices; optional scripts remain off until consent. |
| 6 | Meta titles and descriptions | Implemented | Global title template plus route-level metadata and canonical URLs. Content editors must keep every new page's title and description unique. |
| 7 | Social preview image | Implemented | A generated 1200×630 Open Graph image is available at `/opengraph-image` and referenced by Open Graph, Twitter, and Organization metadata. |
| 8 | Favicon | Implemented | `app/favicon.ico`. |
| 9 | Sitemap and robots.txt | Implemented | Dynamic database-backed sitemap and bot-specific robots rules. |
| 10 | Image alt text | Implemented baseline | Product images have contextual alt text. Every future uploaded image still requires a meaningful description or an empty alt attribute when decorative. |
| 11 | Compress images | Implemented baseline | Next Image negotiates AVIF/WebP with a one-day cache. Admin-supplied announcement images are lazy-loaded and decoded asynchronously. Uploaded originals should still be size-limited during moderation. |
| 12 | Check page-load speed | Ready for recurring QA | Fonts use `display: swap`, images are optimized/lazy, and server rendering is used. Run Lighthouse on production after every material UI release; target LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile. |
| 13 | Fix color contrast | Implemented baseline | High-contrast design tokens and visible focus styles are used. Re-run automated and manual contrast checks whenever colors change. |
| 14 | Mobile friendly | Implemented | Responsive navigation, filters, cards and forms. Test at 320px width and on real low-end Android hardware before release. |
| 15 | Custom 404 page | Implemented | Global branded `app/not-found.tsx` with recovery actions. |
| 16 | Fix broken links | Implemented as a release check | Run `npm run check:links` while the production build is served locally, or set `CHECK_BASE_URL` to a preview deployment. |
| 17 | Form validation | Implemented | Required fields, format validation, accessible labels, server checks and useful error states exist in important submission flows. |
| 18 | Spam protection | Implemented baseline | Honeypots, authentication, duplicate checks, fingerprints, rate limits and moderation protect write flows. Add managed challenge protection only if measured abuse bypasses these controls. |
| 19 | Analytics | Implemented, configuration required | Consent-gated Google Analytics loader. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` in Vercel; no analytics request is made before consent. |
| 20 | One clear call to action | Implemented | Homepage search and clear school/college pathways; landing pages use a single primary action. |

## Required production configuration

1. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain.
2. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` only when the Analytics property is ready.
3. Keep `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and other private keys server-only.
4. After deployment, run Lighthouse mobile, keyboard-only navigation, a 320px device check, and `CHECK_BASE_URL=https://your-preview-domain npm run check:links`.
5. Re-check policy wording with a Nepal-qualified lawyer before commercial launch; code-level checks are not legal certification.
