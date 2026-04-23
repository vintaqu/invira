export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GuestService } from '@/modules/guests/guest.service'
import { z } from 'zod'

const createGuestSchema = z.object({
  name: z.string().min(1).max(120),
  // empty string → undefined so z.email() doesn't reject ""
  email: z.string().email().optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional().or(z.literal('').transform(() => undefined)),
  group: z.string().optional().or(z.literal('').transform(() => undefined)),
  tableNumber: z.number().optional(),
  tableName: z.string().optional().or(z.literal('').transform(() => undefined)),
  isVIP: z.boolean().optional(),
  menuChoice: z.string().optional().or(z.literal('').transform(() => undefined)),
  notes: z.string().optional().or(z.literal('').transform(() => undefined)),
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guests = await GuestService.listByEvent(id, session.user.id)
    return NextResponse.json({ guests })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = createGuestSchema.parse(body)

    const guest = await GuestService.create({ ...data, eventId: id })
    return NextResponse.json({ guest }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
