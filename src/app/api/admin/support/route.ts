export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

// Support uses the Message model as a simple ticket system
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  // Get all messages ordered by date - no metadata filter (field doesn't exist in schema)
  const messages = await prisma.message.findMany({
    where: {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      event: { select: { title: true, slug: true } },
    },
  }).catch(() => [])

  return NextResponse.json({ tickets: messages })
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { id, isApproved, isPinned } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const message = await prisma.message.update({
    where: { id },
    data: {
      ...(isApproved !== undefined && { isApproved }),
      ...(isPinned !== undefined && { isPinned }),
    },
  })

  return NextResponse.json({ message })
}
