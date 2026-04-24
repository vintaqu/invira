# Evochi — SaaS de Invitaciones Digitales

> Plataforma completa para crear y gestionar invitaciones digitales para bodas, cumpleaños, bautizos, quinceañeras, graduaciones y eventos corporativos. Con RSVP online, IA generativa, QR check-in, pagos integrados y panel de analíticas.

---

## Índice

- [Demo](#demo)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [API — Endpoints](#api--endpoints)
- [Modelo de negocio](#modelo-de-negocio)
- [Instalación local](#instalación-local)
- [Variables de entorno](#variables-de-entorno)
- [Deploy en Vercel](#deploy-en-vercel)
- [Seguridad](#seguridad)
- [Scripts](#scripts)

---

## Demo

| URL | Descripción |
|-----|-------------|
| `http://localhost:3000` | Landing marketing |
| `http://localhost:3000/event/sofia-y-miguel-2025` | Invitación demo (boda) |
| `http://localhost:3000/dashboard` | Panel del usuario |
| `http://localhost:3000/admin` | Panel de administración |

**Usuarios de prueba:**

| Email | Contraseña | Rol |
|-------|-----------|-----|
| `admin@evochi.app` | `admin123` | ADMIN |
| `demo@evochi.app` | `demo1234` | USER |

---

## Características

### Creación de invitaciones
- **Wizard paso a paso** (10 pasos): tipo → modo → nombres → fecha → secciones → portada → color → tipografía → texto IA → preview
- **Editor visual** con preview en tiempo real
- **IA generativa** (Groq / Gemini) para texto personalizado por tipo de evento y tono
- **6 tipos de evento**: Boda, Cumpleaños, Bautizo, Quinceañera, Graduación, Corporativo
- **Diseño personalizable**: colores, tipografía, decoraciones (floral, geométrica, romántica, estrellas, hojas, ondas)
- **Subida de fotos** con almacenamiento en Cloudinary
- **Música de fondo** (YouTube embed o archivo de audio)

### Landing pública `/event/[slug]`
- Hero con foto a pantalla completa
- Cuenta regresiva en tiempo real
- Agenda del evento
- Mapa de ubicación
- RSVP (confirmación, acompañantes, restricciones alimentarias)
- Lista de canciones colaborativa con votación
- Lista de regalos (reserva para evitar duplicados)
- Hoteles cercanos
- Opciones de transporte
- Timeline / historia de la pareja
- Dress code
- Menú del evento
- Instagram wall
- Álbum de fotos compartido
- Acceso VIP con token privado

### Gestión de invitados
- Panel completo con búsqueda y filtros
- Importación masiva por CSV
- Invitaciones personalizadas (nombre, mesa, menú por invitado)
- QR individual descargable como PNG
- Grupos y mesas asignadas
- Marcado VIP

### RSVP y comunicaciones
- Confirmación de asistencia en un clic
- Número de acompañantes
- Restricciones alimentarias y alergias
- Recordatorios automáticos por email (cron jobs)
- Envío masivo de invitaciones

### Check-in QR
- QR único por invitado (descarga PNG)
- Escaneo en tiempo real desde móvil
- Panel de control de asistencia en el evento

### Pagos
- **Stripe** (tarjeta, Apple Pay, Google Pay)
- **PayPal** (alternativa)
- Modelo pay-per-event: pago único al publicar
- Webhooks con verificación de firma
- Descuentos por tiempo limitado desde panel admin

### Analytics
- Visitas totales y únicas
- Apertura por invitado
- Tasa de confirmación RSVP
- Tracking por canal (WhatsApp, email, directo)
- UTM source tracking

### Panel de administración `/admin`
- Gestión de usuarios (bloqueo, cambio de rol)
- Gestión de eventos
- Revenue dashboard
- Configuración de precios y descuentos
- Sistema de soporte (tickets)
- Estadísticas globales

### SEO
- 6 landing pages optimizadas por tipo de evento
- JSON-LD (WebSite, Organization, Product, FAQPage, SocialEvent)
- Sitemap dinámico
- OG Images dinámicas por evento
- Robots.txt con bloqueo de bots de scraping IA
- URLs canónicas y hreflang

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 15 (App Router) |
| Base de datos | PostgreSQL — Neon en producción |
| ORM | Prisma 5 |
| Autenticación | NextAuth v4 (JWT + Google OAuth) |
| Pagos | Stripe + PayPal |
| Emails | Resend |
| Storage | Cloudinary |
| Caché / Rate limit | Upstash Redis |
| IA | Groq (Llama 3.1) + Google Gemini (fallback) |
| QR | qrcode |
| Exportación | xlsx (Excel) |
| Validación | Zod |
| Tipografía | Playfair Display, Great Vibes, Inter |

---

## Estructura del proyecto

```
evochi/
├── prisma/
│   ├── schema.prisma          # Modelo de datos (12+ entidades)
│   ├── seed.ts                # Datos de demo
│   ├── update-demo.sql        # SQL para actualizar evento demo
│   └── migrations/
│
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing marketing
│   │   ├── layout.tsx                    # Layout raíz + metadatos
│   │   ├── sitemap.ts                    # Sitemap dinámico
│   │   ├── robots.ts
│   │   ├── event/[slug]/                 # Invitación pública
│   │   ├── checkin/[token]/              # Check-in QR
│   │   ├── i/[token]/                    # Invitación personalizada
│   │   ├── dashboard/                    # Panel usuario autenticado
│   │   │   ├── events/new/               # Wizard creación (10 pasos)
│   │   │   ├── events/[id]/              # Editor de evento
│   │   │   └── settings/
│   │   ├── admin/                        # Panel administración
│   │   │   ├── users/
│   │   │   ├── events/
│   │   │   ├── revenue/
│   │   │   ├── settings/                 # Precios y descuentos
│   │   │   └── support/
│   │   ├── invitaciones-boda/            # Landing SEO bodas
│   │   ├── invitaciones-cumpleanos/      # Landing SEO cumpleaños
│   │   ├── invitaciones-bautizo/         # Landing SEO bautizos
│   │   ├── invitaciones-quinceAnera/     # Landing SEO quinceañeras
│   │   ├── invitaciones-graduacion/      # Landing SEO graduaciones
│   │   ├── invitaciones-corporativas/    # Landing SEO corporativo
│   │   ├── legal/                        # Privacidad, términos, cookies, RGPD
│   │   └── api/                          # 41 endpoints REST
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── EventEditor.tsx           # Editor completo con tabs
│   │   │   ├── DesignEditor.tsx          # Editor visual de diseño
│   │   │   ├── TimelineEditor.tsx
│   │   │   └── PublishModal.tsx
│   │   ├── event/
│   │   │   └── EventLanding.tsx          # Invitación pública
│   │   └── landing/
│   │       └── LandingPage.tsx           # Componente compartido SEO
│   │
│   ├── modules/
│   │   ├── events/event.service.ts
│   │   ├── guests/guest.service.ts
│   │   ├── payments/payment.service.ts
│   │   ├── analytics/analytics.service.ts
│   │   └── ai/ai.service.ts              # Groq + Gemini + fallback
│   │
│   ├── lib/
│   │   ├── auth.ts                       # NextAuth + rate limit login
│   │   ├── prisma.ts
│   │   ├── rateLimit.ts                  # Redis + memoria
│   │   ├── admin.ts                      # requireAdmin() guard
│   │   ├── qr.ts
│   │   ├── cloudinary.ts
│   │   ├── redis.ts
│   │   ├── paypal.ts
│   │   ├── email/index.ts
│   │   └── utils/slug.ts
│   │
│   └── middleware.ts                     # Auth guards + security headers
│
├── .env.example
├── vercel.json                           # Config cron jobs
├── DEPLOY.md
└── CHECKLIST_PRODUCCION.md
```

---

## API — Endpoints

### Autenticación
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro con email/contraseña |
| * | `/api/auth/[...nextauth]` | Login, logout, OAuth |

### Eventos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/events` | Listar / crear eventos |
| GET/PATCH/DELETE | `/api/events/[id]` | Obtener / editar / eliminar |
| POST | `/api/events/[id]/publish` | Publicar evento |
| POST | `/api/events/[id]/send` | Enviar invitaciones por email |
| GET | `/api/events/[id]/analytics` | Analíticas |
| GET | `/api/events/[id]/export` | Exportar invitados a Excel |
| PATCH | `/api/events/[id]/design` | Configuración de diseño |

### Invitados
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/events/[id]/guests` | Listar / añadir |
| GET/PATCH/DELETE | `/api/events/[id]/guests/[guestId]` | Gestionar invitado |
| POST | `/api/events/[id]/guests/import` | Importar CSV |
| GET | `/api/events/[id]/guests/[guestId]/qr` | QR en PNG |

### Contenido del evento
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/events/[id]/songs` | Lista de canciones |
| GET/POST | `/api/events/[id]/gifts` | Lista de regalos |
| POST | `/api/events/[id]/gifts/[giftId]/take` | Reservar regalo |
| GET/POST | `/api/events/[id]/hotels` | Hoteles cercanos |
| GET/POST | `/api/events/[id]/transport` | Opciones de transporte |
| GET/POST/PATCH | `/api/events/[id]/timeline` | Agenda / timeline |

### RSVP y Check-in
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/rsvp` | Confirmar asistencia |
| GET | `/api/invite/[token]` | Datos de invitación personalizada |
| GET/POST | `/api/checkin/[token]` | Check-in QR |

### Pagos
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/payments/stripe` | Crear sesión Stripe |
| POST | `/api/payments/paypal` | Crear orden PayPal |
| POST | `/api/payments/paypal/capture` | Capturar pago PayPal |
| POST | `/api/webhooks/stripe` | Webhook (firma verificada) |

### IA
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/ai/wizard` | Texto para wizard |
| POST | `/api/ai/generate` | Texto, diseño, traducción, sugerencias |

### Otros
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/upload` | Subida imágenes/audio a Cloudinary |
| GET | `/api/pricing` | Planes y precios activos |
| PATCH | `/api/user/profile` | Actualizar perfil |
| PATCH | `/api/user/password` | Cambiar contraseña |
| POST | `/api/cron/reminders` | Recordatorios automáticos (CRON_SECRET) |

### Admin *(requiere rol ADMIN o SUPER_ADMIN)*
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/stats` | Estadísticas globales |
| GET/PATCH | `/api/admin/events` | Gestión de eventos |
| GET/PATCH/DELETE | `/api/admin/users` | Gestión de usuarios |
| GET | `/api/admin/revenue` | Ingresos |
| PATCH | `/api/admin/pricing` | Precios y descuentos |
| GET/PATCH | `/api/admin/support` | Tickets de soporte |

---

## Modelo de negocio

**Freemium → Pay-per-event** (pago único, sin suscripción mensual)

| Plan | Precio | Incluye |
|------|--------|---------|
| Preview | Gratis | Editor completo, preview privada, IA de texto |
| Esencial | Pago único | 1 evento publicado, RSVP ilimitado, 300 invitados, QR |
| Premium | Pago único | Hasta 3 eventos, invitados ilimitados, analytics avanzados |

Los precios son configurables desde el panel admin sin tocar código. Soporta descuentos con fecha de caducidad.

---

## Instalación local

### Requisitos
- Node.js 18+
- Docker Desktop

### 1. Clonar e instalar
```bash
git clone https://github.com/tu-usuario/evochi.git
cd evochi
npm install
```

### 2. Variables de entorno
```bash
cp .env.example .env.local
cp .env.example .env    # Prisma lee .env, no .env.local
```

Edita `.env.local` — mínimo necesario para arrancar:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/evochi"
DIRECT_URL="postgresql://postgres:password@localhost:5432/evochi"
NEXTAUTH_SECRET="cualquier-string-aleatorio-largo"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Base de datos
```bash
# Levantar PostgreSQL con Docker
docker run -d \
  --name evochi-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=evochi \
  -p 5432:5432 \
  postgres:15

# Ejecutar migraciones
npx prisma migrate dev --name init

# Cargar datos de demo
npm run db:seed
```

### 4. Arrancar
```bash
npm run dev
# → http://localhost:3000
```

### 5. IA (opcional pero recomendado)
```env
GROQ_API_KEY="gsk_..."   # gratis en console.groq.com
```
Sin esta clave la IA usa textos de fallback estáticos.

---

## Variables de entorno

| Variable | | Descripción |
|----------|-|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL pooled (Neon en producción) |
| `DIRECT_URL` | ✅ | PostgreSQL directo (migraciones Prisma) |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | URL pública de la app |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL pública accesible en cliente |
| `STRIPE_SECRET_KEY` | ✅ | Clave secreta Stripe |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Secret del webhook Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Clave pública Stripe |
| `RESEND_API_KEY` | ✅ | Emails |
| `EMAIL_FROM` | ✅ | `Evochi <hola@tudominio.com>` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Almacenamiento imágenes |
| `CLOUDINARY_API_KEY` | ✅ | |
| `CLOUDINARY_API_SECRET` | ✅ | |
| `CRON_SECRET` | ✅ | `openssl rand -base64 32` |
| `GROQ_API_KEY` | ⚡ | IA gratuita — console.groq.com |
| `GEMINI_API_KEY` | ⚡ | Fallback IA — aistudio.google.com |
| `UPSTASH_REDIS_REST_URL` | 🔧 | Rate limiting multi-instancia |
| `UPSTASH_REDIS_REST_TOKEN` | 🔧 | |
| `PAYPAL_CLIENT_ID` | 🔧 | Alternativa a Stripe |
| `PAYPAL_CLIENT_SECRET` | 🔧 | |
| `GOOGLE_CLIENT_ID` | 🔧 | Login con Google |
| `GOOGLE_CLIENT_SECRET` | 🔧 | |

✅ Obligatoria · ⚡ Recomendada · 🔧 Opcional

---

## Deploy en Vercel

```bash
npm i -g vercel
vercel --prod
```

**Servicios necesarios:**

| Servicio | Free tier | Link |
|----------|-----------|------|
| PostgreSQL | Neon | [neon.tech](https://neon.tech) |
| Emails | Resend (3.000/mes) | [resend.com](https://resend.com) |
| Imágenes | Cloudinary (25GB) | [cloudinary.com](https://cloudinary.com) |
| IA | Groq (14.400 req/día) | [console.groq.com](https://console.groq.com) |
| Redis | Upstash (10.000 req/día) | [upstash.com](https://upstash.com) |
| Pagos | Stripe (2.9% + 0.30€) | [stripe.com](https://stripe.com) |

**Post-deploy:**
```bash
# Ejecutar migraciones contra Neon
npx prisma migrate deploy

# Hacer admin tu usuario (en Neon SQL editor)
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

Ver [DEPLOY.md](./DEPLOY.md) para la guía completa.

---

## Seguridad

| Área | Implementación |
|------|---------------|
| Auth en rutas | JWT verificado en middleware para `/dashboard` y `/admin` |
| Brute force | Rate limit: 10 intentos/email cada 15 minutos |
| Timing attacks | bcrypt siempre se ejecuta aunque el usuario no exista |
| RSVP spam | 5 submissions/IP cada 10 minutos |
| Uploads | Validación MIME real + 20 uploads/usuario/hora |
| Stripe webhook | Firma verificada con `constructEvent()` |
| SQL injection | Imposible — Prisma usa queries parametrizadas |
| XSS | Sin `dangerouslySetInnerHTML` con input de usuario |
| Headers HTTP | HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options |
| Ownership | Todas las rutas verifican que el recurso pertenece al usuario |
| Admin | `requireAdmin()` en todas las rutas `/api/admin/*` |
| Sesiones | JWT con expiración de 30 días |
| Slugs | Solo `[a-z0-9-]` — sin caracteres especiales |

---

## Scripts

```bash
npm run dev           # Desarrollo → http://localhost:3000
npm run build         # Build de producción
npm run start         # Producción (tras build)
npm run lint          # ESLint
npm run db:seed       # Cargar datos de demo
npm run db:reset      # Reset completo + seed (⚠️ borra todo)
```

---

© 2025 Evochi — Todos los derechos reservados.
