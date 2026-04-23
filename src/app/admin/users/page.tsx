'use client'
import { useState, useEffect, useCallback } from 'react'

interface User { id: string; name: string; email: string; role: string; createdAt: string; paidEvents: number; totalSpent: number; _count: { events: number } }

const ROLE_BADGE: Record<string, [string, string]> = {
  USER:        ['#f0f0ff', '#6366f1'],
  ADMIN:       ['#fff0f0', '#ff6b6b'],
  SUPER_ADMIN: ['#0d0d0f', '#fff'],
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [roleFilter, setRole] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<User | null>(null)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('q', search)
    if (roleFilter) params.set('role', roleFilter)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, search, roleFilter])

  useEffect(() => { load() }, [load])

  async function updateRole(userId: string, role: string) {
    setSaving(true)
    await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) })
    setSaving(false)
    setSelected(null)
    load()
  }

  async function deleteUser(userId: string) {
    if (!confirm('¿Eliminar este usuario? Sus datos serán anonimizados.')) return
    await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    setSelected(null)
    load()
  }

  return (
    <div style={{ padding: 32, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>Usuarios</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{total} usuarios registrados</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Buscar por nombre o email…"
          style={{ flex: 1, border: '1px solid #e8e8ec', borderRadius: 10, padding: '10px 16px', fontSize: 13, outline: 'none', background: '#fff' }} />
        <select value={roleFilter} onChange={e => { setRole(e.target.value); setPage(1) }}
          style={{ border: '1px solid #e8e8ec', borderRadius: 10, padding: '10px 16px', fontSize: 13, background: '#fff', outline: 'none' }}>
          <option value="">Todos los roles</option>
          <option value="USER">Usuario</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPER_ADMIN">Super Admin</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto', padding: '10px 20px', background: '#f8f8fa', borderBottom: '1px solid #f0f0f4', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888' }}>
          <span>Nombre</span><span>Email</span><span>Rol</span><span>Eventos</span><span>Pagados</span><span>Gasto</span><span></span>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><div style={{ width: 24, height: 24, border: '2px solid #6366f1', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} /></div>
        ) : users.map((u, i) => (
          <div key={u.id}
            style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 1fr auto', alignItems: 'center', padding: '12px 20px', borderBottom: i < users.length - 1 ? '1px solid #f8f8fa' : 'none', cursor: 'pointer', transition: 'background .1s' }}
            onClick={() => setSelected(u)}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fafafa'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = '#fff'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6366f1', flexShrink: 0 }}>
                {u.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name ?? '—'}</span>
            </div>
            <span style={{ fontSize: 13, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</span>
            <span>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: ROLE_BADGE[u.role]?.[0] ?? '#f0f0f0', color: ROLE_BADGE[u.role]?.[1] ?? '#444' }}>{u.role}</span>
            </span>
            <span style={{ fontSize: 13, color: '#444' }}>{u._count.events}</span>
            <span style={{ fontSize: 13, color: '#444' }}>{u.paidEvents}</span>
            <span style={{ fontSize: 13, color: u.totalSpent > 0 ? '#10b981' : '#888', fontWeight: u.totalSpent > 0 ? 500 : 400 }}>€{u.totalSpent.toFixed(0)}</span>
            <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(u.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 13, fontFamily: 'Inter,sans-serif',
                borderColor: p === page ? '#6366f1' : '#e8e8ec',
                background: p === page ? '#6366f1' : '#fff',
                color: p === page ? '#fff' : '#444' }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* User detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setSelected(null)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, width: 440, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 22, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>{selected.name ?? 'Sin nombre'}</p>
                <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                ['Eventos totales', selected._count.events],
                ['Eventos pagados', selected.paidEvents],
                ['Gasto total', `€${selected.totalSpent.toFixed(2)}`],
                ['Registrado', new Date(selected.createdAt).toLocaleDateString('es-ES')],
              ].map(([l, v]) => (
                <div key={String(l)} style={{ background: '#f8f8fa', borderRadius: 10, padding: '10px 14px' }}>
                  <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px' }}>{l}</p>
                  <p style={{ fontSize: 16, fontWeight: 500, color: '#0d0d0f', margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Cambiar rol</p>
              <div style={{ display: 'flex', gap: 8 }}>
                {['USER', 'ADMIN', 'SUPER_ADMIN'].map(r => (
                  <button key={r} onClick={() => updateRole(selected.id, r)} disabled={saving || selected.role === r}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter,sans-serif', transition: 'all .15s',
                      borderColor: selected.role === r ? '#6366f1' : '#e8e8ec',
                      background: selected.role === r ? '#6366f1' : '#fff',
                      color: selected.role === r ? '#fff' : '#444',
                      opacity: saving ? 0.5 : 1 }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => deleteUser(selected.id)}
              style={{ width: '100%', padding: 10, background: 'none', border: '1px solid #fde8e8', borderRadius: 10, cursor: 'pointer', fontSize: 13, color: '#ef4444', fontFamily: 'Inter,sans-serif' }}>
              Anonimizar y eliminar usuario
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
