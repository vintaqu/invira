import React from 'react'
import Link from 'next/link'

interface FAQ { q: string; a: string }
interface Feature { emoji: string; title: string; desc: string }
interface Testimonial { text: string; name: string; location: string; rating?: string }

interface LandingPageProps {
  // SEO / identity
  slug: string
  type: string           // e.g. 'boda', 'cumpleaños'
  heroTitle: React.ReactNode // allows <em> inside
  heroSubtitle: string
  heroBg: string         // CSS gradient or color

  // Content
  features: Feature[]
  faqs: FAQ[]
  testimonials: Testimonial[]

  // Hero image (optional)
  heroImg?: string

  // CTA label override
  ctaLabel?: string
}

const ALL_LINKS = [
  { href: '/invitaciones-boda',         label: '💍 Bodas' },
  { href: '/invitaciones-cumpleanos',   label: '🎂 Cumpleaños' },
  { href: '/invitaciones-bautizo',      label: '👶 Bautizos' },
  { href: '/invitaciones-quinceAnera',  label: '🌸 Quinceañeras' },
  { href: '/invitaciones-corporativas', label: '🏢 Corporativos' },
  { href: '/invitaciones-graduacion',   label: '🎓 Graduaciones' },
]

export function LandingPage({
  slug, type, heroTitle, heroSubtitle, heroBg,
  features, faqs, testimonials, heroImg, ctaLabel,
}: LandingPageProps) {
  const ff = "'Inter','Helvetica Neue',sans-serif"
  const serif = "'Playfair Display',serif"
  const teal = '#84C5BC'
  const dark = '#1a1a1a'

  const otherLinks = ALL_LINKS.filter(l => !l.href.includes(slug))

  return (
    <main style={{ fontFamily: ff, background: '#fff', minHeight: '100vh' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f0ebe4',
        padding: '0 clamp(20px,5vw,80px)', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <svg width="28" height="28" viewBox="0 0 110 110" fill="none">
            <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
            <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
            <circle cx="78" cy="15" r="5.5" fill="white"/>
          </svg>
          <span style={{ fontFamily: ff, fontSize: 18, color: dark, fontWeight: 600, letterSpacing: -0.3 }}>evochi</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ fontSize: 13, color: '#666', textDecoration: 'none' }}>Inicio</Link>
          <Link href="/dashboard/events/new"
            style={{ background: teal, color: '#fff', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            Crear gratis →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: heroBg,
        padding: 'clamp(70px,10vw,130px) clamp(20px,5vw,80px)',
        textAlign: 'center',
      }}>
        {heroImg && (
          <img src={heroImg} alt="" aria-hidden
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
        )}
        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" style={{ marginBottom: 28 }}>
            <ol style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
              <li><Link href="/" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textDecoration: 'none' }}>Inicio</Link></li>
              <li style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>/</li>
              <li style={{ color: teal, fontSize: 13 }}>Invitaciones de {type}</li>
            </ol>
          </nav>

          <p style={{ fontSize: 11, letterSpacing: 3.5, textTransform: 'uppercase', color: teal, marginBottom: 20, fontWeight: 500 }}>
            Invitaciones de {type} online
          </p>
          <h1 style={{
            fontFamily: serif, fontWeight: 400,
            fontSize: 'clamp(38px,6vw,70px)', color: '#fff',
            lineHeight: 1.08, marginBottom: 24,
            maxWidth: 820, margin: '0 auto 24px',
          }}>
            {heroTitle}
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.75 }}>
            {heroSubtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/dashboard/events/new?from=${slug}`}
              style={{ background: teal, color: '#fff', borderRadius: 12, padding: '16px 36px', fontSize: 15, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              {ctaLabel ?? `Crear mi invitación de ${type} — Gratis`}
            </Link>
            <Link href="#funciones"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 12, padding: '16px 28px', fontSize: 15, border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', display: 'inline-block' }}>
              Ver funciones
            </Link>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 20, letterSpacing: 0.5 }}>
            Gratuito para empezar · Sin tarjeta de crédito
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#f8f7f4', padding: '36px clamp(20px,5vw,80px)', borderBottom: '1px solid #ede8e0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 24, textAlign: 'center' }}>
          {[
            ['+2.400', 'eventos creados'],
            ['98%', 'tasa de apertura'],
            ['4.9 ★', 'valoración media'],
            ['< 10 min', 'para tenerla lista'],
          ].map(([n, l]) => (
            <div key={n}>
              <p style={{ fontFamily: serif, fontSize: 38, fontWeight: 400, color: dark, lineHeight: 1, marginBottom: 4 }}>{n}</p>
              <p style={{ fontSize: 12, color: '#888', lineHeight: 1.4 }}>{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="funciones" style={{ padding: 'clamp(64px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: teal, textAlign: 'center', marginBottom: 10, fontWeight: 500 }}>Todo incluido</p>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(28px,4vw,46px)', textAlign: 'center', color: dark, marginBottom: 12 }}>
            Una invitación completa
          </h2>
          <p style={{ fontSize: 16, color: '#888', textAlign: 'center', maxWidth: 520, margin: '0 auto 52px', lineHeight: 1.7 }}>
            Todo lo que tus invitados necesitan saber, en un solo enlace que funciona en cualquier móvil.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ background: '#fafaf8', border: '1px solid #eee', borderRadius: 16, padding: '22px 20px' }}>
                <div style={{ fontSize: 30, marginBottom: 12 }}>{f.emoji}</div>
                <h3 style={{ fontFamily: serif, fontWeight: 400, fontSize: 19, color: dark, marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && (
        <section style={{ background: '#f8f7f4', padding: 'clamp(64px,8vw,100px) clamp(20px,5vw,80px)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(26px,4vw,42px)', textAlign: 'center', color: dark, marginBottom: 44 }}>
              Lo que dicen quienes ya lo usaron
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>
              {testimonials.map(t => (
                <div key={t.name} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 16, padding: '22px 20px' }}>
                  <p style={{ fontSize: 22, color: '#f59e0b', marginBottom: 12 }}>{t.rating ?? '★★★★★'}</p>
                  <p style={{ fontSize: 14, color: '#444', lineHeight: 1.75, marginBottom: 16, fontStyle: 'italic' }}>"{t.text}"</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: dark }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: '#aaa' }}>{t.location}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      <section style={{ padding: 'clamp(64px,8vw,100px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto' }}>
          <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(26px,4vw,42px)', textAlign: 'center', color: dark, marginBottom: 48 }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {faqs.map((faq, i) => (
              <details key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <summary style={{ padding: '20px 0', fontSize: 15, fontWeight: 500, color: dark, cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <span style={{ color: teal, fontSize: 22, fontWeight: 300, flexShrink: 0, marginLeft: 16, lineHeight: 1 }}>+</span>
                </summary>
                <p style={{ fontSize: 15, color: '#666', lineHeight: 1.75, paddingBottom: 22, marginTop: 2 }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg,#0d2422 0%,#1a3b38 50%,#0d2422 100%)', padding: 'clamp(64px,8vw,100px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: serif, fontWeight: 400, fontSize: 'clamp(30px,5vw,54px)', color: '#fff', marginBottom: 18, lineHeight: 1.1 }}>
          {ctaLabel
            ? `Crea tu ${ctaLabel.toLowerCase()} ahora`
            : `Tu invitación de ${type} empieza aquí`}
        </h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Empieza gratis y publica cuando estés listo. Sin tarjeta de crédito, sin compromisos.
        </p>
        <Link href={`/dashboard/events/new?from=${slug}`}
          style={{ display: 'inline-block', background: teal, color: '#fff', borderRadius: 12, padding: '18px 48px', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
          Empezar ahora — Es gratis →
        </Link>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 18, letterSpacing: 0.5 }}>
          Sin tarjeta de crédito · Pago solo al publicar
        </p>
      </section>

      {/* ── OTROS TIPOS ── */}
      <section style={{ background: '#f8f7f4', padding: '36px clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: 14, letterSpacing: 1, textTransform: 'uppercase' }}>Más tipos de invitaciones</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {otherLinks.map(l => (
              <Link key={l.href} href={l.href}
                style={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: 20, padding: '8px 16px', fontSize: 13, color: '#444', textDecoration: 'none', transition: 'border-color .15s' }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER MINI ── */}
      <footer style={{ background: '#0f0c0a', padding: '28px clamp(20px,5vw,80px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width="22" height="22" viewBox="0 0 110 110" fill="none">
            <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
            <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
            <circle cx="78" cy="15" r="5.5" fill="white"/>
          </svg>
          <span style={{ fontFamily: ff, fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>evochi</span>
        </Link>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Privacidad','/legal/privacidad'],['Términos','/legal/terminos'],['Cookies','/legal/cookies']].map(([l,h])=>(
            <Link key={h} href={h} style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>{l}</Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>© 2025 Evochi</p>
      </footer>
    </main>
  )
}
