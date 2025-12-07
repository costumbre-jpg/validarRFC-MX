# 🚀 Deploy en Vercel - Paso a Paso (Ahora que se Liberó el Límite)

## ✅ PASO 1: Verificar que el Código Esté en GitHub

### 1.1 Verificar último commit

```powershell
cd C:\Users\loorj\Documents\validarFC.MX
git status
```

**Si hay cambios sin commit:**
```powershell
git add .
git commit -m "Fix build errors and prepare for production"
git push
```

**Si todo está actualizado:**
- Continúa al siguiente paso

---

## ✅ PASO 2: Hacer Deploy en Vercel

### 2.1 Ir a Vercel Dashboard

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Inicia sesión si no lo has hecho
3. Busca tu proyecto: **`maflipp-platform`** (o el nombre que usaste)

### 2.2 Opción A: Redeploy (Recomendado)

1. Click en tu proyecto
2. Ve a la pestaña **"Deployments"**
3. Busca el último deployment (el que falló antes)
4. Click en los **3 puntos** (⋯) al lado del deployment
5. Click en **"Redeploy"**
6. Confirma el redeploy

### 2.3 Opción B: Nuevo Deploy desde GitHub

1. En Vercel Dashboard, click en **"Add New..."** → **"Project"**
2. Selecciona tu repositorio: `costumbre-jpg/validarRFC-MX`
3. Vercel detectará automáticamente Next.js
4. Click en **"Deploy"**

**⚠️ IMPORTANTE**: Si te dice que el proyecto ya existe, usa la Opción A (Redeploy).

---

## ✅ PASO 3: Esperar a que Complete el Build

### 3.1 Monitorear el Deploy

1. Verás el progreso del build en tiempo real
2. Debería decir:
   - ✅ "Cloning repository..."
   - ✅ "Installing dependencies..."
   - ✅ "Building application..."
   - ✅ "Deploying..."

### 3.2 Si Hay Errores

**Si el build falla:**
- Revisa los logs en Vercel
- Los errores más comunes ya los arreglamos, pero si aparece algo nuevo, avísame

**Si el build es exitoso:**
- ✅ Verás un mensaje: "Deployment successful"
- ✅ Verás una URL: `https://maflipp-platform-xxxxx.vercel.app`

---

## ✅ PASO 4: Obtener Dominio de Vercel

### 4.1 Ver Dominio

1. Después del deploy exitoso, verás tu dominio en la parte superior
2. Será algo como: `https://maflipp-platform.vercel.app`
3. **Copia este dominio completo** (lo necesitarás después)

### 4.2 Verificar que Funciona

1. Click en el dominio o ábrelo en una nueva pestaña
2. Deberías ver tu landing page
3. Si ves errores, puede ser por variables de entorno faltantes (lo arreglaremos en el siguiente paso)

---

## ✅ PASO 5: Configurar Variables de Entorno en Vercel

### 5.1 Ir a Settings

1. En Vercel Dashboard, ve a tu proyecto
2. Click en **"Settings"** (en el menú superior)
3. Click en **"Environment Variables"** (en el menú lateral)

### 5.2 Agregar Variables de Supabase

Agrega estas variables (cópialas de tu `.env.local`):

**Variable 1:**
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 2:**
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: (Tu anon key de Supabase)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 3:**
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: (Tu service role key de Supabase)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 4:**
- **Key**: `NEXT_PUBLIC_SITE_URL`
- **Value**: `https://tu-dominio-vercel.vercel.app` (reemplaza con tu dominio real)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 5.3 Agregar Variables de Stripe (Si ya las configuraste)

**Variable 5:**
- **Key**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_...` (tu secret key)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 6:**
- **Key**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_...` (tu publishable key)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 7:**
- **Key**: `STRIPE_WEBHOOK_SECRET`
- **Value**: `whsec_...` (tu webhook secret)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 8:**
- **Key**: `STRIPE_PRICE_ID_PRO`
- **Value**: `price_...` (tu price ID de Pro)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

**Variable 9:**
- **Key**: `STRIPE_PRICE_ID_ENTERPRISE`
- **Value**: `price_...` (tu price ID de Enterprise)
- **Environments**: ✅ Production, ✅ Preview, ✅ Development

### 5.4 Guardar y Redeploy

1. Después de agregar todas las variables, click en **"Save"**
2. Ve a **"Deployments"**
3. Click en **"Redeploy"** en el último deployment
4. Esto aplicará las nuevas variables de entorno

---

## ✅ PASO 6: Actualizar URLs en Supabase

### 6.1 Ir a URL Configuration

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**

### 6.2 Actualizar Site URL

En **"Site URL"**, agrega tu dominio de Vercel:
```
https://tu-dominio-vercel.vercel.app
```

**Ejemplo:**
```
https://maflipp-platform.vercel.app
```

**Nota**: Puedes tener múltiples URLs separadas por comas, o simplemente reemplazar con la de producción.

### 6.3 Actualizar Redirect URLs

En **"Redirect URLs"**, agrega (una por línea):

```
http://localhost:3000/auth/callback
https://tu-dominio-vercel.vercel.app/auth/callback
```

**Ejemplo:**
```
http://localhost:3000/auth/callback
https://maflipp-platform.vercel.app/auth/callback
```

### 6.4 Guardar

1. Click en **"Save"**
2. ✅ Deberías ver un mensaje de éxito

---

## ✅ PASO 7: Actualizar Webhook de Stripe (Si ya lo configuraste)

### 7.1 Ir a Webhooks en Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Ve a **Developers** → **Webhooks**
3. Click en tu endpoint de webhook

### 7.2 Actualizar URL del Webhook

1. Click en **"Edit"** o el ícono de editar
2. En **"Endpoint URL"**, actualiza con tu dominio de Vercel:
   ```
   https://tu-dominio-vercel.vercel.app/api/stripe/webhook
   ```
3. Click en **"Save"**

**⚠️ IMPORTANTE**: Si aún no has configurado Stripe, puedes saltar este paso y hacerlo después.

---

## ✅ PASO 8: Verificar que Todo Funciona

### 8.1 Probar Landing Page

1. Ve a tu dominio de Vercel: `https://tu-dominio.vercel.app`
2. Deberías ver la landing page
3. Verifica que no haya errores en la consola (F12)

### 8.2 Probar Registro

1. Ve a `https://tu-dominio.vercel.app/auth/register`
2. Prueba registro con email/password
3. Prueba registro con Google
4. Verifica que llegues al dashboard

### 8.3 Probar Login

1. Ve a `https://tu-dominio.vercel.app/auth/login`
2. Prueba login con email/password
3. Prueba login con Google
4. Verifica que llegues al dashboard

### 8.4 Probar Validación RFC

1. En el dashboard, prueba validar un RFC
2. Verifica que funcione correctamente

### 8.5 Probar Pagos (Si Stripe está configurado)

1. Ve a `https://tu-dominio.vercel.app/dashboard/billing`
2. Click en **"Upgrade"** en un plan
3. Deberías ser redirigido a Stripe Checkout
4. Usa una tarjeta de prueba: `4242 4242 4242 4242`

---

## 🆘 Problemas Comunes

### Error: "Environment variables not found"

**Solución:**
- Verifica que todas las variables estén en Vercel
- Asegúrate de hacer redeploy después de agregar variables

### Error: "redirect_uri_mismatch" en Google OAuth

**Solución:**
- Verifica que en Supabase → URL Configuration tengas el dominio de Vercel
- Verifica que en Google Cloud Console tengas: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`

### La página carga pero muestra errores

**Solución:**
- Abre la consola del navegador (F12)
- Revisa los errores
- Verifica que las variables de entorno estén correctas

### El build falla en Vercel

**Solución:**
- Revisa los logs del build en Vercel
- Verifica que no haya errores de TypeScript
- Asegúrate de que el código esté en GitHub

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

### Deploy
- [ ] Código actualizado en GitHub
- [ ] Deploy exitoso en Vercel
- [ ] Dominio obtenido: `https://________________.vercel.app`

### Variables de Entorno
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `NEXT_PUBLIC_SITE_URL` configurada (con dominio de Vercel)
- [ ] Variables de Stripe configuradas (si aplica)

### URLs Actualizadas
- [ ] Site URL actualizada en Supabase
- [ ] Redirect URLs actualizadas en Supabase
- [ ] Webhook de Stripe actualizado (si aplica)

### Pruebas
- [ ] Landing page carga correctamente
- [ ] Registro funciona (email/password)
- [ ] Registro funciona (Google)
- [ ] Login funciona (email/password)
- [ ] Login funciona (Google)
- [ ] Validación RFC funciona
- [ ] Pagos funcionan (si Stripe está configurado)

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu SaaS está **100% funcional en producción** 🚀

¿Necesitas ayuda con algún paso específico? ¡Avísame!

