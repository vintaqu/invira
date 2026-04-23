import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventService } from '@/modules/events/event.service'
import { redirect } from 'next/navigation'
import { DashboardClient } from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/')

  const userId = session.user.id
  const events = userId ? await EventService.listByUser(userId) : []

  return (
    <DashboardClient
      userName={session.user.name ?? 'Usuario'}
      events={events.map(e => ({
        id:        e.id,
        title:     e.title,
        type:      e.type,
        status:    e.status,
        eventDate: e.eventDate.toISOString(),
        location:  (e as any).venueCity ?? (e as any).location ?? '',
        guests:    (e as any)._count?.guests ?? 0,
        rsvps:     (e as any)._count?.rsvps  ?? 0,
        slug:      e.slug,
      }))}
    />
  )
}
