'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface AgendaItem { id: string; time: string; title: string; description?: string }
interface Song      { id: string; title: string; artist: string; votes: number }
interface Gift      { id: string; name: string; description?: string; price?: number; isTaken: boolean; takenBy?: string }
interface Hotel     { id: string; name: string; stars?: number; priceRange?: string; distance?: number; url?: string; discount?: string }
interface Transport { id: string; name: string; type: string; origin: string; departureTime?: string; returnTime?: string }

interface DesignConfig {
  colorPrimary?: string; colorAccent?: string; colorBackground?: string; colorText?: string
  fontDisplay?: string; fontBody?: string; heroOverlay?: number
  decorationStyle?: string; layoutStyle?: string; musicName?: string; musicUrl?: string
  titleSize?: string; textAlign?: string; accentOpacity?: number; borderStyle?: string
  separatorStyle?: string; heroHeight?: number; animationIntensity?: string
}

interface TimelineItem {
  id: string; title: string; description: string; date?: string
  imageUrl?: string; icon: string; position: number
}

interface EventData {
  id: string; slug: string; title: string; status: string; type?: string
  coupleNames?: string; description?: string
  eventDate: string; endDate?: string
  doors?: string; ceremony?: string; reception?: string
  heroImage?: string; musicUrl?: string; dressCode?: string
  venueName?: string; venueAddress?: string; venueCity?: string
  latitude?: number; longitude?: number
  agendaJson?: AgendaItem[]
  timelineItems?: TimelineItem[]
  songs: Song[]; gifts: Gift[]; hotels: Hotel[]; transport: Transport[]
  menuJson?: { course: string; items: string[] }[]
  isPrivate: boolean; locale: string
  customData?: { design?: DesignConfig }
  _guest?: { id: string; name: string; tableName?: string; tableNumber?: number; isVIP?: boolean; menuChoice?: string; notes?: string }
}

// ─── DATE HELPERS (deterministic - no locale/ICU dependency) ─────
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAYS_ES   = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

function fmtDate(iso: string, opts: { weekday?: boolean; short?: boolean } = {}): string {
  const d = new Date(iso)
  const day   = d.getUTCDate()
  const month = MONTHS_ES[d.getUTCMonth()]
  const year  = d.getUTCFullYear()
  if (opts.short) return `${day} de ${month}`
  if (opts.weekday) return `${DAYS_ES[d.getUTCDay()]}, ${day} de ${month} de ${year}`
  return `${day} de ${month} de ${year}`
}

function fmtMonthYear(iso: string): string {
  const d = new Date(iso)
  return `${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`
}


function useCountdown(target: string) {
  // Start with zeros to avoid SSR/client hydration mismatch (Date.now() differs)
  const [t, setT] = useState({ days:0, hours:0, minutes:0, seconds:0, over:false })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) return { days:0, hours:0, minutes:0, seconds:0, over:true }
      return {
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        over: false,
      }
    }
    setT(calc()) // immediately set on client mount
    const id = setInterval(() => setT(calc()), 1000)
    return () => clearInterval(id)
  }, [target])
  return t
}

function Divider({ color = '#84C5BC', style }: { color?: string; style?: React.CSSProperties }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', width:'100%', margin:'0 auto', ...style }}>
      <svg width="120" height="24" viewBox="0 0 120 24" fill="none" style={{ display:'block', margin:'0 auto' }}>
        <line x1="0" y1="12" x2="48" y2="12" stroke={color} strokeWidth="0.75" strokeOpacity="0.4"/>
        <path d="M54 12 C56 8 60 6 60 12 C60 6 64 8 66 12" stroke={color} strokeWidth="1" fill="none" strokeOpacity="0.7"/>
        <circle cx="60" cy="12" r="1.5" fill={color} fillOpacity="0.5"/>
        <line x1="72" y1="12" x2="120" y2="12" stroke={color} strokeWidth="0.75" strokeOpacity="0.4"/>
      </svg>
    </div>
  )
}

function FloralCorner({ color = '#84C5BC', flip = false, flipY = false, style }: { color?: string; flip?: boolean; flipY?: boolean; style?: React.CSSProperties }) {
  const transform = [flip && 'scaleX(-1)', flipY && 'scaleY(-1)'].filter(Boolean).join(' ')
  return (
    <div style={{ ...style, transform: transform || undefined, pointerEvents:'none' }}>
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" opacity="0.22">
        <path d="M5 75 C5 40 40 5 75 5" stroke={color} strokeWidth="1" fill="none"/>
        <path d="M10 75 C10 45 45 10 75 10" stroke={color} strokeWidth="0.5" fill="none" opacity="0.5"/>
        <circle cx="15" cy="65" r="4" stroke={color} strokeWidth="0.8" fill="none"/>
        <circle cx="15" cy="65" r="1.5" fill={color} opacity="0.4"/>
        <path d="M20 60 Q25 50 30 55 Q25 60 20 60Z" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.15"/>
        <path d="M35 40 Q45 30 45 40 Q35 50 30 45 Q32 42 35 40Z" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.12"/>
        <circle cx="55" cy="20" r="3" stroke={color} strokeWidth="0.8" fill="none"/>
        <path d="M60 15 Q65 10 68 15 Q63 18 60 15Z" stroke={color} strokeWidth="0.8" fill={color} fillOpacity="0.15"/>
      </svg>
    </div>
  )
}

export function EventLanding({ event, guestToken, channel }: {
  event: EventData; guestToken?: string; channel?: string
}) {
  const router    = useRouter()
  const countdown = useCountdown(event.eventDate)

  const [rsvpStep, setRsvpStep]     = useState<'form' | 'sending' | 'done'>('form')
  const [attendance, setAttendance] = useState<'CONFIRMED' | 'DECLINED'>('CONFIRMED')
  const [companions, setCompanions] = useState(0)
  const [dietary, setDietary]       = useState('')
  const [message, setMessage]       = useState('')
  const [rsvpError, setRsvpError]   = useState('')
  const [songs, setSongs] = useState<Song[]>(event.songs)
  const [newSong, setNewSong] = useState('')
  const [gifts, setGifts]    = useState<Gift[]>(event.gifts)

  // No scroll reveal - using CSS scroll-driven animations instead
  const mounted = true // always true - no hydration issues

  const agenda: AgendaItem[] = (event.agendaJson as AgendaItem[]) ?? [
    { id:'1', time: event.doors ?? '',     title: 'Llegada de invitados', description: '' },
    { id:'2', time: event.ceremony ?? '',  title: 'Ceremonia',            description: '' },
    { id:'3', time: event.reception ?? '', title: 'Banquete',             description: '' },
  ].filter(a => a.time)

  const design      = event.customData?.design ?? {} as DesignConfig
  const accent      = design.colorAccent     ?? '#84C5BC'
  const bgPage      = design.colorBackground ?? '#faf9f6'
  const bgDark      = design.colorPrimary    ?? '#2d4a47'
  const fontDisplay = design.fontDisplay     ?? 'Playfair Display'
  const fontBody    = design.fontBody        ?? 'Inter'
  const musicToPlay = design.musicUrl ?? event.musicUrl ?? ''
  const musicLabel  = design.musicName ?? ''

  const a = (op: number) => accent + Math.round(op * 255).toString(16).padStart(2,'0')

  const eventDateShort = fmtDate(event.eventDate)
  const rsvpDeadline   = fmtDate(new Date(new Date(event.eventDate).getTime() - 14*86400000).toISOString(), { short: true })

  async function submitRSVP() {
    if (!guestToken) return
    setRsvpStep('sending'); setRsvpError('')
    try {
      const res = await fetch('/api/rsvp', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ guestToken, eventId:event.id, status:attendance, companions, dietaryRestrictions:dietary||undefined, message:message||undefined }),
      })
      if (res.ok) {
        setRsvpStep('done')
        const guestName = event._guest?.name ? `&name=${encodeURIComponent(event._guest.name)}` : ''
        setTimeout(() => router.push(`/event/${event.slug}/confirmed?status=${attendance}&event=${event.slug}${guestName}`), 800)
      }
      else { const d = await res.json(); setRsvpError(d.error ?? 'Error. Inténtalo de nuevo.'); setRsvpStep('form') }
    } catch { setRsvpError('Error de conexión.'); setRsvpStep('form') }
  }

  async function addSong() {
    const val = newSong.trim(); if (!val) return
    const parts = val.split('·').map(s => s.trim())
    try { await fetch(`/api/events/${event.id}/songs`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ title:parts[0]||val, artist:parts[1]||'Invitado', suggestedBy:'Invitado' }) }) } catch {}
    setSongs(prev => [...prev, { id:Date.now().toString(), title:parts[0]||val, artist:parts[1]||'Invitado', votes:0 }])
    setNewSong('')
  }

  async function takeGift(id: string) {
    try { await fetch(`/api/events/${event.id}/gifts/${id}/take`, { method:'POST' }) } catch {}
    setGifts(prev => prev.map(g => g.id===id ? {...g, isTaken:true} : g))
  }

  const isWedding   = event.type === 'WEDDING'
  const displayName = event.coupleNames || event.title

  // ── Per-type content config ──────────────────────────────────
  const T = {
    WEDDING:     { hero:'Nos casamos',           heroSub:'¡Nos casamos!',            rsvp:'¿Nos acompañas?',         gifts:'Lista de bodas',    showTimeline:true,  showGifts:true  },
    BIRTHDAY:    { hero:'¡Te invito a mi cumple!', heroSub:'¡Ven a celebrar!',         rsvp:'¿Vienes a la fiesta?',    gifts:'Lista de deseos',   showTimeline:false, showGifts:true  },
    CORPORATE:   { hero:'Estás invitado/a',       heroSub:'',                          rsvp:'¿Confirmas asistencia?',  gifts:'',                  showTimeline:false, showGifts:false },
    BAPTISM:     { hero:'Celebra con nosotros',   heroSub:'¡Celebra el bautizo!',      rsvp:'¿Puedes acompañarnos?',   gifts:'Lista de regalos',  showTimeline:false, showGifts:true  },
    ANNIVERSARY: { hero:'Celebramos nuestro aniversario', heroSub:'¡Nos acompañas?',   rsvp:'¿Nos acompañas?',         gifts:'Lista de regalos',  showTimeline:true,  showGifts:true  },
    GRADUATION:  { hero:'¡Me gradúo!',            heroSub:'¡Ven a celebrarlo!',        rsvp:'¿Vienes a celebrarlo?',   gifts:'Lista de regalos',  showTimeline:false, showGifts:true  },
    QUINCEANERA: { hero:'Celebra mis 15 años',    heroSub:'¡Mis 15 años!',             rsvp:'¿Nos acompañas?',         gifts:'Lista de regalos',  showTimeline:false, showGifts:true  },
    OTHER:       { hero:'Te invitamos',            heroSub:'',                          rsvp:'¿Nos acompañas?',         gifts:'Lista de regalos',  showTimeline:false, showGifts:true  },
  } as const
  const tc = T[(event.type as keyof typeof T) ?? 'OTHER'] ?? T.OTHER
  const fb = `'${fontBody}',sans-serif`
  const fd = `'${fontDisplay}',serif`

  function Label({ text }: { text: string }) {
    return <p style={{ fontFamily:fb, fontSize:10, letterSpacing:5, textTransform:'uppercase', color:accent, marginBottom:10, textAlign:'center' }}>{text}</p>
  }
  function Title({ text, light=false }: { text:string; light?:boolean }) {
    return <h2 style={{ fontFamily:"'Great Vibes',cursive", fontWeight:400, fontSize:'clamp(30px,6vw,50px)', color:light?'#fff':'#2c2c2a', textAlign:'center', lineHeight:1.2, marginBottom:0 }}>{text}</h2>
  }

  return (
    <div suppressHydrationWarning style={{ fontFamily:fb, background:bgPage, color:'#2c2c2a', minHeight:'100vh' }}>
      <style>{`
        @keyframes elFadeUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
        @keyframes elFadeIn { from { opacity:0 } to { opacity:1 } }
        .el-fi  { animation: elFadeIn 1s ease forwards }
        .el-fu  { animation: elFadeUp .9s ease forwards }
        .el-fu2 { animation: elFadeUp .9s ease .18s forwards }
        .el-fu3 { animation: elFadeUp .9s ease .34s forwards }
        @media (prefers-reduced-motion: reduce) {
          .el-fi, .el-fu, .el-fu2, .el-fu3 { animation: none !important; opacity:1 !important; transform:none !important; }
        }
        /* Default: always visible (safest - no content ever hidden) */
        .el-reveal { opacity:1; transform:none; }
        /* Progressive enhancement: scroll animation only if supported */
        @supports (animation-timeline: view()) {
          .el-reveal {
            animation: elRevealAnim 0.65s ease both;
            animation-timeline: view();
            animation-range: entry 0% entry 25%;
          }
          @keyframes elRevealAnim {
            from { opacity:0; transform:translateY(18px); }
            to   { opacity:1; transform:translateY(0); }
          }
        }
        .el-visible { opacity:1 !important; transform:none !important; }
        @media (max-width:768px) {
          .el-cols  { grid-template-columns: 1fr !important }
          .el-p     { padding: 56px 28px !important }
          .el-heroimg { height: 55vw !important }
        }
        @keyframes mb0{from{height:6px}to{height:16px}}
        @keyframes mb1{from{height:10px}to{height:5px}}
        @keyframes mb2{from{height:7px}to{height:18px}}
        @keyframes mb3{from{height:8px}to{height:4px}}
        @keyframes mb4{from{height:5px}to{height:14px}}
      `}</style>

      {musicToPlay && <MusicPlayer musicUrl={musicToPlay} musicLabel={musicLabel} accentColor={accent} eventName={event.coupleNames ?? event.title} eventType={event.type} />}

      {/* ── HERO ── */}
      <section style={{ background:bgPage, position:'relative', overflow:'hidden' }}>
        <FloralCorner color={accent} style={{ position:'absolute', top:12, left:12, zIndex:2 }} />
        <FloralCorner color={accent} flip style={{ position:'absolute', top:12, right:12, zIndex:2 }} />

        <div className="el-p" style={{ padding:'80px 48px 44px', textAlign:'center', position:'relative', zIndex:1 }}>
          <p className="el-fi" style={{ fontFamily:fb, fontSize:10, letterSpacing:6, textTransform:'uppercase', color:accent, marginBottom:20, opacity:.8 }}>
            {tc.hero}
          </p>
          <h1 className="el-fu" style={{ fontFamily:fd, fontWeight:600, fontSize:'clamp(52px,10vw,108px)', lineHeight:.88, letterSpacing:-2, color:'#1a1c18', margin:'0 0 28px', wordBreak:'break-word' }}>
            {displayName}
          </h1>
          <p className="el-fu2" style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(22px,4vw,34px)', color:accent, marginBottom:6 }}>
            {tc.heroSub || eventDateShort}
          </p>
          {tc.heroSub && (
            <p className="el-fu3" style={{ fontFamily:fb, fontSize:12, letterSpacing:4, textTransform:'uppercase', color:'#aaa', marginTop:6 }}>
              {eventDateShort}
            </p>
          )}
        </div>

        {event.heroImage ? (
          <div className="el-heroimg" style={{ width:'100%', height:'60vh', position:'relative', overflow:'hidden' }}>
            <img src={event.heroImage} alt={displayName} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top, ${bgDark}cc 0%, transparent 55%)` }} />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, textAlign:'center', padding:'28px 24px' }}>
              <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(26px,4vw,40px)', color:'#fff', textShadow:'0 2px 18px rgba(0,0,0,0.5)', marginBottom:6 }}>
                {isWedding ? '¡Nos casamos!' : displayName}
              </p>
              <p style={{ fontFamily:fb, fontSize:12, letterSpacing:3, color:'rgba(255,255,255,.65)', textTransform:'uppercase' }}>
                {eventDateShort}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ height:3, background:`linear-gradient(to right, transparent, ${a(0.25)}, transparent)` }} />
        )}
      </section>

      {/* ── DESCRIPCIÓN ── */}
      {event.description && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', textAlign:'center', background:bgPage }}>
          <div style={{ maxWidth:580, margin:'0 auto' }}>
            <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(20px,4vw,30px)', color:'#3a3c38', lineHeight:1.7, marginBottom:28 }}>
              {event.description}
            </p>
            <Divider color={accent} />
          </div>
        </section>
      )}

      {/* ── CUÁNDO / DÓNDE ── */}
      <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:bgPage }}>
        <div style={{ maxWidth:660, margin:'0 auto', textAlign:'center' }}>
          <Label text="Acompáñanos" />
          <Title text="Cuándo y dónde" />
          <Divider color={accent} style={{ margin:'22px auto 48px' }} />
          <div className="el-cols" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }}>
            <div>
              <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:28, color:accent, marginBottom:14 }}>¿Cuándo?</p>
              <p style={{ fontFamily:fb, fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#bbb', marginBottom:10 }}>Fecha</p>
              <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:17, color:'#2c2c2a', lineHeight:1.5 }}>
                {fmtDate(event.eventDate).toUpperCase()}
              </p>
              {(event.doors || event.ceremony) && (
                <p style={{ fontSize:13, color:'#999', marginTop:8 }}>
                  {event.doors ? `${event.doors}h` : ''}{event.ceremony ? ` · Ceremonia ${event.ceremony}h` : ''}
                </p>
              )}
            </div>
            {event.venueName && (
              <div>
                <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:28, color:accent, marginBottom:14 }}>¿Dónde?</p>
                <p style={{ fontFamily:fb, fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#bbb', marginBottom:10 }}>Lugar</p>
                <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:17, color:'#2c2c2a', lineHeight:1.5 }}>
                  {event.venueName.toUpperCase()}
                </p>
                {(event.venueAddress || event.venueCity) && (
                  <p style={{ fontSize:13, color:'#999', marginTop:8 }}>
                    {[event.venueAddress, event.venueCity].filter(Boolean).join(', ')}
                  </p>
                )}
                {event.latitude && event.longitude && (
                  <a href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`} target="_blank"
                    style={{ display:'inline-block', marginTop:12, fontSize:12, color:accent, textDecoration:'none', letterSpacing:1, borderBottom:`1px solid ${a(0.3)}`, paddingBottom:2 }}>
                    Ver en Google Maps →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOTO + COUNTDOWN encima ── */}
      {event.heroImage ? (
        <div className="el-heroimg" style={{ width:'100%', height:'42vh', overflow:'hidden', position:'relative' }}>
          <img src={event.heroImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center 35%', filter:'grayscale(15%) brightness(.92)' }} />
          {!countdown.over && (
            <div style={{ position:'absolute', inset:0, background:'rgba(28,30,24,.52)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:0, fontFamily:fd, fontWeight:300, color:'#fff' }}>
                {[{ v:countdown.days,sep:false }, { v:countdown.hours,sep:true }, { v:countdown.minutes,sep:true }, { v:countdown.seconds,sep:true }].map(({ v, sep }, i) => (
                  <span key={i} style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                    {sep && <span style={{ fontSize:'clamp(28px,5vw,52px)', opacity:.4, margin:'0 2px' }}>:</span>}
                    <span style={{ fontSize:'clamp(36px,7vw,68px)' }}>{String(v).padStart(2,'0')}</span>
                  </span>
                ))}
              </div>
              <p style={{ fontFamily:fb, fontSize:10, letterSpacing:4, color:'rgba(255,255,255,.45)', textTransform:'uppercase', marginTop:10 }}>Quedan</p>
            </div>
          )}
        </div>
      ) : (!countdown.over && (
        <section style={{ padding:'56px 40px', background:bgDark, textAlign:'center' }}>
          <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:26, color:a(0.7), marginBottom:28 }}>Quedan</p>
          <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
            {[['days','Días'],['hours','Horas'],['minutes','Min'],['seconds','Seg']].map(([k,l]) => (
              <div key={k} style={{ textAlign:'center' }}>
                <span style={{ fontFamily:fd, fontSize:'clamp(40px,7vw,64px)', fontWeight:300, color:'#fff', display:'block' }}>{String((countdown as any)[k]).padStart(2,'0')}</span>
                <span style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'rgba(255,255,255,.3)', display:'block', marginTop:4 }}>{l}</span>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ── CÓMO LLEGAR + DRESS CODE ── */}
      {(event.venueName || event.dressCode) && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'64px 48px', background:'#fff' }}>
          <div className="el-cols" style={{ maxWidth:660, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, textAlign:'center' }}>
            {event.venueName && (
              <div>
                <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:28, color:accent, marginBottom:16 }}>Cómo llegar</p>
                <div style={{ width:52, height:52, borderRadius:'50%', background:a(0.1), border:`1.5px solid ${a(0.25)}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:22 }}>📍</div>
                <p style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>{event.venueName}{event.venueCity ? `, ${event.venueCity}` : ''}</p>
                {event.latitude && event.longitude && (
                  <a href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`} target="_blank"
                    style={{ display:'inline-block', marginTop:12, fontSize:12, color:accent, textDecoration:'none', letterSpacing:1 }}>Ver mapa →</a>
                )}
              </div>
            )}
            {event.dressCode && (
              <div>
                <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:28, color:accent, marginBottom:16 }}>Dress code</p>
                <div style={{ display:'flex', justifyContent:'center', gap:8, marginBottom:14, fontSize:26 }}><span>🤵</span><span>👗</span></div>
                <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:17, color:'#2c2c2a', marginBottom:6 }}>{event.dressCode}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── AGENDA ── */}
      {agenda.length > 0 && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:bgPage }}>
          <div style={{ maxWidth:460, margin:'0 auto', textAlign:'center' }}>
            <Label text="El día" />
            <Title text="Programa" />
            <Divider color={accent} style={{ margin:'22px auto 48px' }} />
            <div style={{ textAlign:'left' }}>
              {agenda.map((item, i) => (
                <div key={item.id} style={{ display:'flex', gap:24, paddingBottom:i<agenda.length-1?30:0, marginBottom:i<agenda.length-1?30:0, borderBottom:i<agenda.length-1?`1px solid ${a(0.1)}`:'none' }}>
                  <div style={{ textAlign:'right', minWidth:50, paddingTop:3 }}>
                    <p style={{ fontFamily:fb, fontSize:11, letterSpacing:2, color:accent, fontWeight:500 }}>{item.time}</p>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:19, color:'#2c2c2a', marginBottom:item.description?4:0 }}>{item.title}</p>
                    {item.description && <p style={{ fontSize:13, color:'#999', lineHeight:1.6 }}>{item.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TIMELINE ── */}
      {event.timelineItems && event.timelineItems.length > 0 && tc.showTimeline && (
        <TimelineSection items={event.timelineItems} accent={accent} fontDisplay={fontDisplay} bgColor={bgPage} />
      )}

      {/* ── RSVP ── */}
      <section id="rsvp" className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'80px 48px', background:bgDark, position:'relative', overflow:'hidden' }}>
        <FloralCorner color="#fff" style={{ position:'absolute', top:0, left:0, opacity:.07 }} />
        <FloralCorner color="#fff" flip style={{ position:'absolute', top:0, right:0, opacity:.07 }} />
        <FloralCorner color="#fff" flipY style={{ position:'absolute', bottom:0, left:0, opacity:.07 }} />
        <FloralCorner color="#fff" flip flipY style={{ position:'absolute', bottom:0, right:0, opacity:.07 }} />

        <div style={{ maxWidth:500, margin:'0 auto', textAlign:'center', position:'relative', zIndex:1 }}>
          <p style={{ fontFamily:fb, fontSize:10, letterSpacing:5, textTransform:'uppercase', color:a(0.55), marginBottom:14 }}>Confirmación de asistencia</p>
          {event._guest?.tableName && (
            <p style={{ fontFamily:fb, fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>
              Mesa asignada: <strong style={{ color:'rgba(255,255,255,0.75)' }}>{event._guest.tableName}</strong>
            </p>
          )}
          <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(30px,6vw,50px)', color:'#fff', marginBottom:14, lineHeight:1.2 }}>{tc.rsvp}</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', marginBottom:40, lineHeight:1.7 }}>
            Confirma antes del <strong style={{ color:'rgba(255,255,255,.65)' }}>{rsvpDeadline}</strong>
          </p>

          {rsvpStep==='done' ? (
            <div style={{ padding:'32px', background:'rgba(255,255,255,.06)', borderRadius:20, border:`1px solid ${a(0.3)}` }}>
              <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:40, color:accent, marginBottom:10 }}>¡Gracias!</p>
              <p style={{ color:'rgba(255,255,255,.55)', fontSize:14 }}>Hemos recibido tu confirmación</p>
            </div>
          ) : !guestToken ? (
            <div style={{ background:'rgba(255,255,255,.04)', borderRadius:16, padding:'28px', border:'1px solid rgba(255,255,255,.08)' }}>
              <p style={{ fontSize:14, color:'rgba(255,255,255,.4)', lineHeight:1.7 }}>Accede con tu enlace personalizado para confirmar asistencia.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14, textAlign:'left' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {(['CONFIRMED','DECLINED'] as const).map(s => (
                  <button key={s} onClick={() => setAttendance(s)}
                    style={{ padding:'14px', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:fb, transition:'all .15s',
                      background:attendance===s?accent:'transparent',
                      color:attendance===s?'#fff':'rgba(255,255,255,.4)',
                      border:attendance===s?'none':'1px solid rgba(255,255,255,.15)',
                    }}>
                    {s==='CONFIRMED' ? '¡Sí, asistiré! 🎉' : 'No podré ir'}
                  </button>
                ))}
              </div>
              {attendance==='CONFIRMED' && event.type !== 'CORPORATE' && (
                <div>
                  <label style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,.3)', display:'block', marginBottom:8 }}>Acompañantes adicionales</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[0,1,2,3,4,5].map(n => (
                      <button key={n} onClick={() => setCompanions(n)}
                        style={{ width:38, height:38, borderRadius:8, fontSize:14, cursor:'pointer', fontFamily:fb,
                          background:companions===n?accent:'rgba(255,255,255,.06)',
                          color:companions===n?'#fff':'rgba(255,255,255,.4)',
                          border:companions===n?'none':'1px solid rgba(255,255,255,.1)',
                        }}>{n}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,.3)', display:'block', marginBottom:8 }}>Restricciones alimentarias (opcional)</label>
                <input value={dietary} onChange={e=>setDietary(e.target.value)} placeholder="Celiaco, vegetariano…"
                  style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:'12px 16px', fontSize:14, color:'#fff', outline:'none', fontFamily:fb, boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'rgba(255,255,255,.3)', display:'block', marginBottom:8 }}>Mensaje (opcional)</label>
                <input value={message} onChange={e=>setMessage(e.target.value)} placeholder="¡Enhorabuena! 🥂"
                  style={{ width:'100%', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, padding:'12px 16px', fontSize:14, color:'#fff', outline:'none', fontFamily:fb, boxSizing:'border-box' }} />
              </div>
              {rsvpError && <p style={{ fontSize:13, color:'#f0a0a0', textAlign:'center' }}>{rsvpError}</p>}
              <button onClick={submitRSVP} disabled={rsvpStep==='sending'}
                style={{ padding:'16px', background:accent, border:'none', borderRadius:14, fontSize:14, fontWeight:500, color:'#fff', cursor:'pointer', fontFamily:fb, marginTop:4, opacity:rsvpStep==='sending'?.7:1, letterSpacing:.5 }}>
                {rsvpStep==='sending' ? 'Enviando…' : 'Confirmar asistencia'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── REGALOS ── */}
      {gifts.length > 0 && tc.showGifts && tc.gifts && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:'#fff' }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <Label text={tc.gifts} />
            <Title text="Regalos" />
            <Divider color={accent} style={{ margin:'22px auto 16px' }} />
            {isWedding && (
              <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:22, color:'#888', marginBottom:36 }}>Lo que más deseamos es que vengas a celebrar</p>
            )}
            <div className="el-cols" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, textAlign:'left' }}>
              {gifts.map(g => (
                <div key={g.id} onClick={() => !g.isTaken && takeGift(g.id)}
                  style={{ background:bgPage, border:`1px solid ${a(0.14)}`, borderRadius:16, padding:'22px', position:'relative', transition:'all .2s', cursor:g.isTaken?'default':'pointer', opacity:g.isTaken?.55:1 }}
                  onMouseEnter={e => { if(!g.isTaken) (e.currentTarget as HTMLDivElement).style.borderColor=accent }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor=a(0.14) }}>
                  {g.isTaken && <span style={{ position:'absolute', top:10, right:10, background:accent, color:'#fff', fontSize:9, letterSpacing:1.5, padding:'3px 8px', borderRadius:20, textTransform:'uppercase' }}>Elegido</span>}
                  <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:17, color:'#2c2c2a', marginBottom:5 }}>{g.name}</p>
                  {g.description && <p style={{ fontSize:13, color:'#999', marginBottom:6 }}>{g.description}</p>}
                  {g.price && <p style={{ fontSize:13, color:accent }}>~€{g.price.toFixed(0)}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOTELES ── */}
      {event.hotels?.length > 0 && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:bgPage }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <Label text="Alojamiento" />
            <Title text="Hoteles cercanos" />
            <Divider color={accent} style={{ margin:'22px auto 40px' }} />
            <div className="el-cols" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, textAlign:'left' }}>
              {event.hotels.map(h => (
                <div key={h.id} style={{ background:'#fff', border:`1px solid ${a(0.12)}`, borderRadius:16, padding:'22px' }}>
                  <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:19, color:'#2c2c2a', marginBottom:5 }}>{h.name}</p>
                  {h.stars && <p style={{ color:accent, marginBottom:5, fontSize:13 }}>{'★'.repeat(h.stars)}</p>}
                  {h.priceRange && <p style={{ fontSize:13, color:'#999', marginBottom:3 }}>{h.priceRange}</p>}
                  {h.distance && <p style={{ fontSize:12, color:'#ccc' }}>{h.distance} km del lugar</p>}
                  {h.discount && <p style={{ fontSize:12, color:accent, marginTop:5 }}>{h.discount}</p>}
                  {h.url && <a href={h.url} target="_blank" style={{ fontSize:12, color:accent, display:'block', marginTop:9, textDecoration:'none' }}>Reservar →</a>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRANSPORTE ── */}
      {event.transport?.length > 0 && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:'#fff' }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <Label text="Transporte" />
            <Title text="Cómo llegar" />
            <Divider color={accent} style={{ margin:'22px auto 40px' }} />
            <div className="el-cols" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, textAlign:'left' }}>
              {event.transport.map(t => (
                <div key={t.id} style={{ background:bgPage, border:`1px solid ${a(0.12)}`, borderRadius:16, padding:'22px' }}>
                  <p style={{ fontSize:10, letterSpacing:2, textTransform:'uppercase', color:accent, marginBottom:7 }}>{t.type}</p>
                  <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:19, color:'#2c2c2a', marginBottom:5 }}>{t.name}</p>
                  <p style={{ fontSize:13, color:'#999', marginBottom:3 }}>Salida: {t.origin}</p>
                  {t.departureTime && <p style={{ fontSize:13, color:'#999' }}>Hora: {t.departureTime}</p>}
                  {t.returnTime && <p style={{ fontSize:13, color:'#999' }}>Regreso: {t.returnTime}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── MENÚ ── */}
      {event.menuJson && event.menuJson.length > 0 && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:bgPage }}>
          <div style={{ maxWidth:680, margin:'0 auto', textAlign:'center' }}>
            <Label text="Gastronomía" />
            <Title text="Menú del evento" />
            <Divider color={accent} style={{ margin:'22px auto 40px' }} />
            <div className="el-cols" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:20, textAlign:'left' }}>
              {event.menuJson.map((c, i) => (
                <div key={i} style={{ background:'#fff', borderRadius:16, padding:'22px 26px', border:`1px solid ${a(0.12)}` }}>
                  <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:accent, marginBottom:10 }}>{c.course}</p>
                  <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:7 }}>
                    {c.items.map((item, j) => (
                      <li key={j} style={{ fontSize:14, color:'#555', display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ color:accent, fontSize:9 }}>✦</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PLAYLIST ── */}
      {songs.length > 0 && (
        <section className={`el-p${mounted ? " el-reveal" : ""}`} style={{ padding:'72px 48px', background:'#fff' }}>
          <div style={{ maxWidth:520, margin:'0 auto', textAlign:'center' }}>
            <Label text="Música" />
            <Title text="Playlist colaborativa" />
            <Divider color={accent} style={{ margin:'22px auto 32px' }} />
            <p style={{ fontSize:14, color:'#bbb', marginBottom:26, lineHeight:1.7 }}>Sugiere una canción · <em>Título · Artista</em></p>
            <div style={{ display:'flex', gap:10, marginBottom:22 }}>
              <input value={newSong} onChange={e=>setNewSong(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSong()}
                placeholder="My Heart Will Go On · Céline Dion"
                style={{ flex:1, border:`1px solid ${a(0.2)}`, borderRadius:12, padding:'12px 16px', fontSize:14, outline:'none', background:bgPage, fontFamily:fb }} />
              <button onClick={addSong}
                style={{ background:bgDark, color:'#fff', border:'none', borderRadius:12, padding:'12px 18px', fontSize:13, cursor:'pointer', fontFamily:fb, fontWeight:500, whiteSpace:'nowrap' }}>
                Añadir
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:0, border:`1px solid ${a(0.12)}`, borderRadius:14, overflow:'hidden' }}>
              {songs.map((s, i) => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14, background:bgPage, padding:'13px 18px', borderBottom:i<songs.length-1?`1px solid ${a(0.08)}`:'none' }}>
                  <span style={{ fontSize:12, color:accent, width:20, textAlign:'center', flexShrink:0 }}>{i+1}</span>
                  <div style={{ flex:1, textAlign:'left' }}>
                    <p style={{ fontSize:14, color:'#2c2c2a', fontWeight:500 }}>{s.title}</p>
                    <p style={{ fontSize:12, color:'#bbb', marginTop:2 }}>{s.artist}</p>
                  </div>
                  <a href={`https://open.spotify.com/search/${encodeURIComponent(`${s.title} ${s.artist}`)}`} target="_blank"
                    style={{ fontSize:11, color:'#1DB954', textDecoration:'none', opacity:.7 }}>▶</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="el-p" style={{ padding:'64px 48px 48px', background:bgPage, textAlign:'center', borderTop:`1px solid ${a(0.12)}`, position:'relative' }}>
        <FloralCorner color={accent} style={{ position:'absolute', bottom:0, left:0, opacity:.15 }} flipY />
        <FloralCorner color={accent} flip flipY style={{ position:'absolute', bottom:0, right:0, opacity:.15 }} />
        <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(24px,5vw,38px)', color:accent, marginBottom:8 }}>
          {displayName}
        </p>
        <p style={{ fontFamily:fb, fontSize:11, letterSpacing:3, textTransform:'uppercase', color:'#ccc', marginBottom:36 }}>
          {eventDateShort}
        </p>
        <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <p style={{ fontSize:10, letterSpacing:3, textTransform:'uppercase', color:'#ccc', margin:0 }}>Esta invitación fue creada con</p>
          <a href={`${process.env.NEXT_PUBLIC_APP_URL??'https://evochi.app'}/?utm_source=invitation&utm_medium=footer&utm_campaign=${event.slug}`}
            target="_blank" rel="noopener"
            style={{ display:'inline-flex', alignItems:'center', gap:10, background:a(0.08), border:`1px solid ${a(0.22)}`, borderRadius:40, padding:'9px 22px', textDecoration:'none' }}>
            <span style={{ fontFamily:"'Inter','Helvetica Neue',sans-serif", fontSize:16, color:accent, fontWeight:500 }}>evochi</span>
            <span style={{ fontSize:11, color:'#ccc' }}>·</span>
            <span style={{ fontSize:12, color:'#999' }}>Crea tu invitación gratis →</span>
          </a>
        </div>
      </footer>
    </div>
  )
}

// ─── TIMELINE ─────────────────────────────────────────────────
function TimelineSection({ items, accent, fontDisplay, bgColor }: { items: TimelineItem[]; accent:string; fontDisplay:string; bgColor:string }) {
  const a = (op:number) => accent + Math.round(op*255).toString(16).padStart(2,'0')
  const fd = `'${fontDisplay}',serif`
  return (
    <section style={{ background:bgColor, padding:'72px 48px' }}>
      <div style={{ maxWidth:580, margin:'0 auto' }}>
        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:5, textTransform:'uppercase', color:accent, marginBottom:10, textAlign:'center' }}>Nuestra historia</p>
        <h2 style={{ fontFamily:"'Great Vibes',cursive", fontWeight:400, fontSize:'clamp(28px,5vw,44px)', color:'#2c2c2a', textAlign:'center', marginBottom:0 }}>El camino hasta aquí</h2>
        <div style={{ textAlign:'center', margin:'22px auto 52px' }}>
          <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
            <line x1="0" y1="10" x2="40" y2="10" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4"/>
            <circle cx="50" cy="10" r="2" fill={accent} fillOpacity="0.4"/>
            <line x1="60" y1="10" x2="100" y2="10" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4"/>
          </svg>
        </div>
        <div style={{ position:'relative', paddingLeft:28, borderLeft:`1px solid ${a(0.18)}` }}>
          {items.map((item, i) => (
            <div key={item.id} style={{ position:'relative', paddingBottom:i<items.length-1?44:0 }}>
              <div style={{ position:'absolute', left:-35, top:6, width:14, height:14, borderRadius:'50%', background:bgColor, border:`2px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7 }}>{item.icon}</div>
              {item.date && <p style={{ fontFamily:"'Inter',sans-serif", fontSize:10, letterSpacing:3, textTransform:'uppercase', color:a(0.6), marginBottom:5 }}>{fmtMonthYear(item.date)}</p>}
              <p style={{ fontFamily:fd, fontStyle:'italic', fontSize:'clamp(17px,3vw,24px)', color:'#2c2c2a', marginBottom:6, lineHeight:1.2 }}>{item.title}</p>
              {item.description && <p style={{ fontSize:14, color:'#999', lineHeight:1.75, marginBottom:item.imageUrl?14:0 }}>{item.description}</p>}
              {item.imageUrl && (
                <div style={{ borderRadius:12, overflow:'hidden', maxWidth:380, aspectRatio:'16/9', marginTop:10 }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>(e.currentTarget as HTMLImageElement).style.display='none'} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── MUSIC PLAYER ─────────────────────────────────────────────
function MusicPlayer({ musicUrl, musicLabel, accentColor, eventName, eventType }: { musicUrl:string; musicLabel:string; accentColor:string; eventName?:string; eventType?:string }) {
  const isYT    = musicUrl.startsWith('youtube:')
  const ytId    = isYT ? musicUrl.replace('youtube:','') : null
  const audioRef  = useRef<HTMLAudioElement|null>(null)
  const iframeRef = useRef<HTMLIFrameElement|null>(null)
  const [playing, setPlaying] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Send command to YouTube iframe via postMessage
  function ytCommand(cmd: 'playVideo' | 'pauseVideo') {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*'
    )
  }

  async function handleWelcome() {
    setShowWelcome(false)
    if (!isYT && audioRef.current) {
      audioRef.current.volume = 0.45
      try { await audioRef.current.play() } catch {}
    } else if (isYT) {
      // Small delay to ensure iframe is ready
      setTimeout(() => { ytCommand('playVideo'); setPlaying(true) }, 300)
    }
  }

  async function toggleAudio() {
    if (isYT) {
      if (playing) { ytCommand('pauseVideo'); setPlaying(false) }
      else { ytCommand('playVideo'); setPlaying(true) }
      return
    }
    const a = audioRef.current; if (!a) return
    if (playing) { a.pause() } else { a.volume=.45; try { await a.play() } catch {} }
  }

  const bars = (
    <span style={{ display:'flex', alignItems:'flex-end', gap:2, height:18 }}>
      {[16,10,18,8,14].map((h,i) => (
        <span key={i} style={{ display:'block', width:3, borderRadius:2, background:'#fff', height:`${h}px`, animation:`mb${i} ${.4+i*.07}s ease-in-out infinite alternate`, animationDelay:`${i*.08}s` }} />
      ))}
    </span>
  )

  return (
    <>
      {!isYT && <audio ref={audioRef} src={musicUrl} loop onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} />}
      {isYT && ytId && (
        <iframe
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&loop=1&playlist=${ytId}&controls=0&autoplay=0`}
          allow="autoplay; encrypted-media"
          style={{ position:'fixed', bottom:-9999, left:-9999, width:1, height:1, border:'none', opacity:0, pointerEvents:'none' }}
        />
      )}

      {/* Welcome overlay — triggers autoplay on first interaction */}
      {showWelcome && (
        <div onClick={handleWelcome} style={{
          position:'fixed', inset:0, zIndex:999,
          background:'rgba(0,0,0,0.55)',
          backdropFilter:'blur(20px) saturate(1.2)',
          display:'flex', alignItems:'center', justifyContent:'center',
          cursor:'pointer',
        }}>
          <style>{`
            @keyframes wv-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
            @keyframes wv-ring1 { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
            @keyframes wv-ring2 { 0%{transform:scale(1);opacity:.4} 100%{transform:scale(2.8);opacity:0} }
            @keyframes wv-in    { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
            @keyframes wv-bar   { 0%,100%{transform:scaleY(.4)} 50%{transform:scaleY(1)} }
            .wv-card { animation: wv-in .6s cubic-bezier(.16,1,.3,1) forwards }
          `}</style>

          <div className="wv-card" style={{
            position:'relative',
            background:'linear-gradient(145deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
            border:'1px solid rgba(255,255,255,0.18)',
            borderRadius:28, padding:'44px 40px 36px',
            textAlign:'center', width:'min(340px, 88vw)',
            boxShadow:'0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          }}>

            {/* Pulsing rings */}
            <div style={{ position:'relative', width:72, height:72, margin:'0 auto 24px' }}>
              <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:`1.5px solid ${accentColor}`, animation:'wv-ring1 2s ease-out infinite' }} />
              <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:`1.5px solid ${accentColor}`, animation:'wv-ring2 2s ease-out .5s infinite' }} />
              {/* Icon circle */}
              <div style={{ width:72, height:72, borderRadius:'50%', background:`linear-gradient(135deg, ${accentColor}cc, ${accentColor}66)`, display:'flex', alignItems:'center', justifyContent:'center', animation:'wv-float 3s ease-in-out infinite', boxShadow:`0 8px 32px ${accentColor}60` }}>
                {/* Sound wave bars */}
                <div style={{ display:'flex', alignItems:'center', gap:3, height:28 }}>
                  {[12,20,28,20,12].map((h,i) => (
                    <div key={i} style={{ width:3.5, height:h, borderRadius:2, background:'#fff', animation:`wv-bar ${.6+i*.12}s ease-in-out ${i*.08}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Name */}
            <p style={{ fontFamily:'Playfair Display,serif', fontSize:26, fontWeight:400, color:'#fff', lineHeight:1.2, marginBottom:10, letterSpacing:'-0.02em' }}>
              {eventName ?? 'Tu invitación'}
            </p>

            {/* Subtitle — adapted per event type */}
            {(() => {
              const subs: Record<string,string> = {
                WEDDING:     'Tu invitación de boda te espera',
                BIRTHDAY:    '¡Es hora de celebrar!',
                BAPTISM:     'Un momento especial te espera',
                GRADUATION:  'El esfuerzo tiene su recompensa',
                QUINCEANERA: 'Una noche mágica comienza',
                CORPORATE:   'Tu invitación está lista',
                ANNIVERSARY: 'Celebremos juntos este momento',
              }
              const sub = (eventType && subs[eventType]) ?? 'Toca para abrir con música'
              return (
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginBottom:32, lineHeight:1.65, letterSpacing:0.2 }}>
                  {sub}
                </p>
              )
            })()}

            {/* CTA button */}
            <div style={{ position:'relative', display:'inline-block' }}>
              <div style={{ position:'absolute', inset:0, borderRadius:50, background:accentColor, filter:'blur(12px)', opacity:.5 }} />
              <div style={{
                position:'relative',
                background:`linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                color:'#fff', borderRadius:50,
                padding:'14px 36px', fontSize:14, fontWeight:600,
                letterSpacing:0.4, display:'flex', alignItems:'center', gap:8,
                boxShadow:`0 4px 20px ${accentColor}40`,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z"/></svg>
                Abrir invitación
              </div>
            </div>

            {/* Bottom hint */}
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:20, letterSpacing:0.5 }}>
              Puedes silenciar en cualquier momento
            </p>
          </div>
        </div>
      )}

      {musicLabel && (
        <div style={{ position:'fixed', bottom:90, right:20, zIndex:100, background:'rgba(20,16,12,.88)', color:'#fff', fontSize:11, padding:'5px 13px', borderRadius:20, backdropFilter:'blur(10px)', pointerEvents:'none', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', opacity:playing?1:0, transition:'opacity .4s' }}>
          ♪ {musicLabel}
        </div>
      )}
      <button onClick={toggleAudio}
        title={playing?'Pausar':'Reproducir música'}
        style={{ position:'fixed', bottom:24, right:24, zIndex:100, width:52, height:52, borderRadius:'50%', border:'none', cursor:'pointer',
          background:playing?accentColor:'rgba(18,14,10,.82)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:playing?`0 0 0 5px ${accentColor}28, 0 6px 20px rgba(0,0,0,.3)`:'0 4px 16px rgba(0,0,0,.3)',
          transition:'all .3s', backdropFilter:'blur(10px)' }}>
        {playing ? bars : <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M6 3.5L14.5 9L6 14.5V3.5Z" fill="white" opacity="0.92"/></svg>}
      </button>
    </>
  )
}
