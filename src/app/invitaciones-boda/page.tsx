import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones de Boda Online y Digitales — Diseño Premium | Invira',
  description: 'Crea invitaciones de boda digitales con RSVP online, cuenta regresiva, mapa, lista de canciones y QR check-in. Diseño personalizado. Gratuito para empezar.',
  keywords: ['invitaciones de boda online','invitaciones boda digital','invitaciones boda personalizadas','tarjetas de boda digitales','invitaciones boda españa','invitaciones boda RSVP','crear invitaciones boda online','invitaciones boda mexico'],
  alternates: { canonical: 'https://invira.app/invitaciones-boda' },
  openGraph: { title: 'Invitaciones de Boda Online — Diseño Premium | Invira', description: 'RSVP online, cuenta regresiva, mapa, QR check-in y diseño personalizado. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Invira' },
}

const FEATURES = [
  { emoji: '💌', title: 'Diseño personalizado', desc: 'Elige colores, tipografía y foto. El wizard lo guía paso a paso en 10 minutos.' },
  { emoji: '✅', title: 'RSVP online', desc: 'Tus invitados confirman en un clic. Tú ves el estado en tiempo real desde tu panel.' },
  { emoji: '⏳', title: 'Cuenta regresiva', desc: 'Los días que faltan para el gran día, visibles en la propia invitación.' },
  { emoji: '🎵', title: 'Playlist colaborativa', desc: 'Los invitados sugieren canciones para la boda. Votación incluida.' },
  { emoji: '🗺️', title: 'Mapa del lugar', desc: 'Ubicación integrada con cómo llegar, hoteles cercanos y transporte.' },
  { emoji: '🎟️', title: 'QR check-in', desc: 'QR único por invitado para controlar la entrada el día de la boda sin papeles.' },
  { emoji: '🎁', title: 'Lista de regalos', desc: 'Integrada en la invitación. Los invitados eligen sin duplicados.' },
  { emoji: '📊', title: 'Analytics en tiempo real', desc: 'Quién abrió la invitación, quién confirmó y desde qué canal llegó.' },
  { emoji: '🏨', title: 'Hoteles cercanos', desc: 'Recomienda alojamiento para los invitados que vienen de lejos.' },
]

const FAQS = [
  { q: '¿Puedo personalizar completamente el diseño?', a: 'Sí. Paleta de colores, tipografía, foto de portada y nivel de ornamentación. El resultado es único para vosotros.' },
  { q: '¿Cómo funciona el RSVP online?', a: 'Cada invitado confirma desde la propia invitación, elige acompañantes e indica restricciones alimentarias. Tú lo ves todo en tiempo real.' },
  { q: '¿Puedo enviar invitaciones personalizadas a cada invitado?', a: 'Sí. Cada invitado recibe un enlace único con su nombre, mesa asignada y menú personalizado.' },
  { q: '¿Funciona sin descargar ninguna app?', a: 'Perfectamente. Se abre en cualquier navegador desde WhatsApp, email o SMS. Cero fricción para tus invitados.' },
  { q: '¿Puedo hacer cambios después de publicar?', a: 'Sí, en cualquier momento. Los cambios se reflejan al instante para todos los invitados.' },
  { q: '¿Cuánto cuesta?', a: 'Es gratuito crear y previsualizar. Pagas una vez al publicar. Sin suscripción mensual.' },
]

const TESTIMONIALS = [
  { text: 'Nuestros invitados fliparon con la invitación. En 24 horas teníamos el 80% de confirmaciones. Increíble.', name: 'Laura y Marcos', location: 'Boda · Barcelona', rating: '★★★★★' },
  { text: 'La IA escribió el texto en 10 segundos y era exactamente lo que queríamos. El mapa con los hoteles fue un acierto total.', name: 'Sofía y Javier', location: 'Boda · Sevilla', rating: '★★★★★' },
  { text: 'Muchísimo más bonito que cualquier invitación en papel. El check-in con QR el día de la boda fue perfecto.', name: 'Ana y Roberto', location: 'Boda · Madrid', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://invira.app/invitaciones-boda', name: 'Invitaciones de Boda Online | Invira', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://invira.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones de boda', item: 'https://invira.app/invitaciones-boda' }] } },
    { '@type': 'Product', name: 'Invitación Digital de Boda', description: 'Invitación de boda con RSVP, diseño personalizado, cuenta regresiva y QR.', brand: { '@type': 'Brand', name: 'Invira' }, offers: { '@type': 'Offer', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: 'https://invira.app/invitaciones-boda', seller: { '@type': 'Organization', name: 'Invira' } }, aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '183', bestRating: '5' } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function InvitacionesBodaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="boda"
        type="boda"
        heroTitle={<>La invitación de boda que <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>merece</em> vuestra historia</>}
        heroSubtitle="RSVP online, diseño personalizado, cuenta regresiva y QR check-in. Todo en un enlace que tus invitados abren en segundos desde WhatsApp."
        heroBg="linear-gradient(135deg,#0d2422 0%,#1a3b38 60%,#0d2422 100%)"
        heroImg="https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
      />
    </>
  )
}
