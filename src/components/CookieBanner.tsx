'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('evochi-cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('evochi-cookie-consent', 'accepted')
    setVisible(false)
  }

  function reject() {
    localStorage.setItem('evochi-cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: 'calc(100% - 32px)', maxWidth: 600,
      background: '#1a1c18', borderRadius: 16, padding: '20px 24px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
      display: 'flex', flexDirection: 'column', gap: 14,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, margin: 0 }}>
          Usamos cookies propias y de terceros para mejorar tu experiencia y analizar el uso de la plataforma.
          Puedes aceptar todas, rechazar las no esenciales o{' '}
          <Link href="/legal/cookies" style={{ color: '#a8b89a', textDecoration: 'underline' }}>
            saber más
          </Link>.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={accept}
          style={{ flex: 1, minWidth: 120, padding: '10px 20px', background: '#6b7c5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Aceptar todas
        </button>
        <button onClick={reject}
          style={{ flex: 1, minWidth: 120, padding: '10px 20px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
          Solo esenciales
        </button>
        <Link href="/legal/cookies"
          style={{ padding: '10px 16px', color: 'rgba(255,255,255,0.4)', fontSize: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
          Gestionar →
        </Link>
      </div>
    </div>
  )
}
