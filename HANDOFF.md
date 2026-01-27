# Handoff para venta

Este documento resume lo mínimo que un comprador necesita para poner la plataforma en producción.

## 1) Setup rápido

- Instalar dependencias: `npm install`
- Crear `.env.local` desde `env.template`
- Ejecutar migraciones SQL en Supabase (`supabase/migrations/`)
- Levantar local: `npm run dev`

## 2) Servicios externos

### Supabase
- Authentication habilitado (Email + Google si aplica)
- Database + RLS activado (ver migraciones)
- Storage buckets públicos:
  - `avatars`
  - `branding`

### Stripe
- Productos + precios configurados
- Webhook en: `/api/stripe/webhook`
- Variables de entorno `STRIPE_*`

### Resend (emails)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Cron (opcional)
- Endpoint: `/api/alerts/send`
- Header: `x-cron-secret: <CRON_SECRET>`

### Upstash Redis (opcional)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 3) Notas operativas

- El SAT puede fallar por disponibilidad externa.
- Existe modo demo solo para RFCs de ejemplo si el SAT no responde.
- El dashboard se actualiza en tiempo real con validaciones nuevas.
- El conteo de validaciones en modo demo se guarda en `localStorage`.
- La recarga de API Keys está deshabilitada por defecto (`ENABLE_API_KEY_RECHARGE=false`).
- El endpoint de test-upgrade está deshabilitado en producción (`ALLOW_TEST_UPGRADE=false`).
- La validación CFDI requiere integración con proveedor PAC/SAT.

## 4) Checklist de producción

- Configurar dominio y SSL
- Backups automáticos en Supabase (PITR)
- Logs y monitoreo (Vercel + Supabase)
- Política de privacidad y términos

## 5) Qué revisar después de la venta

- Actualizar branding final
- Revisar planes y precios en Stripe
- Validar onboarding real con emails

