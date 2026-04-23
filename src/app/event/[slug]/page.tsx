import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { EventService } from '@/modules/events/event.service'
import { EventLanding } from '@/components/event/EventLanding'
import { analyticsService } from '@/modules/analytics/analytics.service'
import { headers } from 'next/headers'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ g?: string; ch?: string; preview?: string; utm_source?: string; utm_medium?: string; utm_campaign?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = await EventService.getBySlug(slug)
  if (!event) return { title: 'Invitación no encontrada' }
  const TYPE_LABELS: Record<string,string> = {
    WEDDING:'Boda', BIRTHDAY:'Cumpleaños', CORPORATE:'Evento corporativo',
    BAPTISM:'Bautizo', ANNIVERSARY:'Aniversario', GRADUATION:'Graduación',
    QUINCEANERA:'Quinceañera', OTHER:'Evento'
  }
  const TYPE_DESC: Record<string,string> = {
    WEDDING:      `Estás invitado/a a la boda de ${event.title}. Confirma tu asistencia online.`,
    BIRTHDAY:     `Estás invitado/a al cumpleaños de ${event.title}. Confirma tu asistencia online.`,
    BAPTISM:      `Estás invitado/a al bautizo de ${event.title}. Confirma tu asistencia.`,
    QUINCEANERA:  `Estás invitado/a a la quinceañera de ${event.title}. Confirma tu asistencia.`,
    ANNIVERSARY:  `Estás invitado/a al aniversario de ${event.title}. Confirma tu asistencia.`,
    GRADUATION:   `Estás invitado/a a la graduación de ${event.title}. Confirma tu asistencia.`,
    CORPORATE:    `Estás invitado/a al evento de ${event.title}. Confirma tu asistencia.`,
    OTHER:        `Estás invitado/a a ${event.title}. Confirma tu asistencia online.`,
  }
  const typeLabel = TYPE_LABELS[event.type] ?? 'Evento'
  const desc = event.description ?? TYPE_DESC[event.type] ?? `Estás invitado/a a ${event.title}. Confirma tu asistencia online.`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invira.app'

  return {
    title: `${event.title} — Invitación digital`,
    description: desc,
    alternates: { canonical: `${appUrl}/event/${event.slug}` },
    openGraph: {
      type: 'website',
      title: `${event.title} — ${typeLabel}`,
      description: desc,
      images: event.heroImage ? [{ url: event.heroImage, width: 1200, height: 630, alt: event.title }] : [],
      siteName: 'Invira',
      locale: 'es_ES',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${event.title} — ${typeLabel}`,
      description: desc,
      images: event.heroImage ? [event.heroImage] : [],
    },
  }
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams  // await once, use everywhere
  const { g, ch, preview, utm_source, utm_medium, utm_campaign } = sp

  const event = await EventService.getBySlug(slug, g)
  if (!event) notFound()
  if (event.status !== 'PAID' && preview !== '1') notFound()

  const hdrs = await headers()
  const ip = hdrs.get('x-forwarded-for') ?? undefined
  const ua = hdrs.get('user-agent') ?? undefined

  if (g) {
    analyticsService.trackInvitationOpen(g, event.id, ch ?? utm_medium).catch(() => {})
  } else {
    analyticsService.track({
      eventId: event.id,
      type: utm_source === 'invitation' ? 'referral_visit' : 'page_view',
      channel: ch ?? utm_source ?? 'direct',
      utmSource: utm_source, utmMedium: utm_medium, utmCampaign: utm_campaign,
      ipAddress: ip, userAgent: ua,
    }).catch(() => {})
  }

  const serialized = JSON.parse(JSON.stringify(event))
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": event.type === 'CORPORATE' ? 'BusinessEvent'
      : event.type === 'WEDDING' ? 'SocialEvent'
      : event.type === 'GRADUATION' ? 'EducationEvent'
      : 'SocialEvent',
    "name": event.title,
    "description": event.description ?? `Estás invitado/a a ${event.title}`,
    "startDate": event.eventDate.toISOString(),
    "url": `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://invira.app'}/event/${event.slug}`,
    ...(event.venueName && { "location": { "@type": "Place", "name": event.venueName, "address": event.venueCity ?? undefined } }),
    ...(event.heroImage && { "image": event.heroImage }),
    "organizer": { "@type": "Person", "name": event.coupleNames ?? event.title },
    "eventStatus": "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <EventLanding event={serialized} guestToken={g} channel={ch} />
    </>
  )
}
