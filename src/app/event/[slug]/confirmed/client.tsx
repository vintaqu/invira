'use client'
import { useSearchParams } from 'next/navigation'

export default function ConfirmedClient({ slug }: { slug: string }) {
  const params      = useSearchParams()
  const status      = params.get('status') ?? 'CONFIRMED'
  const name        = params.get('name')   ?? ''
  const isConfirmed = status === 'CONFIRMED'

  const accent = '#84C5BC'

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#faf9f6', fontFamily:'Inter,sans-serif', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:500 }}>

        {/* Icon */}
        <div style={{ width:88, height:88, borderRadius:'50%', background: isConfirmed ? '#e8f0e4' : '#f5f0ea', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', fontSize:36 }}>
          {isConfirmed ? '✦' : '○'}
        </div>

        {/* Greeting */}
        {name && (
          <p style={{ fontFamily:"'Great Vibes',cursive", fontSize:'clamp(24px,5vw,36px)', color: accent, marginBottom:8 }}>
            {name}
          </p>
        )}

        {/* Headline */}
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(26px,5vw,44px)', fontWeight:400, color:'#1a1c18', marginBottom:16, lineHeight:1.15 }}>
          {isConfirmed ? '¡Confirmado!' : 'Respuesta registrada'}
        </h1>

        {/* Message */}
        <p style={{ fontSize:15, color:'#888', lineHeight:1.8, marginBottom:40, maxWidth:380, margin:'0 auto 40px' }}>
          {isConfirmed
            ? 'Estamos encantados de que puedas acompañarnos. Te esperamos con mucha ilusión.'
            : 'Hemos registrado tu respuesta. Si cambias de opinión puedes volver a confirmar antes de la fecha límite.'}
        </p>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, maxWidth:300, margin:'0 auto 40px' }}>
          <div style={{ flex:1, height:1, background:'#e8e2db' }} />
          <span style={{ color: accent, fontSize:16 }}>✦</span>
          <div style={{ flex:1, height:1, background:'#e8e2db' }} />
        </div>

        {/* Back button */}
        <a href={`/event/${slug}`}
          style={{ display:'inline-block', background: accent, color:'#fff', padding:'14px 36px', borderRadius:12, textDecoration:'none', fontSize:14, fontWeight:500, letterSpacing:0.5 }}>
          Ver la invitación →
        </a>

        {/* Powered by */}
        <p style={{ marginTop:48, fontSize:11, color:'#ccc', letterSpacing:1.5, textTransform:'uppercase' }}>
          Powered by Invira
        </p>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;1,400&display=swap');`}</style>
    </div>
  )
}
