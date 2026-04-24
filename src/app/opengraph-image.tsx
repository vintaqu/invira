import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Evochi — Invitaciones digitales para bodas y eventos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1c18',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background texture circles */}
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, borderRadius: '50%', background: 'rgba(132,197,188,0.08)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -100, width: 450, height: 450, borderRadius: '50%', background: 'rgba(132,197,188,0.05)', display: 'flex' }} />

        {/* Logo icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <svg width="64" height="64" viewBox="0 0 110 110" fill="none">
            <path d="M55 100C55 100 8 62 8 35C8 16 23 3 40 3C47 3 53 7 55 9C57 7 63 3 70 3C87 3 102 16 102 35C102 62 55 100 55 100Z" fill="#84C5BC"/>
            <circle cx="72" cy="22" r="10" fill="white" opacity="0.95"/>
            <circle cx="78" cy="15" r="5.5" fill="white"/>
          </svg>
          <span style={{ fontSize: 52, color: '#ffffff', fontWeight: 400, letterSpacing: -1, fontFamily: 'serif' }}>
            evochi
          </span>
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', fontWeight: 300, textAlign: 'center', maxWidth: 700, lineHeight: 1.3, fontFamily: 'serif', fontStyle: 'italic' }}>
          Invitaciones digitales para momentos únicos
        </div>

        {/* Divider */}
        <div style={{ width: 80, height: 1, background: '#84C5BC', margin: '32px auto', display: 'flex' }} />

        {/* Features row */}
        <div style={{ display: 'flex', gap: 48, marginTop: 8 }}>
          {['Bodas', 'Cumpleaños', 'Empresas', 'Bautizos'].map(label => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#84C5BC', display: 'flex' }} />
              <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div style={{ position: 'absolute', bottom: 32, fontSize: 14, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, fontFamily: 'sans-serif' }}>
          evochi.app
        </div>
      </div>
    ),
    { ...size }
  )
}
