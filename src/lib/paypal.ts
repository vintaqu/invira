// PayPal Orders API v2 — no SDK needed, pure fetch
// Docs: https://developer.paypal.com/docs/api/orders/v2/

const BASE = process.env.PAYPAL_MODE === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export const paypalConfigured = !!(
  process.env.PAYPAL_CLIENT_ID &&
  process.env.PAYPAL_CLIENT_SECRET
)

// ── Get OAuth token ────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const creds = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!data.access_token) throw new Error('PayPal auth failed')
  return data.access_token
}

// ── Create Order ───────────────────────────────────────────────
export async function createPayPalOrder(params: {
  amount: number      // in euros, e.g. 29
  currency?: string   // default 'EUR'
  description: string
  paymentId: string   // our internal payment record ID
  successUrl: string
  cancelUrl: string
}) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': params.paymentId, // idempotency key
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: params.paymentId,
        description: params.description,
        amount: {
          currency_code: params.currency ?? 'EUR',
          value: params.amount.toFixed(2),
        },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            brand_name: 'Evochi',
            locale: 'es-ES',
            landing_page: 'LOGIN',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'PAY_NOW',
            return_url: params.successUrl,
            cancel_url: params.cancelUrl,
          },
        },
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal order failed: ${JSON.stringify(data)}`)

  // Find the approve link
  const approveLink = data.links?.find((l: any) => l.rel === 'payer-action')?.href
  if (!approveLink) throw new Error('No PayPal approve URL returned')

  return { orderId: data.id as string, approveUrl: approveLink as string }
}

// ── Capture Payment ────────────────────────────────────────────
export async function capturePayPalOrder(orderId: string) {
  const token = await getAccessToken()

  const res = await fetch(`${BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal capture failed: ${JSON.stringify(data)}`)

  const status = data.status // 'COMPLETED'
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  return {
    status,
    captureId: capture?.id as string,
    amount: capture?.amount?.value as string,
    referenceId: data.purchase_units?.[0]?.reference_id as string,
  }
}
