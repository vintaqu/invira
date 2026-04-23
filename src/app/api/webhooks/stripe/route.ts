// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PaymentService } from '@/modules/payments/payment.service'
import { headers } from 'next/headers'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.arrayBuffer()
  const payload = Buffer.from(body)
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const result = await PaymentService.handleWebhook(payload, signature)
    return NextResponse.json(result)
  } catch (error) {
    console.error('[Stripe Webhook Error]', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
