import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones de Bautizo Online y Digitales — Diseño Delicado | Evochi',
  description: 'Crea invitaciones de bautizo digitales con diseño delicado, RSVP online y cuenta regresiva. Comparte por WhatsApp. Gratuito para empezar.',
  keywords: ['invitaciones bautizo online','invitaciones bautizo digitales','invitaciones bautizo personalizadas','invitación bautizo digital','tarjetas bautizo online','invitaciones bautizo españa','invitaciones bautizo mexico'],
  alternates: { canonical: 'https://evochi.app/invitaciones-bautizo' },
  openGraph: { title: 'Invitaciones de Bautizo Online | Evochi', description: 'Invitaciones de bautizo digitales con diseño delicado y RSVP online. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Evochi' },
}

const FEATURES = [
  { emoji: '🌸', title: 'Diseño tierno y delicado', desc: 'Paletas suaves en tonos pastel o blancos. El wizard sugiere el estilo según el bebé.' },
  { emoji: '✅', title: 'Confirmación de asistencia', desc: 'Los invitados confirman en un clic. Tú ves quién viene desde tu panel en tiempo real.' },
  { emoji: '📍', title: 'Iglesia y celebración', desc: 'Dos ubicaciones en el mapa: la ceremonia religiosa y el lugar de la celebración.' },
  { emoji: '🍽️', title: 'Menú del evento', desc: 'Comparte el tipo de celebración y opciones para alergias o restricciones.' },
  { emoji: '🎁', title: 'Lista de regalos', desc: 'Los invitados saben exactamente qué necesita el bebé. Sin duplicados.' },
  { emoji: '📱', title: 'Comparte por WhatsApp', desc: 'Un enlace que funciona en cualquier móvil. Sin apps ni descargas para los invitados.' },
  { emoji: '⏳', title: 'Cuenta regresiva', desc: 'Los días que faltan para el bautizo, en la propia invitación.' },
  { emoji: '📊', title: 'Panel de gestión', desc: 'Controla la lista de invitados, confirmaciones y alergias desde un lugar.' },
]

const FAQS = [
  { q: '¿Puedo poner dos ubicaciones, la iglesia y el restaurante?', a: 'Sí. Puedes añadir el lugar de la ceremonia y el de la celebración posterior con mapas y cómo llegar a cada uno.' },
  { q: '¿Qué información puedo incluir en la invitación de bautizo?', a: 'El nombre del bebé, fecha, hora, iglesia, restaurante, menú, lista de regalos, código de vestimenta y cualquier dato que quieras compartir.' },
  { q: '¿Los invitados necesitan descargar alguna app?', a: 'No. La invitación se abre en el navegador de cualquier móvil directamente desde WhatsApp o email.' },
  { q: '¿Puedo hacer cambios si cambia la fecha o el lugar?', a: 'Sí, en cualquier momento. Los cambios se actualizan al instante para todos los invitados.' },
  { q: '¿Cuánto cuesta?', a: 'Crear y previsualizar es completamente gratis. Pagas solo cuando decides publicarla y enviarla. Sin cuota mensual.' },
]

const TESTIMONIALS = [
  { text: 'Para el bautizo de nuestra hija fue perfecto. El diseño quedó precioso en tonos pastel y todos los invitados lo encontraron muy fácil de usar.', name: 'Lucía y Pablo', location: 'Bautizo · Zaragoza', rating: '★★★★★' },
  { text: 'Teníamos invitados de toda España y les enviamos la invitación por WhatsApp. Las confirmaciones llegaron solas, sin llamar a nadie.', name: 'Sara M.', location: 'Bautizo · Málaga', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://evochi.app/invitaciones-bautizo', name: 'Invitaciones de Bautizo Online | Evochi', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://evochi.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones de bautizo', item: 'https://evochi.app/invitaciones-bautizo' }] } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="bautizo"
        type="bautizo"
        heroTitle={<>Invitaciones de bautizo <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>llenas de ternura</em></>}
        heroSubtitle="Diseño delicado y personalizado, RSVP online y mapa con iglesia y restaurante. Comparte por WhatsApp en segundos."
        heroBg="linear-gradient(135deg,#0a1e30 0%,#1a3a50 60%,#0a1e30 100%)"
        heroImg="https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
      />
    </>
  )
}
