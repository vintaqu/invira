export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

// Vercel Cron — runs daily at 9am UTC
// Add CRON_SECRET env var and set in vercel.json
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  let sent = 0; let errors = 0

  try {
    for (const days of [1, 3, 7]) {
      const targetDate = new Date(now)
      targetDate.setDate(targetDate.getDate() + days)
      const dayStart = new Date(targetDate.setHours(0,0,0,0))
      const dayEnd   = new Date(targetDate.setHours(23,59,59,999))

      const events = await prisma.event.findMany({
        where: { status: 'PAID', eventDate: { gte: dayStart, lte: dayEnd } },
        include: {
          guests: {
            where: { email: { not: null } },
            include: { rsvp: true },
          },
        },
      })

      for (const event of events) {
        // Skip if already sent this reminder
        const existing = await prisma.reminder.findFirst({
          where: { eventId: event.id, type: `${days}d_before`, status: 'SENT' },
        })
        if (existing) continue

        for (const guest of event.guests) {
          if (!guest.email) continue
          try {
            await emailService.sendReminder({
              to: guest.email,
              guestName: guest.name,
              eventTitle: event.title,
              eventDate: event.eventDate,
              daysUntil: days,
              eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/event/${event.slug}`,
              rsvpStatus: guest.rsvp?.status,
            })
            sent++
          } catch (e) {
            errors++
            console.error('[Reminder error]', guest.name, e)
          }
        }

        // Record sent
        await prisma.reminder.create({
          data: { eventId: event.id, type: `${days}d_before`, triggerDays: days, scheduledAt: now, status: 'SENT', sentAt: now },
        }).catch(() => {})
      }
    }

    return NextResponse.json({ success: true, sent, errors })
  } catch (e) {
    console.error('[Cron]', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
