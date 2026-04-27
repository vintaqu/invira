import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones de Graduación Online y Digitales — Celebra tu Logro | Evochi',
  description: 'Crea invitaciones de graduación digitales con diseño elegante, RSVP online y cuenta regresiva. Para grados, másteres y doctorados. Gratuito para empezar.',
  keywords: ['invitaciones graduacion online','invitaciones digitales graduacion','invitación graduación digital','invitaciones titulación online','invitaciones fin de carrera','invitaciones master graduacion','tarjetas graduacion digitales'],
  alternates: { canonical: 'https://evochi.app/invitaciones-graduacion' },
  openGraph: { title: 'Invitaciones de Graduación Online | Evochi', description: 'Invitaciones de graduación con diseño elegante y RSVP online. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Evochi' },
}

const FEATURES = [
  { emoji: '🎓', title: 'Diseño académico y elegante', desc: 'Paletas sobrias y elegantes que reflejan el logro académico. Completamente personalizado.' },
  { emoji: '✅', title: 'Confirmación de asistencia', desc: 'Familiares y amigos confirman en un clic. Control en tiempo real desde tu panel.' },
  { emoji: '⏳', title: 'Cuenta regresiva', desc: 'Los días que faltan para el gran día, visibles en la propia invitación.' },
  { emoji: '📍', title: 'Ubicación de la ceremonia', desc: 'Mapa con el auditorio o salón de actos y cómo llegar.' },
  { emoji: '🍽️', title: 'Celebración posterior', desc: 'Incluye la información del restaurante o lugar de celebración tras la ceremonia.' },
  { emoji: '🎁', title: 'Lista de regalos', desc: 'Comparte qué necesitas como graduado. Sin regalos duplicados.' },
  { emoji: '📸', title: 'Álbum compartido', desc: 'Los invitados pueden subir sus fotos del día. Un recuerdo compartido.' },
  { emoji: '📱', title: 'Comparte por WhatsApp', desc: 'Un enlace que funciona en cualquier móvil sin apps ni descargas.' },
]

const FAQS = [
  { q: '¿Puedo incluir la titulación y la universidad?', a: 'Sí. Puedes añadir todos los detalles: nombre, titulación, universidad, fecha de la ceremonia y lugar de celebración.' },
  { q: '¿Funciona para toda la familia aunque no sean muy tecnológicos?', a: 'Perfectamente. La invitación se abre en cualquier móvil con un simple clic desde WhatsApp. Sin apps ni cuentas.' },
  { q: '¿Puedo incluir dos ubicaciones, la ceremonia y la celebración?', a: 'Sí. Puedes añadir el lugar de la entrega de diplomas y el restaurante o local de la fiesta posterior.' },
  { q: '¿Cuánto cuesta?', a: 'Crear y previsualizar es gratis. Pagas una vez al publicarla. Sin cuota mensual.' },
]

const TESTIMONIALS = [
  { text: 'Después de 6 años de carrera, quería que la invitación de mi graduación estuviera a la altura. Evochi lo consiguió en 15 minutos.', name: 'Daniel F.', location: 'Graduación Medicina · Salamanca', rating: '★★★★★' },
  { text: 'Mis padres y abuelos encontraron la invitación preciosa y muy fácil de abrir. Las confirmaciones llegaron sin llamar a nadie.', name: 'Marta L.', location: 'Graduación · Barcelona', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://evochi.app/invitaciones-graduacion', name: 'Invitaciones de Graduación Online | Evochi', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://evochi.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones de graduación', item: 'https://evochi.app/invitaciones-graduacion' }] } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="graduacion"
        type="graduación"
        heroTitle={<>Tu graduación merece <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>una invitación a su altura</em></>}
        heroSubtitle="Diseño elegante, RSVP online y cuenta regresiva. Celebra años de esfuerzo con la invitación que mereces."
        heroBg="linear-gradient(135deg,#0a0a18 0%,#1a1a35 60%,#0a0a18 100%)"
        heroImg="https://images.unsplash.com/photo-1627556704302-624286467c65?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
        ctaLabel="Crear invitación de graduación"
      />
    </>
  )
}
