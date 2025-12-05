# 🔐 Configuración Completa de Google Cloud Console para MVP

## 📋 Resumen

Vamos a configurar Google OAuth en Google Cloud Console para que funcione con Supabase.

**Tiempo estimado**: 15-20 minutos

---

## ✅ PASO 1: Crear/Seleccionar Proyecto en Google Cloud Console

### 1.1 Ir a Google Cloud Console

1. Abre tu navegador y ve a: **https://console.cloud.google.com/**
2. Inicia sesión con tu cuenta de Google

### 1.2 Crear o Seleccionar Proyecto

1. En la parte superior, verás un dropdown con el nombre del proyecto
2. Click en el dropdown
3. Si ya tienes un proyecto, selecciónalo
4. Si no, click en **"NEW PROJECT"** (Nuevo Proyecto):
   - **Project name**: `ValidaRFC` (o el nombre que prefieras)
   - **Location**: Deja el default (No organization)
   - Click en **"CREATE"**
   - ⏳ Espera unos segundos

### 1.3 Seleccionar el Proyecto

1. Asegúrate de que el proyecto esté seleccionado en el dropdown superior
2. Deberías ver el nombre del proyecto en la parte superior

---

## ✅ PASO 2: Configurar OAuth Consent Screen

### 2.1 Ir a OAuth Consent Screen

1. En el menú lateral izquierdo, busca **"APIs & Services"**
2. Click en **"OAuth consent screen"**
3. Si es la primera vez, verás una pantalla de configuración

### 2.2 Configurar Tipo de Usuario

1. Selecciona **"External"** (para usuarios fuera de tu organización)
2. Click en **"CREATE"**

### 2.3 Completar Información de la App

Completa el formulario con la información mínima necesaria:

**App information:**
- **App name**: `ValidaRFC.mx` ⭐ (requerido)
- **User support email**: Tu email ⭐ (requerido)
- **App logo**: (Opcional - puedes saltar)
- **App domain**: `localhost` (para desarrollo) ⭐
- **Application home page**: `http://localhost:3000` ⭐
- **Privacy policy link**: `http://localhost:3000/privacidad` (puedes crear después) ⭐
- **Terms of service link**: `http://localhost:3000/terminos` (puedes crear después) ⭐
- **Authorized domains**: `localhost` ⭐

**Developer contact information:**
- **Email addresses**: Tu email ⭐ (requerido)

2. Click en **"SAVE AND CONTINUE"**

### 2.4 Configurar Scopes (Permisos)

1. En la pantalla de **"Scopes"**, click en **"ADD OR REMOVE SCOPES"**
2. Selecciona estos scopes (mínimos necesarios):
   - ✅ `.../auth/userinfo.email` (Ver tu dirección de correo electrónico)
   - ✅ `.../auth/userinfo.profile` (Ver tu información de perfil básica)
3. Click en **"UPDATE"**
4. Click en **"SAVE AND CONTINUE"**

### 2.5 Agregar Usuarios de Prueba (Opcional pero Recomendado)

1. En **"Test users"**, click en **"ADD USERS"**
2. Agrega tu email (el que usarás para probar)
3. Click en **"ADD"**
4. Click en **"SAVE AND CONTINUE"**

### 2.6 Revisar y Finalizar

1. Revisa la información
2. Click en **"BACK TO DASHBOARD"**

---

## ✅ PASO 3: Crear Credenciales OAuth (Client ID y Secret)

### 3.1 Ir a Credentials

1. En el menú lateral, click en **"APIs & Services"** → **"Credentials"**
2. Verás una lista de credenciales

### 3.2 Crear OAuth Client ID

1. Click en **"+ CREATE CREDENTIALS"** (arriba)
2. Selecciona **"OAuth client ID"**

### 3.3 Configurar Tipo de Aplicación

1. **Application type**: Selecciona **"Web application"**
2. **Name**: `ValidaRFC Web Client` (o el nombre que prefieras)

### 3.4 Configurar Authorized JavaScript origins

Click en **"+ ADD URI"** y agrega:

**Para desarrollo:**
```
http://localhost:3000
```

**Para producción (cuando despliegues, agrega también):**
```
https://tu-dominio.com
```

**Ejemplo completo:**
```
http://localhost:3000
https://validarfcmx.com
```

### 3.5 Configurar Authorized redirect URIs ⚠️ **MUY IMPORTANTE**

**⚠️ ESTA ES LA URL MÁS IMPORTANTE - DEBE SER EXACTA**

Click en **"+ ADD URI"** y agrega:

```
https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
```

**¿Cómo obtener la URL de tu proyecto Supabase?**
1. Ve a tu Supabase Dashboard
2. Settings → API
3. Copia el **Project URL** (algo como `https://xxxxx.supabase.co`)
4. Agrega `/auth/v1/callback` al final

**Ejemplo completo:**
```
https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
```

**⚠️ IMPORTANTE:**
- Debe ser **exactamente** esta URL
- No debe tener espacios
- Debe incluir `https://`
- Debe terminar en `/auth/v1/callback`

### 3.6 Crear el Client ID

1. Click en **"CREATE"**
2. ⚠️ **IMPORTANTE**: Se mostrará un popup con:
   - **Your Client ID** (algo como: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Your Client Secret** (algo como: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
3. ⚠️ **COPIA AMBOS VALORES INMEDIATAMENTE** (no los pierdas, no los podrás ver de nuevo)
4. Si los pierdes, tendrás que crear nuevas credenciales

**Guarda estos valores en un lugar seguro:**
- Client ID: `_____________________________`
- Client Secret: `_____________________________`

---

## ✅ PASO 4: Configurar en Supabase

### 4.1 Ir a Supabase Dashboard

1. Ve a tu **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecciona tu proyecto: `lkrwnutofhzyvtbbsrwh`

### 4.2 Ir a Authentication → Providers

1. En el menú lateral, click en **"Authentication"**
2. Click en **"Providers"**
3. Verás una lista de providers disponibles

### 4.3 Habilitar Google Provider

1. Busca **"Google"** en la lista
2. Click en el toggle para **habilitarlo** (debe quedar en ON/verde)

### 4.4 Configurar Credenciales

1. Verás dos campos:
   - **Client ID (for OAuth)**
   - **Client Secret (for OAuth)**

2. Pega las credenciales que copiaste de Google Cloud Console:
   - **Client ID**: Pega tu Client ID de Google
   - **Client Secret**: Pega tu Client Secret de Google

3. **Redirect URL**: Ya debería estar configurada automáticamente
   - Debería ser: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
   - Si no aparece, cópiala manualmente

### 4.5 Opciones Adicionales

- **Skip nonce checks**: Déjalo **OFF** (desactivado) - más seguro
- **Allow users without an email**: Déjalo **OFF** - Google siempre proporciona email

### 4.6 Guardar

1. Click en **"Save"** o el botón de guardar
2. ✅ Deberías ver un mensaje de éxito

---

## ✅ Checklist Final de Google Cloud Console

Marca cada item cuando lo completes:

- [ ] **Proyecto creado/seleccionado** en Google Cloud Console

- [ ] **OAuth Consent Screen** configurado:
  - [ ] Tipo: External
  - [ ] App name configurado
  - [ ] User support email configurado
  - [ ] Scopes agregados (email, profile)
  - [ ] Test users agregados (opcional)

- [ ] **OAuth Client ID creado**:
  - [ ] Tipo: Web application
  - [ ] Authorized JavaScript origins: `http://localhost:3000`
  - [ ] Authorized redirect URIs: `https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback`
  - [ ] Client ID copiado
  - [ ] Client Secret copiado

- [ ] **Supabase configurado**:
  - [ ] Google provider habilitado (toggle ON)
  - [ ] Client ID pegado en Supabase
  - [ ] Client Secret pegado en Supabase
  - [ ] Guardado correctamente

---

## 🧪 Probar Configuración

1. Reinicia tu servidor: `npm run dev`
2. Ve a `http://localhost:3000/auth/register`
3. Haz clic en **"Google"**
4. Deberías ver el selector de cuentas de Google
5. Selecciona una cuenta
6. Después de autenticarte, deberías llegar al dashboard

---

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección no coincide exactamente.

**Solución**:
1. Ve a Google Cloud Console → **Credentials** → Tu OAuth Client
2. Verifica que en **Authorized redirect URIs** tengas exactamente:
   ```
   https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
   ```
3. No debe tener espacios, debe ser exactamente así
4. Guarda los cambios
5. Espera 1-2 minutos para que se propague

### Error: "invalid_client"

**Causa**: Las credenciales (Client ID/Secret) son incorrectas.

**Solución**:
1. Verifica que copiaste correctamente las credenciales en Supabase
2. Asegúrate de que no haya espacios extra
3. Verifica que el provider esté habilitado en Supabase

### Error: "access_denied"

**Causa**: El usuario canceló la autenticación o no está en la lista de test users.

**Solución**:
- Si estás en modo "Testing", agrega tu email a "Test users" en OAuth Consent Screen
- Si cancelaste, simplemente intenta de nuevo

### No aparece el selector de cuentas de Google

**Causa**: Puede ser caché del navegador o configuración.

**Solución**:
1. Limpia cookies y caché del navegador
2. Prueba en modo incógnito
3. Verifica que en el código tengas `prompt: "select_account"` (ya está configurado)

### El botón no hace nada

**Causa**: El provider no está habilitado o hay un error en el código.

**Solución**:
1. Verifica que Google esté habilitado en Supabase (toggle ON)
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que las variables de entorno estén configuradas

---

## 🚀 Para Producción (Más Adelante)

Cuando despliegues a producción:

### 1. Actualizar Google Cloud Console

1. Ve a **Credentials** → Tu OAuth Client
2. Agrega a **Authorized JavaScript origins**:
   - `https://tu-dominio.com`
3. **Authorized redirect URIs** ya está bien (no cambia)

### 2. Actualizar Supabase

1. Ve a **Authentication** → **URL Configuration**
2. Agrega:
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: `https://tu-dominio.com/auth/callback`

### 3. Actualizar OAuth Consent Screen

1. Ve a **OAuth consent screen**
2. Actualiza:
   - **App domain**: Tu dominio real
   - **Application home page**: `https://tu-dominio.com`
   - **Privacy policy link**: `https://tu-dominio.com/privacidad`
   - **Terms of service link**: `https://tu-dominio.com/terminos`
   - **Authorized domains**: Tu dominio real

---

## ✅ Siguiente Paso

Una vez que Google Cloud Console y Supabase estén configurados:

1. Prueba el flujo completo de registro/login
2. Verifica que los usuarios se creen correctamente en Supabase
3. Verifica que puedas acceder al dashboard

¿Todo funcionando? ¡Excelente! 🎉

