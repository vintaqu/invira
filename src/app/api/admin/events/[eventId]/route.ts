export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { EventService } from '@/modules/events/event.service'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { eventId } = await params
  const body = await req.json()

  // Admin can force publish/unpublish
  if (body.action === 'publish') {
    const event = await EventService.publish(eventId)
    return NextResponse.json({ event })
  }
  if (body.action === 'archive') {
    const event = await prisma.event.update({ where: { id: eventId }, data: { status: 'ARCHIVED', archivedAt: new Date() } })
    return NextResponse.json({ event })
  }
  if (body.action === 'draft') {
    const event = await prisma.event.update({ where: { id: eventId }, data: { status: 'DRAFT' } })
    return NextResponse.json({ event })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { eventId } = await params
  await prisma.event.delete({ where: { id: eventId } })
  return NextResponse.json({ success: true })
}
