export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { code, planSlug, basePrice } = await req.json()
    if (!code?.trim()) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
      include: { uses: { where: { userId: session.user.id } } }
    })

    if (!promo || !promo.isActive)
      return NextResponse.json({ error: 'Código no válido o inactivo' }, { status: 404 })

    const now = new Date()
    if (promo.validFrom > now)
      return NextResponse.json({ error: 'Este código aún no está activo' }, { status: 400 })
    if (promo.validUntil && promo.validUntil < now)
      return NextResponse.json({ error: 'Este código ha caducado' }, { status: 400 })
    if (promo.maxUses && promo.usedCount >= promo.maxUses)
      return NextResponse.json({ error: 'Este código ha alcanzado el límite de usos' }, { status: 400 })
    if (promo.uses.length >= promo.maxUsesPerUser)
      return NextResponse.json({ error: 'Ya has usado este código' }, { status: 400 })
    if (promo.appliesTo !== 'all' && promo.appliesTo !== planSlug)
      return NextResponse.json({ error: `Este código solo aplica al plan ${promo.appliesTo}` }, { status: 400 })
    if (promo.minAmount && basePrice < promo.minAmount)
      return NextResponse.json({ error: `Mínimo €${promo.minAmount} para usar este código` }, { status: 400 })

    const discountAmount = promo.discountType === 'percent'
      ? +(basePrice * promo.discountValue / 100).toFixed(2)
      : Math.min(promo.discountValue, basePrice)

    const finalPrice = Math.max(0, +(basePrice - discountAmount).toFixed(2))

    return NextResponse.json({
      valid: true,
      promoId: promo.id,
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      basePrice,
      finalPrice,
      label: promo.discountType === 'percent'
        ? `${promo.discountValue}% de descuento`
        : `€${promo.discountValue} de descuento`,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
