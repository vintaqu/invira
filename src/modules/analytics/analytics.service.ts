import { prisma } from '@/lib/prisma'

interface TrackInput {
  eventId: string
  guestId?: string
  type: string
  channel?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  ipAddress?: string
  userAgent?: string
  country?: string
  city?: string
  referrer?: string
  sessionId?: string
  duration?: number
  metadata?: Record<string, unknown>
}

export const analyticsService = {
  async track(input: TrackInput) {
    try {
      return await prisma.analytics.create({ data: input as any })
    } catch (e) {
      // Analytics failures should never crash the app
      console.error('[Analytics track error]', e)
    }
  },

  async getEventDashboard(eventId: string) {
    const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [totalViews, viewsLast7Days, rsvpBreakdown, channelBreakdown, guestCheckIns] =
      await Promise.all([
        prisma.analytics.count({ where: { eventId, type: 'page_view' } }),
        prisma.analytics.count({ where: { eventId, type: 'page_view', timestamp: { gte: last7days } } }),
        prisma.rSVP.groupBy({ by: ['status'], where: { eventId }, _count: true }),
        prisma.analytics.groupBy({ by: ['channel'], where: { eventId, type: 'page_view' }, _count: { _all: true } }),
        prisma.guest.groupBy({ by: ['checkInStatus'], where: { eventId }, _count: true }),
      ])

    const confirmed = rsvpBreakdown.find(r => r.status === 'CONFIRMED')?._count ?? 0
    const declined  = rsvpBreakdown.find(r => r.status === 'DECLINED')?._count ?? 0
    const pending   = rsvpBreakdown.find(r => r.status === 'PENDING')?._count ?? 0
    const totalRSVP = confirmed + declined + pending
    const confirmationRate = totalRSVP > 0 ? Math.round((confirmed / totalRSVP) * 100) : 0
    const checkedIn = guestCheckIns.find(c => c.checkInStatus === 'CHECKED_IN')?._count ?? 0

    return {
      overview: { totalViews, viewsLast7Days, confirmationRate, checkedIn },
      rsvp: { confirmed, declined, pending, total: totalRSVP },
      channels: channelBreakdown.map(c => ({
        channel: c.channel ?? 'direct',
        count: c._count._all,
      })),
    }
  },

  async trackInvitationOpen(guestToken: string, eventId: string, channel?: string) {
    const guest = await prisma.guest.findFirst({ where: { accessToken: guestToken, eventId } })
    if (!guest) return

    await Promise.all([
      prisma.invitation.updateMany({
        where: { guestId: guest.id },
        data: { openedAt: new Date(), openCount: { increment: 1 }, status: 'OPENED', channel },
      }),
      this.track({ eventId, guestId: guest.id, type: 'page_view', channel }),
    ])
  },
}
