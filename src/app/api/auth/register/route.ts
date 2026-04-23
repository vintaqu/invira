export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'
import { z } from 'zod'

const schema = z.object({
  name:     z.string().min(2).max(80).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(8).max(100),
})

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60_000)) {
    return rateLimitResponse(900)
  }

  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await bcrypt.hash(password, 12),
      },
      select: { id: true, email: true, name: true },
    })

    // Welcome email — non-blocking
    emailService.sendWelcome({ to: email, name }).catch(err =>
      console.error('[Welcome email]', err)
    )

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.errors }, { status: 400 })
    }
    console.error('[Register]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
