import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones de Quinceañera Online y Digitales — Únicas y Especiales | Evochi',
  description: 'Crea invitaciones de quinceañera digitales con diseño elegante, RSVP online y cuenta regresiva. Para los 15 años más especiales. Gratuito para empezar.',
  keywords: ['invitaciones quinceañera online','invitaciones 15 años digitales','invitaciones quinceañera digital','invitaciones quince años','tarjetas quinceañera online','invitaciones quinceañera mexico','invitaciones xv años digitales'],
  alternates: { canonical: 'https://evochi.app/invitaciones-quinceAnera' },
  openGraph: { title: 'Invitaciones de Quinceañera Online | Evochi', description: 'Invitaciones de quinceañera con diseño elegante, RSVP y cuenta regresiva. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Evochi' },
}

const FEATURES = [
  { emoji: '✨', title: 'Diseño mágico y elegante', desc: 'Paletas en rosa, dorado, lila o el color favorito de la quinceañera. Completamente personalizado.' },
  { emoji: '✅', title: 'RSVP online', desc: 'Los invitados confirman en un clic. Control de asistencia en tiempo real desde tu panel.' },
  { emoji: '⏳', title: 'Cuenta regresiva', desc: 'La emoción crece con los días que faltan para la gran noche, visibles en la invitación.' },
  { emoji: '🎵', title: 'Playlist de la fiesta', desc: 'Los invitados sugieren las canciones que harán memorable la noche.' },
  { emoji: '👗', title: 'Dress code', desc: 'Comparte el código de vestimenta para que todos lleguen perfectos a la celebración.' },
  { emoji: '🗺️', title: 'Ubicación del salón', desc: 'Mapa integrado con cómo llegar al lugar de la fiesta.' },
  { emoji: '🎁', title: 'Lista de regalos', desc: 'Los invitados saben exactamente qué regalar. Sin duplicados.' },
  { emoji: '📱', title: 'Comparte por WhatsApp', desc: 'Un enlace elegante que funciona en cualquier móvil sin apps.' },
]

const FAQS = [
  { q: '¿Puedo elegir el color que más le guste a la quinceañera?', a: 'Sí, completamente. Elige cualquier color de la paleta o el personalizado. El diseño se adapta al estilo soñado.' },
  { q: '¿Se puede incluir la historia o el mensaje de los XV años?', a: 'Sí. Puedes añadir un texto de bienvenida, la historia de la festejada y cualquier mensaje especial.' },
  { q: '¿Puedo enviarla por WhatsApp a todos los invitados?', a: 'Sí, es un enlace único que funciona en cualquier móvil directamente desde WhatsApp, sin descargar apps.' },
  { q: '¿Los invitados pueden confirmar con cuántos acompañantes vienen?', a: 'Sí. Cada invitado indica el número de personas que asistirán y cualquier restricción alimentaria.' },
  { q: '¿Cuánto cuesta?', a: 'Crear y previsualizar es completamente gratis. Pagas solo cuando la publicas. Sin cuota mensual.' },
]

const TESTIMONIALS = [
  { text: 'La invitación de los XV de mi hija quedó preciosa en rosa y dorado. Todos los invitados decían que jamás habían visto algo así.', name: 'Patricia G.', location: 'Quinceañera · Ciudad de México', rating: '★★★★★' },
  { text: 'Usamos Evochi para los 15 de mi sobrina y fue la mejor decisión. Las confirmaciones llegaron solas y la lista quedó perfecta.', name: 'Mónica R.', location: 'Quinceañera · Guadalajara', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://evochi.app/invitaciones-quinceAnera', name: 'Invitaciones de Quinceañera Online | Evochi', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://evochi.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones de quinceañera', item: 'https://evochi.app/invitaciones-quinceAnera' }] } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="quinceAnera"
        type="quinceañera"
        heroTitle={<>La invitación de quinceañera <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>que ella siempre soñó</em></>}
        heroSubtitle="Diseño elegante personalizado, RSVP online, cuenta regresiva y playlist de la fiesta. Una noche única merece una invitación única."
        heroBg="linear-gradient(135deg,#200830 0%,#3a1060 60%,#200830 100%)"
        heroImg="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
      />
    </>
  )
}
