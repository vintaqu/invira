# Evochi — Deploy a Producción

## 1. Base de datos (Neon — recomendado)

1. Crea cuenta en https://neon.tech
2. Crea proyecto → copia las URLs:
   - `DATABASE_URL` = connection string **pooled**
   - `DIRECT_URL` = connection string **direct** (sin pooler)
3. Ejecuta la migración inicial:
   ```bash
   npx prisma migrate deploy
   ```

## 2. Variables de entorno en Vercel

Ve a tu proyecto → Settings → Environment Variables y añade:

| Variable | Valor | Obligatoria |
|----------|-------|-------------|
| `DATABASE_URL` | URL pooled de Neon | ✅ |
| `DIRECT_URL` | URL direct de Neon | ✅ |
| `NEXTAUTH_URL` | `https://tudominio.com` | ✅ |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | ✅ |
| `NEXT_PUBLIC_APP_URL` | `https://tudominio.com` | ✅ |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ✅ |
| `RESEND_API_KEY` | `re_...` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | tu cloud name | ✅ |
| `CLOUDINARY_API_KEY` | tu api key | ✅ |
| `CLOUDINARY_API_SECRET` | tu api secret | ✅ |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Recomendada (IA) |
| `CRON_SECRET` | `openssl rand -base64 32` | Recomendada |
| `UPSTASH_REDIS_REST_URL` | URL de Upstash | Opcional (caché) |
| `UPSTASH_REDIS_REST_TOKEN` | Token de Upstash | Opcional (caché) |
| `GOOGLE_CLIENT_ID` | OAuth Google | Opcional |
| `GOOGLE_CLIENT_SECRET` | OAuth Google | Opcional |

## 3. Stripe Webhook

1. Ve a https://dashboard.stripe.com/webhooks
2. Añade endpoint: `https://tudominio.com/api/webhooks/stripe`
3. Selecciona eventos:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copia el webhook secret → `STRIPE_WEBHOOK_SECRET`

## 4. Resend (emails)

1. Crea cuenta en https://resend.com
2. Verifica tu dominio (DNS)
3. Crea API key → `RESEND_API_KEY`
4. Actualiza el FROM en `src/lib/email/index.ts`:
   ```
   const FROM = 'Evochi <hola@tudominio.com>'
   ```

## 5. Cloudinary (imágenes)

1. Crea cuenta en https://cloudinary.com
2. Copia Cloud name, API Key, API Secret
3. En Cloudinary → Settings → Upload → Add preset con nombre `evochi`

## 6. Deploy en Vercel

```bash
# Conecta el repo
vercel link

# Deploy producción
vercel --prod
```

O simplemente: push a main si tienes CI/CD configurado.

## 7. Post-deploy

```bash
# Aplica migraciones en producción
DATABASE_URL="..." npx prisma migrate deploy

# Seed de planes de precio (si la tabla está vacía)
# El endpoint /api/admin/pricing hace auto-seed en la primera visita
```

## 8. Hacer admin al primer usuario

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'tu@email.com';
```

O desde Prisma Studio:
```bash
DATABASE_URL="..." npx prisma studio
```

## Checklist final

- [ ] `NEXTAUTH_SECRET` generado con `openssl rand -base64 32`
- [ ] `CRON_SECRET` generado con `openssl rand -base64 32`
- [ ] Dominio verificado en Resend
- [ ] Webhook de Stripe apuntando al dominio de producción
- [ ] Primer usuario ascendido a ADMIN
- [ ] Precios configurados en `/admin/settings`
- [ ] OG image añadida en `/public/og-image.png` (1200×630px)
- [ ] Cookie banner verificado funcionando
