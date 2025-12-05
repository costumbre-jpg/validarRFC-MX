# 🔐 Configuración de OAuth (Google y Facebook)

## 📋 Resumen

Ahora puedes permitir que los usuarios se registren e inicien sesión con:
- ✅ **Google**
- ✅ **Facebook**
- ✅ **Email/Password** (ya estaba)

---

## 🚀 Configuración en Supabase

### Paso 1: Habilitar Providers

1. Ve a tu **Supabase Dashboard**
2. Click en **Authentication** → **Providers**
3. Busca **Google** y **Facebook** en la lista

### Paso 2: Configurar Google OAuth

1. Click en **Google** en la lista de providers
2. Toggle **ON** para habilitarlo
3. Necesitas obtener credenciales de Google:

#### 2.1 Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **APIs & Services** → **Credentials**
4. Click en **Create Credentials** → **OAuth client ID**
5. Configura:
   - **Application type**: Web application
   - **Name**: ValidaRFC.mx
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**:
     - `https://tu-proyecto.supabase.co/auth/v1/callback`
6. Click **Create**
7. Copia:
   - **Client ID**
   - **Client Secret**

#### 2.2 Configurar en Supabase

1. En Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Pega:
   - **Client ID** (de Google Cloud Console)
   - **Client Secret** (de Google Cloud Console)
3. Click **Save**

---

### Paso 3: Configurar Facebook OAuth

1. Click en **Facebook** en la lista de providers
2. Toggle **ON** para habilitarlo
3. Necesitas obtener credenciales de Facebook:

#### 3.1 Crear app en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Click en **My Apps** → **Create App**
3. Selecciona **Consumer** como tipo de app
4. Completa la información básica
5. Ve a **Settings** → **Basic**
6. Agrega:
   - **App Domains**: `tu-dominio.com`
   - **Privacy Policy URL**: `https://tu-dominio.com/privacidad`
   - **Terms of Service URL**: `https://tu-dominio.com/terminos`
7. Ve a **Products** → **Facebook Login** → **Settings**
8. Agrega **Valid OAuth Redirect URIs**:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
9. Ve a **Settings** → **Basic** y copia:
   - **App ID**
   - **App Secret** (click en "Show" para revelarlo)

#### 3.2 Configurar en Supabase

1. En Supabase Dashboard → **Authentication** → **Providers** → **Facebook**
2. Pega:
   - **Client ID (App ID)** (de Facebook Developers)
   - **Client Secret (App Secret)** (de Facebook Developers)
3. Click **Save**

---

## ✅ Verificación

### Probar Google OAuth

1. Reinicia tu servidor: `npm run dev`
2. http://localhost:3000/auth/login
3. Click en el botón **"Google"**
4. Deberías ser redirigido a Google para autenticarte
5. Después de autenticarte, serás redirigido de vuelta a tu app

### Probar Facebook OAuth

1. Ve a http://localhost:3000/auth/login
2. Click en el botón **"Facebook"**
3. Deberías ser redirigido a Facebook para autenticarte
4. Después de autenticarte, serás redirigido de vuelta a tu app

---

## 🔧 Para Producción

Cuando despliegues a producción:

### Google Cloud Console

1. Agrega tu dominio de producción a **Authorized JavaScript origins**:
   - `https://tu-dominio.com`
2. Agrega tu dominio a **Authorized redirect URIs**:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

### Facebook Developers

1. Agrega tu dominio de producción a **App Domains**
2. Agrega tu dominio a **Valid OAuth Redirect URIs**:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`

### Supabase

1. Ve a **Authentication** → **URL Configuration**
2. Agrega tu dominio de producción:
   - **Site URL**: `https://tu-dominio.com`
   - **Redirect URLs**: 
     - `https://tu-dominio.com/auth/callback`
     - `https://tu-dominio.com/**`

---

## 🎨 Personalización (Opcional)

Los botones de OAuth ya están implementados en:
- `app/auth/login/page.tsx`
- `app/auth/register/page.tsx`

Puedes personalizar:
- Colores
- Iconos
- Texto
- Posición

---

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa**: La URL de redirección no está configurada correctamente.

**Solución**:
1. Verifica que agregaste `https://tu-proyecto.supabase.co/auth/v1/callback` en:
   - Google Cloud Console → Authorized redirect URIs
   - Facebook Developers → Valid OAuth Redirect URIs

### Error: "invalid_client"

**Causa**: Las credenciales (Client ID/Secret) son incorrectas.

**Solución**:
1. Verifica que copiaste correctamente las credenciales
2. Asegúrate de que el provider esté habilitado en Supabase

### El botón no hace nada

**Causa**: El provider no está habilitado en Supabase.

**Solución**:
1. Ve a Supabase Dashboard → Authentication → Providers
2. Asegúrate de que Google/Facebook esté **ON**

---

## 📝 Notas Importantes

1. **Trigger automático**: El trigger `003_create_user_trigger.sql` también funciona con OAuth. Cuando un usuario se registra con Google/Facebook, automáticamente se crea un registro en la tabla `users`.

2. **Email**: Con OAuth, el email se obtiene automáticamente del proveedor (Google/Facebook).

3. **Primera vez**: La primera vez que un usuario usa OAuth, se crea automáticamente su cuenta.

4. **Siguientes veces**: Las siguientes veces, simplemente inicia sesión automáticamente.

---

## ✅ Checklist

- [ ] Google OAuth configurado en Supabase
- [ ] Facebook OAuth configurado en Supabase
- [ ] Credenciales de Google Cloud Console obtenidas
- [ ] Credenciales de Facebook Developers obtenidas
- [ ] URLs de redirección configuradas
- [ ] Probado en desarrollo
- [ ] Configurado para producción (cuando despliegues)

---

**¡Listo!** Ahora tus usuarios pueden registrarse e iniciar sesión con Google o Facebook. 🎉

