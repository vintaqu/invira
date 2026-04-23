export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const hotels = await prisma.hotel.findMany({ where: { eventId: id }, orderBy: { position: 'asc' } })
  return NextResponse.json({ hotels })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const event = await prisma.event.findFirst({ where: { id: id, userId: session.user.id } })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const count = await prisma.hotel.count({ where: { eventId: id } })
    const hotel = await prisma.hotel.create({
      data: { eventId: id, name: body.name, address: body.address, stars: body.stars ? Number(body.stars) : null, priceRange: body.priceRange, url: body.url, phone: body.phone, distance: body.distance ? Number(body.distance) : null, discount: body.discount, position: count },
    })
    return NextResponse.json({ hotel }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
