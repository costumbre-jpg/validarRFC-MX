# 🔄 Guía: Cambiar de Dominio Gratis a Dominio Real

Esta guía te muestra **exactamente qué cambiar** cuando tengas tu dominio real configurado.

---

## 📋 Resumen de Cambios

Cuando tengas tu dominio real (ej: `maflipp.com`), necesitas actualizar:

1. ✅ **Variable de entorno en Vercel** (1 cambio)
2. ✅ **URLs de redirección en Supabase** (2 cambios)
3. ✅ **Webhook de Stripe** (1 cambio)
4. ✅ **Configuración de Resend** (1 cambio)
5. ✅ **Dominio en Vercel** (1 cambio)

**Total: 6 cambios necesarios**

---

## 🔧 1. Variable de Entorno en Vercel

### Cambio Necesario:

**En Vercel Dashboard → Settings → Environment Variables:**

- [ ] Actualizar `NEXT_PUBLIC_SITE_URL`
  - **Antes:** `https://tu-proyecto.vercel.app`
  - **Después:** `https://maflipp.com` (tu dominio real)

**⚠️ IMPORTANTE:**
- Después de cambiar, haz un **redeploy** del proyecto
- Las variables se aplican en el próximo deploy

---

## 🔗 2. URLs de Redirección en Supabase

### Cambios Necesarios:

**En Supabase Dashboard → Authentication → URL Configuration:**

#### Site URL:
- [ ] **Antes:** `https://tu-proyecto.vercel.app`
- [ ] **Después:** `https://maflipp.com`

#### Redirect URLs:
- [ ] **Agregar:** `https://maflipp.com/auth/callback`
- [ ] **Agregar:** `https://maflipp.com/**` (wildcard)
- [ ] **Opcional:** Mantener el dominio gratis para desarrollo si quieres

**⚠️ IMPORTANTE:**
- Sin esto, el registro/login NO funcionará con el nuevo dominio
- Puedes mantener ambos dominios en Redirect URLs si quieres

---

## 💳 3. Webhook de Stripe

### Cambio Necesario:

**En Stripe Dashboard → Developers → Webhooks:**

- [ ] **Editar webhook existente** o crear uno nuevo
- [ ] **URL del webhook:**
  - **Antes:** `https://tu-proyecto.vercel.app/api/stripe/webhook`
  - **Después:** `https://maflipp.com/api/stripe/webhook`
- [ ] **Copiar el nuevo Signing secret** (si creaste uno nuevo)
- [ ] **Actualizar** `STRIPE_WEBHOOK_SECRET` en Vercel si cambió

**⚠️ IMPORTANTE:**
- Si creas un nuevo webhook, obtendrás un nuevo `STRIPE_WEBHOOK_SECRET`
- Actualiza la variable en Vercel con el nuevo secret
- O mantén el webhook anterior y solo cambia la URL

---

## 📬 4. Configuración de Resend

### Cambios Necesarios:

#### A. Verificar Dominio en Resend

**En Resend Dashboard → Domains:**

- [ ] **Agregar dominio:** `maflipp.com`
- [ ] **Configurar DNS records** que Resend te proporciona:
  - SPF record
  - DKIM record
  - DMARC record (opcional pero recomendado)
- [ ] **Esperar verificación** (puede tardar hasta 24 horas)

#### B. Actualizar Variable de Entorno

**En Vercel Dashboard → Settings → Environment Variables:**

- [ ] Actualizar `RESEND_FROM_EMAIL`
  - **Antes:** `Maflipp <onboarding@resend.dev>` (dominio de prueba)
  - **Después:** `Maflipp <noreply@maflipp.com>` (tu dominio verificado)

**⚠️ IMPORTANTE:**
- No puedes enviar emails desde tu dominio hasta que esté verificado
- Mientras tanto, puedes seguir usando `onboarding@resend.dev`
- Una vez verificado, cambia a `noreply@maflipp.com`

---

## 🌐 5. Configurar Dominio en Vercel

### Pasos:

**En Vercel Dashboard → Tu Proyecto → Settings → Domains:**

1. [ ] **Agregar dominio:**
   - Click en "Add Domain"
   - Ingresa: `maflipp.com`
   - También agrega: `www.maflipp.com` (opcional pero recomendado)

2. [ ] **Configurar DNS:**
   - Vercel te dará los registros DNS a configurar
   - Ve a tu proveedor de dominio (GoDaddy, Namecheap, etc.)
   - Agrega los registros:
     - **A record** o **CNAME** (Vercel te dirá cuál)
     - **CNAME** para `www` (si lo agregaste)

3. [ ] **Esperar propagación DNS:**
   - Puede tardar desde minutos hasta 48 horas
   - Verifica en Vercel cuando esté "Valid"

4. [ ] **SSL/HTTPS:**
   - Vercel lo configura automáticamente
   - Espera a que se active (puede tardar unos minutos)

---

## 📝 Checklist Completo de Cambio de Dominio

### Paso 1: Configurar Dominio en Vercel
- [ ] Agregar dominio en Vercel Dashboard
- [ ] Configurar DNS en tu proveedor de dominio
- [ ] Esperar a que el dominio esté "Valid" en Vercel
- [ ] Verificar que SSL/HTTPS esté activo

### Paso 2: Actualizar Variables de Entorno
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel
- [ ] Actualizar `RESEND_FROM_EMAIL` en Vercel (después de verificar dominio en Resend)
- [ ] Redeploy del proyecto en Vercel

### Paso 3: Actualizar Supabase
- [ ] Actualizar Site URL en Supabase Auth
- [ ] Agregar Redirect URLs con el nuevo dominio

### Paso 4: Actualizar Stripe
- [ ] Actualizar URL del webhook en Stripe
- [ ] Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel (si creaste nuevo webhook)

### Paso 5: Configurar Resend
- [ ] Agregar dominio en Resend Dashboard
- [ ] Configurar DNS records para Resend
- [ ] Esperar verificación del dominio
- [ ] Actualizar `RESEND_FROM_EMAIL` en Vercel

### Paso 6: Verificación Final
- [ ] Probar registro de usuario con el nuevo dominio
- [ ] Probar login con el nuevo dominio
- [ ] Probar checkout de Stripe (si configurado)
- [ ] Probar envío de emails (si configurado)

---

## 🔍 Dónde se Usa el Dominio en el Código

El dominio se usa en estos lugares (se actualiza automáticamente con `NEXT_PUBLIC_SITE_URL`):

1. ✅ **Links de invitación de equipo** (`app/api/team/invite/route.ts`)
2. ✅ **URLs de redirección de Stripe** (`app/api/stripe/checkout/route.ts`)
3. ✅ **Links en emails de alertas** (`lib/email.ts`)
4. ✅ **Links en emails de invitación** (`app/api/team/invite/route.ts`)

**✅ No necesitas cambiar nada en el código** - todo usa `process.env.NEXT_PUBLIC_SITE_URL`

---

## ⚠️ Orden Recomendado

1. **Primero:** Configurar dominio en Vercel y DNS
2. **Segundo:** Esperar a que el dominio esté activo
3. **Tercero:** Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel
4. **Cuarto:** Actualizar URLs en Supabase
5. **Quinto:** Actualizar webhook en Stripe
6. **Sexto:** Configurar dominio en Resend (puede hacerse en paralelo)
7. **Séptimo:** Redeploy y pruebas

---

## 🧪 Pruebas Después del Cambio

### Pruebas Básicas:
- [ ] Abrir `https://maflipp.com` - debe cargar correctamente
- [ ] Registro de usuario - debe funcionar
- [ ] Login - debe funcionar
- [ ] Redirección después de login - debe ir a dashboard

### Pruebas de Pagos (si configurado):
- [ ] Click en "Mejorar Plan" - debe abrir Stripe checkout
- [ ] Completar pago - debe redirigir a `/dashboard/billing?success=true`
- [ ] Verificar en Stripe Dashboard que el webhook se recibió

### Pruebas de Emails (si configurado):
- [ ] Invitar miembro del equipo - debe enviar email
- [ ] Verificar que el email viene de `noreply@maflipp.com`
- [ ] Verificar que los links en el email usan `https://maflipp.com`

---

## 🆘 Troubleshooting

### Error: "Redirect URL mismatch"
- **Causa:** No agregaste el nuevo dominio a Redirect URLs en Supabase
- **Solución:** Agrega `https://maflipp.com/auth/callback` a Redirect URLs

### Error: "Stripe webhook verification failed"
- **Causa:** La URL del webhook no coincide o el secret cambió
- **Solución:** Verifica la URL del webhook en Stripe y el `STRIPE_WEBHOOK_SECRET` en Vercel

### Error: "Domain not verified in Resend"
- **Causa:** El dominio no está verificado o los DNS records no están configurados
- **Solución:** Verifica los DNS records en tu proveedor de dominio y espera la verificación

### Error: "SSL certificate not ready"
- **Causa:** Vercel está generando el certificado SSL
- **Solución:** Espera unos minutos (puede tardar hasta 1 hora)

---

## ✅ Resumen

**Cuando tengas tu dominio real:**

1. ✅ Configura el dominio en Vercel
2. ✅ Actualiza `NEXT_PUBLIC_SITE_URL` en Vercel
3. ✅ Actualiza URLs en Supabase
4. ✅ Actualiza webhook en Stripe
5. ✅ Configura dominio en Resend
6. ✅ Redeploy y pruebas

**⚠️ IMPORTANTE:** 
- No necesitas cambiar nada en el código
- Todo se actualiza automáticamente con las variables de entorno
- El dominio gratis puede seguir funcionando si lo mantienes en las configuraciones

---

**✅ Una vez completado, tu plataforma estará funcionando con tu dominio real!**

