export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/modules/analytics/analytics.service'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const guest = await prisma.guest.findUnique({
    where: { accessToken: token },
    include: { event: { select: { slug: true, id: true, status: true } } },
  })

  if (!guest || !guest.event) {
    return NextResponse.redirect(new URL('/', req.url))
  }
  if (guest.event.status !== 'PAID') {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const channel = req.nextUrl.searchParams.get('ch') ?? undefined
  await analyticsService.trackInvitationOpen(token, guest.eventId, channel)

  const url = new URL(`/event/${guest.event.slug}`, req.url)
  url.searchParams.set('g', token)
  if (channel) url.searchParams.set('ch', channel)
  return NextResponse.redirect(url)
}
