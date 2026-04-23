import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('')
  console.log('🌱 Invitely — Seeding database...')
  console.log('─────────────────────────────────')

  // ── 1. USUARIOS DE PRUEBA ─────────────────────────────────
  console.log('\n👤 Creando usuarios...')

  const adminPassword   = await bcrypt.hash('admin123',   10)
  const demoPassword    = await bcrypt.hash('demo1234',   10)
  const vicentePassword = await bcrypt.hash('invitely2025', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@invitely.app' },
    update: {},
    create: {
      email: 'admin@invitely.app',
      name: 'Admin Invitely',
      passwordHash: adminPassword,
      role: 'ADMIN',
      locale: 'es',
    },
  })
  console.log('  ✓ admin@invitely.app  /  admin123')

  const demo = await prisma.user.upsert({
    where: { email: 'demo@invitely.app' },
    update: {},
    create: {
      email: 'demo@invitely.app',
      name: 'Usuario Demo',
      passwordHash: demoPassword,
      role: 'USER',
      locale: 'es',
    },
  })
  console.log('  ✓ demo@invitely.app   /  demo1234')

  const vicente = await prisma.user.upsert({
    where: { email: 'vicente@invitely.app' },
    update: {},
    create: {
      email: 'vicente@invitely.app',
      name: 'Vicente',
      passwordHash: vicentePassword,
      role: 'ADMIN',
      locale: 'es',
    },
  })
  console.log('  ✓ vicente@invitely.app  /  invitely2025')

  // ── 2. TEMPLATES ──────────────────────────────────────────
  console.log('\n🎨 Creando templates...')

  const templateNoche = await prisma.template.upsert({
    where: { slug: 'noche-de-gala' },
    update: {},
    create: {
      name: 'Noche de Gala',
      slug: 'noche-de-gala',
      description: 'Elegancia oscura. Perfecto para bodas íntimas y eventos de noche.',
      isPremium: false,
      eventTypes: ['WEDDING', 'ANNIVERSARY'],
      isActive: true,
      schema: {
        sections: ['hero', 'countdown', 'details', 'agenda', 'rsvp', 'gifts', 'playlist', 'map'],
        fonts: [{ display: 'Cormorant Garamond', body: 'DM Sans' }],
        colorPalettes: [
          { name: 'Noche', primary: '#0f0e0c', accent: '#b8975a', background: '#faf8f4' },
        ],
      },
      defaultData: {
        colorPrimary: '#0f0e0c', colorAccent: '#b8975a',
        layoutStyle: 'split', animationIntensity: 'minimal',
      },
    },
  })
  console.log('  ✓ Noche de Gala (gratis)')

  const templateGarden = await prisma.template.upsert({
    where: { slug: 'garden-romance' },
    update: {},
    create: {
      name: 'Garden Romance',
      slug: 'garden-romance',
      description: 'Suave y romántico. Tonos crema y dorado para bodas en jardín.',
      isPremium: true,
      price: 15,
      eventTypes: ['WEDDING', 'BAPTISM'],
      isActive: true,
      schema: {
        sections: ['hero', 'story', 'countdown', 'details', 'agenda', 'rsvp', 'gifts', 'playlist', 'instagram', 'map'],
        fonts: [{ display: 'Playfair Display', body: 'Lato' }],
        colorPalettes: [
          { name: 'Rose', primary: '#5a3a2a', accent: '#c9a96e', background: '#fdf9f4' },
        ],
      },
      defaultData: {
        colorPrimary: '#5a3a2a', colorAccent: '#c9a96e',
        layoutStyle: 'centered', animationIntensity: 'moderate',
      },
    },
  })
  console.log('  ✓ Garden Romance (premium)')

  await prisma.template.upsert({
    where: { slug: 'corporate-modern' },
    update: {},
    create: {
      name: 'Corporate Modern',
      slug: 'corporate-modern',
      description: 'Minimalista y profesional. Ideal para eventos corporativos.',
      isPremium: true,
      price: 15,
      eventTypes: ['CORPORATE', 'OTHER'],
      isActive: true,
      schema: {
        sections: ['hero', 'details', 'agenda', 'rsvp', 'map'],
        fonts: [{ display: 'Inter', body: 'Inter' }],
        colorPalettes: [
          { name: 'Dark', primary: '#1e2d3a', accent: '#64a0ff', background: '#f5f7fa' },
        ],
      },
      defaultData: {
        colorPrimary: '#1e2d3a', colorAccent: '#378add',
        layoutStyle: 'fullbleed', animationIntensity: 'minimal',
      },
    },
  })
  console.log('  ✓ Corporate Modern (premium)')

  // ── 3. EVENTO DEMO (publicado) ────────────────────────────
  console.log('\n📅 Creando evento de demostración...')

  const demoEvent = await prisma.event.upsert({
    where: { slug: 'sofia-y-miguel-2025' },
    update: {
      heroImage:  'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85&auto=format&fit=crop',
      musicUrl:   'youtube:ZbZSe6N_BXs',
      customData: {
        design: {
          colorPrimary:    '#1e2d1f',
          colorAccent:     '#b8966e',
          colorBackground: '#faf8f4',
          fontDisplay:     'Playfair Display',
          fontBody:        'Inter',
        }
      } as any,
    },
    create: {
      userId:       demo.id,
      templateId:   templateNoche.id,
      slug:         'sofia-y-miguel-2025',
      title:        'Boda de Sofía y Miguel',
      type:         'WEDDING',
      status:       'PAID',
      publishedAt:  new Date(),
      paidAt:       new Date(),
      eventDate:    new Date('2025-09-20T13:00:00'),
      timezone:     'Europe/Madrid',
      coupleNames:  'Sofía & Miguel',
      description:  'Con toda la ilusión del mundo os invitamos a compartir el día más especial de nuestras vidas. Vuestra presencia es el mejor regalo.',
      heroImage:    'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=85&auto=format&fit=crop',
      musicUrl:     'youtube:ZbZSe6N_BXs',
      venueName:    'Finca La Alameda',
      venueAddress: 'Ctra. Sevilla-Utrera km 14',
      venueCity:    'Sevilla',
      venueCountry: 'ES',
      latitude:     37.3886303,
      longitude:    -5.9953403,
      dressCode:    'Etiqueta · Se ruega no venir de blanco',
      doors:        '12:30h',
      ceremony:     '13:00h',
      reception:    '15:00h',
      locale:       'es',
      customData: {
        design: {
          colorPrimary:    '#1e2d1f',
          colorAccent:     '#b8966e',
          colorBackground: '#faf8f4',
          fontDisplay:     'Playfair Display',
          fontBody:        'Inter',
        }
      } as any,
      agendaJson: [
        { id: '1', time: '12:30h', title: 'Llegada de invitados',   description: 'Recibimiento en los jardines con copa de bienvenida' },
        { id: '2', time: '13:00h', title: 'Ceremonia civil',        description: 'En la capilla de la finca · Duración aprox. 45 min' },
        { id: '3', time: '14:00h', title: 'Aperitivo',              description: 'Selección de canapés y cócteles en la terraza' },
        { id: '4', time: '15:30h', title: 'Banquete',               description: 'Menú de 5 pasos en el salón principal · Música en directo' },
        { id: '5', time: '20:00h', title: 'Baile y celebración',    description: 'DJ hasta las 02:00h · Barra libre incluida' },
      ] as any,
    },
  })
  console.log(`  ✓ Evento creado: /event/sofia-y-miguel-2025`)

  // ── 4. INVITADOS DEL EVENTO DEMO ──────────────────────────
  console.log('\n👥 Creando invitados de demo...')

  const guestData = [
    { name: 'Ana García López',     email: 'ana@example.com',     phone: '612345678', group: 'Familia',  tableName: 'Mesa de honor', isVIP: true,  rsvp: 'CONFIRMED', companions: 1 },
    { name: 'Carlos Martínez Ruiz', email: 'carlos@example.com',  phone: '623456789', group: 'Amigos',   tableName: 'Mesa 2',        isVIP: false, rsvp: 'CONFIRMED', companions: 1 },
    { name: 'Lucía Fernández',      email: 'lucia@example.com',   phone: '634567890', group: 'Trabajo',  tableName: 'Mesa 3',        isVIP: false, rsvp: 'CONFIRMED', companions: 0 },
    { name: 'Roberto Sánchez',      email: 'roberto@example.com', phone: '645678901', group: 'Amigos',   tableName: 'Mesa 2',        isVIP: false, rsvp: 'DECLINED',  companions: 0 },
    { name: 'María López Torres',   email: 'maria@example.com',   phone: '656789012', group: 'Familia',  tableName: 'Mesa de honor', isVIP: true,  rsvp: 'CONFIRMED', companions: 2 },
    { name: 'Javier Moreno',        email: 'javier@example.com',  phone: '667890123', group: 'Amigos',   tableName: 'Mesa 4',        isVIP: false, rsvp: 'PENDING',   companions: 0 },
    { name: 'Elena Castro',         email: 'elena@example.com',   phone: '678901234', group: 'Trabajo',  tableName: 'Mesa 3',        isVIP: false, rsvp: 'CONFIRMED', companions: 1 },
    { name: 'Pablo Jiménez',        email: 'pablo@example.com',   phone: '689012345', group: 'Amigos',   tableName: 'Mesa 4',        isVIP: false, rsvp: 'PENDING',   companions: 0 },
    { name: 'Carmen Ruiz Pérez',    email: 'carmen@example.com',  phone: '690123456', group: 'Familia',  tableName: 'Mesa 5',        isVIP: false, rsvp: 'CONFIRMED', companions: 1 },
    { name: 'David Herrera',        email: 'david@example.com',   phone: '601234567', group: 'Trabajo',  tableName: 'Mesa 5',        isVIP: false, rsvp: 'CONFIRMED', companions: 0 },
    { name: 'Isabel Vargas',        email: 'isabel@example.com',  phone: '612345670', group: 'Amigos',   tableName: 'Mesa 6',        isVIP: false, rsvp: 'DECLINED',  companions: 0 },
    { name: 'Alejandro Reyes',      email: null,                  phone: '623456780', group: 'Familia',  tableName: 'Mesa 6',        isVIP: false, rsvp: 'PENDING',   companions: 0 },
  ]

  let guestCount = 0
  for (const g of guestData) {
    // Check if guest already exists
    const existing = g.email
      ? await prisma.guest.findFirst({ where: { eventId: demoEvent.id, email: g.email } })
      : null
    if (existing) continue

    const guest = await prisma.guest.create({
      data: {
        eventId:   demoEvent.id,
        name:      g.name,
        email:     g.email ?? undefined,
        phone:     g.phone,
        group:     g.group,
        tableName: g.tableName,
        isVIP:     g.isVIP,
      },
    })

    // RSVP
    await prisma.rSVP.create({
      data: {
        eventId:    demoEvent.id,
        guestId:    guest.id,
        status:     g.rsvp as any,
        companions: g.companions,
        respondedAt: g.rsvp !== 'PENDING' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      },
    })

    // Invitation
    await prisma.invitation.create({
      data: {
        eventId:        demoEvent.id,
        guestId:        guest.id,
        status:         g.rsvp !== 'PENDING' ? 'OPENED' : 'SENT',
        sentAt:         new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        openedAt:       g.rsvp !== 'PENDING' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
        channel:        ['whatsapp', 'email', 'whatsapp', 'direct'][Math.floor(Math.random() * 4)],
        personalizedUrl: `/api/invite/${guest.accessToken}`,
      },
    })

    guestCount++
  }
  console.log(`  ✓ ${guestCount} invitados creados`)

  // ── 5. CANCIONES DEMO ─────────────────────────────────────
  const songsExist = await prisma.song.findFirst({ where: { eventId: demoEvent.id } })
  if (!songsExist) {
    await prisma.song.createMany({
      data: [
        { eventId: demoEvent.id, title: 'La Vie en Rose',            artist: 'Édith Piaf',       votes: 8,  isApproved: true },
        { eventId: demoEvent.id, title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley',  votes: 12, isApproved: true },
        { eventId: demoEvent.id, title: 'Perfect',                   artist: 'Ed Sheeran',       votes: 15, isApproved: true },
        { eventId: demoEvent.id, title: 'A Thousand Years',          artist: 'Christina Perri',  votes: 10, isApproved: true },
        { eventId: demoEvent.id, title: 'Marry You',                 artist: 'Bruno Mars',       votes: 7,  isApproved: true },
        { eventId: demoEvent.id, title: 'All of Me',                 artist: 'John Legend',      votes: 9,  isApproved: true },
      ],
    })
    console.log('  ✓ 6 canciones de playlist')
  }

  // ── TIMELINE DEMO ─────────────────────────────────────────
  const timelineExist = await prisma.timelineItem.findFirst({ where: { eventId: demoEvent.id } })
  if (!timelineExist) {
    await prisma.timelineItem.createMany({
      data: [
        { eventId: demoEvent.id, title: 'Nos conocimos', description: 'Una noche de verano que ninguno de los dos olvidará. Lo que empezó como un encuentro casual se convirtió en el comienzo de todo.', date: new Date('2018-07-15'), icon: '✦', position: 0 },
        { eventId: demoEvent.id, title: 'Primera cita', description: 'Nervios, risas y horas hablando sin parar. Supimos que algo especial estaba pasando.', date: new Date('2018-08-03'), icon: '♡', position: 1 },
        { eventId: demoEvent.id, title: 'Nuestro primer viaje', description: 'Lisboa fue el escenario de nuestro primer "te quiero". Paseando por Alfama, bajo la lluvia.', date: new Date('2019-04-20'), icon: '✈️', position: 2 },
        { eventId: demoEvent.id, title: 'Nuestra casa', description: 'El día que firmamos juntos por primera vez. Convertimos cuatro paredes en nuestro hogar.', date: new Date('2021-09-01'), icon: '🏠', position: 3 },
        { eventId: demoEvent.id, title: 'La pedida', description: 'En la misma playa donde nos besamos por primera vez, Miguel se arrodilló. Entre lágrimas y risas, dije que sí.', date: new Date('2024-02-14'), icon: '💍', position: 4 },
        { eventId: demoEvent.id, title: '¡Nos casamos!', description: 'Y ahora solo nos queda celebrarlo con las personas que más queremos. ¡Os esperamos!', date: new Date('2025-09-20'), icon: '🥂', position: 5 },
      ],
    })
    console.log('  ✓ 6 momentos de timeline')
  }

  // ── 6. REGALOS DEMO ───────────────────────────────────────
  const giftsExist = await prisma.gift.findFirst({ where: { eventId: demoEvent.id } })
  if (!giftsExist) {
    await prisma.gift.createMany({
      data: [
        { eventId: demoEvent.id, name: 'Aportación luna de miel',   description: 'Tailandia & Bali',  price: null, position: 0, isTaken: true,  takenBy: 'Ana García' },
        { eventId: demoEvent.id, name: 'Batería de cocina',         description: 'Le Creuset',         price: 380,  position: 1, isTaken: false },
        { eventId: demoEvent.id, name: 'Noche en hotel',            description: 'Gran Meliá Sevilla', price: 220,  position: 2, isTaken: false },
        { eventId: demoEvent.id, name: 'Robot de cocina',           description: 'Thermomix TM6',      price: 1200, position: 3, isTaken: false },
        { eventId: demoEvent.id, name: 'Cata de vinos privada',     description: 'Marco de Jerez',     price: 160,  position: 4, isTaken: false },
      ],
    })
    console.log('  ✓ 5 regalos en lista de bodas')
  }

  // ── 7. ANALYTICS DEMO ────────────────────────────────────
  const analyticsExist = await prisma.analytics.findFirst({ where: { eventId: demoEvent.id } })
  if (!analyticsExist) {
    const channels = ['whatsapp', 'whatsapp', 'whatsapp', 'email', 'direct']
    const analyticsData = []
    for (let i = 0; i < 47; i++) {
      analyticsData.push({
        eventId:   demoEvent.id,
        type:      'page_view',
        channel:   channels[Math.floor(Math.random() * channels.length)],
        timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        sessionId: `session-${Math.random().toString(36).substring(2, 10)}`,
      })
    }
    await prisma.analytics.createMany({ data: analyticsData as any })
    console.log('  ✓ 47 visitas de analytics')
  }

  // ── 8. EVENTO ADMIN (borrador) ────────────────────────────
  console.log('\n📝 Creando evento borrador para admin...')

  await prisma.event.upsert({
    where: { slug: 'cumpleanos-ana-30' },
    update: {},
    create: {
      userId:      admin.id,
      slug:        'cumpleanos-ana-30',
      title:       'Cumpleaños de Ana — 30 años',
      type:        'BIRTHDAY',
      status:      'DRAFT',
      eventDate:   new Date('2025-10-15T20:00:00'),
      coupleNames: 'Ana',
      venueName:   'Restaurante El Mirador',
      venueCity:   'Madrid',
      dressCode:   'Informal elegante',
      locale:      'es',
    },
  })
  console.log('  ✓ Cumpleaños de Ana (borrador)')

  // ── RESUMEN ───────────────────────────────────────────────
  console.log('')
  console.log('─────────────────────────────────')
  console.log('✅ Seed completado con éxito!')
  console.log('')
  console.log('📧 USUARIOS DE ACCESO:')
  console.log('  ┌─────────────────────────────────────────────┐')
  console.log('  │  admin@invitely.app     →  admin123         │')
  console.log('  │  demo@invitely.app      →  demo1234         │')
  console.log('  │  vicente@invitely.app   →  invitely2025     │')
  console.log('  └─────────────────────────────────────────────┘')
  console.log('')
  console.log('🌐 EVENTO DEMO PUBLICADO:')
  console.log('  http://localhost:3000/event/sofia-y-miguel-2025')
  console.log('')
  console.log('🏠 DASHBOARD:')
  console.log('  http://localhost:3000/dashboard')
  console.log('─────────────────────────────────')
  console.log('')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
