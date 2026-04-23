export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GuestService } from '@/modules/guests/guest.service'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await prisma.event.findFirst({
      where: { id: id, userId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const guests = body.guests as Array<{ name: string; email?: string; phone?: string; group?: string }>
    if (!Array.isArray(guests) || guests.length === 0) {
      return NextResponse.json({ error: 'No guests provided' }, { status: 400 })
    }

    const created = await GuestService.bulkImport({ eventId: id, guests })
    return NextResponse.json({ created: created.length, guests: created }, { status: 201 })
  } catch (error) {
    console.error('[Import]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
