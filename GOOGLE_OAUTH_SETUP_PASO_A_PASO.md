# 🔐 Configuración de Google OAuth - Paso a Paso

## 📋 Resumen

Vamos a configurar Google OAuth en **3 pasos**:
1. Crear proyecto en Google Cloud Console (10 min)
2. Configurar OAuth en Google (10 min)
3. Configurar en Supabase (5 min)

**Total: ~25 minutos**

---

## ✅ PASO 1: Crear Proyecto en Google Cloud Console

### 1.1 Ir a Google Cloud Console

1. Abre tu navegador y ve a: **https://console.cloud.google.com/**
2. Inicia sesión con tu cuenta de Google
   - Puede ser tu cuenta personal o una cuenta de Google Workspace

### 1.2 Crear o Seleccionar Proyecto

1. En la parte superior, verás un dropdown con el nombre del proyecto
2. Click en el dropdown
3. Click en **"NEW PROJECT"** (Nuevo Proyecto)
4. Completa:
   - **Project name**: `ValidaRFC` (o el nombre que prefieras)
   - **Location**: Deja el default (No organization)
5. Click en **"CREATE"**
6. ⏳ Espera unos segundos mientras se crea

### 1.3 Seleccionar el Proyecto

1. Una vez creado, selecciona el proyecto desde el dropdown superior
2. Asegúrate de que esté seleccionado antes de continuar

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

Completa el formulario:

**App information:**
- **App name**: `ValidaRFC.mx`
- **User support email**: Tu email
- **App logo**: (Opcional, puedes subir después)
- **App domain**: `validarfcmx.com` (o tu dominio)
- **Application home page**: `https://validarfcmx.com` (o tu dominio)
- **Privacy policy link**: `https://validarfcmx.com/privacidad` (o crea una página después)
- **Terms of service link**: `https://validarfcmx.com/terminos` (o crea una página después)
- **Authorized domains**: `validarfcmx.com` (o tu dominio)

**Developer contact information:**
- **Email addresses**: Tu email

2. Click en **"SAVE AND CONTINUE"**

### 2.4 Configurar Scopes (Permisos)

1. En la pantalla de **"Scopes"**, click en **"ADD OR REMOVE SCOPES"**
2. Selecciona estos scopes (mínimos necesarios):
   - ✅ `.../auth/userinfo.email` (Ver tu dirección de correo electrónico)
   - ✅ `.../auth/userinfo.profile` (Ver tu información de perfil básica)
3. Click en **"UPDATE"**
4. Click en **"SAVE AND CONTINUE"**

### 2.5 Agregar Usuarios de Prueba (Opcional para desarrollo)

1. En **"Test users"**, puedes agregar emails de prueba
2. Esto es útil para desarrollo antes de publicar
3. Click en **"ADD USERS"** y agrega tu email
4. Click en **"SAVE AND CONTINUE"**

### 2.6 Revisar y Finalizar

1. Revisa la información
2. Click en **"BACK TO DASHBOARD"**

---

## ✅ PASO 3: Crear Credenciales OAuth

### 3.1 Ir a Credentials

1. En el menú lateral, click en **"APIs & Services"** → **"Credentials"**
2. Verás una lista de credenciales (probablemente vacía)

### 3.2 Crear OAuth Client ID

1. Click en **"+ CREATE CREDENTIALS"** (arriba)
2. Selecciona **"OAuth client ID"**

### 3.3 Configurar OAuth Client

1. **Application type**: Selecciona **"Web application"**
2. **Name**: `ValidaRFC Web Client` (o el nombre que prefieras)

### 3.4 Configurar Authorized JavaScript origins

Click en **"+ ADD URI"** y agrega:

**Para desarrollo:**
- `http://localhost:3000`

**Para producción (cuando despliegues):**
- `https://tu-dominio.com` (o `https://tu-dominio.vercel.app`)

**Ejemplo:**
```
http://localhost:3000
https://validarfcmx.com
```

### 3.5 Configurar Authorized redirect URIs

**⚠️ IMPORTANTE**: Esta es la URL más importante.

Click en **"+ ADD URI"** y agrega:

**Para desarrollo:**
- `https://tu-proyecto.supabase.co/auth/v1/callback`
  - Reemplaza `tu-proyecto` con el ID de tu proyecto de Supabase
  - Ejemplo: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

**Para producción (cuando despliegues):**
- La misma URL de Supabase (no cambia)
- `https://tu-proyecto.supabase.co/auth/v1/callback`

**¿Cómo obtener la URL de tu proyecto Supabase?**
1. Ve a tu Supabase Dashboard
2. Settings → API
3. Copia el **Project URL** (algo como `https://xxxxx.supabase.co`)
4. Agrega `/auth/v1/callback` al final

**Ejemplo completo:**
```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

### 3.6 Crear el Client ID

1. Click en **"CREATE"**
2. ⚠️ **IMPORTANTE**: Se mostrará un popup con:
   - **Your Client ID** (algo como: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Your Client Secret** (algo como: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
3. ⚠️ **COPIA AMBOS VALORES** (no los pierdas, no los podrás ver de nuevo)
4. Si los pierdes, tendrás que crear nuevas credenciales

---

## ✅ PASO 4: Configurar en Supabase

### 4.1 Ir a Supabase Dashboard

1. Ve a tu **Supabase Dashboard**
2. Selecciona tu proyecto

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
   - Debería ser: `https://tu-proyecto.supabase.co/auth/v1/callback`
   - Verifica que sea correcta

### 4.5 Guardar Configuración

1. Click en **"Save"** (o el botón de guardar)
2. ✅ Deberías ver un mensaje de éxito

---

## ✅ PASO 5: Verificar Configuración

### 5.1 Verificar en Supabase

1. En Supabase Dashboard → **Authentication** → **Providers**
2. Verifica que **Google** esté **habilitado** (toggle ON)
3. Verifica que las credenciales estén guardadas

### 5.2 Verificar en Google Cloud Console

1. Ve a Google Cloud Console → **APIs & Services** → **Credentials**
2. Verifica que tu OAuth Client ID esté creado
3. Verifica que las **Authorized redirect URIs** incluyan:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

---

## ✅ PASO 6: Probar en tu App

### 6.1 Reiniciar Servidor

1. Detén tu servidor si está corriendo (`Ctrl+C`)
2. Reinicia: `npm run dev`

### 6.2 Probar en el Navegador

1. Abre: **http://localhost:3000/auth/login**
2. Deberías ver el botón **"Google"**
3. Click en el botón **"Google"**
4. Deberías ser redirigido a Google para autenticarte
5. Selecciona tu cuenta de Google
6. Acepta los permisos
7. Deberías ser redirigido de vuelta a tu app
8. ✅ Deberías estar autenticado y ver el dashboard

### 6.3 Verificar en Supabase

1. Ve a Supabase Dashboard → **Authentication** → **Users**
2. Deberías ver tu usuario creado con Google
3. El email debería ser el de tu cuenta de Google

---

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección no coincide.

**Solución**:
1. Ve a Google Cloud Console → **Credentials** → Tu OAuth Client
2. Verifica que **Authorized redirect URIs** incluya:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
3. Asegúrate de que sea EXACTAMENTE igual (sin espacios, sin trailing slash)

### Error: "invalid_client"

**Causa**: Las credenciales (Client ID/Secret) son incorrectas.

**Solución**:
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de que no haya espacios extra
3. Verifica que el provider esté habilitado en Supabase

### Error: "access_denied"

**Causa**: El usuario canceló la autenticación o no aceptó los permisos.

**Solución**:
- Es normal, el usuario simplemente canceló
- Intenta de nuevo

### El botón no hace nada

**Causa**: El provider no está habilitado o hay un error en el código.

**Solución**:
1. Verifica que Google esté habilitado en Supabase
2. Abre la consola del navegador (F12) y revisa errores
3. Verifica que las variables de entorno estén configuradas

### Error: "OAuth client not found"

**Causa**: El Client ID no existe o fue eliminado.

**Solución**:
1. Ve a Google Cloud Console → **Credentials**
2. Verifica que el OAuth Client ID exista
3. Si fue eliminado, créalo de nuevo

---

## 📝 Checklist Final

- [ ] Proyecto creado en Google Cloud Console
- [ ] OAuth Consent Screen configurado
- [ ] OAuth Client ID creado
- [ ] Authorized JavaScript origins configurados
- [ ] Authorized redirect URIs configurados (con URL de Supabase)
- [ ] Credenciales copiadas (Client ID y Secret)
- [ ] Google provider habilitado en Supabase
- [ ] Credenciales pegadas en Supabase
- [ ] Probado en desarrollo (funciona)
- [ ] Usuario creado correctamente en Supabase

---

## 🚀 Para Producción

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

---

## ✅ ¡Listo!

Si completaste todos los pasos y la prueba funcionó, **¡Google OAuth está configurado!** 🎉

Ahora tus usuarios pueden:
- ✅ Registrarse con Google
- ✅ Iniciar sesión con Google
- ✅ Usar su cuenta de Google para acceder

**Próximo paso**: Configurar Stripe (cuando quieras habilitar pagos)

---

## 📚 Recursos Útiles

- [Google Cloud Console](https://console.cloud.google.com/)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentación de Supabase OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

**¿Necesitas ayuda?** Revisa la sección de "Solución de Problemas" o comparte el error que ves.

