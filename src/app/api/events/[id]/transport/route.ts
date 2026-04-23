export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const transport = await prisma.transport.findMany({ where: { eventId: id }, orderBy: { position: 'asc' } })
  return NextResponse.json({ transport })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const event = await prisma.event.findFirst({ where: { id: id, userId: session.user.id } })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const count = await prisma.transport.count({ where: { eventId: id } })
    const transport = await prisma.transport.create({
      data: { eventId: id, name: body.name, type: body.type ?? 'bus', origin: body.origin, destination: body.destination, departureTime: body.departureTime, returnTime: body.returnTime, capacity: body.capacity ? Number(body.capacity) : null, notes: body.notes, contactPhone: body.contactPhone, position: count },
    })
    return NextResponse.json({ transport }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
