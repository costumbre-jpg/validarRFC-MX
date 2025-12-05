# Configuración de Variables de Entorno

## ⚠️ Error Actual

Si ves este error:
```
Error: Your project's URL and Key are required to create a Supabase client!
```

Significa que necesitas configurar las variables de entorno de Supabase.

## 📝 Pasos para Configurar

### 1. Crear archivo `.env.local`

Crea un archivo llamado `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# Supabase Configuration
# Obtén estos valores en: https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration
# Obtén estos valores en: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs
# Crea productos en Stripe y copia los Price IDs
STRIPE_PRICE_ID_PRO=price_your_pro_price_id
STRIPE_PRICE_ID_ENTERPRISE=price_your_enterprise_price_id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Obtener Credenciales de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantén esto secreto)

### 3. Obtener Credenciales de Stripe (Opcional para desarrollo)

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Asegúrate de estar en **Test mode**
3. Ve a **Developers** → **API keys**
4. Copia:
   - **Secret key** → `STRIPE_SECRET_KEY`
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 4. Crear Productos en Stripe (Opcional)

1. Ve a **Products** en Stripe Dashboard
2. Crea dos productos:
   - **PRO Plan**: $99 MXN/mes (o el precio que prefieras)
   - **Enterprise Plan**: $499 MXN/mes
3. Copia los **Price IDs** a:
   - `STRIPE_PRICE_ID_PRO`
   - `STRIPE_PRICE_ID_ENTERPRISE`

### 5. Reiniciar el Servidor

Después de crear/actualizar `.env.local`:

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo:
npm run dev
```

## ✅ Verificación

Una vez configurado, deberías poder:

- ✅ Ver la landing page sin errores
- ✅ Acceder a `/auth/login` y `/auth/register`
- ✅ Crear una cuenta y acceder al dashboard

## 🚨 Nota Importante

El archivo `.env.local` está en `.gitignore` y **NO debe subirse a Git**. Contiene información sensible.

## 📚 Documentación Adicional

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Stripe Setup Guide](./STRIPE_SETUP.md)

