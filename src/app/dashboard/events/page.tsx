import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { EventService } from '@/modules/events/event.service'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/')

  const userId = session.user.id
  const events = await EventService.listByUser(userId)

  return (
    <div className="p-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-['Playfair_Display',serif] text-4xl font-light text-[#1a1a1a] mb-1">Mis eventos</h1>
          <p className="text-[14px] text-[#888]">{events.length} evento{events.length !== 1 ? 's' : ''} creados</p>
        </div>
        <Link href="/dashboard/events/new"
          className="text-[13px] bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl hover:bg-[#84C5BC] transition-colors no-underline">
          + Crear evento
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white border border-[#e8e0d2] border-dashed rounded-2xl p-16 text-center">
          <p className="font-['Playfair_Display',serif] text-2xl font-light text-[#1a1a1a] mb-3">Sin eventos todavía</p>
          <p className="text-[14px] text-[#888] mb-6">Crea tu primera invitación digital en minutos</p>
          <Link href="/dashboard/events/new"
            className="inline-block text-[13px] bg-[#1a1a1a] text-white px-8 py-3 rounded-xl hover:bg-[#84C5BC] transition-colors no-underline">
            Crear mi primera invitación
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {events.map(event => (
            <Link key={event.id} href={`/dashboard/events/${event.id}`}
              className="bg-white border border-[#e8e0d2] rounded-2xl p-5 flex items-center justify-between hover:border-[#84C5BC] transition-colors group no-underline">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <p className="text-[15px] font-medium text-[#1a1a1a]">{event.title}</p>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium uppercase tracking-wide ${
                    event.status === 'PAID' ? 'bg-[#e6f5ec] text-[#1a6b3c]' : 'bg-[#fff7f0] text-[#8a4520]'
                  }`}>
                    {event.status === 'PAID' ? 'Publicado' : 'Borrador'}
                  </span>
                </div>
                <p className="text-[13px] text-[#888]">
                  {new Date(event.eventDate).toLocaleDateString('es-ES', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="font-['Playfair_Display',serif] text-2xl font-light text-[#1a1a1a]">
                    {(event as any)._count?.guests ?? 0}
                  </p>
                  <p className="text-[11px] text-[#888]">invitados</p>
                </div>
                <div className="text-right">
                  <p className="font-['Playfair_Display',serif] text-2xl font-light text-[#1a6b3c]">
                    {(event as any)._count?.rsvps ?? 0}
                  </p>
                  <p className="text-[11px] text-[#888]">RSVP</p>
                </div>
                <span className="text-[#84C5BC] group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
