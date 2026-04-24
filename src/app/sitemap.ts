import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'https://evochi.app'

  const staticRoutes: MetadataRoute.Sitemap = [
    // Homepage — max priority
    { url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },

    // ── SEO LANDING PAGES — high priority ──────────────────────
    // These are the pages that capture organic traffic by keyword
    { url: `${url}/invitaciones-boda`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${url}/invitaciones-cumpleanos`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${url}/invitaciones-bautizo`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${url}/invitaciones-quinceAnera`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${url}/invitaciones-corporativas`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${url}/invitaciones-graduacion`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.80 },

    // Legal
    { url: `${url}/legal/privacidad`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/legal/terminos`,   lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${url}/legal/cookies`,    lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Public events — indexed for long-tail SEO
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const events = await prisma.event.findMany({
      where: { status: 'PAID', isPrivate: false },
      select: { slug: true, updatedAt: true, type: true },
      take: 5000,
      orderBy: { publishedAt: 'desc' },
    })
    eventRoutes = events.map(e => ({
      url: `${url}/event/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.65,
    }))
  } catch {}

  return [...staticRoutes, ...eventRoutes]
}
