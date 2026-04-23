'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('[App Error]', error)
  }, [error])

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#faf8f4', fontFamily:'Inter,sans-serif', padding:'0 24px' }}>
      <p style={{ fontFamily:'Playfair Display,serif', fontSize:80, fontStyle:'italic', color:'#84C5BC', lineHeight:1, margin:'0 0 16px' }}>!</p>
      <h1 style={{ fontSize:24, fontWeight:400, color:'#1a1a1a', margin:'0 0 8px', textAlign:'center' }}>Algo salió mal</h1>
      <p style={{ fontSize:14, color:'#888', margin:'0 0 32px', maxWidth:360, textAlign:'center', lineHeight:1.7 }}>
        Ocurrió un error inesperado. Puedes intentarlo de nuevo o volver al inicio.
      </p>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={reset}
          style={{ background:'#1a1a1a', color:'#fff', padding:'12px 24px', borderRadius:10, border:'none', fontSize:14, cursor:'pointer', fontFamily:'Inter,sans-serif' }}>
          Reintentar
        </button>
        <a href="/"
          style={{ background:'none', color:'#888', padding:'12px 24px', borderRadius:10, border:'1px solid #e8e0d2', fontSize:14, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center' }}>
          Ir al inicio
        </a>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <details style={{ marginTop:32, maxWidth:600, width:'100%' }}>
          <summary style={{ fontSize:12, color:'#aaa', cursor:'pointer' }}>Debug info (solo en desarrollo)</summary>
          <pre style={{ fontSize:11, color:'#666', background:'#f0f0f0', padding:12, borderRadius:8, overflow:'auto', marginTop:8 }}>
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        </details>
      )}
    </div>
  )
}
