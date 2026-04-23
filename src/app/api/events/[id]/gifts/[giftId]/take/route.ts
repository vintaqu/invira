export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string; giftId: string }> }) {
  const { giftId, id } = await params
  try {
    const gift = await prisma.gift.findFirst({ where: { id: giftId, eventId: id } })
    if (!gift) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (gift.isTaken) return NextResponse.json({ error: 'Already taken' }, { status: 409 })

    const updated = await prisma.gift.update({
      where: { id: giftId },
      data: { isTaken: true, takenAt: new Date() },
    })
    return NextResponse.json({ gift: updated })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
