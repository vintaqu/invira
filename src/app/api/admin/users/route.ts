export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = req.nextUrl
  const search  = searchParams.get('q') ?? ''
  const page    = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit   = 20
  const skip    = (page - 1) * limit
  const role    = searchParams.get('role') ?? undefined

  const where: any = {
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {}),
    ...(role ? { role } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where, skip, take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        stripeCustomerId: true,
        _count: { select: { events: true } },
        events: {
          where: { status: 'PAID' },
          select: { id: true },
          take: 100,
        },
        payments: {
          where: { status: 'COMPLETED' },
          select: { amount: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ])

  const enriched = users.map(u => ({
    ...u,
    paidEvents: u.events.length,
    totalSpent: u.payments.reduce((acc, p) => acc + p.amount, 0),
    events: undefined,
    payments: undefined,
  }))

  return NextResponse.json({ users: enriched, total, page, pages: Math.ceil(total / limit) })
}
