// /i/[token] — Landing page para invitados compartida por WhatsApp
// Esta página tiene OG tags bonitos para el preview de WhatsApp/redes sociales
// y redirige automáticamente al usuario al evento personalizado

import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params

  const guest = await prisma.guest.findUnique({
    where: { accessToken: token },
    include: {
      event: {
        select: {
          title: true, slug: true, status: true,
          coupleNames: true, heroImage: true,
          venueName: true, venueCity: true,
          eventDate: true, description: true,
        },
      },
    },
  })

  if (!guest?.event || guest.event.status !== 'PAID') {
    return { title: 'Invitación' }
  }

  const ev = guest.event
  const name = ev.coupleNames ?? ev.title
  const venue = [ev.venueName, ev.venueCity].filter(Boolean).join(', ')
  const date = ev.eventDate
    ? new Date(ev.eventDate).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : ''

  const title = `${guest.name}, tienes una invitación 💌`
  const description = `${name}${date ? ` · ${date}` : ''}${venue ? ` · ${venue}` : ''}`

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invira.app'

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: 'Invira',
      images: ev.heroImage
        ? [{ url: ev.heroImage, width: 1200, height: 630, alt: name }]
        : [{ url: `${appUrl}/og-image.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ev.heroImage ? [ev.heroImage] : [`${appUrl}/og-image.jpg`],
    },
  }
}

export default async function InvitePreviewPage({ params }: Props) {
  const { token } = await params

  const guest = await prisma.guest.findUnique({
    where: { accessToken: token },
    include: {
      event: { select: { slug: true, status: true } },
    },
  })

  if (!guest?.event) notFound()
  if (guest.event.status !== 'PAID') {
    redirect('/')
  }

  // Track analytics
  try {
    const { analyticsService } = await import('@/modules/analytics/analytics.service')
    await analyticsService.trackInvitationOpen(token, guest.eventId, 'whatsapp')
  } catch {}

  // Update invitation record
  try {
    await prisma.invitation.updateMany({
      where: { guestId: guest.id },
      data: { openedAt: new Date(), channel: 'whatsapp' },
    })
  } catch {}

  // Redirect to the event with guest token
  redirect(`/event/${guest.event.slug}?g=${token}&ch=whatsapp`)
}
