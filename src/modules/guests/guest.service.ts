import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/email'
import { qrService } from '@/lib/qr'
import type { RSVPStatus } from '@prisma/client'

export interface CreateGuestInput {
  eventId: string
  name: string
  email?: string
  phone?: string
  group?: string
  tableNumber?: number
  tableName?: string
  isVIP?: boolean
  menuChoice?: string
  transportId?: string
  notes?: string
}

export interface BulkImportInput {
  eventId: string
  guests: Omit<CreateGuestInput, 'eventId'>[]
}

export interface RSVPInput {
  guestToken: string
  eventId: string
  status: RSVPStatus
  companions?: number
  companionNames?: string[]
  dietaryRestrictions?: string
  allergies?: string
  message?: string
  needsTransport?: boolean
  transportOption?: string
  customFields?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export class GuestService {
  // CREATE SINGLE
  static async create(input: CreateGuestInput) {
    const guest = await prisma.guest.create({
      data: {
        eventId: input.eventId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        group: input.group,
        tableNumber: input.tableNumber,
        tableName: input.tableName,
        isVIP: input.isVIP ?? false,
        menuChoice: input.menuChoice,
        notes: input.notes,
      },
    })

    // Create RSVP record (PENDING)
    await prisma.rSVP.create({
      data: { eventId: input.eventId, guestId: guest.id, status: 'PENDING' },
    })

    // Create invitation record
    await prisma.invitation.create({
      data: {
        eventId: input.eventId,
        guestId: guest.id,
        personalizedUrl: `/api/invite/${guest.accessToken}`,
      },
    })

    return guest
  }

  // BULK IMPORT
  static async bulkImport(input: BulkImportInput) {
    const created = []
    for (const g of input.guests) {
      try {
        const guest = await this.create({ ...g, eventId: input.eventId })
        created.push(guest)
      } catch (e) {
        console.error(`Failed to import guest ${g.name}:`, e)
      }
    }
    return created
  }

  // LIST BY EVENT
  static async listByEvent(eventId: string, userId: string) {
    const event = await prisma.event.findFirst({ where: { id: eventId, userId } })
    if (!event) throw new Error('Unauthorized')

    return prisma.guest.findMany({
      where: { eventId },
      include: {
        rsvp: true,
        invitation: {
          select: { status: true, openedAt: true, sentAt: true, channel: true },
        },
      },
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    })
  }

  // GET BY TOKEN (public)
  static async getByToken(accessToken: string, eventId: string) {
    return prisma.guest.findFirst({
      where: { accessToken, eventId },
      include: { rsvp: true, invitation: true },
    })
  }

  // SUBMIT RSVP
  static async submitRSVP(input: RSVPInput) {
    const guest = await prisma.guest.findFirst({
      where: { accessToken: input.guestToken, eventId: input.eventId },
    })
    if (!guest) throw new Error('Guest not found')

    const rsvp = await prisma.rSVP.upsert({
      where: { guestId: guest.id },
      create: {
        eventId: input.eventId,
        guestId: guest.id,
        status: input.status,
        companions: input.companions ?? 0,
        companionNames: input.companionNames ?? [],
        dietaryRestrictions: input.dietaryRestrictions,
        allergies: input.allergies,
        message: input.message,
        needsTransport: input.needsTransport ?? false,
        transportOption: input.transportOption,
        customFields: input.customFields as any,
        respondedAt: new Date(),
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
      update: {
        status: input.status,
        companions: input.companions ?? 0,
        companionNames: input.companionNames ?? [],
        dietaryRestrictions: input.dietaryRestrictions,
        allergies: input.allergies,
        message: input.message,
        needsTransport: input.needsTransport ?? false,
        respondedAt: new Date(),
        customFields: input.customFields as any,
      },
    })

    // Track in analytics
    await prisma.analytics.create({
      data: {
        eventId: input.eventId,
        guestId: guest.id,
        type: 'rsvp_complete',
        metadata: { status: input.status } as any,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    })

    // Send confirmation email
    if (guest.email && input.status === 'CONFIRMED') {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (event) {
        await emailService.sendRSVPConfirmation({
          to: guest.email,
          guestName: guest.name,
          eventTitle: event.title,
          eventDate: event.eventDate,
          eventSlug: event.slug,
        }).catch(err => console.error('[RSVP email error]', err))
      }
    }

    return rsvp
  }

  // CHECK-IN (QR scan)
  static async checkIn(guestId: string, device?: string) {
    const guest = await prisma.guest.findUnique({ where: { id: guestId } })
    if (!guest) throw new Error('Guest not found')

    if (guest.checkInStatus === 'CHECKED_IN') {
      return { alreadyCheckedIn: true, guest }
    }

    const updated = await prisma.guest.update({
      where: { id: guestId },
      data: {
        checkInStatus: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkInDevice: device,
      },
    })

    return { alreadyCheckedIn: false, guest: updated }
  }

  // GENERATE QR
  static async generateQR(guestId: string, userId: string) {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true },
    })
    if (!guest || guest.event.userId !== userId) throw new Error('Unauthorized')

    const url = `${process.env.NEXT_PUBLIC_APP_URL}/checkin/${guest.accessToken}`
    return qrService.generate(url, { width: 300 })
  }

  // EXPORT EXCEL DATA
  static async exportExcel(eventId: string, userId: string) {
    const guests = await this.listByEvent(eventId, userId)
    return guests.map(g => ({
      Nombre: g.name,
      Email: g.email ?? '',
      Teléfono: g.phone ?? '',
      Grupo: g.group ?? '',
      Mesa: g.tableName ?? g.tableNumber ?? '',
      VIP: g.isVIP ? 'Sí' : 'No',
      RSVP: g.rsvp?.status ?? 'PENDING',
      Acompañantes: g.rsvp?.companions ?? 0,
      Restricciones: g.rsvp?.dietaryRestrictions ?? '',
      Menú: g.menuChoice ?? '',
      'Confirmado el': g.rsvp?.respondedAt
        ? new Date(g.rsvp.respondedAt).toLocaleDateString('es-ES')
        : '',
      'Enviado el': g.invitation?.sentAt
        ? new Date(g.invitation.sentAt).toLocaleDateString('es-ES')
        : '',
      'Abierto el': g.invitation?.openedAt
        ? new Date(g.invitation.openedAt).toLocaleDateString('es-ES')
        : '',
      Canal: g.invitation?.channel ?? '',
      'Check-in': g.checkInStatus === 'CHECKED_IN' ? 'Sí' : 'No',
    }))
  }
}
