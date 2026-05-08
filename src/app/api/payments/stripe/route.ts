export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PaymentService, ProductType } from '@/modules/payments/payment.service'
import { prisma } from '@/lib/prisma'
import { EventService } from '@/modules/events/event.service'

async function getPromoDiscount(promoId: string, userId: string, planSlug: string, baseAmount: number): Promise<number> {
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

    const baseEuros = baseAmount / 100
    const discountEuros = promo.discountType === 'percent'
      ? baseEuros * promo.discountValue / 100
      : Math.min(promo.discountValue, baseEuros)
    return Math.round(discountEuros * 100) // return in cents
  } catch { return 0 }
}

async function recordPromoUse(promoId: string, userId: string, paymentId: string | null, discountCents: number) {
  try {
    const promo = await prisma.promoCode.findUnique({ where: { id: promoId } })
    if (!promo) return
    await prisma.$transaction([
      prisma.promoCodeUse.create({
        data: { promoCodeId: promoId, userId, paymentId, discount: discountCents / 100 }
      }),
      prisma.promoCode.update({
        where: { id: promoId },
        data: { usedCount: { increment: 1 } }
      })
    ])
  } catch {}
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { eventIds, productType = 'event_activation', planSlug = 'esencial', promoId } = body
    const eventId = Array.isArray(eventIds) ? eventIds[0] : eventIds
    if (!eventId) return NextResponse.json({ error: 'eventId requerido' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const userId = session.user.id

    // Get base price from PaymentService (respects plan discounts)
    // We need to calculate server-side without calling createCheckout yet
    const { PRODUCTS } = await import('@/modules/payments/payment.service')
    const product = PRODUCTS[productType as ProductType]
    if (!product) return NextResponse.json({ error: 'Producto inválido' }, { status: 400 })

    // Get live base price
    const plan = await prisma.pricingPlan.findUnique({ where: { slug: planSlug } })
    let baseAmount = product.amount // cents
    if (plan && plan.price > 0) {
      const d = plan.discount as { pct: number; until: string | null } | null
      const expired = d?.until ? new Date(d.until) < new Date() : false
      if (d?.pct && d.pct > 0 && !expired) {
        baseAmount = Math.round(plan.price * (1 - d.pct / 100) * 100)
      } else {
        baseAmount = Math.round(plan.price * 100)
      }
    }

    // Apply promo discount server-side
    let discountCents = 0
    if (promoId) {
      discountCents = await getPromoDiscount(promoId, userId, planSlug, baseAmount)
    }
    const finalAmount = Math.max(0, baseAmount - discountCents)

    // ── FREE: publish directly without Stripe ──────────────────
    if (finalAmount === 0) {
      await EventService.publish(eventId)
      if (promoId && discountCents > 0) {
        await recordPromoUse(promoId, userId, null, discountCents)
      }
      return NextResponse.json({ url: `${appUrl}/dashboard/events/${eventId}/success`, free: true })
    }

    // ── PAID: go through Stripe ────────────────────────────────
    const { url } = await PaymentService.createCheckout({
      userId,
      eventId,
      productType: productType as ProductType,
      successUrl: `${appUrl}/dashboard/events/${eventId}/success`,
      cancelUrl: `${appUrl}/dashboard/events/${eventId}?payment=cancelled`,
      planSlug,
      promoId,
      finalAmountCents: finalAmount,
    } as any)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('[Stripe checkout]', error)
    return NextResponse.json({ error: error.message ?? 'Error' }, { status: 500 })
  }
}
