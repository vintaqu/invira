export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { uses: true } } }
  })
  return NextResponse.json({ promos })
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) return auth.error

  const body = await req.json()
  const {
    code, description, discountType, discountValue,
    appliesTo = 'all', minAmount, maxUses, maxUsesPerUser = 1,
    validFrom, validUntil, isActive = true
  } = body

  if (!code || !discountType || !discountValue)
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })

  // Generate code if not provided
  const finalCode = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (finalCode.length < 3)
    return NextResponse.json({ error: 'El código debe tener al menos 3 caracteres' }, { status: 400 })

  const promo = await prisma.promoCode.create({
    data: {
      code: finalCode,
      description,
      discountType,
      discountValue: Number(discountValue),
      appliesTo,
      minAmount: minAmount ? Number(minAmount) : null,
      maxUses: maxUses ? Number(maxUses) : null,
      maxUsesPerUser: Number(maxUsesPerUser),
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      isActive,
    }
  })
  return NextResponse.json({ promo }, { status: 201 })
}
