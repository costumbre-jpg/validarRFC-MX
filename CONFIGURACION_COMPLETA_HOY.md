# 🚀 Configuración Completa: Supabase + Dominios (Hoy)

## 📋 Resumen de lo que haremos hoy

1. ✅ Verificar configuración de Supabase (local y producción)
2. ✅ Configurar dominio en Vercel
3. ✅ Actualizar URLs en Supabase para producción
4. ✅ Actualizar URLs en Google Cloud Console para OAuth

---

## PARTE 1: Verificar Supabase Local

### 1.1 Verificar archivo `.env.local`

Abre tu archivo `.env.local` en la raíz del proyecto y verifica que tenga:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://lkrwnutofhzyvtbbsrwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Site URL (local)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Si no tienes estas variables:**
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantén esto secreto)

### 1.2 Verificar tablas en Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **Table Editor**
3. Verifica que existan estas tablas:
   - ✅ `users`
   - ✅ `validations`
   - ✅ `subscriptions`
   - ✅ `api_keys`
   - ✅ `api_usage_logs`

**Si faltan tablas:**
1. Ve a **SQL Editor**
2. Ejecuta las migraciones de `supabase/migrations/` en orden

### 1.3 Verificar configuración de autenticación

1. Ve a **Authentication** → **URL Configuration**
2. Verifica:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

3. Ve a **Authentication** → **Providers**
4. Verifica:
   - ✅ **Email**: Habilitado (toggle ON)
   - ✅ **Google**: Habilitado (toggle ON) con Client ID y Secret configurados

---

## PARTE 2: Obtener Dominio de Vercel

### 2.1 Esperar a que se libere el límite de deploys

- ⏰ Espera las 21 horas desde el último deploy
- O actualiza a Vercel Pro para deploys ilimitados

### 2.2 Hacer deploy en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `maflipp-platform`
3. Click en **"Deployments"**
4. Click en **"Redeploy"** en el último deployment
5. O haz un nuevo push a GitHub:
   ```powershell
   git add .
   git commit -m "Fix build errors"
   git push
   ```

### 2.3 Obtener dominio de Vercel

Después del deploy exitoso:

1. En Vercel Dashboard, ve a tu proyecto
2. Click en **"Settings"** → **"Domains"**
3. Verás tu dominio automático:
   - Ejemplo: `maflipp-platform.vercel.app`
   - O si configuraste uno: `maflipp-platform-tu-usuario.vercel.app`

**Copia este dominio**, lo necesitarás en los siguientes pasos.

---

## PARTE 3: Configurar Variables de Entorno en Vercel

### 3.1 Agregar variables de Supabase

1. En Vercel Dashboard, ve a tu proyecto
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega estas variables (cópialas de tu `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://lkrwnutofhzyvtbbsrwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_SITE_URL=https://tu-dominio-vercel.vercel.app
```

**⚠️ IMPORTANTE**: 
- Reemplaza `tu-dominio-vercel.vercel.app` con tu dominio real de Vercel
- Selecciona **"Production"**, **"Preview"** y **"Development"** para cada variable

### 3.2 Guardar y redeploy

1. Click en **"Save"** para cada variable
2. Ve a **"Deployments"**
3. Click en **"Redeploy"** en el último deployment para aplicar los cambios

---

## PARTE 4: Actualizar URLs en Supabase (Producción)

### 4.1 Actualizar Site URL

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Authentication** → **URL Configuration**
4. En **"Site URL"**, agrega tu dominio de Vercel:
   ```
   https://tu-dominio-vercel.vercel.app
   ```
   (Mantén también `http://localhost:3000` si quieres seguir desarrollando localmente)

### 4.2 Actualizar Redirect URLs

En **"Redirect URLs"**, agrega (una por línea):

```
http://localhost:3000/auth/callback
https://tu-dominio-vercel.vercel.app/auth/callback
```

**Ejemplo completo:**
```
http://localhost:3000/auth/callback
https://maflipp-platform.vercel.app/auth/callback
```

### 4.3 Guardar cambios

1. Click en **"Save"**
2. ✅ Deberías ver un mensaje de éxito

---

## PARTE 5: Actualizar URLs en Google Cloud Console

### 5.1 Ir a OAuth 2.0 Client IDs

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Click en tu **OAuth 2.0 Client ID** (el que creaste para esta app)

### 5.2 Actualizar Authorized redirect URIs

En **"Authorized redirect URIs"**, agrega:

```
https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE**: 
- Esta URL es la de Supabase, NO la de Vercel
- Supabase maneja el OAuth, así que siempre usa la URL de Supabase
- Si ya la tienes, no necesitas cambiarla

### 5.3 Actualizar Authorized JavaScript origins (Opcional)

Si quieres agregar tu dominio de Vercel (aunque no es necesario para OAuth):

```
https://tu-dominio-vercel.vercel.app
```

### 5.4 Guardar cambios

1. Click en **"Save"**
2. ⏰ Puede tardar unos minutos en aplicarse

---

## PARTE 6: Verificar que Todo Funcione

### 6.1 Probar localmente

```powershell
cd C:\Users\loorj\Documents\validarFC.MX
npm run dev
```

1. Ve a `http://localhost:3000/auth/register`
2. Prueba registro con email/password
3. Prueba registro con Google
4. Verifica que llegues al dashboard

### 6.2 Probar en producción

1. Ve a `https://tu-dominio-vercel.vercel.app/auth/register`
2. Prueba registro con email/password
3. Prueba registro con Google
4. Verifica que llegues al dashboard

---

## ✅ Checklist Final

Marca cada item cuando lo completes:

### Supabase Local
- [ ] `.env.local` tiene todas las variables de Supabase
- [ ] Todas las tablas existen (`users`, `validations`, `subscriptions`, `api_keys`, `api_usage_logs`)
- [ ] URL Configuration tiene `http://localhost:3000`
- [ ] Redirect URLs tiene `http://localhost:3000/auth/callback`
- [ ] Google Provider está habilitado con credenciales

### Vercel
- [ ] Deploy exitoso en Vercel
- [ ] Dominio obtenido: `https://________________.vercel.app`
- [ ] Variables de entorno configuradas en Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_SITE_URL` (con dominio de Vercel)

### Supabase Producción
- [ ] Site URL actualizada con dominio de Vercel
- [ ] Redirect URLs tiene dominio de Vercel: `https://tu-dominio.vercel.app/auth/callback`

### Google Cloud Console
- [ ] Authorized redirect URIs tiene: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
- [ ] Cambios guardados

### Pruebas
- [ ] Login/registro funciona localmente
- [ ] Login/registro funciona en producción
- [ ] Google OAuth funciona localmente
- [ ] Google OAuth funciona en producción

---

## 🆘 Problemas Comunes

### Error: "redirect_uri_mismatch"
- Verifica que en Google Cloud Console tengas: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
- Verifica que en Supabase tengas el redirect URL correcto

### Error: "Invalid login credentials"
- Verifica que en Supabase → Authentication → Providers → Email, "Confirm email" esté en OFF (para desarrollo)

### La app no carga en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Verifica que el build haya sido exitoso
- Revisa los logs en Vercel Dashboard → Deployments → [tu deploy] → Logs

### Google OAuth no funciona en producción
- Verifica que en Supabase → URL Configuration tengas el dominio de Vercel
- Verifica que en Supabase → Redirect URLs tengas: `https://tu-dominio.vercel.app/auth/callback`
- Espera unos minutos después de hacer cambios (pueden tardar en aplicarse)

---

## 📝 Notas Importantes

1. **Supabase maneja OAuth**: La URL de redirect en Google Cloud Console SIEMPRE debe ser la de Supabase (`https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`), NO la de Vercel.

2. **Variables de entorno**: Asegúrate de que `NEXT_PUBLIC_SITE_URL` en Vercel tenga tu dominio real (con `https://`).

3. **Tiempo de propagación**: Los cambios en Google Cloud Console pueden tardar 5-10 minutos en aplicarse.

4. **Desarrollo vs Producción**: Puedes tener ambos configurados al mismo tiempo (localhost para desarrollo, Vercel para producción).

---

## 🎯 Siguiente Paso

Una vez que todo esté configurado y funcionando:
- ✅ **Stripe** (para cuando quieras activar pagos)
- ✅ **Dominio personalizado** (opcional, si quieres usar tu propio dominio)

¿Listo para empezar? ¡Vamos paso a paso! 🚀

