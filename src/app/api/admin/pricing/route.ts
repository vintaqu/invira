export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

const DEFAULT_PLANS = [
  {
    id: 'plan_free', slug: 'free', name: 'Preview', price: 0, maxEvents: 0, maxGuests: 0,
    features: ['Editor visual completo','Generación de texto con IA','Vista previa ilimitada','Múltiples borradores'],
    notFeatures: ['Enlace público activo','RSVP de invitados','Analytics'],
    discount: null, badge: null, isActive: true, sortOrder: 0,
  },
  {
    id: 'plan_esencial', slug: 'esencial', name: 'Esencial', price: 29, maxEvents: 1, maxGuests: 300,
    features: ['1 evento publicado','RSVP ilimitado','Hasta 300 invitados','QR Check-in','Analytics básicos','Enlace personalizable','Música de fondo'],
    notFeatures: ['Invitados ilimitados','Analytics avanzados','Dominio personalizado','Recordatorios automáticos'],
    discount: null, badge: null, isActive: true, sortOrder: 1,
  },
  {
    id: 'plan_premium', slug: 'premium', name: 'Premium', price: 59, maxEvents: 3, maxGuests: -1,
    features: ['Hasta 3 eventos publicados','Invitados ilimitados','Analytics avanzados','Dominio personalizado','Recordatorios automáticos','Soporte prioritario','Todo de Esencial incluido'],
    notFeatures: [],
    discount: null, badge: 'Más popular', isActive: true, sortOrder: 2,
  },
]

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    let plans = await prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } })

    // Auto-seed if table is empty
    if (plans.length === 0) {
      await Promise.all(DEFAULT_PLANS.map(p =>
        prisma.pricingPlan.upsert({
          where: { slug: p.slug },
          update: {},
          create: p as any,
        })
      ))
      plans = await prisma.pricingPlan.findMany({ orderBy: { sortOrder: 'asc' } })
    }

    return NextResponse.json({ plans })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (auth.error) return auth.error

    const body = await req.json()
    const { slug, price, maxEvents, maxGuests, features, notFeatures, discount, badge, name } = body

    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

    const updated = await prisma.pricingPlan.update({
      where: { slug },
      data: {
        ...(price       !== undefined && { price: Number(price) }),
        ...(maxEvents   !== undefined && { maxEvents: Number(maxEvents) }),
        ...(maxGuests   !== undefined && { maxGuests: Number(maxGuests) }),
        ...(features    !== undefined && { features }),
        ...(notFeatures !== undefined && { notFeatures }),
        ...(discount    !== undefined && { discount: discount || null }),
        ...(badge       !== undefined && { badge: badge || null }),
        ...(name        !== undefined && { name }),
      },
    })
    return NextResponse.json({ plan: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
