import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventService } from '@/modules/events/event.service'
import { EventEditor } from '@/components/dashboard/EventEditor'
import { notFound, redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/')

  const userId = session.user.id
  const event = await EventService.getById(id, userId)
  if (!event) notFound()

  const serialized = JSON.parse(JSON.stringify(event))
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#faf8f4' }} />}>
      <EventEditor event={serialized} />
    </Suspense>
  )
}
