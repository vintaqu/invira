export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; transportId: string }> }) {
  const { id, transportId } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const event = await prisma.event.findFirst({ where: { id: id, userId: session.user.id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.transport.delete({ where: { id: transportId } })
  return NextResponse.json({ success: true })
}
