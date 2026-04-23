export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const now = new Date()
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const last7d    = new Date(Date.now() - 7 * 86400000)
  const last30d   = new Date(Date.now() - 30 * 86400000)

  const [
    totalUsers, usersThisMonth, usersLastMonth,
    totalEvents, eventsThisMonth, eventsLastMonth,
    paidEvents, paidThisMonth,
    totalRevenue, revenueThisMonth,
    totalRSVPs, rsvpConfirmed, referralVisits,
    recentUsers, recentEvents, recentPayments,
    dailySignups, dailyRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thisMonth } } }),
    prisma.user.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth } } }),
    prisma.event.count({ where: { status: { not: 'ARCHIVED' } } }),
    prisma.event.count({ where: { createdAt: { gte: thisMonth }, status: { not: 'ARCHIVED' } } }),
    prisma.event.count({ where: { createdAt: { gte: lastMonth, lt: thisMonth }, status: { not: 'ARCHIVED' } } }),
    prisma.event.count({ where: { status: 'PAID' } }),
    prisma.event.count({ where: { status: 'PAID', paidAt: { gte: thisMonth } } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: thisMonth } }, _sum: { amount: true } }),
    prisma.rSVP.count(),
    prisma.rSVP.count({ where: { status: 'CONFIRMED' } }),
    prisma.analytics.count({ where: { type: 'referral_visit' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, name: true, email: true, createdAt: true, role: true, _count: { select: { events: true } } } }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 8, select: { id: true, title: true, slug: true, status: true, type: true, createdAt: true, paidAt: true, user: { select: { name: true, email: true } }, _count: { select: { guests: true } } } }),
    prisma.payment.findMany({ where: { status: 'COMPLETED' }, orderBy: { paidAt: 'desc' }, take: 8, select: { id: true, amount: true, currency: true, paidAt: true, productType: true, user: { select: { name: true, email: true } }, event: { select: { title: true, slug: true } } } }),
    // Daily signups last 14 days
    Promise.all(Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      const start = new Date(d.setHours(0,0,0,0))
      const end   = new Date(d.setHours(23,59,59,999))
      return prisma.user.count({ where: { createdAt: { gte: start, lte: end } } })
        .then(count => ({ date: start.toISOString().split('T')[0], count }))
    })),
    // Daily revenue last 14 days
    Promise.all(Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - (13 - i) * 86400000)
      const start = new Date(d.setHours(0,0,0,0))
      const end   = new Date(d.setHours(23,59,59,999))
      return prisma.payment.aggregate({ where: { status: 'COMPLETED', paidAt: { gte: start, lte: end } }, _sum: { amount: true } })
        .then(r => ({ date: start.toISOString().split('T')[0], amount: r._sum.amount ?? 0 }))
    })),
  ])

  return NextResponse.json({
    users:    { total: totalUsers, thisMonth: usersThisMonth, lastMonth: usersLastMonth, growth: usersLastMonth > 0 ? Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100) : 100 },
    events:   { total: totalEvents, thisMonth: eventsThisMonth, lastMonth: eventsLastMonth, paid: paidEvents, paidThisMonth },
    revenue:  { total: totalRevenue._sum.amount ?? 0, thisMonth: revenueThisMonth._sum.amount ?? 0 },
    rsvps:    { total: totalRSVPs, confirmed: rsvpConfirmed, rate: totalRSVPs > 0 ? Math.round((rsvpConfirmed / totalRSVPs) * 100) : 0 },
    growth:   { referralVisits },
    recentUsers, recentEvents, recentPayments,
    charts: { signups: dailySignups, revenue: dailyRevenue },
  })
}
