export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = req.nextUrl
  const search = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? undefined
  const page   = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit  = 20
  const skip   = (page - 1) * limit

  const where: any = {
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }] } : {}),
    ...(status ? { status } : {}),
  }

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { guests: true, rsvps: true } },
        payments: { where: { status: 'COMPLETED' }, select: { amount: true } },
      },
    }),
    prisma.event.count({ where }),
  ])

  return NextResponse.json({ events, total, page, pages: Math.ceil(total / limit) })
}
