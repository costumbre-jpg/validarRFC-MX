# 🌐 Guía Completa: Compra y Configuración de Dominio Real

Esta guía te lleva paso a paso desde la compra del dominio hasta tener todo configurado y funcionando.

---

## 💰 1. Comprar el Dominio

### Proveedores Recomendados

#### Opción 1: Namecheap (Recomendado)
- **Precio:** ~$10-15 USD/año para `.com`
- **Ventajas:** 
  - Precios competitivos
  - Interfaz fácil
  - Soporte en español
  - DNS gratuito incluido
- **URL:** [namecheap.com](https://www.namecheap.com)

#### Opción 2: GoDaddy
- **Precio:** ~$12-20 USD/año para `.com`
- **Ventajas:**
  - Muy popular
  - Fácil de usar
  - Promociones frecuentes
- **URL:** [godaddy.com](https://www.godaddy.com)

#### Opción 3: Google Domains (ahora Squarespace)
- **Precio:** ~$12 USD/año para `.com`
- **Ventajas:**
  - Interfaz simple
  - Integración con Google
- **URL:** [domains.google](https://domains.google)

#### Opción 4: Cloudflare Registrar
- **Precio:** ~$8-10 USD/año para `.com` (precio al costo)
- **Ventajas:**
  - Precio sin markup
  - DNS rápido y gratuito
  - Seguridad incluida
- **URL:** [cloudflare.com/products/registrar](https://www.cloudflare.com/products/registrar)

### Precios Aproximados

| Extensión | Precio Anual | Notas |
|-----------|--------------|-------|
| `.com` | $8-20 USD | Más popular y confiable |
| `.mx` | $15-30 USD | Para México |
| `.com.mx` | $20-40 USD | Para México |
| `.net` | $10-15 USD | Alternativa a .com |
| `.io` | $30-50 USD | Popular para tech |

**💡 Recomendación:** Usa `.com` si está disponible, es el más confiable y reconocido.

### Tiempo de Compra

- **Compra:** Instantánea (5-10 minutos)
- **Activación:** 5-30 minutos (generalmente inmediato)
- **Propagación DNS:** 1-48 horas (generalmente 1-4 horas)

**⏱️ Tiempo Total Estimado:** 1-2 horas para estar funcionando (aunque puede tardar hasta 48h)

---

## 📋 2. Pasos Completos: Desde la Compra hasta la Configuración Final

### FASE 1: Compra del Dominio (15-30 minutos)

#### Paso 1.1: Buscar Disponibilidad
1. Ve a tu proveedor elegido (ej: Namecheap)
2. Busca tu dominio deseado (ej: `maflipp.com`)
3. Verifica que esté disponible
4. Si no está disponible, prueba variaciones:
   - `maflipp.mx`
   - `maflipp.io`
   - `getmaflipp.com`
   - `maflippapp.com`

#### Paso 1.2: Comprar el Dominio
1. Agrega el dominio al carrito
2. **IMPORTANTE:** Desactiva opciones adicionales (hosting, email, etc.) si no las necesitas
3. Completa el pago
4. Verifica tu email de confirmación

#### Paso 1.3: Acceder al Panel de Control
1. Inicia sesión en tu proveedor
2. Ve a "My Domains" o "Mis Dominios"
3. Encuentra tu dominio recién comprado
4. Click en "Manage" o "Gestionar"

**✅ Completado:** Dominio comprado y activo

---

### FASE 2: Configurar Dominio en Vercel (30-60 minutos)

#### Paso 2.1: Agregar Dominio en Vercel
1. Ve a Vercel Dashboard → Tu Proyecto
2. Click en **Settings** → **Domains**
3. Click en **Add Domain**
4. Ingresa tu dominio: `maflipp.com`
5. Click en **Add**
6. También agrega: `www.maflipp.com` (opcional pero recomendado)

#### Paso 2.2: Obtener Registros DNS de Vercel
Vercel te mostrará los registros DNS que necesitas configurar:

**Ejemplo:**
```
Tipo: A
Nombre: @
Valor: 76.76.21.21

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

**⚠️ IMPORTANTE:** Copia estos valores, los necesitarás en el siguiente paso.

#### Paso 2.3: Configurar DNS en tu Proveedor de Dominio

**En tu proveedor de dominio (Namecheap, GoDaddy, etc.):**

1. Ve a la sección de **DNS Management** o **DNS Records**
2. **Elimina registros existentes** (si hay)
3. **Agrega los registros que Vercel te dio:**
   - Agrega el registro **A** para `@` (o dominio raíz)
   - Agrega el registro **CNAME** para `www`

**Ejemplo en Namecheap:**
- Ve a **Advanced DNS**
- Agrega **A Record**: `@` → `76.76.21.21`
- Agrega **CNAME Record**: `www` → `cname.vercel-dns.com`

**Ejemplo en GoDaddy:**
- Ve a **DNS Management**
- Agrega **A Record**: `@` → `76.76.21.21`
- Agrega **CNAME Record**: `www` → `cname.vercel-dns.com`

#### Paso 2.4: Esperar Propagación DNS
1. Vuelve a Vercel Dashboard
2. Verifica el estado del dominio
3. Debe cambiar de "Pending" a "Valid" (puede tardar 1-48 horas, generalmente 1-4 horas)
4. El SSL/HTTPS se configurará automáticamente

**✅ Completado:** Dominio configurado en Vercel

**⏱️ Tiempo:** 30-60 minutos (más tiempo de espera para DNS)

---

### FASE 3: Actualizar Variables de Entorno en Vercel (5 minutos)

#### Paso 3.1: Actualizar NEXT_PUBLIC_SITE_URL
1. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Environment Variables**
2. Busca `NEXT_PUBLIC_SITE_URL`
3. Click en **Edit**
4. Cambia el valor:
   - **Antes:** `https://tu-proyecto.vercel.app`
   - **Después:** `https://maflipp.com`
5. Click en **Save**

#### Paso 3.2: Redeploy
1. Ve a **Deployments**
2. Click en los **3 puntos** del último deployment
3. Click en **Redeploy**
4. O simplemente haz un nuevo commit y push

**✅ Completado:** Variables actualizadas

**⏱️ Tiempo:** 5 minutos + tiempo de deploy (~2-5 minutos)

---

### FASE 4: Configurar Supabase (10 minutos)

#### Paso 4.1: Actualizar Site URL
1. Ve a Supabase Dashboard → **Authentication** → **URL Configuration**
2. En **Site URL**, cambia:
   - **Antes:** `https://tu-proyecto.vercel.app`
   - **Después:** `https://maflipp.com`
3. Click en **Save**

#### Paso 4.2: Agregar Redirect URLs
1. En la misma página, en **Redirect URLs**
2. Click en **Add URL**
3. Agrega: `https://maflipp.com/auth/callback`
4. Click en **Add URL** de nuevo
5. Agrega: `https://maflipp.com/**` (wildcard)
6. **Opcional:** Mantén el dominio gratis si quieres usarlo para desarrollo
7. Click en **Save**

**✅ Completado:** Supabase configurado

**⏱️ Tiempo:** 10 minutos

---

### FASE 5: Configurar Stripe Webhook (10 minutos)

#### Paso 5.1: Actualizar Webhook en Stripe
1. Ve a Stripe Dashboard → **Developers** → **Webhooks**
2. Encuentra tu webhook existente (o crea uno nuevo)
3. Click en el webhook
4. En **Endpoint URL**, cambia:
   - **Antes:** `https://tu-proyecto.vercel.app/api/stripe/webhook`
   - **Después:** `https://maflipp.com/api/stripe/webhook`
5. Click en **Update endpoint**

#### Paso 5.2: Verificar Signing Secret
1. En la misma página del webhook
2. Copia el **Signing secret** (empieza con `whsec_...`)
3. Ve a Vercel Dashboard → **Settings** → **Environment Variables**
4. Verifica que `STRIPE_WEBHOOK_SECRET` tenga el valor correcto
5. Si cambió, actualízalo

**✅ Completado:** Stripe configurado

**⏱️ Tiempo:** 10 minutos

---

### FASE 6: Configurar Resend (30-60 minutos + tiempo de verificación)

#### Paso 6.1: Agregar Dominio en Resend
1. Ve a Resend Dashboard → **Domains**
2. Click en **Add Domain**
3. Ingresa tu dominio: `maflipp.com`
4. Click en **Add Domain**

#### Paso 6.2: Obtener Registros DNS de Resend
Resend te mostrará los registros DNS que necesitas agregar:

**Ejemplo:**
```
Tipo: TXT
Nombre: @
Valor: v=spf1 include:resend.com ~all

Tipo: CNAME
Nombre: resend._domainkey
Valor: resend.com

Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com
```

#### Paso 6.3: Configurar DNS en tu Proveedor de Dominio

**En tu proveedor de dominio:**

1. Ve a **DNS Management** o **DNS Records**
2. **Agrega los registros que Resend te dio:**
   - Agrega el registro **TXT** para SPF
   - Agrega el registro **CNAME** para DKIM
   - Agrega el registro **TXT** para DMARC (opcional pero recomendado)

**⚠️ IMPORTANTE:** 
- No elimines los registros de Vercel
- Agrega los registros de Resend **además** de los de Vercel

#### Paso 6.4: Esperar Verificación
1. Vuelve a Resend Dashboard
2. El dominio aparecerá como "Pending" o "Verifying"
3. La verificación puede tardar desde minutos hasta 24 horas
4. Una vez verificado, aparecerá como "Verified" ✅

#### Paso 6.5: Actualizar Variable de Entorno
1. Ve a Vercel Dashboard → **Settings** → **Environment Variables**
2. Busca `RESEND_FROM_EMAIL`
3. Click en **Edit**
4. Cambia el valor:
   - **Antes:** `Maflipp <onboarding@resend.dev>`
   - **Después:** `Maflipp <noreply@maflipp.com>`
5. Click en **Save**

**✅ Completado:** Resend configurado

**⏱️ Tiempo:** 30-60 minutos de configuración + 1-24 horas de verificación

---

## 📝 Checklist Completo

### ✅ FASE 1: Compra del Dominio
- [ ] Buscar disponibilidad del dominio
- [ ] Comprar el dominio
- [ ] Verificar email de confirmación
- [ ] Acceder al panel de control del proveedor

### ✅ FASE 2: Configurar en Vercel
- [ ] Agregar dominio en Vercel Dashboard
- [ ] Obtener registros DNS de Vercel
- [ ] Configurar DNS en proveedor de dominio
- [ ] Esperar propagación DNS (1-48 horas)
- [ ] Verificar que dominio esté "Valid" en Vercel
- [ ] Verificar que SSL/HTTPS esté activo

### ✅ FASE 3: Actualizar Variables de Entorno
- [ ] Actualizar `NEXT_PUBLIC_SITE_URL` en Vercel
- [ ] Redeploy del proyecto

### ✅ FASE 4: Configurar Supabase
- [ ] Actualizar Site URL en Supabase
- [ ] Agregar Redirect URLs con nuevo dominio

### ✅ FASE 5: Configurar Stripe
- [ ] Actualizar URL del webhook en Stripe
- [ ] Verificar `STRIPE_WEBHOOK_SECRET` en Vercel

### ✅ FASE 6: Configurar Resend
- [ ] Agregar dominio en Resend Dashboard
- [ ] Obtener registros DNS de Resend
- [ ] Configurar DNS en proveedor de dominio
- [ ] Esperar verificación del dominio (1-24 horas)
- [ ] Actualizar `RESEND_FROM_EMAIL` en Vercel

### ✅ FASE 7: Pruebas Finales
- [ ] Abrir `https://maflipp.com` - debe cargar
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Probar checkout de Stripe (si configurado)
- [ ] Probar envío de emails (si configurado)

---

## ⏱️ Tiempo Total Estimado

| Fase | Tiempo Activo | Tiempo de Espera |
|------|---------------|------------------|
| Compra del dominio | 15-30 min | 5-30 min |
| Configurar en Vercel | 30-60 min | 1-48 horas (DNS) |
| Actualizar variables | 5 min | 2-5 min (deploy) |
| Configurar Supabase | 10 min | - |
| Configurar Stripe | 10 min | - |
| Configurar Resend | 30-60 min | 1-24 horas (verificación) |
| **TOTAL** | **1.5-2.5 horas** | **2-72 horas** |

**⏱️ Tiempo Total:** Puedes hacer la configuración activa en 1.5-2.5 horas, pero necesitas esperar la propagación DNS (1-48 horas) y verificación de Resend (1-24 horas).

---

## 💰 Costos Totales

| Item | Costo Anual | Notas |
|------|-------------|-------|
| Dominio `.com` | $8-20 USD | Una vez al año |
| Vercel | Gratis | Plan Hobby es suficiente |
| Supabase | Gratis | Plan Free es suficiente para empezar |
| Stripe | Gratis | Solo pagas comisiones por transacciones |
| Resend | Gratis | 3,000 emails/mes gratis |
| **TOTAL** | **$8-20 USD/año** | Solo el dominio |

---

## 🎯 Orden Recomendado de Ejecución

1. **Día 1 (2-3 horas):**
   - ✅ Comprar dominio
   - ✅ Configurar en Vercel
   - ✅ Configurar DNS de Vercel
   - ✅ Actualizar variables de entorno
   - ✅ Configurar Supabase
   - ✅ Configurar Stripe
   - ✅ Configurar Resend
   - ✅ Configurar DNS de Resend

2. **Día 1-2 (Espera):**
   - ⏳ Esperar propagación DNS de Vercel (1-48 horas)
   - ⏳ Esperar verificación de Resend (1-24 horas)

3. **Día 2 (30 minutos):**
   - ✅ Verificar que dominio esté activo en Vercel
   - ✅ Verificar que Resend esté verificado
   - ✅ Actualizar `RESEND_FROM_EMAIL` si Resend está listo
   - ✅ Pruebas finales

---

## 🆘 Troubleshooting

### El dominio no carga después de 48 horas
- **Causa:** DNS no propagado o mal configurado
- **Solución:** 
  - Verifica los registros DNS en tu proveedor
  - Usa [whatsmydns.net](https://www.whatsmydns.net) para verificar propagación
  - Contacta soporte de tu proveedor de dominio

### Resend no verifica el dominio
- **Causa:** DNS records mal configurados
- **Solución:**
  - Verifica que todos los registros estén correctos
  - Espera hasta 24 horas
  - Contacta soporte de Resend

### Stripe webhook no funciona
- **Causa:** URL incorrecta o secret incorrecto
- **Solución:**
  - Verifica la URL del webhook en Stripe
  - Verifica `STRIPE_WEBHOOK_SECRET` en Vercel
  - Revisa los logs en Stripe Dashboard

---

## ✅ Resumen Ejecutivo

**Para tener tu dominio funcionando:**

1. **Compra el dominio** ($8-20 USD/año) - 15-30 minutos
2. **Configura en Vercel** - 30-60 minutos + espera DNS (1-48 horas)
3. **Actualiza variables** - 5 minutos
4. **Configura Supabase** - 10 minutos
5. **Configura Stripe** - 10 minutos
6. **Configura Resend** - 30-60 minutos + espera verificación (1-24 horas)

**Tiempo activo:** 1.5-2.5 horas  
**Tiempo total:** 2-72 horas (incluyendo esperas)

**Costo:** Solo $8-20 USD/año (el dominio)

---

**✅ Una vez completado, tu plataforma estará funcionando con tu dominio profesional!**

