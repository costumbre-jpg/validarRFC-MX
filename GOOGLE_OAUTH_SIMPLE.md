# 🔐 Google OAuth - Guía Simple y Directa

## 📋 Hay DOS cosas que configurar (en orden):

1. **OAuth Consent Screen** (pantalla de consentimiento) - PRIMERO
2. **OAuth Client ID** (credenciales) - DESPUÉS

---

## ✅ PASO 1: OAuth Consent Screen

### ¿Dónde está?
- Google Cloud Console → **APIs & Services** → **OAuth consent screen**

### ¿Qué hacer?
1. Si es la primera vez, Google te guía paso a paso
2. Completa la información básica:
   - **App name**: `ValidaRFC.mx`
   - **User support email**: Tu email
   - **App domain**: `validarfcmx.com` (o deja en blanco si no tienes dominio aún)
   - **Privacy policy**: Puedes dejarlo en blanco por ahora
   - **Terms of service**: Puedes dejarlo en blanco por ahora
3. Click en **"SAVE AND CONTINUE"**

### ¿Qué pasa con los Scopes?
- Si Google te muestra una pantalla de **"Scopes"**:
  - Click en **"ADD OR REMOVE SCOPES"**
  - Selecciona: `.../auth/userinfo.email` y `.../auth/userinfo.profile`
  - Click en **"UPDATE"** y **"SAVE AND CONTINUE"**
- Si NO te muestra esa pantalla:
  - **No te preocupes**, los scopes básicos ya están incluidos
  - Continúa al siguiente paso

### ¿Test Users?
- Si te muestra **"Test users"**:
  - Agrega tu email
  - Click en **"SAVE AND CONTINUE"**
- Si NO te muestra esa pantalla:
  - Continúa al siguiente paso

### Finalizar
- Click en **"BACK TO DASHBOARD"** o simplemente continúa

---

## ✅ PASO 2: Crear OAuth Client ID (LO MÁS IMPORTANTE)

### ¿Dónde está?
- Google Cloud Console → **APIs & Services** → **Credentials**
- Click en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**

### Configurar:

1. **Application type**: `Web application` ✅

2. **Name**: `ValidaRFC Web Client` (o el que quieras)

3. **Authorized JavaScript origins**: 
   ```
   http://localhost:3000
   ```

4. **Authorized redirect URIs**: ⚠️ **MUY IMPORTANTE**
   ```
   https://tu-proyecto.supabase.co/auth/v1/callback
   ```
   - Reemplaza `tu-proyecto` con el ID de tu proyecto Supabase
   - Ejemplo: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`

5. Click en **"CREATE"**

6. **COPIA** el **Client ID** y **Client Secret** que aparecen

---

## ✅ PASO 3: Configurar en Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Busca **"Google"** y habilítalo (toggle ON)
3. Pega:
   - **Client ID**: (el que copiaste)
   - **Client Secret**: (el que copiaste)
4. Click en **"Save"**

---

## ✅ PASO 4: Probar

1. Reinicia servidor: `npm run dev`
2. Ve a: http://localhost:3000/auth/login
3. Click en botón **"Google"**
4. Debería funcionar ✅

---

## 🎯 Resumen: ¿Qué es verdad?

### ✅ VERDAD:
- **SÍ necesitas** configurar OAuth Consent Screen (primero)
- **SÍ necesitas** crear OAuth Client ID (después)
- **SÍ necesitas** configurar en Supabase

### ⚠️ OPCIONAL:
- Configurar Scopes manualmente (solo si Google te los pide)
- Agregar Test Users (solo si Google te los pide)
- Privacy Policy/Terms (puedes dejarlos en blanco por ahora)

---

## 💡 La Guía Completa vs La Simple

- **Guía Completa** (`GOOGLE_OAUTH_SETUP_PASO_A_PASO.md`): Tiene TODOS los pasos posibles
- **Esta Guía Simple**: Solo los pasos esenciales

**Usa esta guía simple** si quieres ir directo al grano. ✅

---

## 🆘 Si algo no funciona

1. Verifica que el **Redirect URI** en Google sea EXACTAMENTE igual al de Supabase
2. Verifica que Google esté **habilitado** en Supabase
3. Verifica que las credenciales estén **correctamente pegadas** (sin espacios)

---

**¿Necesitas ayuda con algún paso específico?** Dime en qué paso estás y te ayudo. 🚀

