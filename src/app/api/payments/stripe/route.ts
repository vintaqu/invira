export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PaymentService, ProductType } from '@/modules/payments/payment.service'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { eventId, productType = 'event_activation' } = await req.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    const { url } = await PaymentService.createCheckout({
      userId: session.user.id,
      eventId,
      productType: productType as ProductType,
      successUrl: `${appUrl}/dashboard/events/${eventId}/success`,
      cancelUrl:  `${appUrl}/dashboard/events/${eventId}?payment=cancelled`,
    })

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('[Stripe checkout]', error)
    return NextResponse.json({ error: error.message ?? 'Error' }, { status: 500 })
  }
}
