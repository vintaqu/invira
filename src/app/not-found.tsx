import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#faf8f4', fontFamily: 'Inter, sans-serif' }}>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 80, fontStyle: 'italic', color: '#84C5BC', lineHeight: 1, marginBottom: 16 }}>404</p>
      <h1 style={{ fontSize: 24, fontWeight: 400, color: '#1a1a1a', marginBottom: 8 }}>Página no encontrada</h1>
      <p style={{ fontSize: 14, color: '#888', marginBottom: 32 }}>La página que buscas no existe o ha sido eliminada.</p>
      <Link href="/" style={{ background: '#1a1a1a', color: '#fff', padding: '12px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>
        Volver al inicio
      </Link>
    </div>
  )
}
