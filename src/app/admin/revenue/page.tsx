'use client'
import { useState, useEffect } from 'react'

interface RevenueData { payments: any[]; total: number; count: number; avg: number; byType: any[]; daily: { date: string; amount: number }[] }

function MiniBar({ data, max }: { data: number; max: number }) {
  return <div style={{ width: `${Math.max(2, (data / Math.max(max, 1)) * 100)}%`, height: 20, background: '#10b981', borderRadius: 4, minWidth: 2 }} />
}

export default function AdminRevenuePage() {
  const [data, setData]     = useState<RevenueData | null>(null)
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/revenue?period=${period}`).then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [period])

  const maxDay = data ? Math.max(...data.daily.map(d => d.amount), 1) : 1

  return (
    <div style={{ padding: 32, fontFamily: 'Inter,sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 30, fontWeight: 400, color: '#0d0d0f', margin: '0 0 4px' }}>Ingresos</h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>Pagos procesados a través de Stripe</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['7d','30d','90d','1y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter,sans-serif',
                borderColor: p === period ? '#10b981' : '#e8e8ec',
                background: p === period ? '#10b981' : '#fff',
                color: p === period ? '#fff' : '#444' }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, border: '2px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
      ) : data ? (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total período', value: `€${data.total.toFixed(2)}` },
              { label: 'Transacciones', value: String(data.count) },
              { label: 'Ticket medio', value: `€${data.avg.toFixed(2)}` },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e8e8ec' }}>
                <p style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', margin: '0 0 8px' }}>{s.label}</p>
                <p style={{ fontFamily: 'Playfair Display,serif', fontSize: 36, fontWeight: 400, color: '#10b981', margin: 0, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', padding: 24, marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', marginBottom: 16 }}>Ingresos por día</p>
            <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 80 }}>
              {data.daily.map((d, i) => {
                const h = Math.max(2, (d.amount / maxDay) * 80)
                return (
                  <div key={d.date} title={`${d.date}: €${d.amount}`}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <div style={{ width: '100%', height: h, background: d.amount > 0 ? '#10b981' : '#f0f0f4', borderRadius: 3, opacity: i === data.daily.length - 1 ? 1 : 0.6 + (i / data.daily.length) * 0.4 }} />
                    {i % Math.ceil(data.daily.length / 7) === 0 && (
                      <span style={{ fontSize: 9, color: '#aaa', whiteSpace: 'nowrap' }}>
                        {new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* By type */}
          {data.byType.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', padding: 24, marginBottom: 24 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', marginBottom: 16 }}>Por tipo de producto</p>
              {data.byType.map(t => (
                <div key={t.productType} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ color: '#444', textTransform: 'capitalize' }}>{t.productType?.replace(/_/g, ' ') ?? 'Otro'}</span>
                    <span style={{ color: '#10b981', fontWeight: 500 }}>€{t._sum.amount?.toFixed(2)} · {t._count} pagos</span>
                  </div>
                  <MiniBar data={t._sum.amount ?? 0} max={data.total} />
                </div>
              ))}
            </div>
          )}

          {/* Transactions table */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ec', overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', padding: '16px 20px', borderBottom: '1px solid #f0f0f4', margin: 0 }}>Transacciones</p>
            {data.payments.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>Sin pagos en este período</div>
            ) : data.payments.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 20px', borderBottom: i < data.payments.length - 1 ? '1px solid #f8f8fa' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#10b981', flexShrink: 0 }}>€</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#0d0d0f', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.user?.name ?? p.user?.email ?? '—'}
                  </p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.event?.title} · {p.productType?.replace(/_/g,' ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#10b981', margin: '0 0 2px' }}>€{p.amount}</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
