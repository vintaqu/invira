import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { CookieBanner } from '@/components/CookieBanner'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const viewport = {
  themeColor: '#84C5BC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://evochi.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    // Keyword-rich, under 60 chars, brand at end
    default: 'Invitaciones Digitales Online para Bodas y Eventos | Evochi',
    template: '%s | Evochi',
  },

  description:
    // 150-160 chars, primary KW first, clear value prop, includes CTA
    'Crea invitaciones digitales para bodas, cumpleaños, bautizos y quinceañeras con RSVP online, diseño premium y QR check-in. Desde €29, pago único.',

  keywords: [
    // Primary — high volume ES+LATAM
    'invitaciones digitales',
    'invitaciones online',
    'invitaciones digitales boda',
    'invitaciones boda online',
    'invitaciones digitales cumpleaños',
    'invitaciones cumpleaños online',
    // Secondary — intent
    'crear invitaciones online',
    'invitaciones RSVP online',
    'invitación digital con confirmación asistencia',
    'invitaciones digitales gratis',
    // Long tail
    'invitaciones bautizo online',
    'invitaciones quinceañera digital',
    'invitaciones 15 años online',
    'invitaciones corporativas online',
    'invitaciones graduacion online',
    // LATAM
    'invitaciones digitales mexico',
    'invitaciones digitales colombia',
    'invitaciones digitales argentina',
    'invitaciones digitales chile',
    'invitaciones digitales venezuela',
  ],

  authors: [{ name: 'Evochi', url: APP_URL }],
  creator: 'Evochi',
  publisher: 'Evochi',
  category: 'technology',

  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['es_MX', 'es_AR', 'es_CO', 'es_CL', 'es_PE', 'es_VE'],
    url: APP_URL,
    siteName: 'Evochi',
    title: 'Invitaciones Digitales Online para Bodas y Eventos | Evochi',
    description: 'Crea invitaciones digitales para bodas, cumpleaños y todo tipo de eventos. RSVP online, diseño premium y QR check-in. Desde €29.',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@evochi_app',
    creator: '@evochi_app',
    title: 'Invitaciones Digitales para Bodas y Eventos | Evochi',
    description: 'RSVP online, diseño premium, QR check-in. Desde €29, pago único.',
  },

  // Technical SEO
  manifest: '/manifest.json',
  alternates: {
    canonical: APP_URL,
    languages: {
      'es-ES': APP_URL,
      'es-MX': APP_URL,
      'es-419': APP_URL, // Latin America catch-all
    },
  },

  // Verification tags (add your real values after deploy)
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  //   yandex: 'YOUR_YANDEX_CODE',
  // },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${cormorant.variable} ${dmSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Satisfy&family=Great+Vibes&family=Cinzel:wght@400;600&family=Libre+Baskerville:ital,wght@0,400;1,400&family=Poppins:wght@300;400;500&family=Nunito:wght@300;400;500&family=Josefin+Sans:wght@300;400&family=Raleway:wght@300;400;500&family=Montserrat:wght@300;400;500&family=DM+Sans:wght@300;400;500&family=Lato:wght@300;400&family=Lora:ital,wght@0,400;1,400&family=Jost:wght@300;400&family=Inter:wght@300;400;500&family=Source+Serif+4:ital,wght@0,400;1,400&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  )
}
