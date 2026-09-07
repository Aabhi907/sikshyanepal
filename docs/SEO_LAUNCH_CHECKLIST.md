# SEO launch checklist

Technical work in this repository improves crawlability, but it cannot itself guarantee a top ranking. Before launch, the owner must:

1. Set `NEXT_PUBLIC_SITE_URL` to the final canonical HTTPS domain (for example `https://sikshyanepal.com`) in Vercel and redeploy. Do not leave the Vercel preview URL as the canonical domain after a custom domain is live.
2. Create a Google Search Console property for that exact domain, add its verification value as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, then submit `https://YOUR-DOMAIN/sitemap.xml`.
3. Set a permanent redirect from every alternate domain (`www` or Vercel URL) to the canonical domain.
4. Validate structured data and key pages in Google Search Console. Fix crawl errors before producing large volumes of pages.
5. Publish original, source-linked guides and keep school, college, admission, notice, and result records current. Do not publish scraped text verbatim or thin pages with no useful information.
6. Earn relevant links naturally from official institutions, education organisations, local publications, and useful partner resources. Never buy manipulative backlinks.

Track the Search Insights dashboard and Google Search Console weekly. Prioritise zero-result searches, pages with impressions but low click-through rate, and important pages with poor indexing.
