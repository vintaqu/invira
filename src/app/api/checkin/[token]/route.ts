export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GuestService } from '@/modules/guests/guest.service'

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const guest = await prisma.guest.findUnique({ where: { accessToken: token } })
    if (!guest) return NextResponse.json({ error: 'Invitado no encontrado' }, { status: 404 })
    const body = await req.json().catch(() => ({}))
    const result = await GuestService.checkIn(guest.id, body.device)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const guest = await prisma.guest.findUnique({
    where: { accessToken: token },
    include: { event: { select: { title: true, eventDate: true } }, rsvp: true },
  })
  if (!guest) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({
    name: guest.name,
    table: guest.tableName ?? guest.tableNumber,
    isVIP: guest.isVIP,
    menuChoice: guest.menuChoice,
    rsvpStatus: guest.rsvp?.status,
    checkInStatus: guest.checkInStatus,
    checkedInAt: guest.checkedInAt,
    event: guest.event,
  })
}
