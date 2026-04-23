'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PaymentSuccessPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(t); router.replace(`/dashboard/events/${id}`); return 0 }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [id, router])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#faf8f4', fontFamily:'Inter,sans-serif' }}>
      <div style={{ textAlign:'center', maxWidth:480, padding:40 }}>
        <div style={{ width:80, height:80, background:'#e6f5ec', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 28px', fontSize:36 }}>
          ✓
        </div>
        <h1 style={{ fontFamily:'Playfair Display,serif', fontSize:40, fontWeight:400, color:'#1a1a1a', marginBottom:12 }}>
          ¡Evento publicado!
        </h1>
        <p style={{ fontSize:15, color:'#888', lineHeight:1.7, marginBottom:32 }}>
          Tu invitación ya está activa y lista para compartir con tus invitados.
        </p>
        <div style={{ background:'#fff', border:'1px solid #e8e0d2', borderRadius:16, padding:20, marginBottom:28 }}>
          <p style={{ fontSize:13, color:'#888', marginBottom:4 }}>Tu enlace de invitación</p>
          <p style={{ fontSize:14, color:'#84C5BC', fontWeight:500 }}>
            {typeof window !== 'undefined' ? window.location.origin : ''}/event/…
          </p>
        </div>
        <p style={{ fontSize:13, color:'#bbb' }}>
          Redirigiendo al panel en <strong style={{ color:'#84C5BC' }}>{countdown}s</strong>…
        </p>
        <button onClick={() => router.replace(`/dashboard/events/${id}`)}
          style={{ marginTop:16, background:'#1a1a1a', color:'#fff', border:'none', padding:'12px 28px', borderRadius:10, fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Ir al panel ahora →
        </button>
      </div>
    </div>
  )
}
