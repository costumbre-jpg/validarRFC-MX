# ✅ Verificación Completa: Supabase y Google Cloud Console

## 🔍 PARTE 1: Verificar Supabase

### 1.1 Variables de Entorno ✅
Verifica que en Vercel tengas estas variables:
- [x] `NEXT_PUBLIC_SUPABASE_URL` = `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key)
- [x] `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key)
- [x] `NEXT_PUBLIC_SITE_URL` = `https://maflipp-platform.vercel.app`

**✅ Ya las tienes configuradas en Vercel**

---

### 1.2 Base de Datos ✅
Verifica que existan estas tablas:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **"Table Editor"** (en el menú lateral)
3. Deberías ver estas tablas:
   - [ ] `users`
   - [ ] `validations`
   - [ ] `subscriptions`
   - [ ] `api_keys`
   - [ ] `api_usage_logs`

**Si faltan tablas:**
- Ve a **SQL Editor**
- Ejecuta las migraciones de `supabase/migrations/`

---

### 1.3 URL Configuration ⚠️ **VERIFICAR**
1. Ve a **Authentication** → **URL Configuration**
2. Verifica:

**Site URL:**
- [ ] Debe tener: `https://maflipp-platform.vercel.app`
- [ ] Puede tener también: `http://localhost:3000` (para desarrollo)

**Redirect URLs:**
- [ ] Debe tener: `https://maflipp-platform.vercel.app/auth/callback`
- [ ] Puede tener también: `http://localhost:3000/auth/callback` (para desarrollo)

**Ejemplo correcto:**
```
Site URL: https://maflipp-platform.vercel.app

Redirect URLs:
http://localhost:3000/auth/callback
https://maflipp-platform.vercel.app/auth/callback
```

---

### 1.4 Google Provider ⚠️ **VERIFICAR**
1. Ve a **Authentication** → **Providers**
2. Busca **"Google"** en la lista
3. Verifica:

**Toggle:**
- [ ] Debe estar **ON** (habilitado/verde)

**Credenciales:**
- [ ] **Client ID (for OAuth)**: Debe tener tu Client ID de Google (empieza con números)
- [ ] **Client Secret (for OAuth)**: Debe tener tu Client Secret de Google

**Redirect URL:**
- [ ] Debe mostrar: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
- Esta URL es automática, solo verifica que esté ahí

**Opciones:**
- [ ] **Skip nonce checks**: OFF (desactivado) - más seguro
- [ ] **Allow users without an email**: OFF (desactivado)

---

### 1.5 Email Provider ⚠️ **VERIFICAR**
1. En **Authentication** → **Providers**
2. Busca **"Email"**
3. Verifica:

**Toggle:**
- [ ] Debe estar **ON** (habilitado/verde)

**Confirm email:**
- [ ] Para desarrollo: **OFF** (desactivado) - permite registro sin confirmar
- [ ] Para producción: **ON** (activado) - más seguro

---

## 🔍 PARTE 2: Verificar Google Cloud Console

### 2.1 OAuth 2.0 Client ID ⚠️ **VERIFICAR**
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Busca tu **OAuth 2.0 Client ID** (el que creaste para esta app)
5. Click en él para ver detalles

---

### 2.2 Authorized redirect URIs ⚠️ **VERIFICAR**
En la sección **"Authorized redirect URIs"**, debe tener:

- [ ] `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`

**⚠️ IMPORTANTE**: 
- Esta es la URL de Supabase, NO la de Vercel
- Debe ser exactamente esta URL (con `https://` y sin barra al final)
- Si tienes URLs de `localhost`, puedes dejarlas o eliminarlas

**Ejemplo correcto:**
```
https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
```

---

### 2.3 Authorized JavaScript origins (Opcional)
En la sección **"Authorized JavaScript origins"**, puedes tener:

- [ ] (Opcional) `https://maflipp-platform.vercel.app`
- [ ] (Opcional) `http://localhost:3000` (para desarrollo)

**⚠️ NOTA**: Esto es opcional, no es necesario para que funcione.

---

### 2.4 Consent Screen ⚠️ **VERIFICAR**
1. Ve a **APIs & Services** → **OAuth consent screen**
2. Verifica:

**App information:**
- [ ] **App name**: Tiene un nombre
- [ ] **User support email**: Tiene un email
- [ ] **Developer contact information**: Tiene un email

**App domain:**
- [ ] **Application home page**: `https://maflipp-platform.vercel.app` (o tu dominio)
- [ ] **Privacy Policy link**: `https://maflipp-platform.vercel.app/privacidad`
- [ ] **Terms of Service link**: `https://maflipp-platform.vercel.app/terminos`

**Scopes:**
- [ ] Debe tener: `.../auth/userinfo.email`
- [ ] Debe tener: `.../auth/userinfo.profile`

**Test users (si está en Testing):**
- [ ] Si está en modo "Testing", agrega tu email como test user
- [ ] Si está en modo "In production", no necesitas test users

**Publishing status:**
- [ ] **Testing**: Solo tú y test users pueden usar OAuth
- [ ] **In production**: Cualquiera puede usar OAuth (requiere verificación de Google)

---

## ✅ Checklist Final

### Supabase
- [ ] Variables de entorno en Vercel ✅ (ya las tienes)
- [ ] Tablas creadas (users, validations, subscriptions, api_keys, api_usage_logs)
- [ ] URL Configuration:
  - [ ] Site URL tiene: `https://maflipp-platform.vercel.app`
  - [ ] Redirect URLs tiene: `https://maflipp-platform.vercel.app/auth/callback`
- [ ] Google Provider:
  - [ ] Toggle ON
  - [ ] Client ID configurado
  - [ ] Client Secret configurado
- [ ] Email Provider:
  - [ ] Toggle ON
  - [ ] Confirm email: OFF (para desarrollo) o ON (para producción)

### Google Cloud Console
- [ ] OAuth 2.0 Client ID creado
- [ ] Authorized redirect URIs tiene: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
- [ ] Consent Screen configurado:
  - [ ] App name, emails, dominios
  - [ ] Privacy Policy y Terms of Service
  - [ ] Scopes configurados
  - [ ] Publishing status (Testing o In production)

---

## 🆘 Si Algo Falta

### Falta en Supabase:
1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Sigue las instrucciones arriba para verificar cada sección
3. Si falta algo, configúralo según las instrucciones

### Falta en Google Cloud Console:
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Sigue las instrucciones arriba para verificar cada sección
3. Si falta algo, configúralo según las instrucciones

---

## 🎯 Siguiente Paso

Una vez que verifiques que todo esté completo:
1. Prueba el login con Google
2. Verifica que funcione correctamente
3. Si hay errores, revisa la consola del navegador (F12)

¿Quieres que te guíe para verificar algo específico?

