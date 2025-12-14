# 🔐 Actualizar Google OAuth con Dominio Real

Si tienes Google OAuth configurado, necesitas actualizar las URLs autorizadas cuando cambies a tu dominio real.

---

## 🔍 Verificar si Tienes Google OAuth Configurado

### En tu Aplicación:
1. Ve a `https://maflipp.com/auth/login`
2. ¿Ves un botón "Google" o "Continuar con Google"?
   - **Sí** → Necesitas actualizar Google Cloud Console
   - **No** → No necesitas hacer nada

### En Supabase:
1. Ve a Supabase Dashboard → **Authentication** → **Providers**
2. ¿Está **Google** habilitado (toggle ON)?
   - **Sí** → Necesitas actualizar Google Cloud Console
   - **No** → No necesitas hacer nada

---

## ✅ Si Tienes Google OAuth: Actualizar en Google Cloud Console

### Paso 1: Ir a Google Cloud Console
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**

### Paso 2: Encontrar tu OAuth Client
1. Busca tu **OAuth 2.0 Client ID** (el que usas para Supabase)
2. Click en el nombre del cliente para editarlo

### Paso 3: Actualizar Authorized JavaScript Origins
1. En la sección **"Authorized JavaScript origins"**
2. **Agrega** tu dominio real:
   - `https://maflipp.com`
3. **Opcional:** Elimina el dominio gratis si ya no lo usas:
   - `https://tu-proyecto.vercel.app` (si quieres eliminarlo)
4. Click en **"SAVE"**

### Paso 4: Verificar Authorized Redirect URIs
1. En la sección **"Authorized redirect URIs"**
2. **NO necesitas cambiar esto** - debe ser:
   - `https://tu-proyecto.supabase.co/auth/v1/callback`
3. Esta URL es de Supabase, no de tu dominio, así que **no cambia**

**⚠️ IMPORTANTE:** 
- La URL de redirección es de Supabase, NO de tu dominio
- Solo necesitas actualizar "Authorized JavaScript origins"

---

## 📋 Checklist de Google OAuth

### Si Tienes Google OAuth Configurado:

- [ ] Ve a Google Cloud Console → APIs & Services → Credentials
- [ ] Encuentra tu OAuth 2.0 Client ID
- [ ] Actualiza **Authorized JavaScript origins**:
  - Agrega: `https://maflipp.com`
  - (Opcional) Elimina: `https://tu-proyecto.vercel.app`
- [ ] Verifica **Authorized redirect URIs**:
  - Debe tener: `https://tu-proyecto.supabase.co/auth/v1/callback`
  - Esta NO cambia
- [ ] Guarda los cambios

---

## 🆘 Si No Tienes Google OAuth

**Si NO ves el botón de Google en tu login:**
- No necesitas hacer nada
- Google OAuth no está configurado
- Puedes saltarte este paso

---

## ✅ Resumen

### Si Tienes Google OAuth:
- ✅ Actualizar **Authorized JavaScript origins** en Google Cloud Console
- ✅ Agregar: `https://maflipp.com`
- ❌ NO cambiar **Authorized redirect URIs** (es de Supabase)

### Si NO Tienes Google OAuth:
- ✅ No necesitas hacer nada

---

**✅ Con eso estaría completo!**

