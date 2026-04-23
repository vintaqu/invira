# Invitely — SaaS de Invitaciones Digitales

Plataforma completa para crear invitaciones digitales para bodas, cumpleaños y eventos corporativos.

## Stack
Next.js 15 · PostgreSQL (Prisma) · NextAuth · Stripe · Resend · Cloudinary · Upstash Redis · Anthropic Claude

---

## Desarrollo local

### 1. Requisitos
- Node.js 18+
- Docker Desktop (para PostgreSQL local)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar entorno
```bash
# Copia las variables de entorno
cp .env.example .env.local
# También necesario para Prisma:
cp .env.example .env
```
Edita `.env.local` con tus valores (mínimo: DATABASE_URL, NEXTAUTH_SECRET).

### 4. Base de datos local
```bash
# Levanta PostgreSQL con Docker
docker run -d --name invitely-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=invitely -p 5432:5432 postgres:15

# Ejecuta las migraciones
npx prisma migrate dev --name init

# Carga datos de prueba
npm run db:seed
```

### 5. Arrancar
```bash
npm run dev
# → http://localhost:3000
```

### Usuarios de prueba
| Email | Password | Rol |
|-------|----------|-----|
| admin@invitely.app | admin123 | ADMIN |
| demo@invitely.app | demo1234 | USER |

Demo de invitación: `http://localhost:3000/event/sofia-y-miguel-2025?preview=1`  
Panel admin: `http://localhost:3000/admin`

---

## Deploy en Vercel

Ver [DEPLOY.md](./DEPLOY.md) para instrucciones completas.

**Resumen rápido:**
1. Crea una base de datos en [neon.tech](https://neon.tech)
2. Verifica tu dominio en [resend.com](https://resend.com)
3. Activa Stripe en modo live
4. Deploy en Vercel con todas las env vars del `.env.example`
5. Ejecuta `npx prisma migrate deploy` apuntando a Neon

---

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing marketing
│   ├── dashboard/          # Panel del usuario
│   ├── admin/              # Panel de administración
│   ├── event/[slug]/       # Invitación pública
│   ├── checkin/[token]/    # Check-in QR
│   ├── legal/              # Privacidad, términos, cookies
│   └── api/                # 37 endpoints API
├── components/
│   ├── dashboard/          # EventEditor, DesignEditor, TimelineEditor
│   └── event/              # EventLanding (invitación pública)
├── modules/                # Servicios de negocio
│   ├── events/             # EventService
│   ├── guests/             # GuestService
│   ├── payments/           # PaymentService (Stripe)
│   ├── analytics/          # AnalyticsService
│   └── ai/                 # AIService (Claude)
└── lib/                    # Utilidades compartidas
```

---

## Scripts disponibles

```bash
npm run dev          # Desarrollo local
npm run build        # Build de producción
npm run db:seed      # Cargar datos de prueba
npm run db:reset     # Reset + seed (⚠️ borra todo)
```

---

## Licencia
Privado — todos los derechos reservados.
