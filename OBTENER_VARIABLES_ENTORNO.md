# 📋 Dónde Obtener las Variables de Entorno

## 📍 Ubicación del Archivo `.env.local`

El archivo `.env.local` está en la **raíz de tu proyecto**:
```
C:\Users\loorj\Documents\validarFC.MX\.env.local
```

**⚠️ Nota**: Este archivo puede estar oculto porque empieza con punto (`.`).

---

## ✅ PASO 1: Verificar si Existe el Archivo

### Opción A: Desde el Explorador de Archivos

1. Abre el **Explorador de Archivos**
2. Ve a: `C:\Users\loorj\Documents\validarFC.MX`
3. En la barra de herramientas, click en **"Ver"** → Marca **"Elementos ocultos"**
4. Busca el archivo `.env.local`

### Opción B: Desde PowerShell

```powershell
cd C:\Users\loorj\Documents\validarFC.MX
dir .env.local
```

**Si existe** → Ábrelo y copia las variables ✅  
**Si no existe** → Necesitas crearlo o obtener las variables directamente

---

## ✅ PASO 2: Obtener Variables de Supabase

### 2.1 Ir a Supabase Dashboard

1. Ve a: **https://supabase.com/dashboard**
2. Selecciona tu proyecto: `lkrwnutofhzyvtbbsrwh`

### 2.2 Ir a Settings → API

1. En el menú lateral, click en **"Settings"** (engranaje ⚙️)
2. Click en **"API"**

### 2.3 Copiar las Variables

Verás tres valores importantes:

#### Variable 1: NEXT_PUBLIC_SUPABASE_URL
- **Dónde está**: En la sección **"Project URL"**
- **Valor**: `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- **Copia este valor completo**

#### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Dónde está**: En la sección **"Project API keys"** → **"anon public"**
- **Valor**: Algo como `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Click en el ícono de "eye" (👁️)** para revelarlo
- **Copia este valor completo**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Dónde está**: En la sección **"Project API keys"** → **"service_role"**
- **Valor**: Algo como `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **⚠️ IMPORTANTE**: Este es secreto, no lo compartas
- **Click en el ícono de "eye" (👁️)** para revelarlo
- **Copia este valor completo**

---

## ✅ PASO 3: Obtener Variables de Stripe (Si las Usas)

### 3.1 Ir a Stripe Dashboard

1. Ve a: **https://dashboard.stripe.com**
2. Inicia sesión

### 3.2 Ir a API Keys

1. En el menú lateral, click en **"Developers"**
2. Click en **"API keys"**

### 3.3 Copiar las Variables

#### Variable 1: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- **Dónde está**: En **"Publishable key"**
- **Valor**: Algo como `pk_test_51...`
- **Copia este valor**

#### Variable 2: STRIPE_SECRET_KEY
- **Dónde está**: En **"Secret key"**
- **Valor**: Algo como `sk_test_51...`
- **Click en "Reveal test key"** para verlo
- **Copia este valor**

#### Variable 3: STRIPE_WEBHOOK_SECRET (Opcional)
- **Dónde está**: En **"Developers"** → **"Webhooks"**
- Solo si ya configuraste webhooks
- **Copia el "Signing secret"**

---

## ✅ PASO 4: Usar las Variables en Vercel

Una vez que tengas los valores, en Vercel:

1. Ve a la sección **"Environment Variables"**
2. Para cada variable:
   - **Name**: El nombre (ej: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: El valor que copiaste
   - **Environments**: Marca **Production**, **Preview**, y **Development**
   - Click en **"Add"**

---

## 📝 Ejemplo de Valores

### Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://lkrwnutofhzyvtbbsrwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcndudXRvZmh6eXZ0YmJzcnciLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcndudXRvZmh6eXZ0YmJzcnciLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjk...
```

### Stripe (si lo usas):
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

---

## 🆘 Si No Tienes el Archivo .env.local

Si no tienes el archivo, puedes obtener las variables directamente desde:

1. **Supabase Dashboard** → Settings → API
2. **Stripe Dashboard** → Developers → API keys

Y agregarlas directamente en Vercel.

---

## ✅ Checklist

- [ ] Fui a Supabase Dashboard → Settings → API
- [ ] Copié `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copié `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copié `SUPABASE_SERVICE_ROLE_KEY`
- [ ] (Opcional) Fui a Stripe Dashboard → Developers → API keys
- [ ] (Opcional) Copié las variables de Stripe
- [ ] Listo para agregar en Vercel

---

¿Ya fuiste a Supabase Dashboard para obtener las variables? ¿Necesitas ayuda con algún paso? 🤔

