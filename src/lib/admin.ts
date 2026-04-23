import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

type AdminAuthSuccess = { error: null; session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>; userId: string; role: string }
type AdminAuthFailure = { error: NextResponse; session?: never; userId?: never; role?: never }
type AdminAuth = AdminAuthSuccess | AdminAuthFailure

export async function requireAdmin(): Promise<AdminAuth> {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { error: null, session, userId: session.user.id, role }
}
