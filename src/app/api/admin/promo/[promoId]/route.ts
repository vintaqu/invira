export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { promoId } = await params
  const body = await req.json()
  const promo = await prisma.promoCode.update({
    where: { id: promoId },
    data: {
      ...(body.description !== undefined && { description: body.description }),
      ...(body.discountType !== undefined && { discountType: body.discountType }),
      ...(body.discountValue !== undefined && { discountValue: Number(body.discountValue) }),
      ...(body.appliesTo !== undefined && { appliesTo: body.appliesTo }),
      ...(body.minAmount !== undefined && { minAmount: body.minAmount ? Number(body.minAmount) : null }),
      ...(body.maxUses !== undefined && { maxUses: body.maxUses ? Number(body.maxUses) : null }),
      ...(body.maxUsesPerUser !== undefined && { maxUsesPerUser: Number(body.maxUsesPerUser) }),
      ...(body.validUntil !== undefined && { validUntil: body.validUntil ? new Date(body.validUntil) : null }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    }
  })
  return NextResponse.json({ promo })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ promoId: string }> }) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error
  const { promoId } = await params
  await prisma.promoCode.delete({ where: { id: promoId } })
  return NextResponse.json({ ok: true })
}
