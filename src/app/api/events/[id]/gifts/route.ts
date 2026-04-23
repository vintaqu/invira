export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const event = await prisma.event.findFirst({ where: { id: id, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const gifts = await prisma.gift.findMany({ where: { eventId: id }, orderBy: { position: 'asc' } })
  return NextResponse.json({ gifts })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const event = await prisma.event.findFirst({ where: { id: id, userId: session.user.id } })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = await req.json()
    const count = await prisma.gift.count({ where: { eventId: id } })
    const gift = await prisma.gift.create({
      data: { eventId: id, name: body.name, description: body.description, price: body.price ? Number(body.price) : null, url: body.url, position: count },
    })
    return NextResponse.json({ gift }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
