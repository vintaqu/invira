export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventService } from '@/modules/events/event.service'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  eventDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  coupleNames: z.string().optional(),
  description: z.string().optional(),
  heroImage: z.string().optional(),
  heroVideo: z.string().optional(),
  musicUrl: z.string().optional(),
  dressCode: z.string().optional(),
  agendaJson: z.any().optional(),
  menuJson: z.any().optional(),
  customData: z.any().optional(),
  isPrivate: z.boolean().optional(),
  privatePassword: z.string().optional(),
  maxGuests: z.number().optional(),
  allowPlusOne: z.boolean().optional(),
  locale: z.string().optional(),
  languages: z.array(z.string()).optional(),
  doors: z.string().optional(),
  ceremony: z.string().optional(),
  reception: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await EventService.getById(id, session.user.id)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ event })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = updateSchema.parse(body)

    const event = await EventService.update(id, session.user.id, {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    })

    return NextResponse.json({ event })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await EventService.archive(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
