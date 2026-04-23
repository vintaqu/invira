export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const items = await prisma.timelineItem.findMany({
    where: { eventId: id },
    orderBy: { position: 'asc' },
  })
  return NextResponse.json({ items })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const event = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { items } = await req.json()

    await prisma.timelineItem.deleteMany({ where: { eventId: id } })

    if (items?.length) {
      await prisma.timelineItem.createMany({
        data: items.map((item: any, i: number) => ({
          eventId:     id,
          title:       item.title       ?? '',
          description: item.description ?? '',
          date:        item.date ? new Date(item.date) : null,
          imageUrl:    item.imageUrl    ?? null,
          icon:        item.icon        ?? '✦',
          position:    i,
        })),
      })
    }

    const updated = await prisma.timelineItem.findMany({
      where: { eventId: id },
      orderBy: { position: 'asc' },
    })
    return NextResponse.json({ items: updated })
  } catch (e: any) {
    console.error('[Timeline PUT]', e)
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
