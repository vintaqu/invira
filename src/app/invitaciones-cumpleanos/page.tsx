import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones de Cumpleaños Online y Digitales — Para Todas las Edades | Evochi',
  description: 'Crea invitaciones de cumpleaños digitales con RSVP online, diseño festivo y cuenta regresiva. Para niños, adultos, 18, 30, 40, 50 o 60 años. Gratuito para empezar.',
  keywords: ['invitaciones cumpleaños online','invitaciones digitales cumpleaños','invitar cumpleaños online','invitaciones 50 cumpleaños','invitaciones 60 cumpleaños','invitaciones cumpleaños niños','invitaciones cumpleaños adultos','invitaciones fiesta cumpleaños','invitaciones cumpleaños mexico'],
  alternates: { canonical: 'https://evochi.app/invitaciones-cumpleanos' },
  openGraph: { title: 'Invitaciones de Cumpleaños Online | Evochi', description: 'Invitaciones de cumpleaños con RSVP, diseño festivo y QR. Para todas las edades. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Evochi' },
}

const FEATURES = [
  { emoji: '🎨', title: 'Diseño festivo', desc: 'Elige entre paletas alegres o elegantes. El wizard te guía según el estilo del cumpleaños.' },
  { emoji: '✅', title: 'Confirmación de asistencia', desc: 'Los invitados confirman en un clic. Tú ves quién viene y quién no desde tu panel.' },
  { emoji: '⏳', title: 'Cuenta regresiva', desc: 'Los días que faltan para la fiesta, visibles en la invitación.' },
  { emoji: '🎵', title: 'Playlist de la fiesta', desc: 'Los invitados sugieren las canciones que no pueden faltar.' },
  { emoji: '🎁', title: 'Lista de regalos', desc: 'Comparte qué necesitas. Los invitados eligen sin duplicados.' },
  { emoji: '📊', title: 'Gestión en tiempo real', desc: 'Controla cuántos vienen, alergias y necesidades especiales desde un panel.' },
  { emoji: '🗺️', title: 'Ubicación integrada', desc: 'El mapa con cómo llegar, incluido en la propia invitación.' },
  { emoji: '📱', title: 'Comparte por WhatsApp', desc: 'Un enlace que funciona en cualquier móvil, sin apps ni descargas.' },
]

const FAQS = [
  { q: '¿Para qué edades sirven las invitaciones de cumpleaños?', a: 'Para cualquier edad: cumpleaños de niños, 18, 30, 40, 50 o 60 años. El diseño se adapta al estilo que elijas.' },
  { q: '¿Cuánto tiempo tarda en crearse?', a: 'Menos de 10 minutos con el wizard paso a paso. La IA puede generar el texto en segundos.' },
  { q: '¿Puedo enviarla por WhatsApp e Instagram?', a: 'Sí, es un enlace único que funciona en cualquier plataforma: WhatsApp, Instagram, email, SMS o redes sociales.' },
  { q: '¿Puedo ver quién ha confirmado su asistencia?', a: 'Sí, en tiempo real. Ves quién confirmó, quién no ha abierto y puedes enviar recordatorios automáticos.' },
  { q: '¿Se puede personalizar con fotos?', a: 'Sí. Sube tu foto o elige de nuestra galería. La invitación queda completamente personalizada.' },
  { q: '¿Cuánto cuesta?', a: 'Crear y previsualizar es gratis. Pagas una vez al publicarla. Sin cuota mensual.' },
]

const TESTIMONIALS = [
  { text: 'Lo usé para los 40 de mi marido y todos preguntaban cómo habíamos hecho algo tan bonito. En dos horas teníamos la fiesta confirmada.', name: 'María J.', location: 'Cumpleaños · Valencia', rating: '★★★★★' },
  { text: 'Para el cumpleaños de mi hija fue perfecto. Los padres de los niños confirmaron sin llamar a nadie. Me ahorré horas de gestión.', name: 'Carmen R.', location: 'Cumpleaños · Madrid', rating: '★★★★★' },
  { text: 'Me hice una invitación para mis 60 y fue el mejor detalle. Mis amigos todavía la tienen guardada en el móvil.', name: 'José M.', location: 'Cumpleaños · Bilbao', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://evochi.app/invitaciones-cumpleanos', name: 'Invitaciones de Cumpleaños Online | Evochi', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://evochi.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones de cumpleaños', item: 'https://evochi.app/invitaciones-cumpleanos' }] } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="cumpleanos"
        type="cumpleaños"
        heroTitle={<>Invitaciones de cumpleaños que <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>sorprenden</em> de verdad</>}
        heroSubtitle="Diseño festivo personalizado, RSVP online y cuenta regresiva. Para todas las edades. Comparte por WhatsApp en segundos."
        heroBg="linear-gradient(135deg,#1a0a30 0%,#2d1050 60%,#1a0a30 100%)"
        heroImg="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
      />
    </>
  )
}
