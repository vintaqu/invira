export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { GuestService } from '@/modules/guests/guest.service'
import { prisma } from '@/lib/prisma'
import { qrService } from '@/lib/qr'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  try {
    const { id: eventId, guestId } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const download = req.nextUrl.searchParams.get('download')

    // Fetch guest and verify ownership
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: { select: { userId: true, title: true } } },
    })
    if (!guest || guest.event.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/checkin/${guest.accessToken}`

    if (download === '1') {
      // Return raw PNG image for download
      const buffer = await qrService.generateBuffer(url)
      const filename = `qr-${guest.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    // Default: return base64 dataURL as JSON (for inline display)
    const qr = await qrService.generate(url, { width: 300 })
    return NextResponse.json({ qr })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
