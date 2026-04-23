import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/utils/slug'
import { redis } from '@/lib/redis'
import type { EventType, Prisma } from '@prisma/client'

export interface CreateEventInput {
  userId: string
  title: string
  type: EventType
  eventDate: Date
  templateId?: string
  locale?: string
  location?: string
  subtitle?: string
  designConfig?: any
}

export interface UpdateEventInput {
  title?: string
  eventDate?: Date
  endDate?: Date
  venueName?: string
  venueAddress?: string
  venueCity?: string
  latitude?: number
  longitude?: number
  coupleNames?: string
  description?: string
  heroImage?: string
  heroVideo?: string
  musicUrl?: string
  dressCode?: string
  agendaJson?: Prisma.InputJsonValue
  customData?: Prisma.InputJsonValue
  isPrivate?: boolean
  privatePassword?: string
  maxGuests?: number
  allowPlusOne?: boolean
  locale?: string
  languages?: string[]
  doors?: string
  ceremony?: string
  reception?: string
}

export class EventService {
  // CREATE
  static async create(input: CreateEventInput) {
    const slug = await this.generateUniqueSlug(input.title)

    const event = await prisma.event.create({
      data: {
        userId: input.userId,
        title: input.title,
        type: input.type,
        eventDate: input.eventDate,
        slug,
        status: 'DRAFT',
        locale: input.locale ?? 'es',
        templateId: input.templateId,
        ...(input.location  && { venueName: input.location }),
        ...(input.subtitle  && { description: input.subtitle }),
        ...(input.designConfig && { customData: input.designConfig }),
      },
      include: { template: true },
    })

    return event
  }

  // GET BY SLUG (public)
  static async getBySlug(slug: string, guestToken?: string) {
    // Only cache the base event (no guest-specific data)
    const cacheKey = `event:slug:${slug}`
    let event: any = null

    if (!guestToken) {
      const cached = await redis.get(cacheKey)
      if (cached) {
        try { event = JSON.parse(cached as string) } catch { /* ignore */ }
      }
    }

    if (!event) {
      event = await prisma.event.findUnique({
        where: { slug },
        include: {
          template: true,
          media: { orderBy: { position: 'asc' } },
          songs: { where: { isApproved: true }, orderBy: { votes: 'desc' } },
          gifts: { orderBy: { position: 'asc' } },
          hotels: { orderBy: { position: 'asc' } },
          transport: { orderBy: { position: 'asc' } },
          timelineItems: { orderBy: { position: 'asc' } },
          instagramPosts: {
            where: { isApproved: true },
            orderBy: { postedAt: 'desc' },
            take: 20,
          },
        },
      })

      if (!event) return null
      if (event.status === 'PAID' && !guestToken) {
        await redis.setex(cacheKey, 60, JSON.stringify(event)).catch(() => {})
      }
    }

    // Fetch guest info if token provided
    if (guestToken) {
      const guest = await prisma.guest.findFirst({
        where: { eventId: event.id, accessToken: guestToken },
        select: { id: true, name: true, tableName: true, tableNumber: true, isVIP: true, menuChoice: true, notes: true },
      })
      // For private events, guest must be valid
      if (event.isPrivate && !guest) return null
      // Attach guest info to event for personalisation
      if (guest) event = { ...event, _guest: guest }
    }

    return event
  }

  // GET BY ID (owner dashboard)
  static async getById(eventId: string, userId: string) {
    return prisma.event.findFirst({
      where: { id: eventId, userId },
      include: {
        template: true,
        media: { orderBy: { position: 'asc' } },
        songs: { orderBy: { votes: 'desc' } },
        gifts: { orderBy: { position: 'asc' } },
        hotels: { orderBy: { position: 'asc' } },
        transport: { orderBy: { position: 'asc' } },
        timelineItems: { orderBy: { position: 'asc' } },
        reminders: true,
        _count: { select: { guests: true, rsvps: true } },
      },
    })
  }

  // LIST USER EVENTS
  static async listByUser(userId: string) {
    return prisma.event.findMany({
      where: { userId, status: { not: 'ARCHIVED' } },
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true, thumbnail: true } },
        _count: { select: { guests: true, rsvps: true } },
      },
    })
  }

  // UPDATE
  static async update(eventId: string, userId: string, data: UpdateEventInput) {
    const event = await prisma.event.update({
      where: { id: eventId, userId },
      data: {
        ...data,
        privateToken: data.isPrivate ? this.generatePrivateToken() : undefined,
      },
    })
    await redis.del(`event:slug:${event.slug}`)
    return event
  }

  // PUBLISH (called after Stripe payment)
  static async publish(eventId: string) {
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status: 'PAID', publishedAt: new Date() },
    })
    await redis.del(`event:slug:${event.slug}`)
    return event
  }

  // ARCHIVE
  static async archive(eventId: string, userId: string) {
    return prisma.event.update({
      where: { id: eventId, userId },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    })
  }

  // ANALYTICS SUMMARY
  static async getAnalyticsSummary(eventId: string, userId: string) {
    const event = await prisma.event.findFirst({ where: { id: eventId, userId } })
    if (!event) throw new Error('Not found')

    const [totalViews, rsvpStats, channelBreakdown] = await Promise.all([
      prisma.analytics.count({ where: { eventId, type: 'page_view' } }),
      prisma.rSVP.groupBy({
        by: ['status'],
        where: { eventId },
        _count: true,
      }),
      prisma.analytics.groupBy({
        by: ['channel'],
        where: { eventId, type: 'page_view' },
        _count: true,
      }),
    ])

    const confirmed = rsvpStats.find((r) => r.status === 'CONFIRMED')?._count ?? 0
    const declined = rsvpStats.find((r) => r.status === 'DECLINED')?._count ?? 0
    const pending = rsvpStats.find((r) => r.status === 'PENDING')?._count ?? 0

    return {
      totalViews,
      rsvp: { confirmed, declined, pending, total: confirmed + declined + pending },
      channels: channelBreakdown,
    }
  }

  private static async generateUniqueSlug(title: string): Promise<string> {
    let slug = generateSlug(title)
    let attempt = 0
    while (true) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
      const existing = await prisma.event.findUnique({ where: { slug: candidate } })
      if (!existing) return candidate
      attempt++
    }
  }

  private static generatePrivateToken(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }
}
