import { getServerSession } from 'next-auth'

export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/')
  const role = session.user.role
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') redirect('/dashboard')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f4f1', fontFamily: 'Inter,sans-serif' }}>
      <AdminSidebar user={session.user} />
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh', background: '#f5f4f1' }}>
        {children}
      </main>
    </div>
  )
}
