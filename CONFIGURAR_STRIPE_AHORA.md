# 💳 Configurar Stripe - Paso a Paso (Ahora)

## 📋 Resumen

Vamos a configurar Stripe completamente para que los pagos funcionen. Esto incluye:
1. Crear cuenta en Stripe
2. Obtener API Keys
3. Crear productos y precios (Pro y Enterprise)
4. Configurar webhook
5. Agregar variables de entorno en Vercel

**Tiempo estimado**: 30-45 minutos

---

## ✅ PASO 1: Crear Cuenta en Stripe

### 1.1 Registrarse

1. Ve a [stripe.com](https://stripe.com)
2. Click en **"Start now"** o **"Sign up"** (arriba a la derecha)
3. Completa el registro:
   - **Email**: Tu email
   - **Contraseña**: Crea una contraseña segura
   - **País**: **México** (ya que los precios están en MXN)
4. Verifica tu email (revisa tu bandeja de entrada)

### 1.2 Completar Perfil Básico

Stripe te pedirá información básica:
- **Nombre completo**
- **Tipo de negocio**: Selecciona "Individual" o "Business" (puedes cambiarlo después)
- **Descripción breve**: Ej: "Validación de RFCs contra el SAT"

**⚠️ IMPORTANTE**: Por ahora, quedémonos en **Test Mode** (modo de prueba). Los pagos serán simulados.

---

## ✅ PASO 2: Obtener API Keys (Test Mode)

### 2.1 Activar Test Mode

1. En el Dashboard de Stripe, verifica que estés en **Test Mode**
2. Deberías ver un banner que dice **"Test mode"** en la parte superior
3. Si no, hay un toggle en la esquina superior derecha para cambiar entre Test/Live

### 2.2 Obtener Secret Key

1. En el menú lateral, ve a **Developers** → **API keys**
2. En la sección **"Standard keys"**, verás:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)
3. Para ver el Secret key:
   - Click en **"Reveal test key"** o el ícono del ojo 👁️
   - **Copia TODO el valor** (es largo)
4. **Guárdalo temporalmente** en un archivo de texto (no lo subas a Git)

**⚠️ IMPORTANTE**: 
- El Secret key solo se muestra una vez cuando lo revelas
- Guárdalo en un lugar seguro
- No lo compartas públicamente

### 2.3 Copiar Publishable Key

1. El **Publishable key** ya está visible (empieza con `pk_test_...`)
2. **Cópialo también**

### 2.4 Guardar Temporalmente

Guarda estos valores en un archivo temporal (ej: `stripe-keys.txt`):

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**⚠️ NO subas este archivo a Git** (ya está en `.gitignore`)

---

## ✅ PASO 3: Crear Productos y Precios

### 3.1 Crear Producto "Plan Pro"

1. En el menú lateral, ve a **Products**
2. Click en **"+ Add product"** (botón azul arriba a la derecha)
3. Completa el formulario:

**Información del Producto:**
- **Name**: `Plan Pro - ValidarRFC.mx`
- **Description**: `Plan Pro con 1,000 validaciones por mes`

**Pricing:**
- **Pricing model**: Selecciona **"Standard pricing"**
- **Price**: `299` (sin el símbolo $)
- **Currency**: **MXN** (Peso Mexicano)
- **Billing period**: Selecciona **"Monthly"** (recurring)
- **Usage is metered**: Deja desactivado

4. Click en **"Save product"** (botón azul abajo)

5. **Después de guardar**, verás la página del producto
6. En la sección **"Pricing"**, verás el **Price ID** (empieza con `price_...`)
7. **Copia este Price ID** y guárdalo

**Ejemplo**: `price_1AbCdEfGhIjKlMnOpQrStUv`

### 3.2 Crear Producto "Plan Enterprise"

1. Click en **"+ Add product"** nuevamente
2. Completa el formulario:

**Información del Producto:**
- **Name**: `Plan Enterprise - ValidarRFC.mx`
- **Description**: `Plan Enterprise con validaciones ilimitadas`

**Pricing:**
- **Pricing model**: Selecciona **"Standard pricing"**
- **Price**: `999` (sin el símbolo $)
- **Currency**: **MXN** (Peso Mexicano)
- **Billing period**: Selecciona **"Monthly"** (recurring)
- **Usage is metered**: Deja desactivado

3. Click en **"Save product"**

4. **Copia el Price ID** (empieza con `price_...`)

### 3.3 Guardar Price IDs

Actualiza tu archivo temporal con los Price IDs:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
```

---

## ✅ PASO 4: Configurar Webhook

### 4.1 Crear Endpoint de Webhook

1. En el menú lateral, ve a **Developers** → **Webhooks**
2. Click en **"+ Add endpoint"** (botón azul arriba a la derecha)
3. Completa el formulario:

**Endpoint URL:**
```
https://maflipp-platform.vercel.app/api/stripe/webhook
```

**⚠️ IMPORTANTE**: 
- Reemplaza `maflipp-platform.vercel.app` con tu dominio real de Vercel
- Debe ser exactamente: `https://tu-dominio.vercel.app/api/stripe/webhook`

**Description:**
```
ValidarRFC.mx - Webhook para suscripciones
```

**Events to send:**
Selecciona estos eventos (marca las casillas):
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`

4. Click en **"Add endpoint"** (botón azul abajo)

### 4.2 Obtener Webhook Secret

1. Después de crear el endpoint, verás la página de detalles del webhook
2. En la sección **"Signing secret"**, verás algo como: `whsec_...`
3. Click en **"Reveal"** o el ícono del ojo 👁️
4. **Copia TODO el Webhook Secret**

**⚠️ IMPORTANTE**: 
- Este secret solo se muestra una vez
- Guárdalo en un lugar seguro

### 4.3 Guardar Webhook Secret

Actualiza tu archivo temporal:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## ✅ PASO 5: Actualizar Variables de Entorno

### 5.1 Actualizar `.env.local` (Local)

Abre tu archivo `.env.local` y agrega/actualiza estas variables:

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

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `maflipp-platform`
3. Ve a **Settings** → **Environment Variables**
4. Agrega estas variables (cópialas de tu `.env.local`):

**Variable 1:**
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_...` (tu secret key)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click en **"Save"**

**Variable 2:**
- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...` (tu publishable key)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click en **"Save"**

**Variable 3:**
- **Key**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_...` (tu webhook secret)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click en **"Save"**

**Variable 4:**
- **Key**: `STRIPE_PRICE_ID_PRO`
- **Value**: `price_...` (tu price ID de Pro)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click en **"Save"**

**Variable 5:**
- **Key**: `STRIPE_PRICE_ID_ENTERPRISE`
- **Value**: `price_...` (tu price ID de Enterprise)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development
- Click en **"Save"**

### 5.3 Hacer Redeploy en Vercel

1. Después de agregar todas las variables, ve a **Deployments**
2. Click en los **3 puntos** (⋯) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que termine (2-3 minutos)

---

## ✅ PASO 6: Verificar Webhook en Stripe

### 6.1 Verificar que el Webhook Esté Activo

1. Ve a Stripe Dashboard → **Developers** → **Webhooks**
2. Click en tu endpoint
3. Verifica que:
   - **Status**: "Enabled" (habilitado)
   - **Endpoint URL**: `https://maflipp-platform.vercel.app/api/stripe/webhook`
   - **Events**: Tiene los 3 eventos seleccionados

### 6.2 Probar Webhook (Opcional)

1. En la página del webhook, hay una sección **"Send test webhook"**
2. Puedes enviar un webhook de prueba para verificar que funciona
3. Esto es opcional, puedes hacerlo después

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

### Cuenta Stripe
- [ ] Cuenta creada en Stripe
- [ ] Test Mode activado
- [ ] Perfil básico completado

### API Keys
- [ ] Secret Key obtenido (`sk_test_...`)
- [ ] Publishable Key obtenido (`pk_test_...`)
- [ ] Keys guardadas en archivo temporal

### Productos y Precios
- [ ] Producto "Plan Pro" creado ($299 MXN/mes)
- [ ] Price ID de Pro copiado (`price_...`)
- [ ] Producto "Plan Enterprise" creado ($999 MXN/mes)
- [ ] Price ID de Enterprise copiado (`price_...`)

### Webhook
- [ ] Endpoint creado: `https://maflipp-platform.vercel.app/api/stripe/webhook`
- [ ] Eventos seleccionados:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Webhook Secret copiado (`whsec_...`)

### Variables de Entorno
- [ ] `.env.local` actualizado con todas las variables de Stripe
- [ ] Variables configuradas en Vercel:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `STRIPE_PRICE_ID_PRO`
  - [ ] `STRIPE_PRICE_ID_ENTERPRISE`
- [ ] Redeploy hecho en Vercel

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

## 🎯 Siguiente Paso

Una vez que Stripe esté configurado:
1. Prueba el flujo completo de checkout (cuando quieras)
2. Verifica que los pagos funcionen
3. Verifica que las suscripciones se actualicen en Supabase

**⚠️ NOTA**: Por ahora, todo está en Test Mode. Los pagos son simulados. Para producción, necesitarás activar tu cuenta de Stripe y usar keys de producción.

---

## 📝 Notas Importantes

1. **Test Mode vs Production**: 
   - En Test Mode, los pagos son simulados (no se cobra dinero real)
   - Para producción, necesitarás activar tu cuenta y usar keys de producción (empiezan con `sk_live_` y `pk_live_`)

2. **Precios en MXN**: 
   - Los precios están en Pesos Mexicanos
   - Stripe maneja la conversión automáticamente

3. **Seguridad**: 
   - Nunca subas las keys a Git (ya están en `.gitignore`)
   - Usa variables de entorno siempre
   - El Secret Key y Webhook Secret son sensibles, guárdalos seguros

---

¿Listo para empezar? ¡Vamos paso a paso! 💳

