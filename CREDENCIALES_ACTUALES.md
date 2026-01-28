# Credenciales Actuales - Maflipp
## ⚠️ DOCUMENTO PRIVADO - NO COMPARTIR HASTA CERRAR VENTA

Este documento es para que TÚ documentes todas tus credenciales actuales antes de la venta.  
**NO compartir este archivo hasta cerrar la venta (firma de contrato/acuerdo).**

---

## 📋 Información de Cuentas

### Supabase
- **URL del proyecto**: `https://________________.supabase.co`
- **Service Role Key**: `________________________________`
- **Anon Key**: `________________________________`
- **Project ID**: `________________________________`
- **Región**: `________________________________`
- **Migraciones ejecutadas**: Ver `MIGRACIONES_LISTA.md`

### Stripe
- **Account ID**: `acct_________________`
- **Modo**: `Test` / `Live` (marcar el que aplica)
- **Product IDs**:
  - Plan Pro: `prod_________________`
  - Plan Business: `prod_________________`
- **Price IDs (Mensuales)**:
  - Pro Mes: `price_________________`
  - Business Mes: `price_________________`
- **Price IDs (Anuales)**:
  - Pro Annual: `price_________________`
  - Business Annual: `price_________________`
- **Webhook endpoint actual**: `https://________________.vercel.app/api/stripe/webhook`
- **Webhook Signing Secret**: `whsec_________________`

### Vercel
- **Project name**: `________________________________`
- **Domain actual**: `________________________________`
- **Team/Account**: `________________________________`
- **Variables de entorno configuradas**: (lista todas)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_ID_PRO`
  - `STRIPE_PRICE_ID_PRO_ANNUAL`
  - `STRIPE_PRICE_ID_BUSINESS`
  - `STRIPE_PRICE_ID_BUSINESS_ANNUAL`
  - `NEXT_PUBLIC_SITE_URL`
  - `UPSTASH_REDIS_REST_URL` (si aplica)
  - `UPSTASH_REDIS_REST_TOKEN` (si aplica)
  - `RESEND_API_KEY` (si aplica)
  - `RESEND_FROM_EMAIL` (si aplica)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (si aplica)
  - `NEXT_PUBLIC_SENTRY_DSN` (si aplica)
  - Otras: `________________________________`

### Dominio
- **Nombre del dominio**: `________________________________`
- **Registrador**: `________________________________` (ej: Namecheap, GoDaddy, Cloudflare, etc.)
- **Email de la cuenta**: `________________________________`
- **Estado del dominio**: `Locked` / `Unlocked`
- **Auth Code / EPP Code**: `________________________________` (obtener cuando se necesite)
- **Privacidad WHOIS**: `Activada` / `Desactivada`
- **Nameservers actuales**: 
  - `________________________________`
  - `________________________________`

### Upstash Redis (si aplica)
- **REST URL**: `https://________________________________.upstash.io`
- **REST Token**: `________________________________`
- **Región**: `________________________________`

### Resend (si aplica)
- **API Key**: `re_________________________________`
- **Dominio verificado**: `________________________________`
- **Email remitente**: `________________________________`

### Google Analytics 4 (si aplica)
- **Measurement ID**: `G-________________________________` (formato: G-XXXXXXXXXX)
- **Property ID**: `________________________________`
- **Account ID**: `________________________________` (opcional)
- **URL de dashboard**: `https://analytics.google.com/analytics/web/#/p________________________________/`

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
- [ ] Repositorio Git actualizado
- [ ] Tag de versión creado: `v1.0-transfer`
- [ ] Branch de transferencia: `transfer-ready`

---

## 📝 Notas Adicionales

### Configuraciones Especiales
- **OAuth providers habilitados**: `________________________________`
- **Redirect URLs configuradas**: 
  - `________________________________`
  - `________________________________`
- **Cron jobs configurados**: `________________________________`
- **Otras configuraciones importantes**: 
  - `________________________________`
  - `________________________________`

### Usuarios/Suscripciones Activas
- **Número de usuarios activos**: `________________________________`
- **Suscripciones activas en Stripe**: `________________________________`
- **Notas sobre migración de usuarios**: `________________________________`

### Costos Operativos Actuales
- **Supabase (mensual)**: `$________________________________`
- **Vercel (mensual)**: `$________________________________`
- **Stripe (comisiones)**: `%________________________________`
- **Upstash Redis (mensual)**: `$________________________________` (si aplica)
- **Resend (mensual)**: `$________________________________` (si aplica)
- **Otros servicios**: `$________________________________`

---

## ✅ Checklist Pre-Transferencia

Antes de iniciar la transferencia, asegúrate de tener:

- [ ] Todas las credenciales documentadas arriba
- [ ] Backup completo de base de datos
- [ ] Archivos de Storage descargados (si aplica)
- [ ] Repositorio Git actualizado y etiquetado
- [ ] Documentación técnica revisada
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

**Fecha de creación**: `________________________________`  
**Última actualización**: `________________________________`
