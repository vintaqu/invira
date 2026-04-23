'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Event { id: string; title: string; slug: string; status: string; type: string; createdAt: string; paidAt?: string; user: { name?: string; email: string }; _count: { guests: number; rsvps: number }; payments: { amount: number }[] }

const STATUS_COLORS: Record<string, [string, string]> = {
  PAID:     ['#d1fae5', '#065f46'],
  DRAFT:    ['#fef3c7', '#92400e'],
  ARCHIVED: ['#f3f4f6', '#6b7280'],
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('q', search)
    if (status) params.set('status', status)
    const res = await fetch(`/api/admin/events?${params}`)
    const data = await res.json()
    setEvents(data.events ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  async function doAction(eventId: string, action: string) {
    setActing(eventId)
    await fetch(`/api/admin/events/${eventId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    setActing(null)
    load()
  }

  async function deleteEvent(eventId: string) {
    if (!confirm('¿Eliminar este evento permanentemente? Esta acción no se puede deshacer.')) return
    await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
    load()
  }

  const revenue = (e: Event) => e.payments.reduce((a, p) => a + p.amount, 0)

  return (
    <div style={{ padding: 32, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>Eventos</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{total} eventos en total</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por título o slug…"
          style={{ flex: 1, border: '1px solid #e8e8ec', borderRadius: 10, padding: '10px 16px', fontSize: 13, outline: 'none', background: '#fff' }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
          style={{ border: '1px solid #e8e8ec', borderRadius: 10, padding: '10px 16px', fontSize: 13, background: '#fff', outline: 'none' }}>
          <option value="">Todos los estados</option>
          <option value="PAID">Publicados</option>
          <option value="DRAFT">Borradores</option>
          <option value="ARCHIVED">Archivados</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 1fr auto', padding: '10px 20px', background: '#f8f8fa', borderBottom: '1px solid #f0f0f4', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888' }}>
          <span>Evento</span><span>Propietario</span><span>Estado</span><span>Invitados</span><span>RSVPs</span><span>Revenue</span><span>Acciones</span>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div style={{ width: 24, height: 24, border: '2px solid #f59e0b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} /></div>
        ) : events.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#888', fontSize: 14 }}>No se encontraron eventos</div>
        ) : events.map((e, i) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr 1fr 1fr 1fr auto', alignItems: 'center', padding: '12px 20px', borderBottom: i < events.length - 1 ? '1px solid #f8f8fa' : 'none', gap: 8 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{e.slug}</p>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, color: '#444', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user?.name ?? '—'}</p>
              <p style={{ fontSize: 11, color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.user?.email}</p>
            </div>
            <span>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 20, background: STATUS_COLORS[e.status]?.[0] ?? '#f0f0f0', color: STATUS_COLORS[e.status]?.[1] ?? '#444' }}>
                {e.status === 'PAID' ? 'Publicado' : e.status === 'DRAFT' ? 'Borrador' : 'Archivado'}
              </span>
            </span>
            <span style={{ fontSize: 13, color: '#444' }}>{e._count.guests}</span>
            <span style={{ fontSize: 13, color: '#444' }}>{e._count.rsvps}</span>
            <span style={{ fontSize: 13, color: revenue(e) > 0 ? '#10b981' : '#888', fontWeight: revenue(e) > 0 ? 500 : 400 }}>
              {revenue(e) > 0 ? `€${revenue(e)}` : '—'}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {e.status === 'PAID' && (
                <a href={`/event/${e.slug}`} target="_blank"
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#f0f0ff', color: '#6366f1', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Ver
                </a>
              )}
              {e.status === 'DRAFT' && (
                <button onClick={() => doAction(e.id, 'publish')} disabled={acting === e.id}
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#d1fae5', color: '#065f46', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Publicar
                </button>
              )}
              {e.status !== 'ARCHIVED' && (
                <button onClick={() => doAction(e.id, 'archive')} disabled={acting === e.id}
                  style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                  Archivar
                </button>
              )}
              <button onClick={() => deleteEvent(e.id)}
                style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif',
                borderColor: p === page ? '#f59e0b' : '#e8e8ec',
                background: p === page ? '#f59e0b' : '#fff',
                color: p === page ? '#fff' : '#444' }}>
              {p}
            </button>
          ))}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
