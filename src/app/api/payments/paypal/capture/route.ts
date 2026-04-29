export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'
import { EventService } from '@/modules/events/event.service'
import { emailService } from '@/lib/email'

// PayPal redirects here after user approves payment
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const paymentId = searchParams.get('paymentId')
  const eventId   = searchParams.get('eventId')
  const token     = searchParams.get('token') // PayPal order ID

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!paymentId || !eventId || !token) {
    return NextResponse.redirect(`${appUrl}/dashboard?error=paypal_invalid`)
  }

  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment) return NextResponse.redirect(`${appUrl}/dashboard?error=not_found`)
    if (payment.status === 'COMPLETED') {
      return NextResponse.redirect(`${appUrl}/dashboard/events/${eventId}/success`)
    }

    // Capture the payment
    const result = await capturePayPalOrder(token)

    if (result.status === 'COMPLETED') {
      // Mark payment as completed
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          stripePaymentIntent: `paypal_capture_${result.captureId}`,
          paidAt: new Date(),
        },
      })

      // Publish the event
      await EventService.publish(eventId)

      // Register promo code use if applicable
      try {
        const promoUse = await prisma.promoCodeUse.findFirst({
          where: { paymentId: payment.id }
        })
        if (!promoUse) {
          // Check if payment has promoId in metadata
          const meta = payment.metadata as any
          if (meta?.promoId) {
            await prisma.$transaction([
              prisma.promoCodeUse.create({
                data: {
                  promoCodeId: meta.promoId,
                  userId: payment.userId,
                  paymentId: payment.id,
                  discount: meta.discountAmount ?? 0,
                }
              }),
              prisma.promoCode.update({
                where: { id: meta.promoId },
                data: { usedCount: { increment: 1 } }
              })
            ])
          }
        }
      } catch (e) { /* non-blocking */ }

      // Send activation email
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { user: true },
      })
      if (event?.user?.email) {
        await emailService.sendEventActivated({
          to: event.user.email,
          userName: event.user.name ?? 'Usuario',
          eventTitle: event.title,
          eventUrl: `${appUrl}/event/${event.slug}`,
          dashboardUrl: `${appUrl}/dashboard/events/${eventId}`,
        }).catch(() => {}) // non-blocking
      }

      return NextResponse.redirect(`${appUrl}/dashboard/events/${eventId}/success`)
    }

    // Payment not completed
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    })
    return NextResponse.redirect(`${appUrl}/dashboard/events/${eventId}?payment=failed`)
  } catch (error: any) {
    console.error('[PayPal capture]', error)
    return NextResponse.redirect(`${appUrl}/dashboard/events/${eventId}?payment=error`)
  }
}
