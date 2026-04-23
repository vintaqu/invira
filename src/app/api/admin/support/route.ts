export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Support uses the Message model as a simple ticket system
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') ?? undefined

  // Get all contact messages (from the contact/support form)
  const messages = await prisma.message.findMany({
    where: status ? { metadata: { path: ['status'], equals: status } } : {},
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      event: { select: { title: true, slug: true } },
    },
  }).catch(() => []) // Message model might not exist yet

  return NextResponse.json({ tickets: messages })
}
