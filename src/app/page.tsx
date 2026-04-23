'use client'
import { useState, useEffect, Suspense } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const EVENT_TYPES = [
  { label: 'Boda',        img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=70&auto=format&fit=crop' },
  { label: 'Cumpleaños',  img: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=200&q=70&auto=format&fit=crop' },
  { label: 'Comunión',    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&q=70&auto=format&fit=crop' },
  { label: 'Bautizo',     img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=70&auto=format&fit=crop' },
  { label: 'Graduación',  img: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=200&q=70&auto=format&fit=crop' },
  { label: 'Corporativo', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=70&auto=format&fit=crop' },
  { label: 'Más...',      img: '' },
]

const HERO_SLIDES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600&q=80&auto=format&fit=crop',
]

const MOSAIC = [
  {
    img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=85&auto=format&fit=crop',
    label: 'Bodas', sub: 'El día más especial',
    href: '/invitaciones-boda', color: 'rgba(45,58,46,0.55)',
  },
  {
    img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=85&auto=format&fit=crop',
    label: 'Cumpleaños', sub: 'Celebra a lo grande',
    href: '/invitaciones-cumpleanos', color: 'rgba(80,30,80,0.55)',
  },
  {
    img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85&auto=format&fit=crop',
    label: 'Bautizos', sub: 'Momentos llenos de ternura',
    href: '/invitaciones-bautizo', color: 'rgba(20,50,80,0.55)',
  },
  {
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=85&auto=format&fit=crop',
    label: 'Quinceañeras', sub: 'Una noche única',
    href: '/invitaciones-quinceAnera', color: 'rgba(80,20,60,0.55)',
  },
  {
    img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=85&auto=format&fit=crop',
    label: 'Graduaciones', sub: 'El esfuerzo tiene recompensa',
    href: '/invitaciones-graduacion', color: 'rgba(30,30,60,0.55)',
  },
  {
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=85&auto=format&fit=crop',
    label: 'Eventos empresa', sub: 'Profesional y memorable',
    href: '/invitaciones-corporativas', color: 'rgba(10,10,30,0.65)',
  },
]

const FEATURES = [
  { icon: '📊', title: 'Panel en tiempo real',    desc: 'Ve quién abrió su invitación, quién confirmó y desde qué canal. Todo al instante.', wide: true },
  { icon: '🤖', title: 'Textos con IA',           desc: 'Elige el tono y la IA escribe el texto perfecto en segundos. Romántico, elegante o divertido.' },
  { icon: '📱', title: 'Comparte por WhatsApp',   desc: 'Un enlace único por invitado. Sin apps. Funciona en cualquier móvil.' },
  { icon: '🎵', title: 'Playlist colaborativa',   desc: 'Tus invitados sugieren canciones y votan sus favoritas para la fiesta.' },
  { icon: '🎟', title: 'QR Check-in',             desc: 'Controla la entrada el día del evento con QR único. Sin colas, sin papel.' },
  { icon: '🎁', title: 'Lista de regalos',        desc: 'Integrada en la invitación. Los invitados eligen y evitáis duplicados.' },
  { icon: '🗺', title: 'Mapa interactivo',        desc: 'Ubicación, hoteles cercanos y servicio de bus incluidos.' },
]

// Plans are loaded dynamically from /api/pricing in the component

const TESTIMONIALS = [
  { text: '"Nuestros invitados no podían creer lo bonita que era la invitación. En un día teníamos el 80% de confirmaciones."', name: 'Laura y Marcos', event: 'Boda · Barcelona · Abril 2025', initials: 'LM', bg: '#f5ede6', color: '#a05030' },
  { text: '"La IA generó el texto en 10 segundos y era exactamente lo que queríamos. Increíble herramienta."', name: 'Sofía y Javier', event: 'Boda · Sevilla · Marzo 2025', initials: 'SJ', bg: '#e8f5e8', color: '#2d6030' },
  { text: '"Lo usé para el cumpleaños de mi hija y todos los padres fliparon. Súper fácil y muy bonito."', name: 'Carmen R.', event: 'Cumpleaños · Madrid · Enero 2025', initials: 'CR', bg: '#e8e8f5', color: '#303080' },
]

function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setCurrent((c) => (c + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(id)
  }, [])
  return (
    <>
      {HERO_SLIDES.map((src, i) => (
        <div key={i} style={{ position:'absolute', inset:0, opacity: i === current ? 1 : 0, transition:'opacity 1.2s ease' }}>
          <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
      ))}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(105deg, rgba(8,6,4,0.82) 0%, rgba(8,6,4,0.55) 50%, rgba(8,6,4,0.15) 100%)' }} />
      <div style={{ position:'absolute', bottom:32, left:80, zIndex:10, display:'flex', gap:8 }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} style={{ height:6, borderRadius:3, border:'none', cursor:'pointer', transition:'all 0.3s', background: i===current ? '#84C5BC' : 'rgba(255,255,255,0.3)', width: i===current ? 24 : 6 }} />
        ))}
      </div>
    </>
  )
}

function AuthModal({ mode, onClose, callbackUrl }: { mode: 'login' | 'register'; onClose: () => void; callbackUrl?: string }) {
  const [tab, setTab] = useState<'login' | 'register'>(mode)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn('credentials', { email, password, callbackUrl: callbackUrl ?? '/dashboard' })
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        })
        if (res.ok) await signIn('credentials', { email, password, callbackUrl: callbackUrl ?? '/dashboard' })
      }
    } finally {
      setLoading(false)
    }
  }

  const inp = { border:'1px solid #ebebeb', borderRadius:12, padding:'14px 16px', fontSize:14, color:'#1a1a1a', background:'#fafafa', outline:'none', width:'100%', fontFamily:'Inter,sans-serif' } as React.CSSProperties

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      className="auth-modal-overlay"
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:999, display:'flex', alignItems:'flex-end', justifyContent:'center', padding:0 }}>
      <div className="auth-modal-box"
        style={{ background:'#fff', borderRadius:'20px 20px 0 0', width:'100%', maxWidth:480, overflow:'hidden', boxShadow:'0 -8px 40px rgba(0,0,0,0.2)', maxHeight:'92svh', overflowY:'auto' }}>
        <div style={{ background:'linear-gradient(135deg,#2d1a10,#1a0e08)', padding:'24px 28px', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, border:'1px solid rgba(132,197,188,0.15)', borderRadius:'50%', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:8, margin:'0 0 4px' }}>
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <path d="M20 36C20 36 6 26 6 16C6 10.477 10.477 6 16 6C18.132 6 20.1 6.698 21.7 7.9C19.5 9.5 18 12.08 18 15C18 19.418 21.582 23 26 23C27.2 23 28.33 22.72 29.34 22.22C27.08 30.12 20 36 20 36Z" fill="rgba(132,197,188,0.9)"/>
              <circle cx="27" cy="14" r="5.5" fill="rgba(132,197,188,0.9)"/>
              <circle cx="27" cy="14" r="2.5" fill="white"/>
            </svg>
            <span style={{ fontFamily:"system-ui, sans-serif", fontSize:22, color:'#fff', fontWeight:600, letterSpacing:-0.3 }}>invira</span>
          </div>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', margin:0, fontWeight:300 }}>{tab==='register' ? 'Crea tu cuenta gratis' : 'Bienvenido de nuevo'}</p>
          <button onClick={onClose} style={{ position:'absolute', top:14, right:18, background:'none', border:'none', fontSize:24, cursor:'pointer', color:'rgba(255,255,255,0.3)', lineHeight:1 }}>×</button>
        </div>
        <div style={{ padding:'20px 24px 32px' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #f0f0f0', marginBottom:24 }}>
            {(['register','login'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex:1, padding:'10px', fontSize:13, fontWeight:500, cursor:'pointer', textAlign:'center', color: tab===t ? '#1a1a1a' : '#aaa', border:'none', background:'none', borderBottom: tab===t ? '2px solid #1a1a1a' : '2px solid transparent', marginBottom:-1, transition:'all .15s', fontFamily:'Inter,sans-serif' }}>
                {t==='register' ? 'Crear cuenta' : 'Iniciar sesión'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {tab==='register' && (
              <div>
                <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:7, fontFamily:'Inter,sans-serif' }}>Nombre completo</label>
                <input value={name} onChange={e=>setName(e.target.value)} style={inp} placeholder="Ana García" />
              </div>
            )}
            <div>
              <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:7, fontFamily:'Inter,sans-serif' }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="ana@ejemplo.com" />
            </div>
            <div>
              <label style={{ fontSize:11, letterSpacing:1.5, textTransform:'uppercase', color:'#aaa', display:'block', marginBottom:7, fontFamily:'Inter,sans-serif' }}>Contraseña</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={inp} placeholder={tab==='register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'} />
            </div>
            {tab==='login' && <p style={{ fontSize:12, color:'#84C5BC', textAlign:'right', cursor:'pointer', margin:0 }}>¿Olvidaste tu contraseña?</p>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ padding:'14px', background:'#1a1a1a', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Cargando...' : tab==='register' ? 'Crear cuenta gratis' : 'Iniciar sesión'}
            </button>
            <div style={{ textAlign:'center', position:'relative', margin:'4px 0' }}>
              <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'#f0f0f0' }} />
              <span style={{ position:'relative', background:'#fff', padding:'0 12px', fontSize:12, color:'#bbb', fontFamily:'Inter,sans-serif' }}>o continúa con</span>
            </div>
            <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              style={{ padding:'12px', border:'1px solid #ebebeb', borderRadius:12, background:'#fff', fontSize:13, color:'#444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'Inter,sans-serif' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HomePageInner() {
  const [modal, setModal] = useState<'login' | 'register' | null>(null)
  const [activeType, setActiveType] = useState(0)
  const { data: session, status } = useSession()
  const [plans, setPlans] = useState<any[]>([])
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/dashboard'

  useEffect(() => {
    fetch('/api/pricing')
      .then(r => r.json())
      .then(d => { if (d.plans) setPlans(d.plans) })
      .catch(() => {})
  }, [])
  const router = useRouter()
  const [fromInvite, setFromInvite] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('utm_source') === 'invitation') {
        setFromInvite(true)
      }
    }
  }, [])

  const s = { fontFamily:"'Inter',sans-serif", fontWeight:300 } as React.CSSProperties
  const gold = '#84C5BC'
  const dark = '#333333'

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      "@context":"https://schema.org",
      "@type":"WebSite",
      "name":"Invira",
      "url":"https://invira.app",
      "description":"Invitaciones digitales para bodas, cumpleaños y eventos",
      "potentialAction":{"@type":"SearchAction","target":"https://invira.app/event/{slug}","query-input":"required name=slug"}
    }) }} />
    <div style={{ minHeight:'100vh', overflowX:'hidden', width:'100%', background:'#fff', ...s }}>
      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:68, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,0,0,0.07)', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 24px rgba(0,0,0,0.05)' }}>
        {/* LOGO */}
        <a href="/" style={{ display:'flex', alignItems:'center', gap:10, textDecoration:'none', flexShrink:0 }}>
          <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 36C20 36 6 26 6 16C6 10.477 10.477 6 16 6C18.132 6 20.1 6.698 21.7 7.9C19.5 9.5 18 12.08 18 15C18 19.418 21.582 23 26 23C27.2 23 28.33 22.72 29.34 22.22C27.08 30.12 20 36 20 36Z" fill="#84C5BC"/>
            <circle cx="27" cy="14" r="5.5" fill="#84C5BC"/>
            <circle cx="27" cy="14" r="2.5" fill="white"/>
            <circle cx="20.5" cy="7.5" r="2.5" fill="#84C5BC" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily:"'DM Sans', system-ui, sans-serif", fontSize:22, color:'#333333', letterSpacing:-0.3, fontWeight:600 }}>invira</span>
        </a>

        {/* NAV LINKS with anchors */}
        <div className="hp-nav-links" style={{ display:'flex', gap:6, position:'absolute', left:'50%', transform:'translateX(-50%)' }}>
          {[
            ['Tu celebración','#celebracion'],
            ['Funciones','#funciones'],
            ['Precios','#precios'],
            ['Cómo funciona','#como-funciona'],
          ].map(([l,href])=>(
            <a key={l} href={href}
              style={{ fontSize:13, color:'#555', textDecoration:'none', padding:'7px 14px', borderRadius:8, transition:'all .15s', fontWeight:400 }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.background='#f5f0ea'; (e.currentTarget as HTMLAnchorElement).style.color='#1a1a1a' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.background='transparent'; (e.currentTarget as HTMLAnchorElement).style.color='#555' }}>
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          {session ? (
            <button onClick={()=>router.push('/dashboard')}
              style={{ fontSize:13, color:'#fff', background:'linear-gradient(135deg,#6aada4,#84C5BC)', border:'none', padding:'10px 22px', borderRadius:10, cursor:'pointer', fontWeight:600, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', boxShadow:'0 2px 12px rgba(106,173,164,0.35)' }}>
              Mi panel →
            </button>
          ) : (
            <>
              <button onClick={()=>setModal('login')}
                style={{ fontSize:13, color:'#666', background:'none', border:'1px solid #e0e0e0', padding:'9px 18px', borderRadius:9, cursor:'pointer', fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', transition:'all .15s' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor='#6aada4'; (e.currentTarget as HTMLButtonElement).style.color='#6aada4' }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.borderColor='#e0e0e0'; (e.currentTarget as HTMLButtonElement).style.color='#666' }}>
                Entrar
              </button>
              <button onClick={()=>setModal('register')}
                style={{ fontSize:13, color:'#fff', background:'linear-gradient(135deg,#6aada4,#84C5BC)', border:'none', padding:'10px 22px', borderRadius:10, cursor:'pointer', fontWeight:600, fontFamily:'Inter,sans-serif', whiteSpace:'nowrap', boxShadow:'0 2px 12px rgba(106,173,164,0.35)', transition:'all .15s' }}
                onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.boxShadow='0 4px 20px rgba(106,173,164,0.5)'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)' }}
                onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.boxShadow='0 2px 12px rgba(106,173,164,0.35)'; (e.currentTarget as HTMLButtonElement).style.transform='none' }}>
                Empezar gratis ✦
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Referral banner - shows when coming from an invitation footer */}
      {fromInvite && (
        <div style={{ background:'linear-gradient(90deg,#eaf4f3,#d4eeeb)', borderBottom:'1px solid #b8e0dc', padding:'10px 48px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <p style={{ fontSize:13, color:'#2d6b65', margin:0 }}>
            ✦ Acabas de ver una invitación hecha con Invira. {session ? '¡Bienvenido de nuevo!' : '¡Crea la tuya en minutos, gratis!'}
          </p>
          <button onClick={()=> session ? router.push('/dashboard') : setModal('register')}
            style={{ fontSize:13, background:'#84C5BC', color:'#fff', border:'none', padding:'7px 18px', borderRadius:8, cursor:'pointer', fontFamily:'Inter,sans-serif', fontWeight:500, flexShrink:0 }}>
            {session ? 'Ir al panel →' : 'Empezar gratis →'}
          </button>
        </div>
      )}
      {/* HERO */}
      <section style={{ position:'relative', minHeight:'100svh', display:'flex', alignItems:'center', overflow:'hidden', width:'100%' }}>
        <div style={{ position:'absolute', inset:0 }}><HeroSlideshow /></div>
        <div style={{ position:'relative', zIndex:2, padding:'68px 64px', maxWidth:800, width:'100%' }} className="hp-hero">
          {/* Badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(132,197,188,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(132,197,188,0.4)', borderRadius:30, padding:'8px 18px', fontSize:12, color:'rgba(255,255,255,0.92)', letterSpacing:0.8, marginBottom:32, textTransform:'uppercase', fontWeight:500 }}>
            <span style={{ width:7, height:7, background:'#84C5BC', borderRadius:'50%', display:'inline-block', boxShadow:'0 0 8px #84C5BC' }} />
            Más de 2.400 celebraciones creadas
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(48px,6.5vw,88px)', fontWeight:400, color:'#fff', lineHeight:1.02, letterSpacing:-2, margin:'0 0 28px', textShadow:'0 2px 40px rgba(0,0,0,0.3)' }}>
            Invitaciones digitales<br />
            para momentos{' '}
            <em style={{ fontStyle:'italic', color:'#84C5BC', textShadow:'0 0 40px rgba(132,197,188,0.4)' }}>únicos</em>
          </h1>

          {/* Sub */}
          <p style={{ fontSize:18, color:'rgba(255,255,255,0.75)', lineHeight:1.7, maxWidth:520, margin:'0 0 48px', fontWeight:300 }}>
            Crea en minutos una invitación preciosa para tu boda, cumpleaños, comunión o cualquier celebración especial.
          </p>

          {/* CTAs */}
          <div className="hp-hero-btns" style={{ display:'flex', gap:16, marginBottom:56, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={()=> session ? router.push('/dashboard') : setModal('register')}
              style={{ fontSize:16, color:'#1a1a1a', background:'#84C5BC', border:'none', padding:'18px 40px', borderRadius:14, cursor:'pointer', fontWeight:700, fontFamily:'Inter,sans-serif', boxShadow:'0 4px 24px rgba(132,197,188,0.5)', letterSpacing:0.3, transition:'all .2s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 8px 32px rgba(132,197,188,0.6)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.transform='none'; (e.currentTarget as HTMLButtonElement).style.boxShadow='0 4px 24px rgba(132,197,188,0.5)' }}>
              {session ? 'Ir a mi panel →' : '✦ Crear mi invitación gratis'}
            </button>
            <a href="/event/sofia-y-miguel-2025" target="_blank"
              style={{ fontSize:15, color:'rgba(255,255,255,0.9)', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.35)', padding:'17px 32px', borderRadius:14, cursor:'pointer', fontFamily:'Inter,sans-serif', backdropFilter:'blur(8px)', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:8, transition:'all .2s' }}
              onMouseEnter={e=>{ (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.18)'; (e.currentTarget as HTMLAnchorElement).style.borderColor='rgba(255,255,255,0.5)' }}
              onMouseLeave={e=>{ (e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,0.1)'; (e.currentTarget as HTMLAnchorElement).style.borderColor='rgba(255,255,255,0.35)' }}>
              Ver ejemplo real →
            </a>
          </div>

          {/* Stats — price loaded dynamically from API */}
          <div className="hp-stats" style={{ display:'flex', gap:48, flexWrap:'wrap' }}>
            {[
              ['2.400+','Eventos creados'],
              ['98%','Clientes satisfechos'],
              [plans.length > 0
                ? (() => {
                    const paidPlans = plans.filter((p:any) => p.price > 0)
                    const prices = paidPlans.map((p:any) => {
                      const disc = p.discount as { pct:number; until:string|null } | null
                      const active = disc?.pct && disc.pct > 0 && (disc.until ? new Date(disc.until) >= new Date() : true)
                      return active ? Math.round(p.price * (1 - disc!.pct / 100)) : p.price
                    })
                    return `€${Math.min(...prices)}`
                  })()
                : '—',
               'Desde este precio'],
            ].map(([n,l])=>(
              <div key={l as string} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <span style={{ fontFamily:'Playfair Display,serif', fontSize:36, color:'#fff', lineHeight:1, fontWeight:400 }}>{n}</span>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.45)', letterSpacing:1, textTransform:'uppercase' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENT TYPE */}
      <div id="celebracion" style={{ background:'#fff', padding:'48px 24px 56px' }}>
        <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:'#aaa', textAlign:'center', marginBottom:28 }}>¿Qué vas a celebrar?</p>
        <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10, maxWidth:1100, margin:'0 auto' }}>
          {EVENT_TYPES.map((t,i)=>(
            <div key={t.label} onClick={()=>setActiveType(i)}
              style={{ background: activeType===i ? '#fff7f0' : '#fafafa', border: activeType===i ? '1px solid #84C5BC' : '1px solid #f0f0f0', borderRadius:16, padding:'18px 10px', textAlign:'center', cursor:'pointer', transition:'all .2s', transform: activeType===i ? 'translateY(-3px)' : 'none', minWidth:90, flex:'0 0 auto' }}>
              <div style={{ width:56, height:56, margin:'0 auto 12px', borderRadius:14, overflow:'hidden', background:'#f5ede6' }}>
                {t.img ? (
                  <img src={t.img} alt={t.label}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => {
                      const el = e.currentTarget as HTMLImageElement
                      el.style.display = 'none'
                      const emojis: Record<string,string> = { 'Boda':'💍','Cumpleaños':'🎂','Comunión':'✟','Bautizo':'👶','Graduación':'🎓','Corporativo':'🏢','Más...':'✨' }
                      const p = el.parentElement!
                      p.style.display = 'flex'; p.style.alignItems = 'center'; p.style.justifyContent = 'center'
                      p.innerHTML = `<span style="font-size:32px">${emojis[t.label] ?? '✨'}</span>`
                    }}
                  />
                ) : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>✨</div>}
              </div>
              <p style={{ fontSize:12, fontWeight:500, color:'#333', letterSpacing:0.3, margin:0 }}>{t.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* MOSAIC */}
      <section style={{ padding:'clamp(48px,6vw,80px) clamp(20px,5vw,80px)', background:'#fff' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:'#84C5BC', marginBottom:12 }}>Para cada celebración</p>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
            <h2 style={{ fontFamily:'Playfair Display,serif', fontWeight:400, fontSize:'clamp(28px,3.5vw,44px)', color:'#1a1a1a', lineHeight:1.1, margin:0 }}>
              Sea cual sea tu evento,<br />tenemos la invitación perfecta
            </h2>
            <a href="/dashboard/events/new" style={{ fontSize:13, color:'#84C5BC', textDecoration:'none', fontWeight:500, whiteSpace:'nowrap', flexShrink:0 }}>
              Ver todos →
            </a>
          </div>
          <div className="hp-mosaic" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'repeat(2,220px)', gap:12 }}>
            {MOSAIC.map((m, i)=>(
              <a key={m.label} href={m.href}
                style={{ position:'relative', overflow:'hidden', borderRadius:16, display:'block', textDecoration:'none',
                  gridColumn: i===0 ? 'span 2' : 'span 1',
                  gridRow: i===0 ? 'span 1' : 'span 1',
                }}
                onMouseEnter={e=>{
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if(img) img.style.transform='scale(1.06)'
                }}
                onMouseLeave={e=>{
                  const img = e.currentTarget.querySelector('img') as HTMLImageElement
                  if(img) img.style.transform='scale(1)'
                }}>
                <img src={m.img} alt={`Invitaciones de ${m.label}`}
                  style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .5s ease' }} />
                {/* Gradient overlay */}
                <div style={{ position:'absolute', inset:0, background:`linear-gradient(160deg, transparent 30%, ${m.color} 100%)` }} />
                {/* Content */}
                <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 20px' }}>
                  <p style={{ fontSize:i===0?18:14, fontWeight:600, color:'#fff', margin:'0 0 3px', letterSpacing:0.2 }}>{m.label}</p>
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.7)', margin:0 }}>{m.sub}</p>
                </div>
                {/* Arrow hover */}
                <div style={{ position:'absolute', top:16, right:16, width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, color:'rgba(255,255,255,0.8)' }}>→</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="como-funciona" style={{ background:'#faf7f4', padding:'64px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:gold, marginBottom:14 }}>Así de fácil</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(32px,4vw,52px)', fontWeight:400, color:dark, lineHeight:1.15, marginBottom:56, letterSpacing:-0.5 }}>
            Tu invitación lista<br />en menos de 10 minutos
          </h2>
          <div className="hp-steps" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', border:'1px solid #eee', borderRadius:20, overflow:'hidden' }}>
            {[
              {n:'01',icon:'🎯',title:'Elige tu evento',desc:'Selecciona boda, cumpleaños, comunión, bautizo u otra celebración especial.'},
              {n:'02',icon:'🎨',title:'Diseña con IA',desc:'Sube tus fotos y la IA genera el texto perfecto según el tono que quieres.'},
              {n:'03',icon:'👥',title:'Añade invitados',desc:'Importa tu lista. Cada invitado recibe su enlace personalizado único.'},
              {n:'04',icon:'🎉',title:'Comparte y gestiona',desc:'Publica y comparte por WhatsApp. Gestiona confirmaciones en tiempo real.'},
            ].map((step,i)=>(
              <div key={step.n} style={{ background:'#fff', padding:'36px 28px', borderRight: i<3 ? '1px solid #f0f0f0' : 'none', position:'relative' }}>
                <div style={{ fontFamily:'Playfair Display,serif', fontSize:52, color:'#f0e6dc', lineHeight:1, marginBottom:16 }}>{step.n}</div>
                <div style={{ width:44, height:44, background:'#fff7f0', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:16 }}>{step.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, color:dark, marginBottom:8 }}>{step.title}</div>
                <div style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>{step.desc}</div>
                {i<3 && <div style={{ position:'absolute', right:-12, top:'50%', transform:'translateY(-50%)', width:24, height:24, background:'#84C5BC', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', zIndex:2 }}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="funciones" style={{ background:'#fff', padding:'64px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:gold, marginBottom:14 }}>Funcionalidades</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(32px,4vw,52px)', fontWeight:400, color:dark, lineHeight:1.15, marginBottom:56, letterSpacing:-0.5 }}>
            Todo lo que necesitas<br />en un solo lugar
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {FEATURES.map(f=>(
              <div key={f.title} style={{ background:'#fafafa', border:'1px solid #f0f0f0', borderRadius:20, padding:32, gridColumn: f.wide ? 'span 1' : 'span 1', transition:'all .2s', cursor:'default' }}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background='#fff';(e.currentTarget as HTMLDivElement).style.borderColor='#e0d0c5'}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background='#fafafa';(e.currentTarget as HTMLDivElement).style.borderColor='#f0f0f0'}}>
                <div style={{ width:44, height:44, background:'#fff7f0', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, marginBottom:18 }}>{f.icon}</div>
                <div style={{ fontSize:15, fontWeight:500, color:dark, marginBottom:8 }}>{f.title}</div>
                <div style={{ fontSize:13, color:'#888', lineHeight:1.7 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ background:'#faf7f4', padding:'64px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:gold, marginBottom:14 }}>Testimonios</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(28px,3.5vw,44px)', fontWeight:400, color:dark, lineHeight:1.15, marginBottom:52, letterSpacing:-0.5 }}>
            Lo que dicen quienes ya<br />celebraron con nosotros
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {TESTIMONIALS.map(t=>(
              <div key={t.name} style={{ background:'#fff', borderRadius:20, padding:28, border:'1px solid #f0f0f0' }}>
                <div style={{ color:'#84C5BC', fontSize:14, letterSpacing:2, marginBottom:16 }}>★★★★★</div>
                <p style={{ fontFamily:'Playfair Display,serif', fontSize:17, fontStyle:'italic', color:'#2a2a2a', lineHeight:1.7, marginBottom:20 }}>{t.text}</p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, flexShrink:0, background:t.bg, color:t.color }}>{t.initials}</div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:dark, margin:0 }}>{t.name}</p>
                    <p style={{ fontSize:11, color:'#999', margin:0 }}>{t.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="precios" style={{ background:'#fff', padding:'64px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:gold, marginBottom:14 }}>Precios</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(32px,4vw,52px)', fontWeight:400, color:dark, lineHeight:1.15, marginBottom:16, letterSpacing:-0.5 }}>
            Sin suscripciones.<br />Pago único por evento.
          </h2>
          <p style={{ fontSize:15, color:'#666', lineHeight:1.8, marginBottom:52, maxWidth:480 }}>
            Diseña y previsualiza gratis. Solo pagas cuando quieras publicar y compartir tu invitación.
          </p>
          <div className="hp-pricing" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:20, maxWidth:860 }}>
            {(plans.length ? plans : [
              { slug:'free',     name:'Preview',  price:0,  badge:null, features:['Editor completo','IA texto','Preview sin publicar'], notFeatures:['Link público','RSVP'], discount:null },
              { slug:'esencial', name:'Esencial', price:29, badge:'Más popular', features:['1 evento publicado','RSVP ilimitado','300 invitados','QR Check-in','Analytics básicos'], notFeatures:[], discount:null },
              { slug:'premium',  name:'Premium',  price:59, badge:null, features:['Hasta 3 eventos','Invitados ilimitados','Analytics avanzados','Dominio propio','Recordatorios automáticos'], notFeatures:[], discount:null },
            ]).map(plan=>{
              const featured = plan.slug === 'esencial'
              const disc = plan.discount as { pct:number; label:string; until:string|null } | null
              const discActive = disc?.pct && disc.pct > 0 && (disc.until ? new Date(disc.until) >= new Date() : true)
              const displayPrice = discActive ? (plan.price * (1 - disc!.pct/100)).toFixed(0) : plan.price
              const features: string[] = Array.isArray(plan.features) ? plan.features : []
              const notFeatures: string[] = Array.isArray(plan.notFeatures) ? plan.notFeatures : []
              return (
              <div key={plan.slug} style={{ borderRadius:20, padding:32, background: featured ? '#fff' : '#fafafa', border: featured ? `2px solid ${dark}` : '1px solid #f0f0f0', position:'relative' }}>
                {(plan.badge || featured) && (
                  <div style={{ background:dark, color:'#84C5BC', fontSize:10, letterSpacing:2, textTransform:'uppercase', padding:'4px 14px', borderRadius:20, width:'fit-content', marginBottom:12 }}>
                    {plan.badge ?? 'Más popular'}
                  </div>
                )}
                <p style={{ fontSize:12, letterSpacing:2, textTransform:'uppercase', color:'#999', marginBottom:12 }}>{plan.name}</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:4 }}>
                  {discActive && <span style={{ fontFamily:'Playfair Display,serif', fontSize:22, color:'#ccc', textDecoration:'line-through' }}>{plan.price}€</span>}
                  <div style={{ fontFamily:'Playfair Display,serif', fontSize:54, color:dark, lineHeight:1 }}>
                    {displayPrice}<span style={{ fontSize:24, color:'#aaa' }}>€</span>
                  </div>
                </div>
                {discActive && (
                  <div style={{ display:'inline-block', background:'#fef3c7', color:'#92400e', fontSize:11, padding:'3px 10px', borderRadius:20, marginBottom:8, fontWeight:500 }}>
                    ⚡ {disc!.label || `${disc!.pct}% descuento`}{disc!.until ? ` · hasta ${disc!.until}` : ''}
                  </div>
                )}
                <p style={{ fontSize:12, color:'#aaa', marginBottom:8 }}>
                  {plan.slug === 'free' ? 'siempre gratis' : 'pago único · por evento'}
                </p>
                <div style={{ height:1, background:'#f0f0f0', margin:'20px 0' }} />
                <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:28 }}>
                  {features.map((f:string)=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#444' }}>
                      <div style={{ width:20, height:20, background:'#e8f5f3', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#84C5BC', fontSize:9, flexShrink:0 }}>✓</div>
                      {f}
                    </div>
                  ))}
                  {notFeatures.map((f:string)=>(
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:10, fontSize:13, color:'#bbb' }}>
                      <div style={{ width:20, height:20, background:'#f8f8f8', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:9, flexShrink:0 }}>×</div>
                      {f}
                    </div>
                  ))}
                </div>
                <button onClick={()=> session ? router.push('/dashboard') : setModal('register')}
                  style={{ width:'100%', padding:14, borderRadius:12, fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'Inter,sans-serif', background: featured ? dark : 'transparent', color: featured ? '#fff' : dark, border: featured ? 'none' : '1px solid #e0e0e0' }}>
                  {session ? 'Ir al panel →' : plan.slug==='free' ? 'Empezar gratis' : plan.slug==='premium' ? 'Elegir Premium →' : 'Publicar mi evento →'}
                </button>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ position:'relative', minHeight:420, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', background:'linear-gradient(135deg,#0d2422 0%,#1a3b38 50%,#0d2422 100%)' }}>
        <div style={{ padding:'64px 24px', maxWidth:700, position:'relative', zIndex:2, width:'100%' }}>
          <p style={{ fontSize:11, letterSpacing:3, textTransform:'uppercase', color:'#84C5BC', marginBottom:20 }}>Empieza hoy · Es gratis</p>
          <h2 style={{ fontFamily:'Playfair Display,serif', fontSize:'clamp(36px,5vw,60px)', fontWeight:400, color:'#fff', lineHeight:1.1, marginBottom:18, letterSpacing:-0.5 }}>
            Tu celebración merece<br />una invitación <em style={{ fontStyle:'italic', color:'#84C5BC' }}>perfecta</em>
          </h2>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.4)', marginBottom:40, lineHeight:1.7 }}>
            Únete a más de 2.400 personas que ya confiaron en Invira.
          </p>
          <button onClick={()=> session ? router.push('/dashboard') : setModal('register')} style={{ fontSize:15, color:dark, background:'#84C5BC', border:'none', padding:'17px 44px', borderRadius:12, cursor:'pointer', fontWeight:500, fontFamily:'Inter,sans-serif' }}>
            Crear mi invitación gratis
          </button>
        </div>
      </section>

      {/* ── INTERNAL LINKS — SEO PageRank flow ── */}
      <section style={{ background:'#f5f4f1', padding:'48px clamp(24px,5vw,80px)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <p style={{ fontSize:11, letterSpacing:2, textTransform:'uppercase', color:'#aaa', marginBottom:20 }}>Tipos de invitaciones</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:12 }}>
            {[
              { href:'/invitaciones-boda',        emoji:'💍', label:'Invitaciones de boda',        desc:'Diseño romántico, RSVP y QR' },
              { href:'/invitaciones-cumpleanos',   emoji:'🎂', label:'Invitaciones de cumpleaños',  desc:'Para todas las edades' },
              { href:'/invitaciones-bautizo',      emoji:'👶', label:'Invitaciones de bautizo',     desc:'Delicadas y personalizadas' },
              { href:'/invitaciones-quinceañera',  emoji:'🌸', label:'Invitaciones de quinceañera', desc:'Especiales para los 15 años' },
              { href:'/invitaciones-corporativas', emoji:'🏢', label:'Invitaciones corporativas',   desc:'Profesionales y con analytics' },
              { href:'/invitaciones-graduacion',   emoji:'🎓', label:'Invitaciones de graduación',  desc:'Celebra tu logro' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{ background:'#fff', border:'1px solid #e8e2db', borderRadius:14, padding:'16px 18px', textDecoration:'none', display:'flex', alignItems:'center', gap:12, transition:'box-shadow .15s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.boxShadow='none'}>
                <span style={{ fontSize:24, flexShrink:0 }}>{item.emoji}</span>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', margin:'0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize:12, color:'#aaa', margin:0 }}>{item.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background:'#0f0c0a', padding:'56px clamp(24px,5vw,80px)' }}>
        <div className="hp-footer-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:32, maxWidth:1100, marginBottom:40 }}>
          <div>
            <p style={{ fontFamily:'Playfair Display,serif', fontStyle:'italic', fontSize:24, color:'#fff', margin:'0 0 12px' }}>Invira</p>
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.3)', lineHeight:1.7, maxWidth:280 }}>
              La plataforma de invitaciones digitales más completa para bodas, cumpleaños y todo tipo de celebraciones.
            </p>
          </div>
          {([
              ['Producto', [
                ['Funciones',      '/#funciones'],
                ['Tipos de evento','/#como-funciona'],
                ['Precios',        '/#precios'],
                ['Plantillas',     '/dashboard/events/new'],
              ]],
              ['Invitaciones', [
                ['Para bodas',        '/invitaciones-boda'],
                ['Para cumpleaños',   '/invitaciones-cumpleanos'],
                ['Para bautizos',     '/invitaciones-bautizo'],
                ['Para quinceañeras', '/invitaciones-quinceAnera'],
                ['Para graduaciones', '/invitaciones-graduacion'],
                ['Para empresas',     '/invitaciones-corporativas'],
              ]],
              ['Legal', [
                ['Privacidad', '/legal/privacidad'],
                ['Términos',   '/legal/terminos'],
                ['Cookies',    '/legal/cookies'],
                ['RGPD',       '/legal/rgpd'],
              ]],
            ] as [string, [string,string][]][]).map(([title, links]) => (
            <div key={title}>
              <p style={{ fontSize:10, letterSpacing:2.5, textTransform:'uppercase', color:'rgba(255,255,255,0.25)', marginBottom:16 }}>{title}</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {links.map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', textDecoration:'none' }}>{label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24, display:'flex', justifyContent:'space-between', maxWidth:1100 }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.18)' }}>© 2025 Invira. Todos los derechos reservados.</p>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.18)' }}>Hecho con cariño en España</p>
        </div>
      </footer>

      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} callbackUrl={callbackUrl} />}
    </div>
  </>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#fff'}} />}>
      <HomePageInner />
    </Suspense>
  )
}
