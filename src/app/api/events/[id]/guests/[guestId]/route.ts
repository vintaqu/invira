export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  email:       z.string().email().optional().or(z.literal('').transform(() => undefined)),
  phone:       z.string().optional().or(z.literal('').transform(() => undefined)),
  group:       z.string().optional().or(z.literal('').transform(() => undefined)),
  tableNumber: z.number().optional(),
  tableName:   z.string().optional().or(z.literal('').transform(() => undefined)),
  isVIP:       z.boolean().optional(),
  menuChoice:  z.string().optional().or(z.literal('').transform(() => undefined)),
  notes:       z.string().optional().or(z.literal('').transform(() => undefined)),
})

async function verifyOwnership(eventId: string, guestId: string, userId: string) {
  const guest = await prisma.guest.findFirst({
    where: { id: guestId, eventId },
    include: { event: { select: { userId: true } } },
  })
  if (!guest || guest.event.userId !== userId) return null
  return guest
}

// PATCH — edit guest
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const { id, guestId } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guest = await verifyOwnership(id, guestId, session.user.id)
    if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const data = updateSchema.parse(body)

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data,
      include: {
        rsvp: true,
        invitation: { select: { status: true, sentAt: true, openedAt: true, channel: true } },
      },
    })

    return NextResponse.json({ guest: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
    }
    console.error('[Guest PATCH]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — remove guest
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; guestId: string }> }
) {
  const { id, guestId } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guest = await verifyOwnership(id, guestId, session.user.id)
    if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.guest.delete({ where: { id: guestId } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('[Guest DELETE]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
