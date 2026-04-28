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

    const body = await req.json()
    const { eventId, eventIds, productType = 'event_activation', planSlug = 'esencial', promoId } = body
    // Note: finalPrice from client is intentionally ignored - price calculated server-side
    // Accept both eventId (singular) and eventIds (array) — use first one
    const resolvedEventId = eventId ?? (Array.isArray(eventIds) ? eventIds[0] : eventIds)
    const userId = session.user.id
    const product = PRODUCTS[productType as ProductType]
    if (!product) return NextResponse.json({ error: 'Producto inválido' }, { status: 400 })
    if (!resolvedEventId) return NextResponse.json({ error: 'eventId requerido' }, { status: 400 })

    // Calculate price server-side - never trust client
    let livePrice = await getLivePlanPrice(planSlug, product.amount)
    if (promoId) {
      try {
        const promo = await prisma.pricingPlan ? null : null // PayPal uses same logic as Stripe via shared service
        // Apply promo server-side
        const { prisma: db } = await import('@/lib/prisma')
        const promoData = await db.promoCode.findUnique({
          where: { id: promoId },
          include: { uses: { where: { userId: session.user.id } } }
        })
        const now = new Date()
        if (promoData?.isActive && promoData.validFrom <= now &&
          (!promoData.validUntil || promoData.validUntil >= now) &&
          (!promoData.maxUses || promoData.usedCount < promoData.maxUses) &&
          promoData.uses.length < promoData.maxUsesPerUser &&
          (promoData.appliesTo === 'all' || promoData.appliesTo === planSlug)) {
          const discount = promoData.discountType === 'percent'
            ? livePrice * promoData.discountValue / 100
            : Math.min(promoData.discountValue, livePrice)
          livePrice = Math.max(0.5, +(livePrice - discount).toFixed(2))
        }
      } catch (e) { console.error('[PayPal] promo error:', e) }
    }

    const event = await prisma.event.findFirst({ where: { id: resolvedEventId, userId } })
    if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })

    if (event.status === 'PAID') return NextResponse.json({ already: true })

    const payment = await prisma.payment.create({
      data: {
        userId, eventId: resolvedEventId,
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
      cancelUrl:  `${appUrl}/dashboard/events/${resolvedEventId}?payment=cancelled`,
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: `paypal_${orderId}` } // reuse field for PayPal order ID,
    })

    return NextResponse.json({ url: approveUrl, orderId })
  } catch (error: any) {
    console.error('[PayPal checkout]', error)
    return NextResponse.json({ error: error.message ?? 'Error' }, { status: 500 })
  }
}
