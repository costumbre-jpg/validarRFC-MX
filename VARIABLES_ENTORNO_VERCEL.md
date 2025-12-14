# 🔐 Variables de Entorno para Vercel

Este documento lista **todas las variables de entorno** que necesitas configurar en Vercel para que la plataforma funcione completamente.

---

## 📋 Cómo Agregar Variables en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** → **Environment Variables**
3. Agrega cada variable una por una
4. Selecciona los **entornos** donde aplica (Production, Preview, Development)
5. Click en **Save**

---

## ✅ Variables OBLIGATORIAS (Críticas)

### 🔵 Supabase (Base de Datos)

Estas variables son **OBLIGATORIAS** para que la plataforma funcione:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**Dónde obtenerlas:**
- Ve a Supabase Dashboard → **Settings** → **API**
- `NEXT_PUBLIC_SUPABASE_URL` = **Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = **anon/public key**
- `SUPABASE_SERVICE_ROLE_KEY` = **service_role key** (mantén esto secreto)

**⚠️ IMPORTANTE:** 
- `NEXT_PUBLIC_*` son públicas (visibles en el cliente)
- `SUPABASE_SERVICE_ROLE_KEY` es privada (solo servidor)

---

### 💳 Stripe (Pagos)

Estas variables son **OBLIGATORIAS** si quieres que los pagos funcionen:

```bash
STRIPE_SECRET_KEY=sk_live_... (o sk_test_... para pruebas)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (o pk_test_... para pruebas)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...
```

**Dónde obtenerlas:**
- Ve a Stripe Dashboard → **Developers** → **API keys**
- `STRIPE_SECRET_KEY` = **Secret key** (usa `sk_live_...` para producción)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = **Publishable key** (usa `pk_live_...` para producción)
- `STRIPE_WEBHOOK_SECRET` = Crea un webhook en Stripe → **Developers** → **Webhooks**
  - URL del webhook: `https://tu-dominio.vercel.app/api/stripe/webhook`
  - Copia el **Signing secret** (empieza con `whsec_...`)
- `STRIPE_PRICE_ID_PRO` = Crea un producto "Plan Pro" en Stripe → copia el **Price ID**
- `STRIPE_PRICE_ID_BUSINESS` = Crea un producto "Plan Business" en Stripe → copia el **Price ID**

**⚠️ IMPORTANTE:**
- Para producción, usa keys que empiecen con `sk_live_` y `pk_live_`
- Para pruebas, usa keys que empiecen con `sk_test_` y `pk_test_`
- El webhook debe apuntar a tu URL de producción en Vercel

---

### 🌐 URL del Sitio

Esta variable es **OBLIGATORIA** para links de invitaciones y redirecciones:

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

**Ejemplo:**
- Si tu dominio es `maflipp.com`: `NEXT_PUBLIC_SITE_URL=https://maflipp.com`
- Si usas dominio de Vercel: `NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app`

---

## 📧 Variables OPCIONALES (Recomendadas)

### 📬 Resend (Emails)

Estas variables son **OPCIONALES** pero **RECOMENDADAS** para enviar emails:

```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Maflipp <noreply@tu-dominio.com>
```

**Dónde obtenerlas:**
- Crea cuenta en [Resend.com](https://resend.com)
- Ve a **API Keys** → crea una nueva key
- Copia la key (empieza con `re_...`)
- Verifica tu dominio en Resend para usar `noreply@tu-dominio.com`
- O usa el dominio de prueba: `Maflipp <onboarding@resend.dev>`

**⚠️ NOTA:**
- Si no configuras estas variables, las invitaciones de equipo se crearán pero **no se enviarán emails**
- Las alertas por email tampoco funcionarán sin estas variables

---

### ⏰ Cron Secret (Alertas Automáticas)

Esta variable es **OPCIONAL** y solo necesaria si configuras alertas automáticas con cron:

```bash
CRON_SECRET=tu-secret-random-aqui
```

**Cómo generarla:**
- Genera un string aleatorio seguro (puedes usar: `openssl rand -base64 32`)
- Úsala para proteger el endpoint `/api/alerts/send` de llamadas no autorizadas

**⚠️ NOTA:**
- Solo necesaria si configuras un cron job externo (ej: Vercel Cron, cron-job.org)
- Si no la configuras, las alertas manuales seguirán funcionando

---

## 📝 Resumen Completo

### Variables OBLIGATORIAS (9 variables)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_BUSINESS=price_...

# URL del sitio
NEXT_PUBLIC_SITE_URL=https://tu-dominio.vercel.app
```

### Variables OPCIONALES (3 variables)

```bash
# Resend (emails)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Maflipp <noreply@tu-dominio.com>

# Cron (alertas automáticas)
CRON_SECRET=tu-secret-random
```

---

## 🎯 Checklist de Configuración

### ✅ Paso 1: Variables Obligatorias
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `STRIPE_SECRET_KEY` configurada (usa `sk_live_...` para producción)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` configurada (usa `pk_live_...` para producción)
- [ ] `STRIPE_WEBHOOK_SECRET` configurada
- [ ] `STRIPE_PRICE_ID_PRO` configurada
- [ ] `STRIPE_PRICE_ID_BUSINESS` configurada
- [ ] `NEXT_PUBLIC_SITE_URL` configurada con tu dominio de producción

### ✅ Paso 2: Variables Opcionales (Recomendadas)
- [ ] `RESEND_API_KEY` configurada (para emails)
- [ ] `RESEND_FROM_EMAIL` configurada (para emails)
- [ ] `CRON_SECRET` configurada (solo si usas cron jobs)

---

## 🔍 Verificación

Después de configurar las variables:

1. **Redeploy** tu proyecto en Vercel (las variables se aplican en el próximo deploy)
2. Verifica que:
   - ✅ El sitio carga correctamente
   - ✅ Puedes registrarte e iniciar sesión
   - ✅ El dashboard funciona
   - ✅ Los pagos funcionan (si configuraste Stripe)
   - ✅ Los emails se envían (si configuraste Resend)

---

## ⚠️ Notas Importantes

### Variables Públicas vs Privadas

- **Variables `NEXT_PUBLIC_*`**: Son públicas y visibles en el código del cliente
- **Variables sin `NEXT_PUBLIC_*`**: Son privadas y solo accesibles en el servidor

### Entornos en Vercel

Puedes configurar diferentes valores para:
- **Production**: Tu dominio de producción
- **Preview**: Branches y PRs
- **Development**: Desarrollo local

### Seguridad

- **NUNCA** compartas `SUPABASE_SERVICE_ROLE_KEY` o `STRIPE_SECRET_KEY`
- **NUNCA** commitees estas variables a Git
- Usa **diferentes keys** para producción y desarrollo

---

## 🆘 Troubleshooting

### Error: "Supabase connection failed"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctas
- Asegúrate de que las políticas RLS estén configuradas en Supabase

### Error: "Stripe payment failed"
- Verifica que `STRIPE_SECRET_KEY` y `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` sean del mismo entorno (ambas `live_` o ambas `test_`)
- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- Verifica que los Price IDs existan en Stripe

### Error: "Emails not sending"
- Verifica que `RESEND_API_KEY` esté configurada
- Verifica que `RESEND_FROM_EMAIL` use un dominio verificado en Resend
- Revisa los logs de Vercel para ver errores específicos

### Error: "Invalid redirect URL"
- Verifica que `NEXT_PUBLIC_SITE_URL` apunte a tu dominio correcto
- Asegúrate de que no tenga `/` al final

---

## 📚 Referencias

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Resend API](https://resend.com/docs/api-reference/overview)

---

**✅ Una vez configuradas todas las variables, tu plataforma estará lista para producción!**

