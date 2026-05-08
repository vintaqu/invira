export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder, paypalConfigured } from '@/lib/paypal'
import { PRODUCTS, ProductType } from '@/modules/payments/payment.service'
import { EventService } from '@/modules/events/event.service'

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

async function applyPromo(promoId: string, userId: string, planSlug: string, basePrice: number): Promise<number> {
  try {
    const promo = await prisma.promoCode.findUnique({
      where: { id: promoId },
      include: { uses: { where: { userId } } }
    })
    const now = new Date()
    if (!promo || !promo.isActive) return 0
    if (promo.validFrom > now) return 0
    if (promo.validUntil && promo.validUntil < now) return 0
    if (promo.maxUses && promo.usedCount >= promo.maxUses) return 0
    if (promo.uses.length >= promo.maxUsesPerUser) return 0
    if (promo.appliesTo !== 'all' && promo.appliesTo !== planSlug) return 0

    return promo.discountType === 'percent'
      ? +(basePrice * promo.discountValue / 100).toFixed(2)
      : Math.min(promo.discountValue, basePrice)
  } catch { return 0 }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { eventIds, productType = 'event_activation', planSlug = 'esencial', promoId } = body
    const resolvedEventId = Array.isArray(eventIds) ? eventIds[0] : eventIds
    if (!resolvedEventId) return NextResponse.json({ error: 'eventId requerido' }, { status: 400 })

    const userId = session.user.id
    const product = PRODUCTS[productType as ProductType]
    if (!product) return NextResponse.json({ error: 'Producto inválido' }, { status: 400 })

    // Get base price server-side
    let livePrice = await getLivePlanPrice(planSlug, product.amount)

    // Apply promo server-side
    let discountAmount = 0
    if (promoId) {
      discountAmount = await applyPromo(promoId, userId, planSlug, livePrice)
      livePrice = Math.max(0, +(livePrice - discountAmount).toFixed(2))
    }

    const event = await prisma.event.findFirst({ where: { id: resolvedEventId, userId } })
    if (!event) return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 })
    if (event.status === 'PAID') return NextResponse.json({ already: true })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // ── FREE: publish directly ─────────────────────────────────
    if (livePrice === 0) {
      await EventService.publish(resolvedEventId)
      if (promoId && discountAmount > 0) {
        try {
          const promo = await prisma.promoCode.findUnique({ where: { id: promoId } })
          if (promo) {
            await prisma.$transaction([
              prisma.promoCodeUse.create({
                data: { promoCodeId: promoId, userId, paymentId: null, discount: discountAmount }
              }),
              prisma.promoCode.update({
                where: { id: promoId },
                data: { usedCount: { increment: 1 } }
              })
            ])
          }
        } catch {}
      }
      return NextResponse.json({ url: `${appUrl}/dashboard/events/${resolvedEventId}/success`, free: true })
    }

    // ── PAID: go through PayPal ────────────────────────────────
    if (!paypalConfigured) {
      return NextResponse.json({ error: 'PayPal no configurado' }, { status: 503 })
    }

    const payment = await prisma.payment.create({
      data: {
        userId, eventId: resolvedEventId,
        amount: livePrice,
        currency: product.currency,
        status: 'PENDING',
        productType,
        metadata: { eventTitle: event.title, eventSlug: event.slug, provider: 'paypal', promoId: promoId ?? null },
      },
    })

    const { orderId, approveUrl } = await createPayPalOrder({
      amount: livePrice,
      currency: product.currency.toUpperCase(),
      description: `${product.name} — ${event.title}`,
      paymentId: payment.id,
      successUrl: `${appUrl}/api/payments/paypal/capture?paymentId=${payment.id}&eventId=${resolvedEventId}`,
      cancelUrl: `${appUrl}/dashboard/events/${resolvedEventId}?payment=cancelled`,
    })

    await prisma.payment.update({
      where: { id: payment.id },
      data: { stripeSessionId: `paypal_${orderId}` },
    })

    return NextResponse.json({ url: approveUrl, orderId })
  } catch (error: any) {
    console.error('[PayPal checkout]', error)
    return NextResponse.json({ error: error.message ?? 'Error' }, { status: 500 })
  }
}
