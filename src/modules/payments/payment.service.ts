import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { EventService } from '@/modules/events/event.service'
import { emailService } from '@/lib/email'

// Stripe is optional in local dev
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null

// Fallback prices if DB unavailable
export const PRODUCTS = {
  event_activation:    { name: 'Activación de Evento',       amount: 2900, currency: 'eur' },
  template_premium:    { name: 'Template Premium',           amount: 1500, currency: 'eur' },
  custom_domain:       { name: 'Dominio Personalizado',      amount: 4900, currency: 'eur' },
  analytics_advanced:  { name: 'Analytics Avanzados',        amount:  900, currency: 'eur' },
  reminders_auto:      { name: 'Recordatorios Automáticos',  amount:  700, currency: 'eur' },
} as const

export type ProductType = keyof typeof PRODUCTS

// Fetch live price from DB for a given plan slug
async function getLivePlanPrice(slug: string): Promise<number> {
  try {
    const plan = await prisma.pricingPlan.findUnique({ where: { slug } })
    if (plan && plan.price > 0) {
      // Apply discount if active and not expired
      const discount = plan.discount as { pct: number; until: string | null } | null
      if (discount?.pct && discount.pct > 0) {
        const expired = discount.until ? new Date(discount.until) < new Date() : false
        if (!expired) {
          return Math.round(plan.price * (1 - discount.pct / 100) * 100) // cents
        }
      }
      return Math.round(plan.price * 100) // cents
    }
  } catch {}
  return PRODUCTS.event_activation.amount // fallback
}

export class PaymentService {
  static async createCheckout(params: {
    userId: string
    eventId: string
    productType: ProductType
    successUrl: string
    cancelUrl: string
  }) {
    if (!stripe) {
      throw new Error('Stripe not configured. Add STRIPE_SECRET_KEY to .env.local')
    }

    const { userId, eventId, productType, successUrl, cancelUrl } = params
    const product = PRODUCTS[productType]

    // Use live price from DB for event_activation, respecting discounts
    const planSlug = (params as any).planSlug ?? 'esencial'
    const liveAmount = productType === 'event_activation'
      ? await getLivePlanPrice(planSlug)
      : product.amount

    const event = await prisma.event.findFirst({ where: { id: eventId, userId } })
    if (!event) throw new Error('Event not found')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new Error('User not found')

    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      })
      customerId = customer.id
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customerId } })
    }

    const payment = await prisma.payment.create({
      data: {
        userId, eventId,
        amount: liveAmount / 100,
        currency: product.currency,
        status: 'PENDING',
        productType,
        metadata: { eventTitle: event.title, eventSlug: event.slug },
      },
    })

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: product.currency,
          product_data: { name: product.name, description: `Evento: ${event.title}`, metadata: { eventId, productType } },
          unit_amount: liveAmount,
        },
        quantity: 1,
      }],
      metadata: { paymentId: payment.id, eventId, userId, productType },
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'es',
      allow_promotion_codes: true,
    })

    await prisma.payment.update({ where: { id: payment.id }, data: { stripeSessionId: session.id } })
    return { url: session.url!, sessionId: session.id }
  }

  static async handleWebhook(payload: Buffer, signature: string) {
    if (!stripe) throw new Error('Stripe not configured')

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '')
    } catch (err) {
      throw new Error(`Webhook signature failed: ${err}`)
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutComplete(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge)
        break
    }

    return { received: true }
  }

  private static async handleCheckoutComplete(session: Stripe.Checkout.Session) {
    const { paymentId, eventId, productType } = session.metadata!
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED', stripePaymentIntent: session.payment_intent as string, paidAt: new Date() },
    })
    if (productType === 'event_activation') {
      await EventService.publish(eventId)
      const event = await prisma.event.findUnique({ where: { id: eventId }, include: { user: true } })
      if (event?.user?.email) {
        await emailService.sendEventActivated({
          to: event.user.email,
          userName: event.user.name ?? 'Usuario',
          eventTitle: event.title,
          eventUrl: `${process.env.NEXT_PUBLIC_APP_URL}/event/${event.slug}`,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/${event.id}`,
        })
      }
    }
  }

  private static async handlePaymentFailed(intent: Stripe.PaymentIntent) {
    await prisma.payment.updateMany({ where: { stripePaymentIntent: intent.id }, data: { status: 'FAILED' } })
  }

  private static async handleRefund(charge: Stripe.Charge) {
    await prisma.payment.updateMany({
      where: { stripePaymentIntent: charge.payment_intent as string },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    })
  }

  static async getStatus(eventId: string, userId: string) {
    return prisma.payment.findMany({ where: { eventId, userId }, orderBy: { createdAt: 'desc' } })
  }
}
