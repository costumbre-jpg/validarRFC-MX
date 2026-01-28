# Credenciales Actuales - Maflipp
## ⚠️ DOCUMENTO PRIVADO - NO COMPARTIR HASTA CERRAR VENTA

Este documento es para que TÚ documentes todas tus credenciales actuales antes de la venta.  
**NO compartir este archivo hasta cerrar la venta (firma de contrato/acuerdo).**

---

## 📋 Información de Cuentas

### Supabase
- **URL del proyecto**: `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcndudXRvZmh6eXZ0YmJzcndoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDgzNzk1NiwiZXhwIjoyMDgwNDEzOTU2fQ.TIDMB44RO-Lzf4DTvscZz3kIBDM13aosKz795QXLGYI`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcndudXRvZmh6eXZ0YmJzcndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4Mzc5NTYsImV4cCI6MjA4MDQxMzk1Nn0.8q2jsLUOuFLGoaFAK0pQOzCU3KRTN29UB3XVSsoYOkg`
- **Project ID**: `lkrwnutofhzyvtbbsrwh`
- **Región**: `________________________________` (verificar en Supabase Dashboard)
- **Migraciones ejecutadas**: 
  1. 001_initial_schema.sql
  2. 002_api_keys.sql
  3. 003_create_user_trigger.sql
  4. 004_reset_monthly_rfc_counts.sql
  5. 005_email_alerts_preferences.sql
  6. 006_email_alerts_cron.sql
  7. 007_add_api_calls_monthly_tracking.sql
  8. 008_reset_monthly_api_calls.sql
  9. 009_team_management.sql
  10. 010_white_label.sql
  11. 011_onboarding_personalizado.sql
  12. 012_add_profile_fields.sql
  13. 012_show_brand_name.sql
  14. 013_add_profile_photo_phone.sql
  15. 014_update_subscription_status_business.sql
  16. 015_notifications.sql
  (y otras más)

### Stripe
- **Account ID**: `acct_________________` (obtener desde Stripe Dashboard → Settings → Account)
- **Modo**: `Test` ✅ (marcar el que aplica)
- **Product IDs**:
  - Plan Pro: `prod_TYrks2bYExmaJz`
  - Plan Business: `prod_TYrxUNg1AkAkKB`
- **Price IDs (Mensuales)**:
  - Pro Mes: `price_1Sbk110nh6PRqrgwt0lyJYlh`
  - Business Mes: `price_1SbkDp0nh6PRqrgwKrWhHABR`
- **Price IDs (Anuales)**:
  - Pro Annual: `price_1SfMik0nh6PRqrgwx0fF8eXt`
  - Business Annual: `price_1SfMll0nh6PRqrgwgVDsmElj`
- **Webhook endpoint actual**: `https://maflipp.com/api/stripe/webhook`
- **Webhook Signing Secret**: `whsec_zzGigZhDn17VV7PDFrbFnuNZ8U1dclJU`

### Vercel
- **Project name**: `maflipp-platform`
- **Domain actual**: `maflipp.com` / `www.maflipp.com`
- **Team/Account**: `costumbre-jpg`
- **Variables de entorno configuradas**: (todas configuradas en Vercel)
  - ✅ `NEXT_PUBLIC_SUPABASE_URL`: `https://lkrwnutofhzyvtbbsrwh.supabase.co`
  - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (ver arriba en Supabase)
  - ✅ `SUPABASE_SERVICE_ROLE_KEY`: (ver arriba en Supabase)
  - ✅ `STRIPE_SECRET_KEY`: `sk_test_...` (configurado en Vercel, no exponer en código)
  - ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: `pk_test_...` (configurado en Vercel)
  - ✅ `STRIPE_WEBHOOK_SECRET`: `whsec_...` (configurado en Vercel, no exponer en código)
  - ✅ `STRIPE_PRICE_ID_PRO`: `price_1Sbk110nh6PRqrgwt0lyJYlh`
  - ✅ `STRIPE_PRICE_ID_PRO_ANNUAL`: `price_1SfMik0nh6PRqrgwx0fF8eXt`
  - ✅ `STRIPE_PRICE_ID_BUSINESS`: `price_1SbkDp0nh6PRqrgwKrWhHABR`
  - ✅ `STRIPE_PRICE_ID_BUSINESS_ANNUAL`: `price_1SfMll0nh6PRqrgwgVDsmElj`
  - ✅ `NEXT_PUBLIC_SITE_URL`: `https://maflipp.com`
  - ✅ `UPSTASH_REDIS_REST_URL`: `https://valid-mallard-37709.upstash.io`
  - ✅ `UPSTASH_REDIS_REST_TOKEN`: (ver arriba en Upstash Redis)
  - ✅ `RESEND_API_KEY`: `re_...` (configurado en Vercel, no exponer en código)
  - ✅ `RESEND_FROM_EMAIL`: `soporte@maflipp.com`
  - ✅ `CRON_SECRET`: `mi-secret-super-seguro-123456`
  - ✅ `NEXT_PUBLIC_GA_MEASUREMENT_ID`: `G-YWD6HCK75B`
  - ✅ `NEXT_PUBLIC_SENTRY_DSN`: (ver arriba en Sentry)
  - ✅ `SENTRY_ORG`: `maflipp`
  - ✅ `SENTRY_PROJECT`: `javascript-nextjs`
  - ✅ `SENTRY_AUTH_TOKEN`: (ver arriba en Sentry)

### Dominio
- **Nombre del dominio**: `maflipp.com`
- **Registrador**: `Namecheap`
- **Email de la cuenta**: `loorjimenezyandryjavier@gmail.com`
- **Estado del dominio**: `Locked` ✅
- **Auth Code / EPP Code**: `________________________________` (obtener cuando se necesite para transferencia)
- **Privacidad WHOIS**: `Activada` / `Desactivada` (verificar en Namecheap)
- **Nameservers actuales**: 
  - `________________________________` (verificar en Namecheap cuando se necesite)
  - `________________________________`

### Upstash Redis (si aplica)
- **REST URL**: `https://valid-mallard-37709.upstash.io`
- **REST Token**: `AZNNAAIncDE3MWViOWY4MDdmNTc0Y2JiOTQ0ODhiNzQ2NjBkNjBhOXAxMzc3MDk`
- **Región**: `________________________________` (verificar en Upstash Dashboard)

### Resend (si aplica)
- **API Key**: `re_ebqXbe3R_BNfzyxPx5HbtCtDRRbJmPUdG`
- **Dominio verificado**: `maflipp.com`
- **Email remitente**: `soporte@maflipp.com`

### Google Analytics 4 (si aplica)
- **Measurement ID**: `G-YWD6HCK75B` (formato: G-XXXXXXXXXX)
- **Property ID**: `521737355`
- **Account ID**: `________________________________` (opcional)
- **URL de dashboard**: `https://analytics.google.com/analytics/web/#/p521737355/` (Página principal)

### Sentry (si aplica)
- **DSN**: `https://________________________________@sentry.io/________________________________` (formato: https://xxx@sentry.io/xxx)
- **Organization**: `________________________________` (nombre de la organización en Sentry)
- **Project**: `________________________________` (nombre del proyecto en Sentry)
- **Auth Token**: `________________________________` (token para upload de source maps, opcional)
- **URL de dashboard**: `https://sentry.io/organizations/________________________________/projects/________________________________/`

**Nota**: Si NO usas Google Analytics o Sentry, puedes dejar estas secciones en blanco o marcarlas como "No aplica".

---

## 📦 Backups Preparados

### Base de Datos
- [x] Backup SQL exportado: `backup_maflipp_2026-01-28.sql`
- [x] Ubicación del backup (en mi laptop): `C:\Users\loorj\Documents\backups_maflipp\backup_maflipp_2026-01-28.sql`
- [x] Fecha del backup: `2026-01-28`
- [x] Tamaño del archivo: `946 KB`
- **Nota**: El comprador guardará este backup en sus propias ubicaciones durante la transferencia

### Storage (Supabase)
- [x] Bucket `avatars`: Archivos descargados (8 archivos)
- [x] Bucket `branding`: Archivos descargados (9 archivos)
- [x] Ubicación de archivos (en mi laptop): `C:\Users\loorj\Documents\backups_maflipp\storage\`
  - Avatars: `C:\Users\loorj\Documents\backups_maflipp\storage\avatars\`
  - Branding: `C:\Users\loorj\Documents\backups_maflipp\storage\branding\`
- **Nota**: El comprador guardará estos archivos en sus propias ubicaciones durante la transferencia

### Código
- [x] Repositorio Git actualizado
- [x] Tag de versión creado: `v1.0-transfer` (subido a GitHub)
- [ ] Branch de transferencia: `transfer-ready` (opcional, no necesario)

---

## 📝 Notas Adicionales

### Configuraciones Especiales
- **OAuth providers habilitados**: `Google OAuth` (verificar en Supabase Dashboard → Authentication → Providers)
- **Redirect URLs configuradas**: 
  - `https://maflipp.com/auth/callback`
  - `https://maflipp.com/pwa`
- **Cron jobs configurados**: 
  - Endpoint: `/api/alerts/send`
  - Secret: `mi-secret-super-seguro-123456`
- **Otras configuraciones importantes**: 
  - Rate limiting con Upstash Redis
  - Email alerts con Resend
  - Monitoreo con Sentry
  - Analytics con Google Analytics 4

### Usuarios/Suscripciones Activas
- **Número de usuarios activos**: `0` (MVP sin usuarios activos)
- **Suscripciones activas en Stripe**: `0` (MVP sin suscripciones activas)
- **Notas sobre migración de usuarios**: `No hay usuarios que migrar - MVP avanzado sin tracción`

### Costos Operativos Actuales
- **Supabase (mensual)**: `$0` (Plan Free)
- **Vercel (mensual)**: `$0` (Plan Free/Hobby)
- **Stripe (comisiones)**: `2.9% + $0.30` por transacción (cuando haya pagos)
- **Upstash Redis (mensual)**: `$0` (Plan Free) o `$10+` (si escala)
- **Resend (mensual)**: `$0` (Plan Free hasta 3,000 emails/mes) o `$20+` (si escala)
- **Otros servicios**: `$0` (Google Analytics y Sentry tienen planes gratuitos)

---

## ✅ Checklist Pre-Transferencia

Antes de iniciar la transferencia, asegúrate de tener:

- [x] Todas las credenciales documentadas arriba (pendiente: Stripe Account ID)
- [x] Backup completo de base de datos
- [x] Archivos de Storage descargados (si aplica)
- [x] Repositorio Git actualizado y etiquetado
- [x] Documentación técnica revisada
- [ ] Contrato/acuerdo de venta firmado
- [ ] Plan de transferencia acordado con comprador

---

## 🔒 Seguridad

**IMPORTANTE**:
- Este documento contiene información sensible
- NO compartir hasta cerrar la venta
- Guardar en lugar seguro (encriptado si es posible)
- Después de la transferencia, cambiar todas las contraseñas
- Eliminar este archivo o moverlo a lugar seguro después de la venta

---

**Fecha de creación**: `2026-01-28`  
**Última actualización**: `2026-01-28`
