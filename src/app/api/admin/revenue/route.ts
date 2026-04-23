export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const { searchParams } = req.nextUrl
  const period = searchParams.get('period') ?? '30d'
  const days   = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30
  const since  = new Date(Date.now() - days * 86400000)

  const [payments, totals, byType] = await Promise.all([
    prisma.payment.findMany({
      where: { status: 'COMPLETED', paidAt: { gte: since } },
      orderBy: { paidAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true, slug: true } },
      },
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', paidAt: { gte: since } },
      _sum: { amount: true }, _count: true, _avg: { amount: true },
    }),
    prisma.payment.groupBy({
      by: ['productType'],
      where: { status: 'COMPLETED', paidAt: { gte: since } },
      _sum: { amount: true }, _count: true,
    }),
  ])

  // Build daily chart
  const dailyMap: Record<string, number> = {}
  for (const p of payments) {
    if (!p.paidAt) continue
    const day = p.paidAt.toISOString().split('T')[0]
    dailyMap[day] = (dailyMap[day] ?? 0) + p.amount
  }
  const daily = Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000)
    const key = d.toISOString().split('T')[0]
    return { date: key, amount: dailyMap[key] ?? 0 }
  })

  return NextResponse.json({
    payments,
    total: totals._sum.amount ?? 0,
    count: totals._count,
    avg: Math.round((totals._avg.amount ?? 0) * 100) / 100,
    byType,
    daily,
  })
}
