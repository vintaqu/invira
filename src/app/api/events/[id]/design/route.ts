export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const event = await prisma.event.findFirst({
    where: { id: id, userId: session.user.id },
    select: { customData: true, heroImage: true, musicUrl: true },
  })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ design: (event.customData as any)?.design ?? {} })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const event = await prisma.event.findFirst({
      where: { id: id, userId: session.user.id },
    })
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const currentData = (event.customData as any) ?? {}

    const updated = await prisma.event.update({
      where: { id: id },
      data: {
        heroImage: body.heroImage ?? event.heroImage,
        musicUrl:  body.musicUrl  ?? event.musicUrl,
        customData: { ...currentData, design: body.design ?? body },
      },
      select: { id: true, customData: true, heroImage: true },
    })

    return NextResponse.json({ design: (updated.customData as any)?.design ?? {} })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
