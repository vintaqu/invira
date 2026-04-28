'use client'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { DesignEditor } from './DesignEditor'
import { PublishModal } from './PublishModal'
import { TimelineEditor } from './TimelineEditor'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────
interface AgendaItem { id: string; time: string; title: string; description: string }
interface Guest {
  id: string; name: string; email?: string; phone?: string; group?: string
  tableNumber?: number; tableName?: string; isVIP: boolean; accessToken: string
  checkInStatus: string; menuChoice?: string
  rsvp?: { status: string; companions: number; respondedAt?: string; dietaryRestrictions?: string }
  invitation?: { status: string; sentAt?: string; openedAt?: string; channel?: string }
}
interface AnalyticsData {
  overview: { totalViews: number; viewsLast7Days: number; confirmationRate: number; checkedIn: number }
  rsvp: { confirmed: number; declined: number; pending: number; total: number }
  channels: { channel: string; count: number }[]
}
interface Event {
  id: string; title: string; slug: string; status: string; eventDate: string
  type?: string
  coupleNames?: string; venueName?: string; venueAddress?: string; venueCity?: string
  description?: string; heroImage?: string; dressCode?: string; isPrivate: boolean
  doors?: string; ceremony?: string; reception?: string; locale?: string
  menuJson?: any; customData?: any; musicUrl?: string; latitude?: number; longitude?: number
  agendaJson?: AgendaItem[]; _count?: { guests: number; rsvps: number }
}

const TABS = [
  { id: 'General',   label: 'General',    icon: '○' },
  { id: 'Diseño',    label: 'Diseño',     icon: '◈' },
  { id: 'Timeline',  label: 'Historia',   icon: '◷' },
  { id: 'Invitados', label: 'Invitados',  icon: '◉' },
  { id: 'RSVP',      label: 'RSVP',       icon: '◎' },
  { id: 'Analytics', label: 'Analytics',  icon: '◻' },
  { id: 'Check-in',  label: 'Check-in',   icon: '◈' },
  { id: 'IA',        label: 'IA',         icon: '✦' },
  { id: 'Extras',    label: 'Extras',     icon: '◍' },
]

// ─── Shared input style ───────────────────────────────────────
const inputCls = 'w-full bg-white border border-[#e4ddd3] rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#6aada4] focus:ring-2 focus:ring-[#6aada4]/10 transition-all placeholder:text-[#c4b9af] font-[Inter,sans-serif]'

// ─── Section Card ─────────────────────────────────────────────
function Card({ title, children, hint }: { title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e2db] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="px-6 py-4 border-b border-[#f0ebe4] flex items-center justify-between">
        <p className="text-[11px] font-semibold tracking-[2px] uppercase text-[#a89880]">{title}</p>
        {hint && <p className="text-[11px] text-[#c4b9af]">{hint}</p>}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────
function Field({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div className={half ? 'flex-1 min-w-0' : ''}>
      <label className="block text-[11px] font-semibold tracking-[1.5px] uppercase text-[#a89880] mb-2">{label}</label>
      {children}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export function EventEditor({ event: initialEvent }: { event: Event }) {
  const [event, setEvent] = useState(initialEvent)
  const [tab, setTab] = useState('General')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [paymentModal, setPaymentModal] = useState<{ methods: { stripe: boolean; paypal: boolean }; eventId: string; productType: string } | null>(null)
  const [form, setForm] = useState({
    title: initialEvent.title,
    coupleNames: initialEvent.coupleNames ?? '',
    venueName: initialEvent.venueName ?? '',
    venueAddress: initialEvent.venueAddress ?? '',
    venueCity: initialEvent.venueCity ?? '',
    description: initialEvent.description ?? '',
    dressCode: initialEvent.dressCode ?? '',
    doors: initialEvent.doors ?? '',
    ceremony: initialEvent.ceremony ?? '',
    reception: initialEvent.reception ?? '',
    isPrivate: initialEvent.isPrivate,
    locale: initialEvent.locale ?? 'es',
  })

  const saveTimer = useRef<NodeJS.Timeout | null>(null)
  function scheduleAutosave(newForm: typeof form) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => doSave(newForm), 1800)
  }

  function updateForm(key: string, value: any) {
    const newForm = { ...form, [key]: value }
    setForm(newForm)
    scheduleAutosave(newForm)
  }

  async function doSave(data: typeof form) {
    setSaving(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
    } finally { setSaving(false) }
  }

  const [showPublishModal, setShowPublishModal] = useState(false)

  async function handlePublish() {
    setShowPublishModal(true)
    return
    setPublishing(true)
    try {
      const res = await fetch(`/api/events/${event.id}/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.selectPayment) {
        setPaymentModal({ methods: data.methods, eventId: data.eventId, productType: data.productType })
      } else if (data.url) {
        window.location.href = data.url
      } else if (data.activated || data.devMode) {
        window.location.href = `/dashboard/events/${event.id}/success`
      } else if (data.already) {
        window.location.reload()
      } else if (data.error) {
        alert('Error: ' + data.error)
      }
    } finally { setPublishing(false) }
  }

  async function payWithStripe() {
    if (!paymentModal) return
    setPublishing(true)
    try {
      const res = await fetch('/api/payments/stripe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: paymentModal.eventId, productType: paymentModal.productType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error con Stripe: ' + (data.error ?? 'Inténtalo de nuevo'))
    } finally { setPublishing(false) }
  }

  async function payWithPayPal() {
    if (!paymentModal) return
    setPublishing(true)
    try {
      const res = await fetch('/api/payments/paypal', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: paymentModal.eventId, productType: paymentModal.productType }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Error con PayPal: ' + (data.error ?? 'Inténtalo de nuevo'))
    } finally { setPublishing(false) }
  }

  const isPaid = event.status === 'PAID'
  const guestCount = event._count?.guests ?? 0
  const rsvpCount  = event._count?.rsvps ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0ea', fontFamily: 'Inter, sans-serif' }}>

      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width: 768px) {
          .ee-topbar { padding: 0 12px !important; height: 52px !important; flex-wrap: wrap !important; }
          .ee-topbar-title { max-width: 140px !important; font-size: 13px !important; }
          .ee-topbar-status { display: none !important; }
          .ee-topbar-preview { display: none !important; }
          .ee-topbar-save { display: none !important; }
          .ee-layout { flex-direction: column !important; }
          .ee-sidebar {
            width: 100% !important;
            height: auto !important;
            position: static !important;
            border-right: none !important;
            border-bottom: 1px solid #ede7e0 !important;
            padding: 8px !important;
          }
          .ee-sidebar-stats { display: none !important; }
          .ee-sidebar-nav {
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 4px !important;
            flex-wrap: nowrap !important;
            padding-bottom: 4px !important;
          }
          .ee-sidebar-nav button {
            flex-direction: column !important;
            padding: 8px 10px !important;
            gap: 3px !important;
            min-width: auto !important;
            font-size: 10px !important;
            white-space: nowrap !important;
            border-radius: 8px !important;
          }
          .ee-sidebar-save { display: none !important; }
          .ee-main { padding: 16px !important; }
        }
      `}</style>
      <header className="ee-topbar" style={{
        background: '#fff',
        borderBottom: '1px solid #ede7e0',
        padding: '0 32px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        gap: 8,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 13, color: '#a89880', textDecoration: 'none',
            padding: '6px 8px', borderRadius: 8, flexShrink: 0,
            transition: 'all .15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#f5f0ea'; (e.currentTarget as HTMLAnchorElement).style.color = '#1a1a1a' }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'none'; (e.currentTarget as HTMLAnchorElement).style.color = '#a89880' }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
            <span>Panel</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span className="ee-topbar-title" style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
              {event.title}
            </span>
            <span className="ee-topbar-status" style={{
              fontSize: 10, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 20, flexShrink: 0,
              background: isPaid ? '#e8f5ee' : '#e8f5f3',
              color: isPaid ? '#1a7a3c' : '#6aada4',
            }}>
              {isPaid ? '● Publicado' : '○ Borrador'}
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span className="ee-topbar-save" style={{
            fontSize: 12, color: saved ? '#1a7a3c' : '#c4b9af', transition: 'color .3s',
          }}>
            {saved ? '✓' : saving ? '…' : ''}
          </span>

          <a className="ee-topbar-preview" href={`/event/${event.slug}${!isPaid ? '?preview=1' : ''}`} target="_blank"
            style={{
              fontSize: 13, color: '#6aada4', textDecoration: 'none',
              padding: '7px 12px', borderRadius: 8, border: '1px solid #b8deda',
              transition: 'all .15s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f0f9f8'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'none'}>
            {isPaid ? 'Ver ↗' : 'Preview ↗'}
          </a>

          {!isPaid && (
            <button onClick={handlePublish} disabled={publishing}
              style={{
                fontSize: 13, fontWeight: 600,
                background: publishing ? '#c4b9af' : 'linear-gradient(135deg, #84C5BC, #6aada4)',
                color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 10,
                cursor: publishing ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(106,173,164,0.35)',
                transition: 'all .2s', fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
              }}>
              {publishing ? '…' : '⚡ Publicar'}
            </button>
          )}
        </div>
      </header>

      {/* ── LAYOUT ──────────────────────────────────────────── */}
      <div className="ee-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 60px)' }}>

        {/* Sidebar tabs */}
        <nav className="ee-sidebar" style={{
          width: 200,
          background: '#fff',
          borderRight: '1px solid #ede7e0',
          padding: '16px 12px',
          flexShrink: 0,
          position: 'sticky',
          top: 60,
          height: 'calc(100vh - 60px)',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Event stats */}
          <div className="ee-sidebar-stats" style={{ padding: '12px 12px 16px', borderBottom: '1px solid #f0ebe4', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              {[
                { label: 'Invitados', value: guestCount },
                { label: 'RSVPs', value: rsvpCount },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', flex: 1 }}>
                  <p style={{ fontSize: 20, fontWeight: 600, color: '#1a1a1a', lineHeight: 1, marginBottom: 2 }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: '#a89880', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Nav items */}
          <div className="ee-sidebar-nav" style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {TABS.map(t => {
              const active = tab === t.id
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10,
                    background: active ? '#f0f9f8' : 'none',
                    color: active ? '#6aada4' : '#6b5e54',
                    border: active ? '1px solid #b8deda' : '1px solid transparent',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'Inter, sans-serif',
                    fontWeight: active ? 500 : 400,
                    textAlign: 'left', width: '100%',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = '#faf5f0'; (e.currentTarget as HTMLButtonElement).style.color = '#3d2e27' } }}
                  onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.background = 'none'; (e.currentTarget as HTMLButtonElement).style.color = '#6b5e54' } }}>
                  <span style={{ fontSize: 14, width: 16, textAlign: 'center', flexShrink: 0, opacity: 0.7 }}>{t.icon}</span>
                  {t.label}
                </button>
              )
            })}
          </div>

          {/* Quick save */}
          <div className="ee-sidebar-save" style={{ marginTop: 'auto', paddingTop: 20 }}>
            <button onClick={() => doSave(form)} disabled={saving}
              style={{
                width: '100%', padding: '9px', borderRadius: 10,
                background: 'none', border: '1px solid #e4ddd3',
                fontSize: 13, color: '#a89880', cursor: 'pointer',
                fontFamily: 'Inter, sans-serif', transition: 'all .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4b9af'; (e.currentTarget as HTMLButtonElement).style.color = '#6b5e54' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.color = '#a89880' }}>
              {saved ? '✓ Guardado' : 'Guardar ahora'}
            </button>
          </div>
        </nav>

        {/* Main content */}
        <main className="ee-main" style={{ flex: 1, padding: '32px', minWidth: 0 }}>
          {tab === 'General'   && <TabGeneral form={form} updateForm={updateForm} event={event} />}
          {tab === 'Diseño'    && <DesignEditor event={event} />}
          {tab === 'Timeline'  && <div style={{ maxWidth: 680 }}><TimelineEditor eventId={event.id} /></div>}
          {tab === 'Invitados' && <TabGuests eventId={event.id} eventSlug={event.slug} eventTitle={event.title} coupleNames={event.coupleNames} isPaid={isPaid} />}
          {tab === 'RSVP'      && <TabRSVP eventId={event.id} />}
          {tab === 'Analytics' && <TabAnalytics eventId={event.id} isPaid={isPaid} />}
          {tab === 'Check-in'  && <TabCheckin eventId={event.id} eventSlug={event.slug} isPaid={isPaid} />}
          {tab === 'IA'        && <TabAI event={event} onApply={(field, val) => updateForm(field, val)} />}
          {tab === 'Extras'    && <TabExtras eventId={event.id} event={event} />}
        </main>
      </div>

      {showPublishModal && (
        <PublishModal currentEventId={event.id} onClose={() => setShowPublishModal(false)} />
      )}

      {/* ── PAYMENT METHOD MODAL ── */}
      {paymentModal && (
        <div style={{
          position:'fixed', inset:0, zIndex:200,
          background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)',
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
        }} onClick={() => { if (!publishing) setPaymentModal(null) }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, padding:'32px 28px', width:'100%', maxWidth:420, boxShadow:'0 24px 80px rgba(0,0,0,0.25)' }}>
            <h2 style={{ fontSize:20, fontWeight:600, color:'#1a1a1a', margin:'0 0 4px', textAlign:'center' }}>
              Publicar invitación
            </h2>
            <p style={{ fontSize:14, color:'#a89880', textAlign:'center', margin:'0 0 28px' }}>
              Elige tu método de pago — €29 · pago único
            </p>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {/* Stripe */}
              {paymentModal.methods.stripe && (
                <button onClick={payWithStripe} disabled={publishing}
                  style={{ width:'100%', padding:'14px 20px', borderRadius:14, border:'1.5px solid #e4ddd3', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all .15s', fontFamily:'Inter,sans-serif' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#1a1a1a'; (e.currentTarget as HTMLButtonElement).style.background='#faf5f0' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background='#fff' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'#635bff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="20" height="20" viewBox="0 0 60 25" fill="white"><path d="M31.5 8.7c0-1.3 1.1-1.8 2.8-1.8 2.5 0 5.6.8 7.8 2.1V3.6C39.7 2 36.9 1.5 34.3 1.5c-5.5 0-9.1 2.9-9.1 7.5 0 7.4 10.2 6.2 10.2 9.4 0 1.5-1.3 2-3.1 2-2.7 0-6.2-1.1-9-2.6v5.5c3.1 1.3 6.2 1.9 9 1.9 5.7 0 9.5-2.8 9.5-7.6-.1-7.9-10.3-6.5-10.3-9.9z"/><path d="M0 24.5l3-6.7c1.3 1 2.8 1.4 4.3 1.4 1.8 0 2.8-.7 2.8-1.8 0-2.6-9.1-1.6-9.1-8.9C1 4.2 4.7 1.5 10.2 1.5c2.5 0 5 .5 7.2 1.4l-2.8 6.1c-1.1-.8-2.4-1.2-3.7-1.2-1.5 0-2.4.6-2.4 1.6 0 2.5 9.2 1.3 9.2 8.8 0 4.7-3.6 7.4-9.4 7.4-3 0-5.8-.7-8.3-2.1z"/></svg>
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1a1a1a', margin:0 }}>Pagar con tarjeta</p>
                    <p style={{ fontSize:12, color:'#a89880', margin:0 }}>Visa, Mastercard, Amex · Stripe</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:13, fontWeight:600, color:'#1a1a1a' }}>€29</span>
                </button>
              )}

              {/* PayPal */}
              {paymentModal.methods.paypal && (
                <button onClick={payWithPayPal} disabled={publishing}
                  style={{ width:'100%', padding:'14px 20px', borderRadius:14, border:'1.5px solid #e4ddd3', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:14, transition:'all .15s', fontFamily:'Inter,sans-serif' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#003087'; (e.currentTarget as HTMLButtonElement).style.background='#f0f6ff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor='#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background='#fff' }}>
                  <div style={{ width:40, height:40, borderRadius:10, background:'#003087', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.2a.483.483 0 0 1-.477-.558L9.086 11.3a.804.804 0 0 1 .794-.68h1.353c3.073 0 5.476-1.243 6.18-4.84.293-1.52.142-2.79-.346-3.78a4.23 4.23 0 0 1 3 2.478z"/><path d="M18.68 5.29c-.24-.334-.543-.628-.9-.874C16.613 3.46 14.822 3 12.565 3H5.944a.805.805 0 0 0-.794.68L2.15 19.673a.483.483 0 0 0 .477.557h3.47l.87-5.53-.027.173a.804.804 0 0 1 .794-.679h1.654c3.238 0 5.774-1.314 6.514-5.12.022-.113.041-.223.059-.332.22-1.415.026-2.378-.281-3.452z"/></svg>
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <p style={{ fontSize:15, fontWeight:600, color:'#1a1a1a', margin:0 }}>Pagar con PayPal</p>
                    <p style={{ fontSize:12, color:'#a89880', margin:0 }}>PayPal, tarjeta o saldo PayPal</p>
                  </div>
                  <span style={{ marginLeft:'auto', fontSize:13, fontWeight:600, color:'#1a1a1a' }}>€29</span>
                </button>
              )}
            </div>

            {/* Security note */}
            <p style={{ fontSize:11, color:'#c4b9af', textAlign:'center', margin:'20px 0 0', lineHeight:1.6 }}>
              🔒 Pago 100% seguro · Sin suscripción · Pago único por evento
            </p>

            {!publishing && (
              <button onClick={() => setPaymentModal(null)}
                style={{ display:'block', width:'100%', marginTop:12, padding:'10px', background:'none', border:'none', fontSize:13, color:'#a89880', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Cancelar
              </button>
            )}

            {publishing && (
              <div style={{ textAlign:'center', marginTop:16 }}>
                <div style={{ width:20, height:20, border:'2px solid #6aada4', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto' }} />
                <p style={{ fontSize:12, color:'#a89880', marginTop:8 }}>Redirigiendo al pago…</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: GENERAL ─────────────────────────────────────────────
function TabGeneral({ form, updateForm, event }: { form: any; updateForm: any; event: Event }) {
  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>

      <Card title="Información principal">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Título del evento">
            <input value={form.title} onChange={e => updateForm('title', e.target.value)}
              placeholder="Boda de María y Carlos" className={inputCls} />
          </Field>
          <Field label="Nombres protagonistas">
            <input value={form.coupleNames} onChange={e => updateForm('coupleNames', e.target.value)}
              placeholder="María & Carlos" className={inputCls} />
          </Field>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => updateForm('description', e.target.value)}
              rows={3} placeholder="Con mucha ilusión os invitamos a compartir este día tan especial…"
              className={inputCls + ' resize-none'} />
          </Field>
          <div style={{ display: 'flex', gap: 16 }}>
            <Field label="Dress code" half>
              <input value={form.dressCode} onChange={e => updateForm('dressCode', e.target.value)}
                placeholder="Etiqueta · Evitar blanco" className={inputCls} />
            </Field>
            <Field label="Idioma" half>
              <select value={form.locale} onChange={e => updateForm('locale', e.target.value)} className={inputCls}>
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="ca">Català</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
              </select>
            </Field>
          </div>
          {/* Privacy toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#faf5f0', borderRadius: 12, border: '1px solid #ede7e0' }}>
            <div>
              <p style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>Evento privado</p>
              <p style={{ fontSize: 12, color: '#a89880', marginTop: 2 }}>Solo accesible con el enlace único</p>
            </div>
            <div onClick={() => updateForm('isPrivate', !form.isPrivate)}
              style={{
                width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
                background: form.isPrivate ? '#6aada4' : '#e4ddd3',
                position: 'relative', transition: 'background .2s', flexShrink: 0,
              }}>
              <div style={{
                position: 'absolute', top: 3,
                left: form.isPrivate ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', transition: 'left .2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
          </div>
        </div>
      </Card>

      <Card title="Lugar del evento">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Nombre del lugar">
            <input value={form.venueName} onChange={e => updateForm('venueName', e.target.value)}
              placeholder="Finca La Alameda" className={inputCls} />
          </Field>
          <div style={{ display: 'flex', gap: 16 }}>
            <Field label="Dirección" half>
              <input value={form.venueAddress} onChange={e => updateForm('venueAddress', e.target.value)}
                placeholder="Ctra. Sevilla-Utrera km 14" className={inputCls} />
            </Field>
            <Field label="Ciudad" half>
              <input value={form.venueCity} onChange={e => updateForm('venueCity', e.target.value)}
                placeholder="Sevilla" className={inputCls} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Horarios" hint="Se muestran en la agenda de la invitación">
        <div className="ee-form-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
          {[
            { key: 'doors',     label: 'Puertas abren', placeholder: '12:00h' },
            { key: 'ceremony',  label: 'Ceremonia',     placeholder: '13:00h' },
            { key: 'reception', label: 'Banquete',      placeholder: '15:00h' },
          ].map(f => (
            <Field key={f.key} label={f.label}>
              <input value={form[f.key]} onChange={e => updateForm(f.key, e.target.value)}
                placeholder={f.placeholder} className={inputCls} />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Agenda del evento">
        <AgendaEditor eventId={event.id} initial={(event.agendaJson as AgendaItem[]) ?? []} />
      </Card>

    </div>
  )
}

// ─── AGENDA EDITOR ────────────────────────────────────────────
function AgendaEditor({ eventId, initial }: { eventId: string; initial: AgendaItem[] }) {
  const [items, setItems] = useState<AgendaItem[]>(
    initial.length > 0 ? initial : [
      { id: '1', time: '12:00h', title: 'Llegada de invitados', description: '' },
      { id: '2', time: '13:00h', title: 'Ceremonia', description: '' },
      { id: '3', time: '15:00h', title: 'Banquete', description: '' },
    ]
  )

  async function saveAgenda(newItems: AgendaItem[]) {
    await fetch(`/api/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agendaJson: newItems }),
    })
  }

  function addItem() {
    const newItems = [...items, { id: Date.now().toString(), time: '', title: '', description: '' }]
    setItems(newItems); saveAgenda(newItems)
  }

  function removeItem(id: string) {
    const newItems = items.filter(i => i.id !== id)
    setItems(newItems); saveAgenda(newItems)
  }

  function updateItem(id: string, key: keyof AgendaItem, value: string) {
    const newItems = items.map(i => i.id === id ? { ...i, [key]: value } : i)
    setItems(newItems); saveAgenda(newItems)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf5f0', borderRadius: 12, padding: '10px 14px', border: '1px solid #f0ebe4' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#6aada4', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {i + 1}
          </div>
          <input value={item.time} onChange={e => updateItem(item.id, 'time', e.target.value)}
            placeholder="14:00h" style={{ width: 72, ...{ flexShrink: 0 } }}
            className="border border-[#e4ddd3] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#6aada4] bg-white" />
          <input value={item.title} onChange={e => updateItem(item.id, 'title', e.target.value)}
            placeholder="Nombre del acto" style={{ flex: 1 }}
            className="border border-[#e4ddd3] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#6aada4] bg-white" />
          <button onClick={() => removeItem(item.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b9af', fontSize: 18, lineHeight: 1, flexShrink: 0, padding: '0 4px' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#c4b9af'}>
            ×
          </button>
        </div>
      ))}
      <button onClick={addItem}
        style={{ background: 'none', border: '1.5px dashed #e4ddd3', borderRadius: 12, padding: '10px', fontSize: 13, color: '#6aada4', cursor: 'pointer', transition: 'all .15s', fontFamily: 'Inter, sans-serif' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f8' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
        + Añadir acto
      </button>
    </div>
  )
}

// ─── TAB: DISEÑO ──────────────────────────────────────────────
function TabDesign({ event }: { event: Event }) {
  const [uploading, setUploading] = useState(false)
  const [heroPreview, setHeroPreview] = useState(event.heroImage ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert('La imagen no puede superar 10MB'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('eventId', event.id); fd.append('type', 'image')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.media?.url) {
        setHeroPreview(data.media.url)
        await fetch(`/api/events/${event.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ heroImage: data.media.url })
        })
      } else {
        alert('Error al subir imagen: ' + (data.error ?? 'Error desconocido'))
      }
    } catch (err: any) {
      alert('Error de conexión al subir imagen')
    } finally { setUploading(false) }
  }

  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card title="Imagen principal">
        <div onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', height: 220, borderRadius: 14,
            border: `2px dashed ${heroPreview ? 'transparent' : '#e4ddd3'}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', position: 'relative',
            background: heroPreview ? 'none' : '#faf5f0', transition: 'all .2s',
          }}
          onMouseEnter={e => { if (!heroPreview) { (e.currentTarget as HTMLDivElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLDivElement).style.background = '#f0f9f8' } }}
          onMouseLeave={e => { if (!heroPreview) { (e.currentTarget as HTMLDivElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLDivElement).style.background = '#faf5f0' } }}>
          {heroPreview ? (
            <img src={heroPreview} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🖼</div>
              <p style={{ fontSize: 14, color: '#a89880', fontWeight: 500 }}>Arrastra o haz clic para subir</p>
              <p style={{ fontSize: 12, color: '#c4b9af', marginTop: 4 }}>JPG, PNG, WebP · Máx 10MB</p>
            </>
          )}
          {uploading && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 28, height: 28, border: '3px solid #6aada4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        {heroPreview && (
          <button onClick={() => { setHeroPreview(''); fetch(`/api/events/${event.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ heroImage: '' }) }) }}
            style={{ marginTop: 10, fontSize: 12, color: '#a89880', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#a89880'}>
            Eliminar imagen
          </button>
        )}
      </Card>
      <Card title="Vista previa">
        <p style={{ fontSize: 13, color: '#a89880', marginBottom: 14 }}>Así verán tu invitación los invitados.</p>
        <a href={`/event/${event.slug}?preview=1`} target="_blank"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#6aada4'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#1a1a1a'}>
          Abrir vista previa ↗
        </a>
      </Card>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── TAB: INVITADOS ───────────────────────────────────────────
function TabGuests({ eventId, eventSlug, eventTitle, coupleNames, isPaid }: { eventId: string; eventSlug: string; eventTitle: string; coupleNames?: string; isPaid: boolean }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newGuest, setNewGuest] = useState({ name: '', email: '', phone: '', group: '', tableName: '', isVIP: false })
  const [adding, setAdding] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [editForm, setEditForm] = useState<Partial<Guest>>({})
  const [saving, setSavingGuest] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/guests`).then(r => r.json()).then(d => { setGuests(d.guests ?? []); setLoading(false) })
  }, [eventId])

  async function addGuest() {
    if (!newGuest.name.trim()) return
    setAdding(true)
    // Strip empty strings so backend validation doesn't reject them
    const payload = Object.fromEntries(
      Object.entries(newGuest).filter(([_, v]) => v !== '' && v !== false || _ === 'isVIP')
    )
    const res = await fetch(`/api/events/${eventId}/guests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (data.guest) { setGuests(prev => [...prev, data.guest]); setNewGuest({ name: '', email: '', phone: '', group: '', tableName: '', isVIP: false }); setShowAdd(false) }
    setAdding(false)
  }

  function startEdit(g: Guest) {
    setEditingGuest(g)
    setEditForm({
      name: g.name, email: g.email ?? '', phone: g.phone ?? '',
      group: g.group ?? '', tableName: g.tableName ?? '',
      isVIP: g.isVIP, menuChoice: g.menuChoice ?? '',
    })
  }

  async function saveEdit() {
    if (!editingGuest) return
    setSavingGuest(true)
    try {
      const payload = Object.fromEntries(
        Object.entries(editForm).filter(([_, v]) => v !== undefined)
      )
      const res = await fetch(`/api/events/${eventId}/guests/${editingGuest.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.guest) {
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? data.guest : g))
        setEditingGuest(null)
      }
    } finally { setSavingGuest(false) }
  }

  async function deleteGuest(guestId: string, name: string) {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/events/${eventId}/guests/${guestId}`, { method: 'DELETE' })
    setGuests(prev => prev.filter(g => g.id !== guestId))
  }

  async function sendInvitations() {
    setSending(true); setSendResult(null)
    const res = await fetch(`/api/events/${eventId}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'email' }) })
    const data = await res.json()
    setSendResult(data); setSending(false)
  }

  const filtered = guests.filter(g => {
    const match = g.name.toLowerCase().includes(search.toLowerCase()) || (g.email ?? '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'confirmed') return match && g.rsvp?.status === 'CONFIRMED'
    if (filter === 'pending')   return match && (!g.rsvp?.status || g.rsvp.status === 'PENDING')
    if (filter === 'vip')       return match && g.isVIP
    return match
  })

  const confirmed = guests.filter(g => g.rsvp?.status === 'CONFIRMED').length
  const pending   = guests.filter(g => !g.rsvp?.status || g.rsvp.status === 'PENDING').length

  const statusBadge = (g: Guest) => {
    const s = g.rsvp?.status ?? 'PENDING'
    const map: Record<string, [string, string]> = {
      CONFIRMED: ['#e8f5ee', '#1a7a3c'],
      DECLINED:  ['#fdf0f0', '#c0392b'],
      PENDING:   ['#fdf7f0', '#a89880'],
    }
    const [bg, color] = map[s] ?? map.PENDING
    const label = { CONFIRMED: 'Confirmado', DECLINED: 'Declinado', PENDING: 'Pendiente' }[s] ?? s
    return <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: bg, color, letterSpacing: 0.5 }}>{label}</span>
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total invitados', value: guests.length },
          { label: 'Confirmados', value: confirmed },
          { label: 'Pendientes', value: pending },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e8e2db', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 28, fontWeight: 600, color: '#1a1a1a', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar invitado…"
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', border: '1px solid #e4ddd3', borderRadius: 10, fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'Inter, sans-serif' }}
          onFocus={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#6aada4'}
          onBlur={e => (e.currentTarget as HTMLInputElement).style.borderColor = '#e4ddd3'} />
        <div style={{ display: 'flex', gap: 4, background: '#fff', border: '1px solid #e4ddd3', borderRadius: 10, padding: 4 }}>
          {[['all','Todos'],['confirmed','Confirmados'],['pending','Pendientes'],['vip','VIP']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)}
              style={{ fontSize: 12, padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', background: filter === v ? '#6aada4' : 'none', color: filter === v ? '#fff' : '#6b5e54', transition: 'all .15s' }}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ fontSize: 13, fontWeight: 500, padding: '9px 18px', borderRadius: 10, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'background .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#6aada4'}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#1a1a1a'}>
          + Añadir invitado
        </button>
        <a href={`/dashboard/events/${eventId}/import`}
          style={{ fontSize: 13, padding: '9px 18px', borderRadius: 10, border: '1px solid #e4ddd3', color: '#6b5e54', textDecoration: 'none', display: 'flex', alignItems: 'center', background: '#fff', transition: 'all .15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#6aada4'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e4ddd3'}>
          ↑ CSV
        </a>
      </div>

      {/* Add guest form */}
      {showAdd && (
        <div style={{ background: '#fff', border: '1px solid #e8e2db', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', color: '#a89880', marginBottom: 14 }}>Nuevo invitado</p>
          <div className="ee-guest-new-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
            {[
              { key: 'name', label: 'Nombre *', placeholder: 'Ana García' },
              { key: 'email', label: 'Email', placeholder: 'ana@email.com' },
              { key: 'phone', label: 'Teléfono', placeholder: '+34 600…' },
              { key: 'group', label: 'Grupo', placeholder: 'Familia novia' },
              { key: 'tableName', label: 'Mesa', placeholder: 'Mesa 3' },
            ].map(f => (
              <div key={f.key} style={{ minWidth: 0 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input value={(newGuest as any)[f.key]} onChange={e => setNewGuest({ ...newGuest, [f.key]: e.target.value })}
                  placeholder={f.placeholder} className={inputCls} style={{ width: '100%', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={addGuest} disabled={adding || !newGuest.name.trim()}
              style={{ fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '9px 22px', borderRadius: 10, border: 'none', cursor: 'pointer', opacity: adding || !newGuest.name.trim() ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              {adding ? 'Añadiendo…' : 'Añadir'}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ fontSize: 13, background: 'none', border: '1px solid #e4ddd3', padding: '9px 18px', borderRadius: 10, cursor: 'pointer', color: '#6b5e54', fontFamily: 'Inter, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Edit guest modal */}
      {editingGuest && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}
          onClick={() => setEditingGuest(null)}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#fff', borderRadius:20, padding:'28px 24px', width:'100%', maxWidth:500, boxShadow:'0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <p style={{ fontSize:16, fontWeight:600, color:'#1a1a1a', margin:0 }}>Editar invitado</p>
              <button onClick={() => setEditingGuest(null)}
                style={{ background:'none', border:'none', cursor:'pointer', color:'#a89880', fontSize:20, lineHeight:1, padding:'0 4px' }}>×</button>
            </div>
            <div className="ee-form-2col" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12, marginBottom:16 }}>
              {[
                { key:'name',       label:'Nombre *',   placeholder:'Ana García' },
                { key:'email',      label:'Email',       placeholder:'ana@email.com' },
                { key:'phone',      label:'Teléfono',    placeholder:'+34 600…' },
                { key:'group',      label:'Grupo',       placeholder:'Familia novia' },
                { key:'tableName',  label:'Mesa',        placeholder:'Mesa 3' },
                { key:'menuChoice', label:'Menú',        placeholder:'Vegetariano' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:10, fontWeight:700, color:'#a89880', letterSpacing:1.5, textTransform:'uppercase', display:'block', marginBottom:5 }}>{f.label}</label>
                  <input
                    value={(editForm as any)[f.key] ?? ''}
                    onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-[#e4ddd3] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#6aada4] bg-[#faf5f0] focus:bg-white transition-all"
                  />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'#faf5f0', borderRadius:10, marginBottom:16, border:'1px solid #ede7e0' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', margin:0 }}>Invitado VIP</p>
                <p style={{ fontSize:11, color:'#a89880', margin:0 }}>Acceso y trato especial</p>
              </div>
              <div onClick={() => setEditForm(prev => ({ ...prev, isVIP: !prev.isVIP }))}
                style={{ width:40, height:22, borderRadius:11, cursor:'pointer', background: editForm.isVIP ? '#6aada4' : '#e4ddd3', position:'relative', transition:'background .2s', flexShrink:0 }}>
                <div style={{ position:'absolute', top:2, left: editForm.isVIP ? 20 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={saveEdit} disabled={saving || !editForm.name}
                style={{ flex:1, padding:'10px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:10, fontSize:13, fontWeight:500, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving || !editForm.name ? 0.4 : 1, fontFamily:'Inter,sans-serif' }}>
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
              <button onClick={() => setEditingGuest(null)}
                style={{ padding:'10px 18px', background:'none', border:'1px solid #e4ddd3', borderRadius:10, fontSize:13, color:'#6b5e54', cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guests table */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e2db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div className="ee-guest-head" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto', padding: '10px 20px', background: '#faf5f0', borderBottom: '1px solid #f0ebe4', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a89880' }}>
          <span>Nombre</span><span>Contacto</span><span>Mesa</span><span>RSVP</span><span>Invitación</span><span style={{textAlign:'right'}}>Acciones</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #6aada4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#a89880', fontSize: 14 }}>
            {guests.length === 0 ? 'Todavía no has añadido invitados' : 'Sin resultados'}
          </div>
        ) : filtered.map((g, i) => (
          <div key={g.id} className="ee-guest-row" style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr auto', alignItems: 'center', padding: '12px 16px', borderBottom: i < filtered.length - 1 ? '1px solid #faf5f0' : 'none', transition: 'background .1s', overflowX:'auto' }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#fdfaf8'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: g.isVIP ? '#e8f5f3' : '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: g.isVIP ? '#6aada4' : '#a89880', flexShrink: 0 }}>
                {g.name[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{g.name}{g.isVIP && <span style={{ marginLeft: 6, fontSize: 9, background: '#e8f5f3', color: '#6aada4', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>VIP</span>}</p>
                {g.group && <p style={{ fontSize: 11, color: '#a89880' }}>{g.group}</p>}
              </div>
            </div>
            <div>
              {g.email && <p style={{ fontSize: 12, color: '#6b5e54', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.email}</p>}
              {g.phone && <p style={{ fontSize: 11, color: '#a89880' }}>{g.phone}</p>}
            </div>
            <span style={{ fontSize: 12, color: '#6b5e54' }}>{g.tableName ?? (g.tableNumber ? `Mesa ${g.tableNumber}` : '—')}</span>
            <span>{statusBadge(g)}</span>
            <div>
              {g.invitation?.sentAt ? (
                <span style={{ fontSize: 10, color: g.invitation.openedAt ? '#1a7a3c' : '#a89880' }}>
                  {g.invitation.openedAt ? '✓ Abierta' : 'Enviada'}
                </span>
              ) : <span style={{ fontSize: 11, color: '#c4b9af' }}>No enviada</span>}
            </div>
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              {/* WhatsApp */}
              {g.phone && (
                isPaid ? (
                  <a href={(() => {
                      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
                      const inviteUrl = `${appUrl}/i/${g.accessToken}`
                      const name = coupleNames || eventTitle
                      const msg = `Hola ${g.name} 👋\n\nTe invitamos a *${name}*.\n\nAquí tienes tu invitación personal con todos los detalles:\n${inviteUrl}`
                      return `https://wa.me/${g.phone.replace(/[^0-9]/g,'')}?text=${encodeURIComponent(msg)}`
                    })()}
                    target="_blank" rel="noopener noreferrer"
                    title={`Enviar WhatsApp a ${g.name}`}
                    style={{ fontSize:11, color:'#25D366', textDecoration:'none', padding:'4px 7px', borderRadius:6, border:'1px solid #b8efc4', background:'#f0fdf4', display:'flex', alignItems:'center', gap:3, fontWeight:500 }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background='#dcfce7'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background='#f0fdf4'}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WA
                  </a>
                ) : (
                  <span title="Publica el evento primero para enviar por WhatsApp"
                    style={{ fontSize:11, color:'#c4b9af', padding:'4px 7px', borderRadius:6, border:'1px solid #e4ddd3', background:'#faf5f0', display:'flex', alignItems:'center', gap:3, cursor:'not-allowed' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="#c4b9af"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WA
                  </span>
                )
              )}
              {/* QR */}
              <a href={`/api/events/${eventId}/guests/${g.id}/qr?download=1`} target="_blank"
                title="Descargar QR"
                style={{ fontSize:11, color:'#6aada4', textDecoration:'none', padding:'4px 7px', borderRadius:6, border:'1px solid #b8deda', background:'#f0f9f8' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background='#e8f5f3'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background='#f0f9f8'}>
                QR
              </a>
              {/* Edit */}
              <button onClick={() => startEdit(g)}
                title="Editar invitado"
                style={{ fontSize:12, padding:'4px 7px', borderRadius:6, border:'1px solid #e4ddd3', background:'#fff', cursor:'pointer', color:'#6b5e54', fontFamily:'Inter,sans-serif' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#faf5f0'; (e.currentTarget as HTMLButtonElement).style.borderColor='#6aada4'; (e.currentTarget as HTMLButtonElement).style.color='#6aada4' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#fff'; (e.currentTarget as HTMLButtonElement).style.borderColor='#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.color='#6b5e54' }}>
                ✎
              </button>
              {/* Delete */}
              <button onClick={() => deleteGuest(g.id, g.name)}
                title="Eliminar invitado"
                style={{ fontSize:13, padding:'4px 7px', borderRadius:6, border:'1px solid #f0e0e0', background:'#fff9f9', cursor:'pointer', color:'#c0392b', fontFamily:'Inter,sans-serif', lineHeight:1 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background='#fef0f0' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background='#fff9f9' }}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Send invitations */}
      {guests.length > 0 && (
        <div style={{ marginTop: 16, display:'flex', flexDirection:'column', gap:10 }}>
          {/* WhatsApp info bar */}
          {guests.some(g => g.phone) && (
            <div style={{ background: isPaid ? '#f0fdf4' : '#faf5f0', borderRadius: 14, border: `1px solid ${isPaid ? '#bbf7d0' : '#ede7e0'}`, padding: '14px 18px', display:'flex', alignItems:'center', gap:14 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isPaid ? '#16a34a' : '#c4b9af'} style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              <div style={{flex:1}}>
                <p style={{ fontSize: 13, fontWeight: 500, color: isPaid ? '#15803d' : '#6b5e54' }}>
                  {guests.filter(g => g.phone).length} invitados con WhatsApp
                </p>
                <p style={{ fontSize: 11, color: isPaid ? '#16a34a' : '#6aada4', marginTop:2 }}>
                  {isPaid
                    ? 'Haz clic en WA de cada invitado. El enlace incluye una preview con foto de tu evento.'
                    : '🔒 Publica el evento primero para desbloquear el envío por WhatsApp.'}
                </p>
              </div>
            </div>
          )}
          {/* Email bar */}
          <div style={{ background: isPaid ? '#fff' : '#faf5f0', borderRadius: 14, border: `1px solid ${isPaid ? '#e8e2db' : '#ede7e0'}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>Enviar por email</p>
              {isPaid ? (
                <p style={{ fontSize: 11, color: '#a89880', marginTop: 2 }}>
                  {guests.filter(g => g.email && !g.invitation?.sentAt).length} invitados con email pendiente de envío.
                </p>
              ) : (
                <p style={{ fontSize: 11, color: '#6aada4', marginTop: 2 }}>
                  🔒 Publica el evento primero para poder enviar invitaciones.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {sendResult && (
                <span style={{ fontSize: 12, color: '#1a7a3c', background: '#e8f5ee', padding: '4px 12px', borderRadius: 8 }}>
                  ✓ {sendResult.sent} enviadas
                </span>
              )}
              <button
                onClick={isPaid ? sendInvitations : undefined}
                disabled={!isPaid || sending || guests.filter(g => g.email && !g.invitation?.sentAt).length === 0}
                title={!isPaid ? 'Publica el evento antes de enviar' : undefined}
                style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 10, background: isPaid ? '#1a1a1a' : '#e4ddd3', color: isPaid ? '#fff' : '#a89880', border: 'none', cursor: (!isPaid || sending || guests.filter(g => g.email && !g.invitation?.sentAt).length === 0) ? 'not-allowed' : 'pointer', opacity: (!isPaid || sending || guests.filter(g => g.email && !g.invitation?.sentAt).length === 0) ? 0.6 : 1, fontFamily: 'Inter, sans-serif' }}>
                {sending ? 'Enviando…' : isPaid ? 'Enviar emails' : '🔒 Publicar primero'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── TAB: RSVP ────────────────────────────────────────────────
function TabRSVP({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/events/${eventId}/guests`).then(r => r.json()).then(d => { setGuests(d.guests ?? []); setLoading(false) })
  }, [eventId])

  const confirmed = guests.filter(g => g.rsvp?.status === 'CONFIRMED')
  const declined  = guests.filter(g => g.rsvp?.status === 'DECLINED')
  const pending   = guests.filter(g => !g.rsvp?.status || g.rsvp.status === 'PENDING')
  const totalComp = confirmed.reduce((acc, g) => acc + (g.rsvp?.companions ?? 0), 0)

  const colors = { CONFIRMED: ['#e8f5ee','#1a7a3c'], DECLINED: ['#fdf0f0','#c0392b'], PENDING: ['#fdf7f0','#a89880'] }

  return (
    <div style={{ maxWidth: 800 }}>
      <div className="ee-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Confirmados', value: confirmed.length, color: '#1a7a3c', bg: '#e8f5ee' },
          { label: 'Acompañantes', value: totalComp, color: '#6aada4', bg: '#fdf7f0' },
          { label: 'Declinados', value: declined.length, color: '#c0392b', bg: '#fdf0f0' },
          { label: 'Sin respuesta', value: pending.length, color: '#a89880', bg: '#faf5f0' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 20px', border: `1px solid ${s.color}20` }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: s.color, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.8 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 24, height: 24, border: '2px solid #6aada4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e2db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="ee-guest-head" style={{ padding: '12px 20px', borderBottom: '1px solid #f0ebe4', background: '#faf5f0', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a89880', overflowX:'auto' }}>
            <span>Invitado</span><span>Estado</span><span>Acompañantes</span><span>Respondió</span><span>Notas</span>
          </div>
          {guests.map((g, i) => {
            const s = g.rsvp?.status ?? 'PENDING'
            const [bg, col] = (colors as any)[s] ?? colors.PENDING
            return (
              <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', alignItems: 'center', padding: '12px 16px', borderBottom: i < guests.length - 1 ? '1px solid #faf5f0' : 'none', overflowX:'auto' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{g.name}</p>
                  {g.email && <p style={{ fontSize: 11, color: '#a89880' }}>{g.email}</p>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: bg, color: col, letterSpacing: 0.5, display: 'inline-block' }}>
                  {{ CONFIRMED:'Confirmado', DECLINED:'Declinado', PENDING:'Pendiente' }[s] ?? s}
                </span>
                <span style={{ fontSize: 13, color: '#6b5e54' }}>{g.rsvp?.companions ?? 0}</span>
                <span style={{ fontSize: 11, color: '#a89880' }}>
                  {g.rsvp?.respondedAt ? new Date(g.rsvp.respondedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : '—'}
                </span>
                <span style={{ fontSize: 11, color: '#a89880', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.rsvp?.dietaryRestrictions ?? ''}
                </span>
              </div>
            )
          })}
          {guests.length === 0 && <div style={{ padding: 40, textAlign: 'center', fontSize: 14, color: '#a89880' }}>Sin respuestas todavía</div>}
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── TAB: ANALYTICS ───────────────────────────────────────────
function TabAnalytics({ eventId, isPaid }: { eventId: string; isPaid: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isPaid) { setLoading(false); return }
    fetch(`/api/events/${eventId}/analytics`).then(r => r.json()).then(d => { setData(d); setLoading(false) }).catch(() => setLoading(false))
  }, [eventId, isPaid])

  if (!isPaid) return (
    <div style={{ maxWidth: 480, background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', border: '1px solid #e8e2db', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
      <p style={{ fontSize: 18, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>Analytics disponibles tras publicar</p>
      <p style={{ fontSize: 14, color: '#a89880', lineHeight: 1.7 }}>Publica tu evento para ver visitas, aperturas y tasa de confirmación en tiempo real.</p>
    </div>
  )

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, border: '2px solid #6aada4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const ov   = data?.overview ?? { totalViews: 0, viewsLast7Days: 0, confirmationRate: 0, checkedIn: 0 }
  const rsvp = data?.rsvp ?? { confirmed: 0, declined: 0, pending: 0, total: 0 }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="ee-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Visitas totales', value: ov.totalViews, icon: '👁' },
          { label: 'Últimos 7 días', value: ov.viewsLast7Days, icon: '📈' },
          { label: 'Tasa confirmación', value: `${ov.confirmationRate}%`, icon: '✓' },
          { label: 'Check-ins', value: ov.checkedIn, icon: '✔' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', border: '1px solid #e8e2db', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ fontSize: 30, fontWeight: 700, color: '#1a1a1a', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: '#a89880', letterSpacing: 1.2, textTransform: 'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e2db', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a89880', marginBottom: 16 }}>RSVP</p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Confirmados', value: rsvp.confirmed, color: '#1a7a3c', bg: '#e8f5ee' },
              { label: 'Declinados',  value: rsvp.declined,  color: '#c0392b', bg: '#fdf0f0' },
              { label: 'Pendientes',  value: rsvp.pending,   color: '#a89880', bg: '#faf5f0' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, borderRadius: 12, padding: '14px', textAlign: 'center', background: s.bg }}>
                <p style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                <p style={{ fontSize: 10, color: s.color, opacity: 0.8 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {data?.channels && data.channels.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e2db', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a89880', marginBottom: 16 }}>Canales</p>
            {data.channels.map(c => {
              const total = data.channels.reduce((a, x) => a + x.count, 0)
              const pct = total > 0 ? Math.round((c.count / total) * 100) : 0
              return (
                <div key={c.channel} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: '#6b5e54', textTransform: 'capitalize' }}>{c.channel ?? 'Directo'}</span>
                    <span style={{ fontSize: 12, color: '#a89880' }}>{c.count} · {pct}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f0ebe4', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#6aada4', borderRadius: 3, width: `${pct}%`, transition: 'width 1s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TAB: CHECK-IN ────────────────────────────────────────────
function TabCheckin({ eventId, eventSlug, isPaid }: { eventId: string; eventSlug: string; isPaid: boolean }) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/events/${eventId}/guests`).then(r => r.json()).then(d => { setGuests(d.guests ?? []); setLoading(false) })
  }, [eventId])

  if (!isPaid) return (
    <div style={{ maxWidth: 480, background: '#fff', borderRadius: 20, padding: '48px 40px', textAlign: 'center', border: '1px solid #e8e2db' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎟</div>
      <p style={{ fontSize: 18, fontWeight: 500, color: '#1a1a1a', marginBottom: 8 }}>Check-in disponible tras publicar</p>
      <p style={{ fontSize: 14, color: '#a89880', lineHeight: 1.7 }}>Publica tu evento para activar el sistema de QR check-in en la entrada.</p>
    </div>
  )

  const checkedIn = guests.filter(g => g.checkInStatus === 'CHECKED_IN').length

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total invitados', value: guests.length },
          { label: 'Check-in realizado', value: checkedIn, green: true },
          { label: 'Pendientes entrada', value: guests.length - checkedIn },
        ].map(s => (
          <div key={s.label} style={{ background: (s as any).green ? '#e8f5ee' : '#fff', borderRadius: 14, padding: '16px 20px', border: '1px solid #e8e2db', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: (s as any).green ? '#1a7a3c' : '#1a1a1a', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: (s as any).green ? '#1a7a3c' : '#a89880', letterSpacing: 1, textTransform: 'uppercase', opacity: (s as any).green ? 0.8 : 1 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e2db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #6aada4', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto' }} />
          </div>
        ) : guests.map((g, i) => (
          <div key={g.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', padding: '12px 16px', borderBottom: i < guests.length - 1 ? '1px solid #faf5f0' : 'none', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{g.name}</p>
              {g.tableName && <p style={{ fontSize: 11, color: '#a89880' }}>Mesa: {g.tableName}</p>}
            </div>
            <span style={{ fontSize: 12, color: g.rsvp?.status === 'CONFIRMED' ? '#1a7a3c' : '#a89880' }}>
              {g.rsvp?.status === 'CONFIRMED' ? '✓ Confirmado' : 'Sin confirmar'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: g.checkInStatus === 'CHECKED_IN' ? '#1a7a3c' : '#c4b9af' }}>
              {g.checkInStatus === 'CHECKED_IN' ? '● Check-in realizado' : '○ Pendiente'}
            </span>
            <a href={`/api/events/${eventId}/guests/${g.id}/qr?download=1`} target="_blank"
              style={{ fontSize: 11, color: '#6aada4', textDecoration: 'none', padding: '5px 10px', borderRadius: 7, border: '1px solid #b8deda', background: '#f0f9f8' }}>
              QR
            </a>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

// ─── TAB: IA ──────────────────────────────────────────────────

// Tonos disponibles por tipo de evento
const TONES_BY_TYPE: Record<string, { id: string; label: string; desc: string }[]> = {
  WEDDING:     [
    { id: 'romantic', label: 'Romántico',  desc: 'Emotivo y poético' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Formal y sofisticado' },
    { id: 'modern',   label: 'Moderno',    desc: 'Minimalista y fresco' },
    { id: 'religious',label: 'Religioso',  desc: 'Espiritual y tradicional' },
  ],
  BIRTHDAY:    [
    { id: 'fun',      label: 'Divertido',  desc: 'Alegre y festivo' },
    { id: 'modern',   label: 'Moderno',    desc: 'Minimalista y fresco' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Para celebraciones especiales' },
    { id: 'funny',    label: 'Gracioso',   desc: 'Con humor y desparpajo' },
  ],
  BAPTISM:     [
    { id: 'religious',label: 'Religioso',  desc: 'Espiritual y tradicional' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Formal y sofisticado' },
    { id: 'warm',     label: 'Cálido',     desc: 'Familiar y cercano' },
  ],
  GRADUATION:  [
    { id: 'proud',    label: 'Orgulloso',  desc: 'Celebra el logro' },
    { id: 'fun',      label: 'Festivo',    desc: 'Alegre y celebratorio' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Formal y sofisticado' },
  ],
  QUINCEANERA: [
    { id: 'romantic', label: 'Soñador',    desc: 'Mágico y especial' },
    { id: 'fun',      label: 'Festivo',    desc: 'Alegre y divertido' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Sofisticado y especial' },
  ],
  CORPORATE:   [
    { id: 'corporate',label: 'Profesional',desc: 'Claro y directo' },
    { id: 'modern',   label: 'Moderno',    desc: 'Fresco y contemporáneo' },
    { id: 'elegant',  label: 'Formal',     desc: 'Sofisticado y serio' },
  ],
  ANNIVERSARY: [
    { id: 'romantic', label: 'Romántico',  desc: 'Emotivo y poético' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Formal y sofisticado' },
    { id: 'warm',     label: 'Nostálgico', desc: 'Emotivo y entrañable' },
  ],
  OTHER:       [
    { id: 'fun',      label: 'Festivo',    desc: 'Alegre y celebratorio' },
    { id: 'elegant',  label: 'Elegante',   desc: 'Formal y sofisticado' },
    { id: 'modern',   label: 'Moderno',    desc: 'Minimalista y fresco' },
  ],
}

const EVENT_TYPE_LABEL: Record<string, string> = {
  WEDDING: 'boda', BIRTHDAY: 'cumpleaños', BAPTISM: 'bautizo',
  GRADUATION: 'graduación', QUINCEANERA: 'quinceañera',
  CORPORATE: 'evento corporativo', ANNIVERSARY: 'aniversario', OTHER: 'celebración',
}

function TabAI({ event, onApply }: { event: Event; onApply: (field: string, val: string) => void }) {
  const eventType = event.type ?? 'OTHER'
  const availableTones = TONES_BY_TYPE[eventType] ?? TONES_BY_TYPE.OTHER
  const [tone, setTone] = useState(availableTones[0].id)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'text', type: eventType, tone, coupleNames: event.coupleNames, eventDate: event.eventDate, venueName: event.venueName, locale: event.locale ?? 'es' }),
      })
      const data = await res.json()
      if (data.result) setResult(data.result)
      else setError('No se pudo generar el texto. Verifica que GROQ_API_KEY esté configurado.')
    } catch { setError('Error de conexión') } finally { setLoading(false) }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e8e2db', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0ebe4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <span style={{ fontSize: 24 }}>✦</span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>Generador de texto con IA</p>
          </div>
          <p style={{ fontSize: 13, color: '#a89880', lineHeight: 1.6 }}>
            Genera el texto de tu invitación de <strong>{EVENT_TYPE_LABEL[eventType]}</strong> adaptado al tono que elijas.
          </p>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#a89880', marginBottom: 12 }}>Tono</p>
          <div className="ee-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 20 }}>
            {availableTones.map(t => (
              <button key={t.id} onClick={() => { setTone(t.id); setResult(null); setError('') }}
                style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${tone === t.id ? '#6aada4' : '#e4ddd3'}`, background: tone === t.id ? '#f0f9f8' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'Inter, sans-serif' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: tone === t.id ? '#6aada4' : '#1a1a1a', marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: 11, color: '#a89880' }}>{t.desc}</p>
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? '#e4ddd3' : 'linear-gradient(135deg, #84C5BC, #6aada4)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .2s', boxShadow: loading ? 'none' : '0 2px 8px rgba(106,173,164,0.3)' }}>
            {loading ? 'Generando…' : '✦ Generar texto con IA'}
          </button>

          {error && <p style={{ marginTop: 12, fontSize: 13, color: '#c0392b', background: '#fdf0f0', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}

          {result && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(result).map(([key, val]) => {
                const labels: Record<string, string> = { headline: 'Titular', subheadline: 'Subtítulo', description: 'Descripción', rsvpText: 'CTA RSVP', footerMessage: 'Mensaje de cierre', hashtag: 'Hashtag' }
                const fields: Record<string, string> = { headline: 'title', subheadline: 'coupleNames', description: 'description' }
                return (
                  <div key={key} style={{ background: '#faf5f0', borderRadius: 12, padding: '14px 16px', border: '1px solid #f0ebe4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: '#6aada4', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{labels[key] ?? key}</p>
                        <p style={{ fontSize: 14, color: '#1a1a1a', lineHeight: 1.6 }}>{val as string}</p>
                      </div>
                      {fields[key] && (
                        <button onClick={() => onApply(fields[key], val as string)}
                          style={{ fontSize: 11, padding: '5px 12px', borderRadius: 8, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, fontFamily: 'Inter, sans-serif' }}>
                          Aplicar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TAB: EXTRAS ──────────────────────────────────────────────
function TabExtras({ eventId, event }: { eventId: string; event: Event }) {
  return (
    <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <MenuEditor eventId={eventId} initialMenu={(event as any).menuJson ?? []} />
      <GiftManager eventId={eventId} />
      <HotelManager eventId={eventId} />
      <TransportManager eventId={eventId} />
    </div>
  )
}

// ─── MENU EDITOR ──────────────────────────────────────────────
function MenuEditor({ eventId, initialMenu }: { eventId: string; initialMenu: { course: string; items: string[] }[] }) {
  const [menu, setMenu] = useState<{ course: string; items: string[] }[]>(initialMenu)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save(newMenu: typeof menu) {
    setSaving(true)
    await fetch(`/api/events/${eventId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuJson: newMenu }) })
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card title="Menú del evento" hint={saved ? '✓ Guardado' : saving ? 'Guardando…' : undefined}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {menu.map((course, ci) => (
          <div key={ci} style={{ background: '#faf5f0', borderRadius: 12, padding: '14px 16px', border: '1px solid #f0ebe4' }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <input value={course.course} onChange={e => { const next = menu.map((c,i) => i===ci ? {...c,course:e.target.value} : c); setMenu(next) }}
                placeholder="Ej: Entrantes" className={inputCls + ' flex-1'} />
              <button onClick={() => { const next = menu.filter((_,i) => i !== ci); setMenu(next); save(next) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b9af', fontSize: 18, padding: '0 6px' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#c4b9af'}>×</button>
            </div>
            {course.items.map((item, ii) => (
              <input key={ii} value={item} onChange={e => { const next = menu.map((c,ci2) => ci2===ci ? {...c,items:c.items.map((it,i) => i===ii?e.target.value:it)} : c); setMenu(next) }}
                placeholder="Nombre del plato…" className={inputCls + ' mb-2'} />
            ))}
            <button onClick={() => { const next = menu.map((c,i) => i===ci ? {...c,items:[...c.items,'']} : c); setMenu(next) }}
              style={{ fontSize: 12, color: '#6aada4', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'Inter, sans-serif' }}>
              + Añadir plato
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setMenu([...menu, { course: '', items: [''] }])}
            style={{ fontSize: 13, color: '#6aada4', background: 'none', border: '1.5px dashed #e4ddd3', padding: '9px 18px', borderRadius: 10, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f8' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
            + Añadir sección
          </button>
          {menu.length > 0 && (
            <button onClick={() => save(menu)} disabled={saving}
              style={{ fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', opacity: saving ? 0.4 : 1 }}>
              {saving ? 'Guardando…' : 'Guardar menú'}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

// ─── GIFT MANAGER ─────────────────────────────────────────────
function GiftManager({ eventId }: { eventId: string }) {
  const [gifts, setGifts] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', url: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/gifts`).then(r => r.json()).then(d => setGifts(d.gifts ?? []))
  }, [eventId])

  async function add() {
    if (!form.name.trim()) return
    setAdding(true)
    const res = await fetch(`/api/events/${eventId}/gifts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    if (data.gift) { setGifts(prev => [...prev, data.gift]); setForm({ name: '', description: '', price: '', url: '' }); setShowAdd(false) }
    setAdding(false)
  }

  return (
    <Card title="Lista de regalos">
      {showAdd && (
        <div style={{ background: '#faf5f0', borderRadius: 12, padding: '14px 16px', marginBottom: 14, border: '1px solid #f0ebe4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[['name','Nombre *','Batería de cocina'],['description','Descripción','Le Creuset'],['price','Precio aprox. (€)','380'],['url','Enlace (tienda)','https://…']].map(([k,l,p]) => (
              <div key={k}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={p} className={inputCls} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={add} disabled={adding || !form.name.trim()}
              style={{ fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', opacity: adding || !form.name.trim() ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              {adding ? 'Añadiendo…' : 'Añadir'}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ fontSize: 13, background: 'none', border: '1px solid #e4ddd3', padding: '8px 16px', borderRadius: 9, cursor: 'pointer', color: '#6b5e54', fontFamily: 'Inter, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {gifts.length === 0 && !showAdd ? (
        <p style={{ fontSize: 13, color: '#a89880', marginBottom: 12 }}>Sin regalos todavía.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {gifts.map(g => (
            <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf5f0', borderRadius: 10, padding: '10px 14px', border: '1px solid #f0ebe4' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{g.name}</p>
                {g.description && <p style={{ fontSize: 11, color: '#a89880' }}>{g.description}</p>}
                {g.price && <p style={{ fontSize: 12, color: '#6aada4' }}>€{g.price}</p>}
              </div>
              {g.isTaken && <span style={{ fontSize: 10, fontWeight: 600, background: '#6aada4', color: '#fff', padding: '2px 8px', borderRadius: 20 }}>Elegido</span>}
              <button onClick={async () => { await fetch(`/api/events/${eventId}/gifts/${g.id}`, { method: 'DELETE' }); setGifts(prev => prev.filter(x => x.id !== g.id)) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b9af', fontSize: 18, padding: '0 4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#c4b9af'}>×</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowAdd(true)}
        style={{ fontSize: 12, color: '#6aada4', background: 'none', border: '1.5px dashed #e4ddd3', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f8' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
        + Añadir regalo
      </button>
    </Card>
  )
}

// ─── HOTEL MANAGER ────────────────────────────────────────────
function HotelManager({ eventId }: { eventId: string }) {
  const [hotels, setHotels] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', address: '', stars: '', price: '', bookingUrl: '', notes: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/hotels`).then(r => r.json()).then(d => setHotels(d.hotels ?? []))
  }, [eventId])

  async function add() {
    if (!form.name.trim()) return
    setAdding(true)
    const res = await fetch(`/api/events/${eventId}/hotels`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, stars: form.stars ? Number(form.stars) : undefined }) })
    const data = await res.json()
    if (data.hotel) { setHotels(prev => [...prev, data.hotel]); setForm({ name: '', address: '', stars: '', price: '', bookingUrl: '', notes: '' }); setShowAdd(false) }
    setAdding(false)
  }

  return (
    <Card title="Hoteles recomendados">
      {showAdd && (
        <div style={{ background: '#faf5f0', borderRadius: 12, padding: '14px 16px', marginBottom: 14, border: '1px solid #f0ebe4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {[['name','Nombre *','Hotel Los Lebreros'],['address','Dirección','C/ Luis Morales, Sevilla'],['stars','Estrellas','4'],['price','Precio aprox.','€90/noche'],['bookingUrl','Enlace reserva','https://…'],['notes','Notas','Descuento 10% con código BODA25']].map(([k,l,p]) => (
              <div key={k}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={p} className={inputCls} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={add} disabled={adding || !form.name.trim()}
              style={{ fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', opacity: adding || !form.name.trim() ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              {adding ? 'Añadiendo…' : 'Añadir'}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ fontSize: 13, background: 'none', border: '1px solid #e4ddd3', padding: '8px 16px', borderRadius: 9, cursor: 'pointer', color: '#6b5e54', fontFamily: 'Inter, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {hotels.length === 0 && !showAdd && <p style={{ fontSize: 13, color: '#a89880', marginBottom: 12 }}>Sin hoteles todavía.</p>}
      {hotels.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {hotels.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf5f0', borderRadius: 10, padding: '10px 14px', border: '1px solid #f0ebe4' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{h.name}{h.stars ? ` ${'★'.repeat(h.stars)}` : ''}</p>
                {h.address && <p style={{ fontSize: 11, color: '#a89880' }}>{h.address}</p>}
                {h.price && <p style={{ fontSize: 12, color: '#6aada4' }}>{h.price}</p>}
              </div>
              <button onClick={async () => { await fetch(`/api/events/${eventId}/hotels/${h.id}`, { method: 'DELETE' }); setHotels(prev => prev.filter(x => x.id !== h.id)) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b9af', fontSize: 18, padding: '0 4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#c4b9af'}>×</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowAdd(true)}
        style={{ fontSize: 12, color: '#6aada4', background: 'none', border: '1.5px dashed #e4ddd3', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f8' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
        + Añadir hotel
      </button>
    </Card>
  )
}

// ─── TRANSPORT MANAGER ────────────────────────────────────────
function TransportManager({ eventId }: { eventId: string }) {
  const [transports, setTransports] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ type: 'BUS', origin: '', destination: '', departureTime: '', returnTime: '', capacity: '', notes: '' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/transport`).then(r => r.json()).then(d => setTransports(d.transport ?? []))
  }, [eventId])

  async function add() {
    if (!form.origin.trim()) return
    setAdding(true)
    const res = await fetch(`/api/events/${eventId}/transport`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : undefined }) })
    const data = await res.json()
    if (data.transport) { setTransports(prev => [...prev, data.transport]); setForm({ type: 'BUS', origin: '', destination: '', departureTime: '', returnTime: '', capacity: '', notes: '' }); setShowAdd(false) }
    setAdding(false)
  }

  return (
    <Card title="Transporte para invitados">
      {showAdd && (
        <div style={{ background: '#faf5f0', borderRadius: 12, padding: '14px 16px', marginBottom: 14, border: '1px solid #f0ebe4' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>Tipo</label>
              <select value={form.type} onChange={e => setForm({...form,type:e.target.value})} className={inputCls}>
                <option value="BUS">Autobús</option>
                <option value="SHUTTLE">Shuttle</option>
                <option value="TAXI">Taxi compartido</option>
                <option value="OTHER">Otro</option>
              </select>
            </div>
            {[['origin','Origen *','Sevilla centro'],['destination','Destino','Finca La Alameda'],['departureTime','Salida','12:00h'],['returnTime','Vuelta','01:00h'],['capacity','Plazas','50'],['notes','Notas','Punto de encuentro: Plaza Nueva']].map(([k,l,p]) => (
              <div key={k}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#a89880', letterSpacing: 1.5, textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{l}</label>
                <input value={(form as any)[k]} onChange={e => setForm({...form,[k]:e.target.value})} placeholder={p} className={inputCls} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={add} disabled={adding || !form.origin.trim()}
              style={{ fontSize: 13, fontWeight: 500, background: '#1a1a1a', color: '#fff', padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', opacity: adding || !form.origin.trim() ? 0.4 : 1, fontFamily: 'Inter, sans-serif' }}>
              {adding ? 'Añadiendo…' : 'Añadir'}
            </button>
            <button onClick={() => setShowAdd(false)}
              style={{ fontSize: 13, background: 'none', border: '1px solid #e4ddd3', padding: '8px 16px', borderRadius: 9, cursor: 'pointer', color: '#6b5e54', fontFamily: 'Inter, sans-serif' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
      {transports.length === 0 && !showAdd && <p style={{ fontSize: 13, color: '#a89880', marginBottom: 12 }}>Sin transporte todavía.</p>}
      {transports.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
          {transports.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#faf5f0', borderRadius: 10, padding: '10px 14px', border: '1px solid #f0ebe4' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1a1a1a' }}>{t.type === 'BUS' ? '🚌' : '🚐'} {t.origin} → {t.destination}</p>
                <p style={{ fontSize: 11, color: '#a89880' }}>Salida: {t.departureTime}{t.returnTime ? ` · Vuelta: ${t.returnTime}` : ''}{t.capacity ? ` · ${t.capacity} plazas` : ''}</p>
              </div>
              <button onClick={async () => { await fetch(`/api/events/${eventId}/transport/${t.id}`, { method: 'DELETE' }); setTransports(prev => prev.filter(x => x.id !== t.id)) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c4b9af', fontSize: 18, padding: '0 4px' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e24b4a'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#c4b9af'}>×</button>
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setShowAdd(true)}
        style={{ fontSize: 12, color: '#6aada4', background: 'none', border: '1.5px dashed #e4ddd3', padding: '7px 16px', borderRadius: 9, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all .15s' }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#6aada4'; (e.currentTarget as HTMLButtonElement).style.background = '#f0f9f8' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e4ddd3'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}>
        + Añadir transporte
      </button>
    </Card>
  )
}
