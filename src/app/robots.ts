import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://evochi.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/event/'],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/checkin/',
          '/i/',
        ],
      },
      // Block AI scrapers
      { userAgent: 'GPTBot',       disallow: ['/'] },
      { userAgent: 'ChatGPT-User', disallow: ['/'] },
      { userAgent: 'CCBot',        disallow: ['/'] },
      { userAgent: 'anthropic-ai', disallow: ['/'] },
    ],
    sitemap: `${url}/sitemap.xml`,
    host: url,
  }
}
