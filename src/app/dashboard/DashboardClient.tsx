'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}

const TYPE_EMOJI: Record<string,string> = {
  WEDDING:'💍', BIRTHDAY:'🎂', CORPORATE:'🏢', BAPTISM:'👶',
  ANNIVERSARY:'🥂', GRADUATION:'🎓', QUINCEANERA:'🌸', OTHER:'✨'
}
const TYPE_LABEL: Record<string,string> = {
  WEDDING:'Boda', BIRTHDAY:'Cumpleaños', CORPORATE:'Empresa', BAPTISM:'Bautizo',
  ANNIVERSARY:'Aniversario', GRADUATION:'Graduación', QUINCEANERA:'Quinceañera', OTHER:'Otro'
}

interface Event {
  id:string; title:string; type:string; status:string
  eventDate:string; location:string; guests:number; rsvps:number; slug:string
}

export function DashboardClient({ userName, events: init }: { userName:string; events:Event[] }) {
  const [events, setEvents] = useState<Event[]>(init)
  const [toDelete, setToDelete] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [menuId, setMenuId]     = useState<string|null>(null)
  const [menuPos, setMenuPos]   = useState<{top:number;right:number}|null>(null)

  const published = events.filter(e=>e.status==='PAID').length
  const drafts    = events.filter(e=>e.status==='DRAFT').length
  const firstName = userName.split(' ')[0]
  const ff = "'Inter','Helvetica Neue',sans-serif"

  const openMenu = useCallback((id:string, btn:HTMLButtonElement) => {
    const r = btn.getBoundingClientRect()
    setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right })
    setMenuId(id)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuId(null); setMenuPos(null)
  }, [])

  async function doDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${toDelete.id}`, { method:'DELETE' })
      if (res.ok) { setEvents(prev => prev.filter(e=>e.id!==toDelete.id)); setToDelete(null) }
    } finally { setDeleting(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f4f1', fontFamily:ff }}>

      {/* ── DELETE MODAL ── */}
      {toDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:600, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:20, padding:'28px 26px 22px', maxWidth:380, width:'100%' }}>
            <div style={{ width:48, height:48, background:'#fef2f2', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:16 }}>🗑️</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:400, color:'#1a1a1a', marginBottom:8 }}>¿Eliminar invitación?</p>
            <p style={{ fontSize:13, color:'#666', lineHeight:1.6, marginBottom:6 }}>
              Vas a eliminar <strong style={{color:'#1a1a1a'}}>{toDelete.title}</strong>.
            </p>
            <p style={{ fontSize:12, color:'#aaa', lineHeight:1.6, marginBottom:24 }}>
              Se archivará y desaparecerá de tu panel. Esta acción no se puede deshacer.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setToDelete(null)} disabled={deleting}
                style={{ flex:1, background:'#f5f5f5', color:'#444', border:'none', borderRadius:10, padding:'12px', fontSize:13, cursor:'pointer', fontFamily:ff }}>
                Cancelar
              </button>
              <button onClick={doDelete} disabled={deleting}
                style={{ flex:1, background:'#ef4444', color:'#fff', border:'none', borderRadius:10, padding:'12px', fontSize:13, fontWeight:600, cursor:deleting?'not-allowed':'pointer', fontFamily:ff, opacity:deleting?0.6:1 }}>
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DROPDOWN PORTAL (fixed, escapes all stacking contexts) ── */}
      {menuId && menuPos && (() => {
        const ev = events.find(e=>e.id===menuId)
        if (!ev) return null
        return (
          <>
            {/* Backdrop */}
            <div style={{ position:'fixed', inset:0, zIndex:490 }} onClick={closeMenu} />
            {/* Menu */}
            <div style={{ position:'fixed', top:menuPos.top, right:menuPos.right, background:'#fff', border:'1px solid #e8e2db', borderRadius:14, padding:'5px', zIndex:500, minWidth:186, boxShadow:'0 8px 32px rgba(0,0,0,0.13)' }}>
              <a href={`/dashboard/events/${ev.id}`}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:9, textDecoration:'none', color:'#333', fontSize:13, fontFamily:ff }}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f5f5f5'}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='transparent'}>
                <span>✏️</span> Editar
              </a>
              {ev.status==='PAID' && ev.slug && (
                <a href={`/event/${ev.slug}`} target="_blank"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:9, textDecoration:'none', color:'#333', fontSize:13, fontFamily:ff }}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f5f5f5'}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='transparent'}>
                  <span>👁️</span> Ver invitación
                </a>
              )}
              <div style={{ height:'0.5px', background:'#f0f0f0', margin:'4px 6px' }} />
              <button
                onClick={() => { setToDelete(ev); closeMenu() }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 13px', borderRadius:9, color:'#dc2626', fontSize:13, background:'none', border:'none', cursor:'pointer', width:'100%', fontFamily:ff }}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
                <span>🗑️</span> Eliminar
              </button>
            </div>
          </>
        )
      })()}

      {/* ── CONTENT ── */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'40px 24px 60px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:400, fontSize:'clamp(26px,4vw,36px)', color:'#1a1a1a', marginBottom:4 }}>
              Hola, {firstName} 👋
            </h1>
            <p style={{ fontSize:14, color:'#888' }}>Aquí tienes el resumen de tus invitaciones</p>
          </div>
          <Link href="/dashboard/events/new"
            style={{ background:'#84C5BC', color:'#fff', borderRadius:12, padding:'11px 22px', fontSize:13, fontWeight:600, textDecoration:'none', display:'inline-flex', alignItems:'center', gap:7, flexShrink:0 }}>
            + Nueva invitación
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:36 }}>
          {[
            { label:'Total',      value:events.length, color:'#1a1a1a' },
            { label:'Publicadas', value:published,     color:'#0f766e' },
            { label:'Borradores', value:drafts,        color:'#92400e' },
          ].map(s=>(
            <div key={s.label} style={{ background:'#fff', border:'1px solid #e8e2db', borderRadius:16, padding:'18px 22px' }}>
              <p style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', marginBottom:8 }}>{s.label}</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:40, fontWeight:400, color:s.color, lineHeight:1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* List header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <p style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', fontWeight:500 }}>Mis invitaciones</p>
          {events.length > 0 && <p style={{ fontSize:12, color:'#ccc' }}>{events.length} en total</p>}
        </div>

        {/* Empty state */}
        {events.length === 0 ? (
          <div style={{ background:'#fff', border:'1.5px dashed #d0e8e5', borderRadius:20, padding:'56px 24px', textAlign:'center' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:48, color:'#84C5BC', marginBottom:16 }}>✦</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:24, fontWeight:400, color:'#1a1a1a', marginBottom:8 }}>Aún no tienes invitaciones</p>
            <p style={{ fontSize:14, color:'#888', marginBottom:24, maxWidth:300, margin:'0 auto 24px' }}>
              Crea tu primera invitación en minutos con nuestro wizard guiado.
            </p>
            <Link href="/dashboard/events/new"
              style={{ display:'inline-block', background:'#84C5BC', color:'#fff', borderRadius:12, padding:'13px 32px', fontSize:14, fontWeight:500, textDecoration:'none' }}>
              Crear mi primera invitación →
            </Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {events.map(event => {
              const isPaid = event.status==='PAID'
              return (
                <div key={event.id}
                  style={{ background:'#fff', border:'1px solid #e8e2db', borderRadius:16, overflow:'visible', position:'relative', transition:'box-shadow .15s' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow='none'}>
                  <div style={{ display:'flex', alignItems:'center', gap:14, padding:'15px 18px' }}>

                    {/* Emoji icon */}
                    <div style={{ width:42, height:42, borderRadius:12, background:isPaid?'#e0f5f2':'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                      {TYPE_EMOJI[event.type]??'✨'}
                    </div>

                    {/* Info (clickable) */}
                    <a href={`/dashboard/events/${event.id}`} style={{ flex:1, minWidth:0, textDecoration:'none' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3, flexWrap:'wrap' }}>
                        <span style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:260 }}>
                          {event.title}
                        </span>
                        <span style={{ fontSize:10, padding:'2px 9px', borderRadius:20, fontWeight:600, letterSpacing:0.5, textTransform:'uppercase', flexShrink:0, background:isPaid?'#dcfce7':'#f3f3f3', color:isPaid?'#166534':'#999' }}>
                          {isPaid?'Publicada':'Borrador'}
                        </span>
                      </div>
                      <p style={{ fontSize:12, color:'#aaa', margin:0 }}>
                        {fmtDate(event.eventDate)}
                        {event.location?` · ${event.location}`:''}
                        {` · ${TYPE_LABEL[event.type]??'Evento'}`}
                      </p>
                    </a>

                    {/* Stats */}
                    <div style={{ display:'flex', gap:20, flexShrink:0 }}>
                      <div style={{ textAlign:'center', minWidth:40 }}>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:400, color:'#1a1a1a', lineHeight:1, marginBottom:1 }}>{event.guests}</p>
                        <p style={{ fontSize:10, color:'#bbb', letterSpacing:0.3 }}>invitados</p>
                      </div>
                      <div style={{ textAlign:'center', minWidth:40 }}>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:400, color:event.rsvps>0?'#0f766e':'#1a1a1a', lineHeight:1, marginBottom:1 }}>{event.rsvps}</p>
                        <p style={{ fontSize:10, color:'#bbb', letterSpacing:0.3 }}>confirm.</p>
                      </div>
                    </div>

                    {/* ··· button */}
                    <button
                      onClick={e => { e.stopPropagation(); menuId===event.id ? closeMenu() : openMenu(event.id, e.currentTarget as HTMLButtonElement) }}
                      style={{ background:'none', border:'none', width:34, height:34, borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:20, lineHeight:1, flexShrink:0, letterSpacing:1, transition:'all .15s' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='#f5f5f5';(e.currentTarget as HTMLButtonElement).style.color='#555'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='none';(e.currentTarget as HTMLButtonElement).style.color='#ccc'}}>
                      ···
                    </button>
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
