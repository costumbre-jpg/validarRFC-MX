# 💳 Configuración Completa de Stripe

## 📋 Resumen

Vamos a configurar Stripe para que los pagos funcionen en tu MVP. Esto incluye:
1. Crear cuenta en Stripe
2. Crear productos y precios (Pro y Enterprise)
3. Configurar webhook
4. Obtener todas las claves necesarias
5. Configurar variables de entorno

---

## ✅ PARTE 1: Crear Cuenta en Stripe

### 1.1 Registrarse en Stripe

1. Ve a [stripe.com](https://stripe.com)
2. Click en **"Start now"** o **"Sign up"**
3. Completa el registro:
   - Email
   - Contraseña
   - País: **México** (ya que los precios están en MXN)
4. Verifica tu email

### 1.2 Completar perfil básico

1. Stripe te pedirá información básica:
   - Nombre completo
   - Tipo de negocio (puedes seleccionar "Individual" o "Business")
   - Descripción breve del negocio
2. Completa lo que puedas (puedes actualizarlo después)

### 1.3 Activar cuenta (Opcional para desarrollo)

**Para desarrollo (Test Mode):**
- No necesitas activar la cuenta completa
- Puedes usar Test Mode inmediatamente
- Los pagos son simulados (no se cobra dinero real)

**Para producción:**
- Necesitarás activar la cuenta con información completa
- Documentos de identidad
- Información bancaria para recibir pagos

**Por ahora, quedémonos en Test Mode** ✅

---

## ✅ PARTE 2: Obtener API Keys (Test Mode)

### 2.1 Activar Test Mode

1. En el Dashboard de Stripe, verifica que estés en **Test Mode**
2. Deberías ver un banner que dice **"Test mode"** en la parte superior
3. Si no, click en el toggle en la esquina superior derecha

### 2.2 Obtener Secret Key

1. Ve a **Developers** → **API keys**
2. En la sección **"Standard keys"**, verás:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)
3. Click en **"Reveal test key"** para ver el Secret key
4. **Copia ambos valores** (los necesitarás después)

**⚠️ IMPORTANTE**: 
- El Secret key solo se muestra una vez
- Guárdalo en un lugar seguro
- No lo compartas públicamente

### 2.3 Guardar temporalmente

Guarda estos valores en un archivo temporal (no los subas a Git):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## ✅ PARTE 3: Crear Productos y Precios

### 3.1 Crear Producto "Pro"

1. Ve a **Products** en el menú lateral
2. Click en **"+ Add product"**
3. Completa:
   - **Name**: `Plan Pro - ValidarRFC.mx`
   - **Description**: `Plan Pro con 1,000 validaciones por mes`
   - **Pricing model**: `Standard pricing`
   - **Price**: `299` (MXN)
   - **Billing period**: `Monthly` (recurring)
4. Click en **"Save product"**
5. **Copia el Price ID** (empieza con `price_...`)
   - Lo verás en la página del producto
   - O en la lista de precios

### 3.2 Crear Producto "Enterprise"

1. Click en **"+ Add product"** nuevamente
2. Completa:
   - **Name**: `Plan Enterprise - ValidarRFC.mx`
   - **Description**: `Plan Enterprise con validaciones ilimitadas`
   - **Pricing model**: `Standard pricing`
   - **Price**: `999` (MXN)
   - **Billing period**: `Monthly` (recurring)
3. Click en **"Save product"**
4. **Copia el Price ID** (empieza con `price_...`)

### 3.3 Guardar Price IDs

Guarda estos valores:

```
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

---

## ✅ PARTE 4: Configurar Webhook

### 4.1 Crear endpoint de webhook

1. Ve a **Developers** → **Webhooks**
2. Click en **"+ Add endpoint"**
3. En **"Endpoint URL"**, escribe:
   ```
   https://tu-dominio-vercel.vercel.app/api/stripe/webhook
   ```
   **⚠️ IMPORTANTE**: Reemplaza `tu-dominio-vercel.vercel.app` con tu dominio real de Vercel
   
   **Si aún no tienes el dominio de Vercel:**
   - Puedes usar `http://localhost:3000/api/stripe/webhook` para desarrollo local
   - O esperar a tener el dominio de Vercel y configurarlo después

4. En **"Description"**, escribe: `ValidarRFC.mx - Webhook para suscripciones`

5. En **"Events to send"**, selecciona estos eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`

6. Click en **"Add endpoint"**

### 4.2 Obtener Webhook Secret

1. Después de crear el endpoint, verás la página de detalles
2. En la sección **"Signing secret"**, click en **"Reveal"**
3. **Copia el Webhook Secret** (empieza con `whsec_...`)

**⚠️ IMPORTANTE**: 
- Este secret solo se muestra una vez
- Guárdalo en un lugar seguro

### 4.3 Guardar Webhook Secret

Guarda este valor:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.4 Nota sobre desarrollo local

**Para probar webhooks localmente**, puedes usar:
- [Stripe CLI](https://stripe.com/docs/stripe-cli) para reenviar eventos a localhost
- O configurar el webhook después cuando tengas el dominio de Vercel

**Por ahora, puedes dejar el webhook configurado con el dominio de Vercel** (aunque aún no esté desplegado, Stripe lo guardará y funcionará cuando esté listo).

---

## ✅ PARTE 5: Configurar Variables de Entorno

### 5.1 Actualizar `.env.local` (Local)

Abre tu archivo `.env.local` y agrega:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_tu_secret_key_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu_publishable_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
STRIPE_PRICE_ID_PRO=price_tu_pro_price_id_aqui
STRIPE_PRICE_ID_ENTERPRISE=price_tu_enterprise_price_id_aqui
```

**Ejemplo completo de `.env.local`:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lkrwnutofhzyvtbbsrwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_WEBHOOK_SECRET=whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_PRICE_ID_PRO=price_1AbCdEfGhIjKlMnOpQrStUv
STRIPE_PRICE_ID_ENTERPRISE=price_1XyZaBcDeFgHiJkLmNoPqRs

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 5.2 Configurar en Vercel (Producción)

**Cuando tengas el dominio de Vercel:**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (cópialas de tu `.env.local`):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

**⚠️ IMPORTANTE**: 
- Selecciona **"Production"**, **"Preview"** y **"Development"** para cada variable
- Reemplaza los valores con los reales (no uses `...`)

### 5.3 Actualizar Webhook en Stripe (Después del deploy)

**Cuando tengas el dominio de Vercel:**

1. Ve a Stripe Dashboard → **Developers** → **Webhooks**
2. Click en tu endpoint
3. Click en **"Edit"**
4. Actualiza **"Endpoint URL"** con tu dominio real:
   ```
   https://tu-dominio-vercel.vercel.app/api/stripe/webhook
   ```
5. Click en **"Save"**

---

## ✅ PARTE 6: Probar Configuración

### 6.1 Probar localmente

1. Reinicia tu servidor:
   ```powershell
   cd C:\Users\loorj\Documents\validarFC.MX
   npm run dev
   ```

2. Ve a `http://localhost:3000/dashboard/billing`
3. Deberías ver los planes Pro y Enterprise
4. Click en **"Upgrade"** en uno de los planes
5. Deberías ser redirigido a Stripe Checkout (en Test Mode)
6. Usa una tarjeta de prueba:
   - **Número**: `4242 4242 4242 4242`
   - **Fecha**: Cualquier fecha futura (ej: `12/25`)
   - **CVC**: Cualquier 3 dígitos (ej: `123`)
   - **ZIP**: Cualquier código postal (ej: `12345`)

7. Completa el pago
8. Deberías ser redirigido de vuelta a `/dashboard/billing?success=true`

### 6.2 Verificar en Stripe Dashboard

1. Ve a **Payments** en Stripe Dashboard
2. Deberías ver el pago de prueba
3. Ve a **Customers**
4. Deberías ver un nuevo customer con el email de tu usuario

### 6.3 Verificar en Supabase

1. Ve a Supabase Dashboard → **Table Editor** → **users**
2. Busca tu usuario
3. Verifica que `subscription_status` haya cambiado a `pro` o `enterprise`
4. Ve a **subscriptions**
5. Deberías ver una nueva suscripción

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

### Stripe Account
- [ ] Cuenta creada en Stripe
- [ ] Test Mode activado
- [ ] Secret Key obtenido
- [ ] Publishable Key obtenido

### Productos y Precios
- [ ] Producto "Pro" creado ($299 MXN/mes)
- [ ] Price ID de Pro copiado
- [ ] Producto "Enterprise" creado ($999 MXN/mes)
- [ ] Price ID de Enterprise copiado

### Webhook
- [ ] Endpoint de webhook creado
- [ ] URL configurada (con dominio de Vercel o localhost)
- [ ] Eventos seleccionados:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Webhook Secret copiado

### Variables de Entorno
- [ ] `.env.local` actualizado con todas las variables de Stripe
- [ ] Variables configuradas en Vercel (cuando tengas el dominio)

### Pruebas
- [ ] Checkout funciona localmente
- [ ] Pago de prueba completado
- [ ] Usuario actualizado en Supabase
- [ ] Suscripción creada en Supabase

---

## 🆘 Problemas Comunes

### Error: "No such price"
- Verifica que los Price IDs sean correctos
- Asegúrate de copiar el Price ID completo (empieza con `price_`)

### Error: "Invalid API Key"
- Verifica que estés usando las keys de Test Mode (empiezan con `sk_test_` y `pk_test_`)
- Asegúrate de no tener espacios extra al copiar

### Webhook no funciona
- Verifica que la URL del webhook sea correcta
- Asegúrate de que el endpoint esté accesible (no en localhost si es producción)
- Revisa los logs en Stripe Dashboard → Webhooks → [tu endpoint] → Logs

### El pago se completa pero no se actualiza la suscripción
- Verifica que el webhook esté configurado correctamente
- Revisa los logs del webhook en Stripe Dashboard
- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto

---

## 📝 Notas Importantes

1. **Test Mode vs Production**: 
   - En Test Mode, los pagos son simulados
   - Para producción, necesitarás activar tu cuenta y usar keys de producción (empiezan con `sk_live_` y `pk_live_`)

2. **Webhook en desarrollo local**:
   - Para probar webhooks localmente, usa [Stripe CLI](https://stripe.com/docs/stripe-cli)
   - O configura el webhook después cuando tengas el dominio de Vercel

3. **Precios en MXN**:
   - Los precios están en Pesos Mexicanos
   - Stripe maneja la conversión automáticamente

4. **Seguridad**:
   - Nunca subas las keys a Git (ya están en `.gitignore`)
   - Usa variables de entorno siempre
   - El Secret Key y Webhook Secret son sensibles, guárdalos seguros

---

## 🎯 Siguiente Paso

Una vez que Stripe esté configurado:
- ✅ Probar el flujo completo de checkout
- ✅ Configurar dominio personalizado (opcional)
- ✅ Activar cuenta de Stripe para producción (cuando estés listo)

¿Listo para empezar? ¡Vamos paso a paso! 💳

