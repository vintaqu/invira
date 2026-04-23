export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { userId } = await params

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      events: { orderBy: { createdAt: 'desc' }, include: { _count: { select: { guests: true } } } },
      payments: { where: { status: 'COMPLETED' }, orderBy: { paidAt: 'desc' } },
    },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { userId } = await params

  const body = await req.json()
  const allowed = ['role', 'name'] // only these fields can be changed by admin
  const data: any = {}
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key]
  }

  const user = await prisma.user.update({ where: { id: userId }, data, select: { id: true, name: true, email: true, role: true } })
  return NextResponse.json({ user })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { userId } = await params
  if (auth.userId === userId) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

  // Soft-delete: anonymize user data
  await prisma.user.update({
    where: { id: userId },
    data: { name: '[Eliminado]', email: `deleted_${userId}@deleted.local`, passwordHash: '', stripeCustomerId: null },
  })
  return NextResponse.json({ success: true })
}
