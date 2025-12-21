# 🌐 Guía de Configuración de Dominio Personalizado

Esta guía te ayudará a configurar tu dominio personalizado para la plataforma Maflipp.

## 📋 Requisitos Previos

- ✅ Proyecto desplegado en Vercel
- ✅ Dominio registrado y acceso al panel de DNS
- ✅ Variables de entorno configuradas en Vercel

---

## 🚀 PASO 1: Configurar Dominio en Vercel

### 1.1 Agregar Dominio en Vercel Dashboard

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Domains**
3. Haz clic en **Add Domain**
4. Ingresa tu dominio (ej: `maflipp.com` o `www.maflipp.com`)
5. Vercel te mostrará las instrucciones de DNS

### 1.2 Configurar Registros DNS

**Opción A: Dominio raíz (maflipp.com)**

Agrega estos registros en tu panel de DNS:

```
Tipo: A
Nombre: @ (o maflipp.com)
Valor: 76.76.21.21
TTL: 3600 (o automático)

Tipo: A  
Nombre: @ (o maflipp.com)
Valor: 76.223.126.88
TTL: 3600 (o automático)
```

**Opción B: Subdominio www (www.maflipp.com)**

```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 3600 (o automático)
```

**Nota:** Vercel actualiza las IPs periódicamente. Revisa las instrucciones específicas en el dashboard de Vercel.

### 1.3 Verificar Configuración

1. Espera 1-24 horas para que se propague el DNS (generalmente toma 5-30 minutos)
2. Vercel verificará automáticamente cuando el dominio esté configurado
3. Una vez verificado, verás un ✅ verde junto a tu dominio

---

## 🔧 PASO 2: Actualizar Variables de Entorno en Vercel

### 2.1 Actualizar NEXT_PUBLIC_SITE_URL

1. Ve a tu proyecto en Vercel Dashboard
2. **Settings** → **Environment Variables**
3. Busca `NEXT_PUBLIC_SITE_URL`
4. Actualiza el valor a tu dominio de producción:
   ```
   https://maflipp.com
   ```
   o si usas www:
   ```
   https://www.maflipp.com
   ```
5. Selecciona todos los **Environments** (Production, Preview, Development)
6. Haz clic en **Save**

### 2.2 Verificar Otras Variables

Asegúrate de que todas estas variables estén configuradas:

- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `STRIPE_PRICE_ID_PRO`
- ✅ `STRIPE_PRICE_ID_PRO_ANNUAL`
- ✅ `STRIPE_PRICE_ID_BUSINESS`
- ✅ `STRIPE_PRICE_ID_BUSINESS_ANNUAL`
- ✅ `NEXT_PUBLIC_SITE_URL` ← **ACTUALIZAR ESTA**

### 2.3 Redesplegar Aplicación

Después de actualizar las variables:

1. Ve a **Deployments**
2. Haz clic en los 3 puntos (⋯) del último deployment
3. Selecciona **Redeploy**
4. O haz un nuevo commit y push a tu repositorio

---

## 🗄️ PASO 3: Configurar Supabase con Dominio de Producción

### 3.1 Configurar URLs de Redirección

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. **Authentication** → **URL Configuration**
3. Actualiza estos campos:

   **Site URL:**
   ```
   https://maflipp.com
   ```

   **Redirect URLs:**
   ```
   https://maflipp.com/**
   https://maflipp.com/auth/callback
   https://www.maflipp.com/**
   https://www.maflipp.com/auth/callback
   ```
   
   (Agrega ambos si usas dominio con y sin www)

4. Haz clic en **Save**

### 3.2 Verificar Configuración de Email

1. Ve a **Authentication** → **Email Templates**
2. Asegúrate de que los enlaces en los emails apunten a tu dominio:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

   Los enlaces deben usar: `https://maflipp.com/auth/callback` o similar

---

## 💳 PASO 4: Configurar Stripe con Dominio de Producción

### 4.1 Actualizar Webhook de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **Webhooks**
3. Si ya tienes un webhook, edítalo. Si no, crea uno nuevo:
   - **Endpoint URL:** `https://maflipp.com/api/stripe/webhook`
   - **Description:** "Webhook para suscripciones Maflipp"
   
4. **Selecciona eventos a escuchar:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

5. Haz clic en **Add endpoint**

6. **Copia el Signing secret** (empieza con `whsec_...`)

7. Actualiza en Vercel:
   - Ve a Vercel Dashboard → Settings → Environment Variables
   - Actualiza `STRIPE_WEBHOOK_SECRET` con el nuevo secret

### 4.2 Configurar URLs de Retorno en Stripe

En los productos de Stripe (Plans), verifica que las URLs de éxito y cancelación estén correctas:
- Success: `https://maflipp.com/dashboard/billing?success=true`
- Cancel: `https://maflipp.com/dashboard/billing?canceled=true`

---

## ✅ PASO 5: Verificación Final

### 5.1 Checklist de Verificación

- [ ] Dominio configurado en Vercel y verificado ✅
- [ ] DNS propagado (verifica con: `nslookup maflipp.com`)
- [ ] `NEXT_PUBLIC_SITE_URL` actualizada en Vercel
- [ ] Aplicación redesplegada en Vercel
- [ ] URLs de Supabase actualizadas
- [ ] Webhook de Stripe actualizado con nuevo dominio
- [ ] `STRIPE_WEBHOOK_SECRET` actualizado en Vercel

### 5.2 Pruebas Funcionales

Prueba estas funcionalidades:

1. **Landing Page:**
   - [ ] Accede a `https://maflipp.com` y verifica que carga correctamente
   - [ ] Verifica que todas las imágenes y estilos cargan

2. **Autenticación:**
   - [ ] Regístrate con un nuevo usuario
   - [ ] Verifica que el email de confirmación llegue
   - [ ] Haz clic en el enlace de confirmación
   - [ ] Inicia sesión

3. **Pagos (Stripe):**
   - [ ] Intenta hacer un upgrade a Pro o Business
   - [ ] Verifica que el checkout de Stripe funcione
   - [ ] Completa un pago de prueba (usando tarjeta de prueba)
   - [ ] Verifica que la suscripción se active correctamente

4. **API:**
   - [ ] Genera una API Key
   - [ ] Prueba hacer una petición a `https://maflipp.com/api/public/validate`

5. **Redirects:**
   - [ ] Verifica que las redirecciones después de login funcionen
   - [ ] Verifica que los enlaces de email funcionen

### 5.3 Verificar SSL/HTTPS

Vercel proporciona SSL automáticamente. Verifica que:
- [ ] El sitio carga con `https://` (no `http://`)
- [ ] No hay advertencias de certificado en el navegador
- [ ] El candado verde aparece en la barra de direcciones

---

## 🔍 Troubleshooting

### El dominio no carga / Error DNS

1. Verifica que los registros DNS están configurados correctamente
2. Espera más tiempo (puede tomar hasta 24-48 horas, pero generalmente es 5-30 min)
3. Usa herramientas para verificar DNS:
   - [whatsmydns.net](https://www.whatsmydns.net)
   - `nslookup maflipp.com` en terminal

### Error de SSL/Certificado

1. Vercel maneja SSL automáticamente, espera 5-10 minutos después de agregar el dominio
2. Si persiste, contacta a Vercel support

### Webhook de Stripe falla

1. Verifica que el endpoint sea: `https://maflipp.com/api/stripe/webhook`
2. Verifica que `STRIPE_WEBHOOK_SECRET` esté actualizado en Vercel
3. Verifica los logs en Stripe Dashboard → Webhooks → [Tu webhook] → Logs

### Redirecciones de Supabase fallan

1. Verifica que las URLs en Supabase incluyan `https://maflipp.com/**`
2. Verifica que `NEXT_PUBLIC_SITE_URL` esté actualizada en Vercel
3. Redesplega la aplicación después de actualizar variables

### Las variables de entorno no se actualizan

1. Asegúrate de hacer **Redeploy** después de actualizar variables
2. Las variables con `NEXT_PUBLIC_` requieren rebuild completo
3. Verifica que seleccionaste todos los environments al guardar

---

## 📝 Notas Adicionales

- **Dominio con y sin www:** Puedes configurar ambos si quieres. Vercel permite agregar múltiples dominios.
- **Subdominios:** Si quieres usar `app.maflipp.com` para el dashboard, puedes agregarlo como dominio adicional en Vercel.
- **Email del dominio:** Considera configurar DNS records para email (MX records) si planeas usar emails con tu dominio.

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu plataforma estará disponible en tu dominio personalizado y lista para producción.

**Última verificación:** Prueba todo el flujo completo (registro → pago → uso de API) antes del lanzamiento oficial.

