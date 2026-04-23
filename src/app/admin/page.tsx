'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  users: { total: number; thisMonth: number; growth: number }
  events: { total: number; paid: number; paidThisMonth: number; thisMonth: number }
  revenue: { total: number; thisMonth: number }
  rsvps: { total: number; confirmed: number; rate: number }
  recentUsers: any[]
  recentEvents: any[]
  recentPayments: any[]
  charts: { signups: { date: string; count: number }[]; revenue: { date: string; amount: number }[] }
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 36 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, background: color, borderRadius: 2, opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.6, minHeight: 2, height: `${Math.max(2, (v / max) * 36)}px` }} />
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color, chart, href }: any) {
  return (
    <Link href={href ?? '#'} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 22, border: '1px solid #e8e8ec', cursor: 'pointer', transition: 'all .15s' }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = color}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#e8e8ec'}>
        <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>{label}</p>
        <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 12, color: '#888', margin: '0 0 10px' }}>{sub}</p>}
        {chart && <MiniChart data={chart} color={color} />}
      </div>
    </Link>
  )
}

const fmt = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n)
const eur = (n: number) => `€${n.toFixed(2)}`

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 28, height: 28, border: '2px solid #ff6b6b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!stats) return null

  const revenueChart = stats.charts.revenue.map(d => d.amount)
  const signupsChart = stats.charts.signups.map(d => d.count)

  return (
    <div style={{ padding: 32, fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 32, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>Panel de administración</h1>
        <p style={{ fontSize: 13, color: '#888', margin: 0 }}>{new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Usuarios totales" value={fmt(stats.users.total)}
          sub={`+${stats.users.thisMonth} este mes · ${stats.users.growth > 0 ? '+' : ''}${stats.users.growth}% vs anterior`}
          color="#6366f1" chart={signupsChart} href="/admin/users" />
        <StatCard label="Eventos creados" value={fmt(stats.events.total)}
          sub={`${stats.events.paid} publicados · +${stats.events.thisMonth} este mes`}
          color="#f59e0b" chart={null} href="/admin/events" />
        <StatCard label="Ingresos totales" value={eur(stats.revenue.total)}
          sub={`€${stats.revenue.thisMonth.toFixed(2)} este mes`}
          color="#10b981" chart={revenueChart} href="/admin/revenue" />
        <StatCard label="RSVPs confirmados" value={fmt(stats.rsvps.confirmed)}
          sub={`${stats.rsvps.rate}% de confirmación · ${stats.rsvps.total} totales`}
          color="#f43f5e" chart={null} href="/admin/events" />
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Recent users */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 500, fontSize: 13, color: '#0d0d0f', margin: 0 }}>Últimos usuarios</p>
            <Link href="/admin/users" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          {stats.recentUsers.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < stats.recentUsers.length - 1 ? '1px solid #f8f8fa' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6366f1', flexShrink: 0 }}>
                {u.name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name ?? 'Sin nombre'}</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{u._count.events} eventos</p>
                {u.role !== 'USER' && <span style={{ fontSize: 9, background: '#ff6b6b20', color: '#ff6b6b', padding: '1px 6px', borderRadius: 20 }}>{u.role}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 500, fontSize: 13, color: '#0d0d0f', margin: 0 }}>Últimos eventos</p>
            <Link href="/admin/events" style={{ fontSize: 12, color: '#f59e0b', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          {stats.recentEvents.map((e, i) => (
            <div key={e.id} style={{ padding: '10px 20px', borderBottom: i < stats.recentEvents.length - 1 ? '1px solid #f8f8fa' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</p>
                  <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{e.user?.name ?? '—'} · {e._count.guests} invitados</p>
                </div>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, flexShrink: 0,
                  background: e.status === 'PAID' ? '#d1fae5' : '#fef3c7',
                  color: e.status === 'PAID' ? '#065f46' : '#92400e' }}>
                  {e.status === 'PAID' ? 'Publicado' : 'Borrador'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent payments */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontWeight: 500, fontSize: 13, color: '#0d0d0f', margin: 0 }}>Últimos pagos</p>
            <Link href="/admin/revenue" style={{ fontSize: 12, color: '#10b981', textDecoration: 'none' }}>Ver todos →</Link>
          </div>
          {stats.recentPayments.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#888', fontSize: 13 }}>Sin pagos todavía</div>
          ) : stats.recentPayments.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: i < stats.recentPayments.length - 1 ? '1px solid #f8f8fa' : 'none' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>€</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.user?.name ?? '—'}</p>
                <p style={{ fontSize: 11, color: '#888', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.event?.title}</p>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981', margin: 0, flexShrink: 0 }}>€{p.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
