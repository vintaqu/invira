import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal — Invira',
}

const LEGAL_LINKS = [
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/terminos',   label: 'Términos' },
  { href: '/legal/cookies',    label: 'Cookies' },
  { href: '/legal/rgpd',       label: 'RGPD' },
]

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid #e8e2db', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 36C20 36 6 26 6 16C6 10.477 10.477 6 16 6C18.132 6 20.1 6.698 21.7 7.9C19.5 9.5 18 12.08 18 15C18 19.418 21.582 23 26 23C27.2 23 28.33 22.72 29.34 22.22C27.08 30.12 20 36 20 36Z" fill="#84C5BC"/>
            <circle cx="27" cy="14" r="5.5" fill="#84C5BC"/>
            <circle cx="27" cy="14" r="2.5" fill="white"/>
            <circle cx="20.5" cy="7.5" r="2.5" fill="#84C5BC" opacity="0.6"/>
          </svg>
          <span style={{ fontFamily:"system-ui, sans-serif", fontSize:20, color:'#333333', fontWeight:600, letterSpacing:-0.3 }}>invira</span>
        </Link>
        <nav style={{ display: 'flex', gap: 24 }}>
          {LEGAL_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 13, color: '#888', textDecoration: 'none' }}
              className="legal-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 780, margin: '0 auto', padding: '56px 32px 80px' }}>
        <style>{`
          article h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(28px, 5vw, 42px);
            font-weight: 400;
            color: #1a1c18;
            margin: 0 0 8px;
            line-height: 1.15;
          }
          article .meta {
            font-size: 13px;
            color: #aaa;
            margin: 0 0 48px;
            display: block;
          }
          article h2 {
            font-family: 'Playfair Display', serif;
            font-size: 22px;
            font-weight: 400;
            color: #1a1c18;
            margin: 48px 0 16px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e8e2db;
          }
          article h3 {
            font-size: 15px;
            font-weight: 600;
            color: #2c2c2a;
            margin: 28px 0 10px;
          }
          article p {
            font-size: 15px;
            color: #444;
            line-height: 1.8;
            margin: 0 0 16px;
          }
          article ul, article ol {
            margin: 0 0 20px 0;
            padding-left: 24px;
          }
          article li {
            font-size: 15px;
            color: #444;
            line-height: 1.8;
            margin-bottom: 8px;
          }
          article a {
            color: #6b7c5c;
            text-decoration: underline;
            text-underline-offset: 3px;
          }
          article a:hover { color: #4a5940; }
          article table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0 28px;
            font-size: 14px;
          }
          article th {
            background: #f5f2ee;
            padding: 10px 14px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.5px;
            color: #666;
            text-transform: uppercase;
            border-bottom: 1px solid #e8e2db;
          }
          article td {
            padding: 10px 14px;
            border-bottom: 1px solid #f0ebe4;
            color: #444;
            vertical-align: top;
          }
          article tr:last-child td { border-bottom: none; }
          article section { margin-bottom: 12px; }
          article em { color: #888; font-style: italic; }
          article strong { color: #2c2c2a; font-weight: 600; }
          @media (max-width: 768px) {
            article h2 { font-size: 18px; }
            article p, article li { font-size: 14px; }
            article table { font-size: 12px; }
            article th, article td { padding: 8px 10px; }
          }
        `}</style>
        {children}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e8e2db', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#fff' }}>
        <p style={{ fontSize: 13, color: '#aaa', margin: 0 }}>© {new Date().getFullYear()} Invira. Todos los derechos reservados.</p>
        <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {LEGAL_LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 12, color: '#aaa', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  )
}
