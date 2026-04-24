import { ImageResponse } from 'next/og'
import { EventService } from '@/modules/events/event.service'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function EventOGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let event: any = null
  try { event = await EventService.getBySlug(slug) } catch {}

  const title  = event?.title ?? 'Te han invitado'
  const heroImage = event?.heroImage ?? null
  const color = (event?.designConfig as any)?.primaryColor ?? '#2d3a2e'

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: color }}>
        {/* Hero image as background */}
        {heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35 }} />
        )}

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)', display: 'flex' }} />

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '60px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: 24, fontFamily: 'sans-serif' }}>
            Estás invitado/a
          </div>
          <div style={{ fontSize: 72, fontWeight: 400, color: '#ffffff', lineHeight: 1.1, fontFamily: 'serif', fontStyle: 'italic', maxWidth: 900, textAlign: 'center' }}>
            {title}
          </div>
          <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.4)', margin: '32px auto', display: 'flex' }} />
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif', letterSpacing: 1 }}>
            evochi.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
