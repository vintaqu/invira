import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'Invitaciones para Eventos Corporativos Online — Profesionales y con Analytics | Evochi',
  description: 'Crea invitaciones digitales para eventos de empresa, conferencias y lanzamientos. RSVP profesional, analytics completos y QR check-in. Gratuito para empezar.',
  keywords: ['invitaciones eventos corporativos','invitaciones empresa online','invitaciones corporativas digitales','invitaciones conferencias online','eventos empresa digitales','invitaciones lanzamiento producto','invitaciones gala empresa'],
  alternates: { canonical: 'https://evochi.app/invitaciones-corporativas' },
  openGraph: { title: 'Invitaciones Corporativas Online | Evochi', description: 'Invitaciones para eventos de empresa con RSVP, analytics y QR check-in. Gratuito para empezar.', type: 'website', locale: 'es_ES', siteName: 'Evochi' },
}

const FEATURES = [
  { emoji: '🏢', title: 'Imagen corporativa', desc: 'Diseño profesional con los colores y tipografía de tu marca. Coherente con tu identidad.' },
  { emoji: '✅', title: 'RSVP con validación', desc: 'Controla quién tiene acceso. Confirmaciones con validación por email corporativo si es necesario.' },
  { emoji: '📊', title: 'Analytics completos', desc: 'Quién abrió la invitación, tasa de confirmación por departamento y fuente de tráfico.' },
  { emoji: '🎟️', title: 'QR check-in profesional', desc: 'Controla la entrada al evento con QR único por asistente. Sin listas de papel.' },
  { emoji: '📋', title: 'Programa del evento', desc: 'Agenda detallada con ponentes, horarios y salas. Todo en la propia invitación.' },
  { emoji: '🚌', title: 'Logística integrada', desc: 'Transporte, parking, instrucciones de llegada y hoteles cercanos.' },
  { emoji: '🌍', title: 'Multi-idioma', desc: 'Invitaciones en español e inglés para eventos internacionales.' },
  { emoji: '📱', title: 'Compatible con cualquier dispositivo', desc: 'Se abre en cualquier móvil o desktop. Sin apps ni descargas.' },
]

const FAQS = [
  { q: '¿Puedo usar los colores y logo de mi empresa?', a: 'Sí. Puedes subir el logo y elegir los colores corporativos exactos para que la invitación sea coherente con tu marca.' },
  { q: '¿Funciona para eventos privados con lista cerrada?', a: 'Sí. Puedes activar el acceso privado, donde solo los invitados con el enlace pueden ver la invitación.' },
  { q: '¿Puedo ver estadísticas de apertura y confirmación?', a: 'Sí. El panel de analytics muestra en tiempo real quién abrió, quién confirmó y desde qué canal llegó cada asistente.' },
  { q: '¿El QR check-in funciona con muchos asistentes?', a: 'Perfectamente. Funciona en tiempo real para eventos de cualquier tamaño. Solo necesitas el móvil.' },
  { q: '¿Puedo exportar la lista de asistentes?', a: 'Sí, en Excel o CSV con todos los datos: nombre, empresa, confirmación y cualquier campo personalizado.' },
  { q: '¿Cuánto cuesta?', a: 'Crear y previsualizar es gratis. Pagas una vez al publicar. Sin cuota mensual ni por asistente.' },
]

const TESTIMONIALS = [
  { text: 'Lo usamos para nuestra conferencia anual de 300 personas. El check-in fue fluido y los analytics nos ayudaron a entender mejor la asistencia.', name: 'Carlos B.', location: 'Evento corporativo · Barcelona', rating: '★★★★★' },
  { text: 'Para el lanzamiento de producto fue perfecto. Aspecto profesional, invitados gestionados desde el panel y ningún problema el día del evento.', name: 'Elena M.', location: 'Lanzamiento · Madrid', rating: '★★★★★' },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', url: 'https://evochi.app/invitaciones-corporativas', name: 'Invitaciones Corporativas Online | Evochi', breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://evochi.app' },{ '@type': 'ListItem', position: 2, name: 'Invitaciones corporativas', item: 'https://evochi.app/invitaciones-corporativas' }] } },
    { '@type': 'FAQPage', mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
  ],
}

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage
        slug="corporativas"
        type="evento corporativo"
        heroTitle={<>Invitaciones corporativas <em style={{ fontStyle: 'italic', color: '#84C5BC' }}>a la altura de tu empresa</em></>}
        heroSubtitle="RSVP profesional, analytics completos y QR check-in. Para conferencias, lanzamientos, galas y cualquier evento de empresa."
        heroBg="linear-gradient(135deg,#080812 0%,#12122a 60%,#080812 100%)"
        heroImg="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80&auto=format&fit=crop"
        features={FEATURES}
        faqs={FAQS}
        testimonials={TESTIMONIALS}
        ctaLabel="Crear invitación corporativa"
      />
    </>
  )
}
