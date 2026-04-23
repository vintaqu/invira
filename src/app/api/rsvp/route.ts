export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { GuestService } from '@/modules/guests/guest.service'
import { z } from 'zod'

const rsvpSchema = z.object({
  guestToken: z.string(),
  eventId: z.string(),
  status: z.enum(['CONFIRMED', 'DECLINED', 'MAYBE']),
  companions: z.number().min(0).max(10).optional(),
  companionNames: z.array(z.string()).optional(),
  dietaryRestrictions: z.string().optional(),
  allergies: z.string().optional(),
  message: z.string().optional(),
  needsTransport: z.boolean().optional(),
  transportOption: z.string().optional(),
  customFields: z.record(z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 RSVP submissions per IP per 10 minutes
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
    const { checkRateLimit, rateLimitResponse } = await import('@/lib/rateLimit')
    if (!checkRateLimit(`rsvp:${ip}`, 5, 10 * 60_000)) {
      return rateLimitResponse(600)
    }

    const body = await req.json()
    const data = rsvpSchema.parse(body)
    const ua = req.headers.get('user-agent') ?? undefined

    const rsvp = await GuestService.submitRSVP({ ...data, ipAddress: ip, userAgent: ua })
    return NextResponse.json({ rsvp }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('[RSVP]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
