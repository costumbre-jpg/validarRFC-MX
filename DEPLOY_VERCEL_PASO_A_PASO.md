# 🚀 Deploy en Vercel - Paso a Paso Completo

## 📋 Resumen

Vamos a hacer deploy de tu app en Vercel para obtener un dominio gratis. El dominio se crea automáticamente cuando haces el deploy.

**Tiempo estimado**: 15-20 minutos

---

## ✅ PASO 1: Preparar el Código en GitHub

### 1.1 Verificar que Tienes Git Inicializado

1. Abre una terminal en tu proyecto
2. Ejecuta:
   ```powershell
   git status
   ```

3. **Si ves archivos**, Git ya está inicializado ✅
4. **Si ves error**, necesitas inicializar Git:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   ```

### 1.2 Crear Repositorio en GitHub

1. Ve a: https://github.com
2. Inicia sesión (o crea cuenta si no tienes)
3. Click en el **"+"** (arriba a la derecha) → **"New repository"**
4. Completa:
   - **Repository name**: `validarfcmx` (o el nombre que prefieras)
   - **Description**: (opcional) "ValidaRFC.mx - Validación de RFC"
   - **Visibility**: **Public** (puede ser privado también, pero public es más fácil)
5. **NO marques** "Add a README file" (ya tienes código)
6. Click en **"Create repository"**

### 1.3 Subir Código a GitHub

GitHub te mostrará instrucciones. En tu terminal, ejecuta:

```powershell
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/validarfcmx.git
git branch -M main
git push -u origin main
```

**Si te pide usuario/contraseña:**
- Usuario: Tu usuario de GitHub
- Contraseña: Usa un **Personal Access Token** (no tu contraseña normal)
  - Cómo crear token: https://github.com/settings/tokens
  - Click en "Generate new token (classic)"
  - Marca "repo" (todos los permisos de repo)
  - Copia el token y úsalo como contraseña

---

## ✅ PASO 2: Crear Cuenta en Vercel

1. Ve a: https://vercel.com
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel a acceder a tu GitHub
5. Completa el registro

---

## ✅ PASO 3: Hacer Deploy en Vercel

### 3.1 Crear Nuevo Proyecto

1. En Vercel, click en **"Add New Project"** o **"New Project"**
2. Verás una lista de tus repositorios de GitHub
3. Busca `validarfcmx` (o el nombre que pusiste)
4. Click en **"Import"** al lado del repositorio

### 3.2 Configurar el Proyecto

Vercel detectará automáticamente que es Next.js. Verás:

**Framework Preset:**
- Debería decir **"Next.js"** automáticamente ✅
- Si no, selecciónalo manualmente

**Root Directory:**
- Déjalo en `./` (por defecto) ✅

**Build and Output Settings:**
- Déjalo por defecto ✅

### 3.3 Agregar Variables de Entorno

**⚠️ MUY IMPORTANTE**: Aquí debes agregar todas tus variables de entorno.

Click en **"Environment Variables"** y agrega:

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: Tu URL de Supabase (ej: `https://lkrwnutofhzyvtbbsrwh.supabase.co`)

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: Tu anon key de Supabase

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Value: Tu service role key de Supabase

4. **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Value: Tu Stripe publishable key (si usas Stripe)

5. **STRIPE_SECRET_KEY**
   - Value: Tu Stripe secret key (si usas Stripe)

6. **STRIPE_WEBHOOK_SECRET**
   - Value: Tu Stripe webhook secret (si usas Stripe)

**Para cada variable:**
- Click en **"Add Another"** para agregar más
- Asegúrate de agregar para **Production**, **Preview**, y **Development** (o al menos Production)

### 3.4 Hacer Deploy

1. Revisa que todas las variables estén agregadas
2. Click en **"Deploy"** (botón grande abajo)
3. ⏳ Espera 2-5 minutos mientras Vercel:
   - Instala dependencias
   - Hace build del proyecto
   - Despliega la app

---

## ✅ PASO 4: Obtener el Dominio

### 4.1 El Dominio se Crea Automáticamente

Cuando el deploy termine, verás:

```
✅ Deployment successful!

Your project is live at:
https://validarfcmx.vercel.app
```

**¡Ese es tu dominio!** 🎉

### 4.2 Ver el Dominio

1. En la página del proyecto en Vercel, verás:
   - **Domains**: `validarfcmx.vercel.app`
   - O puede ser: `validarfcmx-abc123.vercel.app`

2. **Copia esa URL** - esa es tu URL pública

---

## ✅ PASO 5: Usar el Dominio en Google Cloud Console

Ahora que tienes el dominio de Vercel, úsalo en Google:

1. Ve a **Google Cloud Console** → **OAuth consent screen**
2. Click en **"EDIT APP"**
3. En **App information**, actualiza:

   - **Privacy policy link**: 
     ```
     https://validarfcmx.vercel.app/privacidad
     ```
     (Reemplaza con tu URL real de Vercel)

   - **Terms of service link**: 
     ```
     https://validarfcmx.vercel.app/terminos
     ```
     (Reemplaza con tu URL real de Vercel)

4. Guarda los cambios

---

## ✅ PASO 6: Actualizar Google Cloud Console Credentials

También necesitas agregar el dominio de Vercel a las credenciales de OAuth:

1. Ve a **Google Cloud Console** → **APIs & Services** → **Credentials**
2. Click en tu **OAuth 2.0 Client ID**
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://validarfcmx.vercel.app
   ```
   (Reemplaza con tu URL real de Vercel)

4. **Authorized redirect URIs** ya está bien (no cambia):
   ```
   https://lkrwnutofhzyvtbbsrwh.supabase.co/auth/v1/callback
   ```

5. Click en **"SAVE"**

---

## ✅ PASO 7: Actualizar Supabase

También actualiza Supabase para que acepte el dominio de Vercel:

1. Ve a **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   https://validarfcmx.vercel.app/auth/callback
   ```
   (Reemplaza con tu URL real de Vercel)

3. Guarda los cambios

---

## 🧪 Verificar que Todo Funciona

1. Ve a: `https://validarfcmx.vercel.app` (tu URL de Vercel)
2. Deberías ver tu landing page
3. Ve a: `https://validarfcmx.vercel.app/privacidad`
4. Deberías ver la política de privacidad
5. Ve a: `https://validarfcmx.vercel.app/terminos`
6. Deberías ver los términos de servicio

Si todo se ve bien, ¡está funcionando! ✅

---

## 🆘 Problemas Comunes

### Error: "Build Failed"

**Causa**: Faltan variables de entorno o hay un error en el código.

**Solución**:
1. Revisa los logs de build en Vercel
2. Verifica que todas las variables de entorno estén agregadas
3. Revisa que el código compile localmente (`npm run build`)

### Error: "Environment Variables Missing"

**Causa**: No agregaste las variables de entorno.

**Solución**:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega todas las variables necesarias

### El Dominio No Funciona

**Causa**: El deploy puede estar en proceso o hay un error.

**Solución**:
1. Espera 2-3 minutos después del deploy
2. Verifica que el deploy esté completo (debe decir "Ready")
3. Prueba abrir la URL en modo incógnito

---

## 📝 Checklist Final

- [ ] Código subido a GitHub
- [ ] Cuenta creada en Vercel
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno agregadas
- [ ] Deploy completado
- [ ] Dominio obtenido (ej: `validarfcmx.vercel.app`)
- [ ] URLs actualizadas en Google Cloud Console
- [ ] URLs actualizadas en Supabase
- [ ] Probado que las páginas funcionan

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ Tu app en producción
- ✅ Dominio público gratis
- ✅ HTTPS automático
- ✅ URLs para Privacy Policy y Terms

¿Necesitas ayuda con algún paso específico? 🤔

