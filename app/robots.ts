import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sikshyanepal.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Good bots — full access except protected paths
        userAgent: '*',
        allow:    '/',
        disallow: [
          '/admin/',
          '/api/',
          '/search',
        ],
      },
      {
        // Block known bad scrapers / AI training bots
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
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
