export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return NextResponse.json({ plans }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    })
  } catch {
    // Fallback hardcoded if DB not available
    return NextResponse.json({ plans: FALLBACK_PLANS })
  }
}

const FALLBACK_PLANS = [
  { slug:'free',     name:'Preview',  price:0,  maxEvents:0, badge:null,         features:['Editor completo','Preview ilimitada','IA texto'],       notFeatures:['Enlace público','RSVP'] },
  { slug:'esencial', name:'Esencial', price:29, maxEvents:1, badge:null,         features:['1 evento publicado','RSVP ilimitado','300 invitados','QR Check-in'], notFeatures:['Analytics avanzados','Dominio propio'] },
  { slug:'premium',  name:'Premium',  price:59, maxEvents:3, badge:'Más popular',features:['Hasta 3 eventos','Invitados ilimitados','Analytics avanzados','Dominio propio','Recordatorios automáticos'], notFeatures:[] },
]
