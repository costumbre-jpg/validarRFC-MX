# 🚀 Configuración Completa de Supabase para MVP

## ✅ PASO 1: Configurar URLs en Supabase

### 1.1 Ir a URL Configuration

1. Ve a tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: `lkrwnutofhzyvtbbsrwh`
3. En el menú lateral, click en **"Authentication"**
4. Click en **"URL Configuration"** (en el submenú de Authentication)

### 1.2 Configurar Site URL

En el campo **"Site URL"**, escribe:
```
http://localhost:3000
```

### 1.3 Configurar Redirect URLs

En **"Redirect URLs"**, agrega (una por línea):
```
http://localhost:3000/auth/callback
```

**Importante**: Si planeas usar producción más adelante, también agrega:
```
https://tu-dominio.com/auth/callback
```

### 1.4 Guardar

1. Click en **"Save"** o el botón de guardar
2. ✅ Deberías ver un mensaje de éxito

---

## ✅ PASO 2: Configurar Google OAuth Provider

### 2.1 Ir a Providers

1. En el menú lateral, click en **"Authentication"**
2. Click en **"Providers"**
3. Verás una lista de providers disponibles

### 2.2 Habilitar Google

1. Busca **"Google"** en la lista
2. Click en el **toggle** para habilitarlo (debe quedar en **ON/verde**)

### 2.3 Configurar Credenciales de Google

**⚠️ IMPORTANTE**: Necesitas tener las credenciales de Google Cloud Console listas.

1. En los campos que aparecen:
   - **Client ID (for OAuth)**: Pega tu Client ID de Google
   - **Client Secret (for OAuth)**: Pega tu Client Secret de Google

2. **Redirect URL**: Ya debería estar configurada automáticamente
   - Debería ser: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
   - Si no aparece, cópiala manualmente

### 2.4 Opciones Adicionales (Opcional)

- **Skip nonce checks**: Déjalo **OFF** (desactivado) - más seguro
- **Allow users without an email**: Déjalo **OFF** - Google siempre proporciona email

### 2.5 Guardar

1. Click en **"Save"** o el botón de guardar
2. ✅ Deberías ver un mensaje de éxito

---

## ✅ PASO 3: Verificar Configuración de Email (Opcional pero Recomendado)

### 3.1 Ir a Email Provider

1. En **Authentication** → **Providers**
2. Busca **"Email"**
3. Asegúrate de que esté **habilitado** (toggle ON)

### 3.2 Configurar Confirmación de Email (Para Desarrollo)

1. Click en **"Email"** para ver opciones
2. **"Confirm email"**: 
   - Para desarrollo: **OFF** (desactivado) - permite registro sin confirmar email
   - Para producción: **ON** (activado) - más seguro

3. Guarda los cambios

---

## ✅ PASO 4: Verificar que las Tablas Existan

### 4.1 Ir a Table Editor

1. En el menú lateral, click en **"Table Editor"**
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `validations`
   - ✅ `subscriptions`
   - ✅ `api_keys`
   - ✅ `api_usage_logs`

### 4.2 Si Faltan Tablas

Si alguna tabla no existe, necesitas ejecutar las migraciones SQL:
1. Ve a **SQL Editor**
2. Ejecuta las migraciones del archivo `COPIAR_SQL_AQUI.md`

---

## ✅ PASO 5: Verificar Variables de Entorno

### 5.1 Verificar .env.local

Abre tu archivo `.env.local` y verifica que tenga:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lkrwnutofhzyvtbbsrwh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 5.2 Obtener Credenciales (Si no las tienes)

1. En Supabase Dashboard → **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## ✅ Checklist Final de Supabase

Marca cada item cuando lo completes:

- [ ] **URL Configuration** configurada:
  - [ ] Site URL: `http://localhost:3000`
  - [ ] Redirect URLs: `http://localhost:3000/auth/callback`

- [ ] **Google Provider** configurado:
  - [ ] Toggle ON (habilitado)
  - [ ] Client ID pegado
  - [ ] Client Secret pegado
  - [ ] Guardado correctamente

- [ ] **Email Provider** configurado:
  - [ ] Toggle ON (habilitado)
  - [ ] Confirm email: OFF (para desarrollo)

- [ ] **Tablas** creadas:
  - [ ] `users` existe
  - [ ] `validations` existe
  - [ ] `subscriptions` existe
  - [ ] `api_keys` existe
  - [ ] `api_usage_logs` existe

- [ ] **Variables de entorno** configuradas:
  - [ ] `.env.local` tiene todas las variables
  - [ ] Servidor reiniciado después de cambios

---

## 🧪 Probar Configuración

1. Reinicia tu servidor: `npm run dev`
2. Ve a `http://localhost:3000/auth/register`
3. Haz clic en **"Google"**
4. Deberías ver el selector de cuentas de Google
5. Después de autenticarte, deberías llegar al dashboard

---

## 🆘 Si Algo No Funciona

### Error: "redirect_uri_mismatch"
- Verifica que en Google Cloud Console tengas: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`

### Error: "invalid_client"
- Verifica que las credenciales en Supabase sean correctas
- Asegúrate de que no haya espacios extra

### No aparece el botón de Google
- Verifica que Google esté habilitado (toggle ON) en Supabase
- Revisa la consola del navegador (F12) por errores

---

## ✅ Siguiente Paso

Una vez que Supabase esté configurado, sigue con:
- **Google Cloud Console** (si aún no lo has configurado)

¿Listo para continuar con Google Cloud Console?

