export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const body = await req.json()
    const { title, artist, suggestedBy } = z.object({
      title: z.string().min(1).max(200),
      artist: z.string().max(200).optional(),
      suggestedBy: z.string().max(100).optional(),
    }).parse(body)

    const song = await prisma.song.create({
      data: { eventId: id, title, artist: artist ?? 'Desconocido', suggestedBy, isApproved: true },
    })
    return NextResponse.json({ song }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 400 })
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const songs = await prisma.song.findMany({
    where: { eventId: id, isApproved: true },
    orderBy: { votes: 'desc' },
  })
  return NextResponse.json({ songs })
}
