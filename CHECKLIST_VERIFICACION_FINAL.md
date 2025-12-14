# ✅ Checklist de Verificación Final - Producción

Este documento verifica que **TODO** esté configurado correctamente para que la plataforma funcione para los usuarios.

---

## 🔐 1. Variables de Entorno en Vercel

### ✅ Verificado: 12 variables configuradas

**Obligatorias (9):**
- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `SUPABASE_SERVICE_ROLE_KEY`
- [x] `STRIPE_SECRET_KEY`
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [x] `STRIPE_WEBHOOK_SECRET`
- [x] `STRIPE_PRICE_ID_PRO`
- [x] `STRIPE_PRICE_ID_BUSINESS`
- [x] `NEXT_PUBLIC_SITE_URL`

**Opcionales (3):**
- [x] `RESEND_API_KEY` (para emails)
- [x] `RESEND_FROM_EMAIL` (para emails)
- [x] `CRON_SECRET` (o variable adicional)

**✅ Estado: COMPLETO**

---

## 🗄️ 2. Migraciones SQL en Supabase

### Verificar que todas las migraciones estén ejecutadas:

**Migraciones Básicas (Críticas):**
- [ ] `001_initial_schema.sql` - Tablas básicas (users, validations, subscriptions)
- [ ] `002_api_keys.sql` - Sistema de API Keys
- [ ] `003_create_user_trigger.sql` - ⚠️ **CRÍTICO** - Trigger para crear usuarios automáticamente

**Migraciones Adicionales:**
- [ ] `004_reset_monthly_rfc_counts.sql` - Reset mensual de contadores
- [ ] `005_email_alerts_preferences.sql` - Alertas por email
- [ ] `006_email_alerts_cron.sql` - Cron para alertas (opcional)
- [ ] `007_add_api_calls_monthly_tracking.sql` - Tracking de llamadas API
- [ ] `008_reset_monthly_api_calls.sql` - Reset mensual de API calls
- [ ] `009_team_management.sql` - Gestión de equipo
- [ ] `010_white_label.sql` - White Label
- [ ] `011_onboarding_personalizado.sql` - Onboarding personalizado
- [ ] `012_add_profile_fields.sql` - Campos de perfil
- [ ] `013_add_profile_photo_phone.sql` - Foto y teléfono

**Migraciones de Estadísticas:**
- [ ] `EJECUTAR_MIGRACION_ESTADISTICAS_ALERTAS.sql` - Estadísticas y alertas

**✅ Cómo verificar:**
1. Ve a Supabase Dashboard → **Table Editor**
2. Deberías ver estas tablas:
   - `users`
   - `validations`
   - `subscriptions`
   - `api_keys`
   - `api_usage_logs`
   - `email_alert_preferences`
   - `email_alerts_sent`
   - `team_members`
   - `white_label_settings`
   - `onboarding_requests`

**⚠️ IMPORTANTE:** Si falta alguna tabla, ejecuta la migración correspondiente.

---

## 🔄 3. Trigger de Usuario (CRÍTICO)

### Verificar que el trigger esté creado:

**SQL para verificar:**
```sql
SELECT tgname, tgrelid::regclass 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
```

**✅ Debe existir:** `on_auth_user_created`

**⚠️ Si no existe:** Ejecuta `supabase/migrations/003_create_user_trigger.sql`

**✅ Estado: Verificar en Supabase**

---

## 🔗 4. Configuración de Supabase Auth

### URLs de Redirección (CRÍTICO)

**En Supabase Dashboard → Authentication → URL Configuration:**

- [ ] **Site URL**: `https://tu-dominio.vercel.app` (tu dominio de producción)
- [ ] **Redirect URLs** debe incluir:
  - `https://tu-dominio.vercel.app/auth/callback`
  - `https://tu-dominio.vercel.app/**` (wildcard para desarrollo)

**⚠️ Sin esto, el registro/login NO funcionará correctamente.**

**✅ Estado: Verificar en Supabase Dashboard**

---

## 📧 5. Configuración de Email en Supabase

### Email Provider

- [ ] **Authentication → Providers → Email** debe estar **HABILITADO**
- [ ] Verifica que los templates de email estén configurados (opcional pero recomendado)

**✅ Estado: Verificar en Supabase Dashboard**

---

## 💳 6. Configuración de Stripe

### Webhook (CRÍTICO para pagos)

**En Stripe Dashboard → Developers → Webhooks:**

- [ ] Webhook creado con URL: `https://tu-dominio.vercel.app/api/stripe/webhook`
- [ ] Eventos seleccionados:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] **Signing secret** copiado a `STRIPE_WEBHOOK_SECRET` en Vercel

**✅ Estado: Verificar en Stripe Dashboard**

### Productos y Precios

- [ ] Producto "Plan Pro" creado con Price ID → `STRIPE_PRICE_ID_PRO`
- [ ] Producto "Plan Business" creado con Price ID → `STRIPE_PRICE_ID_BUSINESS`

**✅ Estado: Verificar en Stripe Dashboard**

---

## 📬 7. Configuración de Resend (Opcional)

### Si configuraste emails:

- [ ] Cuenta creada en [Resend.com](https://resend.com)
- [ ] API Key creada → `RESEND_API_KEY` en Vercel
- [ ] Dominio verificado (o usar `onboarding@resend.dev` para pruebas)
- [ ] `RESEND_FROM_EMAIL` configurado en Vercel

**✅ Estado: Verificar si usas emails**

---

## 🌐 8. Configuración de Dominio en Vercel

### Dominio Personalizado

- [ ] Dominio agregado en Vercel Dashboard → Settings → Domains
- [ ] DNS configurado correctamente
- [ ] SSL/HTTPS activado (automático en Vercel)

**✅ Estado: Verificar en Vercel Dashboard**

---

## 🧪 9. Pruebas Funcionales

### Pruebas Básicas (Hacer después del deploy):

- [ ] **Registro de usuario:**
  - Crear cuenta nueva
  - Verificar que se crea en Supabase Auth
  - Verificar que se crea en tabla `users` (gracias al trigger)

- [ ] **Login:**
  - Iniciar sesión con cuenta creada
  - Verificar redirección a dashboard

- [ ] **Validación RFC:**
  - Validar un RFC desde el dashboard
  - Verificar que se guarda en tabla `validations`
  - Verificar que el contador se actualiza

- [ ] **Dashboard:**
  - Verificar que muestra estadísticas
  - Verificar que muestra historial

### Pruebas de Pagos (Si configuraste Stripe):

- [ ] **Checkout:**
  - Click en "Mejorar Plan" (Pro o Business)
  - Completar checkout en Stripe
  - Verificar que redirige a `/dashboard/billing?success=true`
  - Verificar que el plan se actualiza en Supabase

- [ ] **Webhook:**
  - Verificar en Stripe Dashboard → Webhooks → Logs
  - Debe mostrar eventos recibidos correctamente

### Pruebas de Funcionalidades Avanzadas:

- [ ] **API Keys (Pro/Business):**
  - Crear API Key
  - Usar API Key para validar RFC
  - Verificar que se registra en `api_usage_logs`

- [ ] **Gestión de Equipo (Pro/Business):**
  - Invitar miembro
  - Verificar que se crea en `team_members`
  - (Si configuraste Resend) Verificar que se envía email

- [ ] **Alertas por Email (Pro/Business):**
  - Configurar alertas en "Mi Cuenta"
  - Verificar que se guarda en `email_alert_preferences`

- [ ] **White Label (Business):**
  - Configurar branding
  - Verificar que se guarda en `white_label_settings`

---

## 🔍 10. Verificación de Logs

### Después del deploy, verificar:

- [ ] **Vercel Logs:**
  - Ve a Vercel Dashboard → Tu proyecto → Logs
  - Verifica que no hay errores críticos
  - Verifica que las conexiones a Supabase funcionan

- [ ] **Supabase Logs:**
  - Ve a Supabase Dashboard → Logs
  - Verifica que no hay errores de RLS
  - Verifica que las queries funcionan

- [ ] **Stripe Logs:**
  - Ve a Stripe Dashboard → Developers → Logs
  - Verifica que los webhooks se reciben correctamente

---

## ✅ Resumen Final

### ✅ Completado:
- [x] Variables de entorno configuradas (12/12)
- [ ] Migraciones SQL ejecutadas (verificar)
- [ ] Trigger de usuario creado (verificar)
- [ ] URLs de redirección configuradas (verificar)
- [ ] Webhook de Stripe configurado (verificar)
- [ ] Pruebas funcionales (hacer después del deploy)

### ⚠️ Pendiente de Verificar:
1. **Migraciones SQL** - Verificar que todas estén ejecutadas
2. **Trigger de usuario** - Verificar que existe
3. **URLs de redirección en Supabase** - Configurar con tu dominio de producción
4. **Webhook de Stripe** - Configurar con tu URL de producción
5. **Pruebas funcionales** - Hacer después del deploy

---

## 🚀 Próximos Pasos

1. **Verifica las migraciones SQL** ejecutando los scripts de verificación
2. **Configura las URLs de redirección** en Supabase con tu dominio de producción
3. **Configura el webhook de Stripe** con tu URL de producción
4. **Haz un redeploy** en Vercel
5. **Ejecuta las pruebas funcionales** listadas arriba

---

## 🆘 Si algo no funciona

### Error: "Usuario no se crea en tabla users"
- **Solución:** Verifica que el trigger `on_auth_user_created` existe
- Ejecuta: `supabase/migrations/003_create_user_trigger.sql`

### Error: "Redirect URL mismatch"
- **Solución:** Agrega tu URL de producción a Redirect URLs en Supabase

### Error: "Stripe webhook failed"
- **Solución:** Verifica que la URL del webhook sea correcta y que `STRIPE_WEBHOOK_SECRET` coincida

### Error: "Emails no se envían"
- **Solución:** Verifica que `RESEND_API_KEY` esté configurada y que el dominio esté verificado

---

**✅ Una vez completado este checklist, tu plataforma estará 100% lista para producción!**

