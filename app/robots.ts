import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sikshyanepal.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Search/indexing and user-requested retrieval for answer engines.
        userAgent: ['OAI-SearchBot', 'ChatGPT-User'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/search'],
      },
      {
        // Good bots — full access except protected paths
        userAgent: '*',
        allow:    '/',
        disallow: [
          '/admin/',
          '/api/',
          '/account/',
          '/search',
        ],
      },
      {
        // Block known bad scrapers / AI training bots
        userAgent: [
          'GPTBot',
          'CCBot',
          'anthropic-ai',
          'Claude-Web',
          'Omgilibot',
          'FacebookBot',
        ],
        disallow: '/',
      },
    ],
    sitemap:     `${BASE_URL}/sitemap.xml`,
    host:        BASE_URL,
  }
}
