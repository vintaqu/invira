export const runtime = 'nodejs'

// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventService } from '@/modules/events/event.service'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1).max(120),
  type: z.enum(['WEDDING', 'BIRTHDAY', 'CORPORATE', 'BAPTISM', 'ANNIVERSARY', 'GRADUATION', 'QUINCEANERA', 'OTHER']),
  eventDate: z.string().optional(),   // accepts any date string, we parse it manually
  location: z.string().optional(),
  subtitle: z.string().optional(),
  designConfig: z.any().optional(),
  wizardMode: z.boolean().optional(),
  initialFeatures: z.any().optional(),
  featureData: z.any().optional(),
  templateId: z.string().optional(),
  locale: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const events = await EventService.listByUser(session.user.id)
    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validated = createEventSchema.parse(body)

    const parsedDate = validated.eventDate
      ? new Date(validated.eventDate)
      : new Date(Date.now() + 90 * 86400000)

    const event = await EventService.create({
      userId: session.user.id,
      title: validated.title,
      type: validated.type,
      eventDate: isNaN(parsedDate.getTime()) ? new Date(Date.now() + 90*86400000) : parsedDate,
      ...(validated.location && { location: validated.location }),
      ...(validated.subtitle && { subtitle: validated.subtitle }),
      ...(validated.designConfig && { designConfig: validated.designConfig }),
      templateId: validated.templateId,
      locale: validated.locale ?? 'es',
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ── app/api/events/[id]/route.ts ──────────────────────────

// app/api/events/[id]/publish/route.ts
// POST → trigger Stripe checkout for event_activation

// app/api/events/[id]/guests/route.ts
// GET  → list guests
// POST → add guest

// app/api/events/[id]/guests/import/route.ts
// POST → bulk CSV import

// app/api/events/[id]/analytics/route.ts
// GET → analytics summary

// app/api/events/[id]/export/route.ts
// GET?format=excel → download guest list
// GET?format=pdf   → download event summary

// app/api/rsvp/route.ts
// POST → submit RSVP (public, no auth)

// app/api/checkin/[token]/route.ts
// POST → check in guest by access token

// app/api/webhooks/stripe/route.ts
// POST → Stripe webhook handler

// app/api/ai/generate/route.ts
// POST → AI text/design generation

// app/api/invite/[token]/route.ts
// GET → redirect to personalized event URL
