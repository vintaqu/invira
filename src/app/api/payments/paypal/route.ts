export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder, paypalConfigured } from '@/lib/paypal'
import { PRODUCTS, ProductType } from '@/modules/payments/payment.service'

async function getLivePlanPrice(slug: string, fallback: number): Promise<number> {
  try {
    const plan = await prisma.pricingPlan.findUnique({ where: { slug } })
    if (plan && plan.price > 0) {
      const discount = plan.discount as { pct: number; until: string | null } | null
      if (discount?.pct && discount.pct > 0) {
        const expired = discount.until ? new Date(discount.until) < new Date() : false
        if (!expired) return +(plan.price * (1 - discount.pct / 100)).toFixed(2)
      }
      return plan.price
    }
  } catch {}
  return fallback / 100
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!paypalConfigured) {
      return NextResponse.json({ error: 'PayPal no configurado' }, { status: 503 })
    }

    const { eventId, productType = 'event_activation' } = await req.json()
    const userId = session.user.id
    const product  = PRODUCTS[productType as ProductType]
    const planSlug = (data as any).planSlug ?? 'esencial'
    const livePrice = await getLivePlanPrice(planSlug, product.amount)
    if (!product) return NextResponse.json({ error: 'Producto inválido' }, { status: 400 })

    const event = await prisma.event.findFirst({ where: { id: eventId, userId } })
    if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

    if (event.status === 'PAID') {
      return NextResponse.json({ already: true })
    }

    // Create internal payment record first
    const payment = await prisma.payment.create({
      data: {
        userId,
        eventId,
        amount: livePrice,
        currency: product.currency,
        status: 'PENDING',
        productType,
        metadata: { eventTitle: event.title, eventSlug: event.slug, provider: 'paypal' },
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const { orderId, approveUrl } = await createPayPalOrder({
      amount: livePrice,
      currency: product.currency.toUpperCase(),
      description: `${product.name} — ${event.title}`,
      paymentId: payment.id,
      successUrl: `${appUrl}/api/payments/paypal/capture?paymentId=${payment.id}&eventId=${eventId}`,
      cancelUrl:  `${appUrl}/dashboard/events/${eventId}?payment=cancelled`,
    })

    // Store PayPal order ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: `paypal_${orderId}` }, // reuse field for PayPal order ID
    })

    return NextResponse.json({ url: approveUrl, orderId })
  } catch (error: any) {
    console.error('[PayPal checkout]', error)
    return NextResponse.json({ error: error.message ?? 'Error' }, { status: 500 })
  }
}
