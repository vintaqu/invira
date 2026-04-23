export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await prisma.event.findFirst({
      where: { id: id, userId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Must be paid to send invitations
    if (event.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Debes publicar el evento antes de enviar invitaciones.' },
        { status: 402 }
      )
    }

    const body = await req.json()
    // guestIds: string[] | 'all'
    const guestIds: string[] | 'all' = body.guestIds ?? 'all'

    const whereClause = guestIds === 'all'
      ? { eventId: id, email: { not: null } }
      : { eventId: id, id: { in: guestIds }, email: { not: null } }

    const guests = await prisma.guest.findMany({
      where: whereClause,
      select: { id: true, name: true, email: true, accessToken: true },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    let sent = 0
    let failed = 0
    const errors: string[] = []

    for (const guest of guests) {
      if (!guest.email) continue
      try {
        await emailService.sendInvitation({
          to: guest.email,
          guestName: guest.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          personalizedUrl: `${appUrl}/api/invite/${guest.accessToken}?ch=email`,
          heroImageUrl: event.heroImage ?? undefined,
        })

        // Mark invitation as sent
        await prisma.invitation.updateMany({
          where: { guestId: guest.id },
          data: { sentAt: new Date(), status: 'SENT', channel: 'email' },
        })

        sent++
      } catch (e: any) {
        failed++
        errors.push(`${guest.name}: ${e.message}`)
        console.error('[Send invitation error]', guest.name, e.message)
      }
    }

    return NextResponse.json({ sent, failed, total: guests.length, errors })
  } catch (error) {
    console.error('[Send]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
