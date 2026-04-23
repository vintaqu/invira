# ✅ Checklist Pre-Producción — Invitely

## Infraestructura
- [ ] Base de datos Neon creada y connection strings copiadas
- [ ] `npx prisma migrate deploy` ejecutado contra Neon (sin `--dev`)
- [ ] Dominio verificado en Resend (SPF + DKIM + DMARC)
- [ ] Cuenta Stripe en modo Live activada
- [ ] Webhook Stripe configurado → `https://tudominio.com/api/webhooks/stripe`
  - Eventos: `checkout.session.completed`, `payment_intent.payment_failed`, `charge.refunded`
- [ ] Cuenta Cloudinary creada
- [ ] Upstash Redis creado (plan gratuito suficiente)

## PayPal (opcional)
- [ ] Cuenta PayPal Business creada
- [ ] App creada en https://developer.paypal.com/dashboard
- [ ] `PAYPAL_CLIENT_ID` configurado en Vercel
- [ ] `PAYPAL_CLIENT_SECRET` configurado en Vercel
- [ ] `PAYPAL_MODE=live` en producción (`sandbox` para pruebas)
- [ ] Webhook PayPal configurado (opcional, para notificaciones de reembolso)
- [ ] Test de pago con cuenta PayPal sandbox antes de go-live

## Variables de entorno en Vercel
- [ ] `DATABASE_URL` → Neon pooled connection
- [ ] `DIRECT_URL` → Neon direct connection
- [ ] `NEXTAUTH_URL` → tu dominio exacto (ej: `https://invitely.app`)
- [ ] `NEXTAUTH_SECRET` → generado con `openssl rand -base64 32`
- [ ] `STRIPE_SECRET_KEY` → `sk_live_...`
- [ ] `STRIPE_WEBHOOK_SECRET` → `whsec_...`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
- [ ] `RESEND_API_KEY` → `re_...`
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] `ANTHROPIC_API_KEY` → `sk-ant-...`
- [ ] `CRON_SECRET` → generado con `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_APP_URL` → `https://tudominio.com`

## Tests end-to-end (hacer antes de anunciar)
- [ ] Registro de nuevo usuario
- [ ] Login con email/password
- [ ] Crear evento desde dashboard
- [ ] Publicar evento (pago Stripe con tarjeta `4242 4242 4242 4242`)
- [ ] Ver invitación pública en `/event/[slug]`
- [ ] RSVP funciona (confirmar asistencia)
- [ ] Email de confirmación RSVP llega
- [ ] Descargar Excel de invitados
- [ ] Check-in QR funciona en móvil
- [ ] Panel admin accesible con `admin@invitely.app`
- [ ] Webhook Stripe dispara y activa el evento

## SEO y Social
- [ ] `public/og-image.jpg` creada (1200×630px)
- [ ] Verificar preview WhatsApp: wa.me → pega el enlace
- [ ] Google Search Console: añadir propiedad y subir sitemap
- [ ] Sitemap visible en `tudominio.com/sitemap.xml`
- [ ] Robots.txt visible en `tudominio.com/robots.txt`

## Seguridad
- [ ] NEXTAUTH_SECRET único y seguro (no el de desarrollo)
- [ ] CRON_SECRET configurado en Vercel
- [ ] Stripe en modo Live (no Test)
- [ ] Dominio con HTTPS (automático en Vercel)
- [ ] Sin credenciales en el repositorio (revisar git log)

## Post-deploy
- [ ] Crear primer evento real de prueba
- [ ] Verificar que los emails llegan desde tu dominio (no @resend.dev)
- [ ] Monitorizar primeros errores en Vercel → Functions → Logs

---
**Tiempo estimado de setup:** 2-3 horas la primera vez
**Coste mensual inicial:** ~0€ (todos los servicios en tier gratuito)
