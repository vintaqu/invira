# INVITELY — SaaS de Invitaciones Digitales
## Arquitectura Completa & Deploy

---

## 📁 ESTRUCTURA DEL PROYECTO

```
invitely/
├── prisma/
│   └── schema.prisma              ✅ Generado
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx               (Landing marketing)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx       (Overview)
│   │   │   │   └── events/
│   │   │   │       ├── page.tsx   (Listado)
│   │   │   │       ├── new/page.tsx
│   │   │   │       └── [id]/
│   │   │   │           ├── page.tsx     (Editor)
│   │   │   │           ├── guests/page.tsx
│   │   │   │           ├── analytics/page.tsx
│   │   │   │           └── checkin/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── event/
│   │   │   └── [slug]/
│   │   │       └── page.tsx       ✅ Landing pública
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── events/
│   │       │   ├── route.ts       ✅ GET, POST
│   │       │   └── [id]/
│   │       │       ├── route.ts   (GET, PATCH, DELETE)
│   │       │       ├── publish/route.ts
│   │       │       ├── guests/route.ts
│   │       │       ├── guests/import/route.ts
│   │       │       ├── analytics/route.ts
│   │       │       └── export/route.ts
│   │       ├── rsvp/route.ts
│   │       ├── checkin/[token]/route.ts
│   │       ├── invite/[token]/route.ts
│   │       ├── ai/generate/route.ts
│   │       ├── payments/
│   │       │   └── checkout/route.ts
│   │       └── webhooks/
│   │           └── stripe/route.ts ✅ Generado
│   │
│   ├── modules/
│   │   ├── events/
│   │   │   ├── event.service.ts   ✅ Generado
│   │   │   ├── event.repository.ts
│   │   │   └── event.controller.ts
│   │   ├── guests/
│   │   │   ├── guest.service.ts   ✅ Generado
│   │   │   ├── guest.repository.ts
│   │   │   └── guest.controller.ts
│   │   ├── payments/
│   │   │   └── payment.service.ts ✅ Generado
│   │   ├── analytics/
│   │   │   └── analytics.service.ts ✅ Generado
│   │   ├── ai/
│   │   │   └── ai.service.ts      ✅ Generado
│   │   └── templates/
│   │       ├── template.service.ts
│   │       └── templates/
│   │           ├── elegante-boda.json
│   │           └── moderno-corp.json
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── redis.ts
│   │   ├── cloudinary.ts
│   │   ├── qr.ts
│   │   ├── email/
│   │   │   └── index.ts           ✅ Generado
│   │   └── utils/
│   │       ├── slug.ts
│   │       └── export.ts
│   │
│   └── components/
│       ├── ui/
│       ├── event/
│       │   ├── CountdownTimer.tsx
│       │   ├── RSVPForm.tsx
│       │   ├── MapboxMap.tsx
│       │   ├── PlaylistSection.tsx
│       │   ├── GiftRegistry.tsx
│       │   ├── InstagramWall.tsx
│       │   └── AgendaTimeline.tsx
│       └── dashboard/
│           ├── EventEditor.tsx
│           ├── GuestTable.tsx
│           └── AnalyticsDashboard.tsx
│
├── .env.local                     (Ver sección ENV)
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## ⚙️ VARIABLES DE ENTORNO (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:5432/invitely?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:5432/invitely"

# Auth
NEXTAUTH_URL="https://invitely.app"
NEXTAUTH_SECRET="super-secret-32-chars-min"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Resend (Email)
RESEND_API_KEY="re_..."

# Cloudinary
CLOUDINARY_CLOUD_NAME="invitely"
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1..."

# Anthropic (AI)
ANTHROPIC_API_KEY="sk-ant-..."

# App
NEXT_PUBLIC_APP_URL="https://invitely.app"
```

---

## 🚀 DEPLOY EN VERCEL

### 1. Setup inicial
```bash
# Clonar e instalar
git clone https://github.com/tu-usuario/invitely
cd invitely
npm install

# Base de datos (Neon recomendado)
npx prisma migrate dev --name init
npx prisma db seed   # Seeds de templates

# Dev local
npm run dev
```

### 2. Deploy Vercel
```bash
npm i -g vercel
vercel login
vercel --prod

# Variables de entorno en Vercel Dashboard:
# Settings → Environment Variables → pegar todas las del .env.local
```

### 3. Stripe Webhooks
```bash
# En dashboard.stripe.com → Webhooks → Add endpoint
# URL: https://invitely.app/api/webhooks/stripe
# Eventos a escuchar:
#   - checkout.session.completed
#   - payment_intent.payment_failed
#   - charge.refunded
```

### 4. Dominio personalizado
```bash
# Vercel → Settings → Domains
# Añadir: invitely.app → configurar DNS
# Añadir: *.invitely.app → wildcard para custom domains
```

---

## 📦 PACKAGE.JSON

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "@prisma/client": "^5.14.0",
    "next-auth": "^4.24.0",
    "stripe": "^16.0.0",
    "resend": "^3.0.0",
    "cloudinary": "^2.4.0",
    "@anthropic-ai/sdk": "^0.27.0",
    "zod": "^3.23.0",
    "qrcode": "^1.5.3",
    "xlsx": "^0.18.5",
    "@upstash/redis": "^1.34.0",
    "framer-motion": "^11.0.0"
  },
  "devDependencies": {
    "prisma": "^5.14.0",
    "typescript": "^5.5.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 🔑 ENDPOINTS API COMPLETOS

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | /api/events | ✅ | Listar eventos del usuario |
| POST | /api/events | ✅ | Crear evento |
| GET | /api/events/[id] | ✅ | Obtener evento (owner) |
| PATCH | /api/events/[id] | ✅ | Actualizar evento |
| DELETE | /api/events/[id] | ✅ | Eliminar evento |
| POST | /api/events/[id]/publish | ✅ | Iniciar checkout para publicar |
| GET | /api/events/[id]/guests | ✅ | Listar invitados |
| POST | /api/events/[id]/guests | ✅ | Añadir invitado |
| POST | /api/events/[id]/guests/import | ✅ | Importar CSV |
| GET | /api/events/[id]/export?format=excel | ✅ | Exportar Excel |
| GET | /api/events/[id]/analytics | ✅ | Analytics dashboard |
| POST | /api/rsvp | ❌ | Confirmar asistencia (público) |
| GET | /api/invite/[token] | ❌ | Redirect a invitación personalizada |
| POST | /api/checkin/[token] | ❌ | Check-in por QR |
| POST | /api/ai/generate | ✅ | Generar texto/diseño con IA |
| POST | /api/payments/checkout | ✅ | Crear sesión Stripe |
| POST | /api/webhooks/stripe | ❌ | Webhook Stripe |

---

## 💰 PRICING SUGERIDO

| Plan | Precio | Incluye |
|------|--------|---------|
| Preview | Gratis | Crear y editar, no publicar |
| Esencial | €29/evento | Publicar, RSVP, 100 invitados |
| Premium | €59/evento | Todo + Analytics, Recordatorios |
| Ilimitado | €99/evento | Todo + Dominio propio, IA, QR |

**Upsells:**
- Template premium: €15
- Dominio personalizado: €49/año
- Analytics avanzados: €9/evento
- Recordatorios automáticos: €7/evento

---

## 🚀 ESTRATEGIAS VIRALES

1. **"Powered by Invitely"** en footer de cada invitación (link orgánico viral)
2. **Watermark removible** como upsell (€5 extra)
3. **Hashtag tracking** — cuando un invitado pone #MaríaYCarlos2025 en Instagram
4. **Referral program** — descuento por cada boda referida
5. **Álbum público post-boda** — la invitación se convierte en recuerdo compartible
6. **RSVP social** — "Sofía González ha confirmado su asistencia" (con permiso)

---

## 🧠 IDEAS DE MONETIZACIÓN ADICIONALES

1. **Marketplace de fotógrafos/floristas** — comisión por lead cualificado
2. **Seguro de cancelación de eventos** — partnership con aseguradoras
3. **Spotify integration premium** — playlist oficial del evento exportable
4. **Libro de firmas digital** imprimible en físico (via Printful API)
5. **Servicio white-label** para wedding planners (B2B)
6. **API pública** para integraciones — €29/mes para developers
7. **Tienda de recuerdos** post-evento (álbum físico, caneca, imán)
