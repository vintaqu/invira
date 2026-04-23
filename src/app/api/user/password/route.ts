export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { currentPassword, newPassword } = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }).parse(await req.json())
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user?.passwordHash) return NextResponse.json({ error: 'Cuenta OAuth sin contraseña' }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(newPassword, 12) } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Error' }, { status: 400 })
  }
}
