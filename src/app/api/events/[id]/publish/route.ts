export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PaymentService } from '@/modules/payments/payment.service'
import { EventService } from '@/modules/events/event.service'
import { prisma } from '@/lib/prisma'
import { paypalConfigured } from '@/lib/paypal'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const userId = session.user.id
    const event = await prisma.event.findFirst({ where: { id, userId } })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    if (event.status === 'PAID') {
      return NextResponse.json({ already: true, url: `/dashboard/events/${id}` })
    }

    const body = await req.json().catch(() => ({}))
    const productType = body.productType ?? 'event_activation'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // DEV MODE — activate without payment if nothing configured
    if (!process.env.STRIPE_SECRET_KEY && !paypalConfigured) {
      await EventService.publish(id)
      return NextResponse.json({
        devMode: true,
        activated: true,
        message: 'Evento activado en modo desarrollo',
        redirectUrl: `/dashboard/events/${id}/success`,
      })
    }

    // Return available payment methods to the client
    return NextResponse.json({
      selectPayment: true,
      methods: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        paypal: paypalConfigured,
      },
      eventId: id,
      productType,
    })
  } catch (error: any) {
    console.error('[Publish]', error)
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 })
  }
}
