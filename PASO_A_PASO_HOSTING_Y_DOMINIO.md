# 🚀 Paso a Paso: Obtener Hosting y Dominio en Vercel

## 📋 Resumen

Esta guía te llevará desde cero hasta tener tu app en línea con hosting y dominio gratis.

**Tiempo total**: 20-30 minutos

---

## ✅ PASO 1: Preparar tu Código (5 minutos)

### 1.1 Verificar que Tienes Git

Abre una terminal en tu proyecto y ejecuta:

```powershell
git status
```

**Si ves archivos** → Git ya está configurado ✅  
**Si ves error** → Necesitas inicializar Git:

```powershell
git init
git add .
git commit -m "Initial commit"
```

### 1.2 Crear Cuenta en GitHub (Si no tienes)

1. Ve a: **https://github.com**
2. Click en **"Sign up"** (arriba a la derecha)
3. Completa el registro:
   - Usuario
   - Email
   - Contraseña
4. Verifica tu email

### 1.3 Crear Repositorio en GitHub

1. En GitHub, click en el **"+"** (arriba a la derecha)
2. Selecciona **"New repository"**
3. Completa:
   - **Repository name**: `validarfcmx` (o el nombre que quieras)
   - **Description**: (opcional) "ValidaRFC.mx - Validación de RFC"
   - **Visibility**: **Public** (puede ser privado también)
4. **NO marques** ninguna opción adicional
5. Click en **"Create repository"**

### 1.4 Subir tu Código a GitHub

GitHub te mostrará instrucciones. En tu terminal, ejecuta:

```powershell
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/validarfcmx.git
git branch -M main
git push -u origin main
```

**Si te pide usuario/contraseña:**
- **Usuario**: Tu usuario de GitHub
- **Contraseña**: Necesitas un **Personal Access Token** (no tu contraseña normal)
  - Cómo crear: https://github.com/settings/tokens
  - Click en **"Generate new token (classic)"**
  - Marca **"repo"** (todos los permisos)
  - Click en **"Generate token"**
  - **COPIA EL TOKEN** (no lo verás de nuevo)
  - Úsalo como contraseña cuando Git te lo pida

**Verificación:**
- Ve a tu repositorio en GitHub
- Deberías ver todos tus archivos

---

## ✅ PASO 2: Crear Cuenta en Vercel (2 minutos)

1. Ve a: **https://vercel.com**
2. Click en **"Sign Up"** (arriba a la derecha)
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel a acceder a tu GitHub
5. Completa el registro si es necesario

**Verificación:**
- Deberías ver el dashboard de Vercel

---

## ✅ PASO 3: Conectar GitHub con Vercel (1 minuto)

1. En Vercel, click en **"Add New Project"** o **"New Project"** (botón grande)
2. Verás una lista de tus repositorios de GitHub
3. Busca `validarfcmx` (o el nombre que pusiste)
4. Click en **"Import"** al lado del repositorio

**Verificación:**
- Deberías ver la página de configuración del proyecto

---

## ✅ PASO 4: Configurar el Proyecto (5 minutos)

### 4.1 Configuración Básica

Vercel detectará automáticamente que es Next.js. Verifica:

- **Framework Preset**: Debe decir **"Next.js"** ✅
- **Root Directory**: Déjalo en `./` (por defecto) ✅
- **Build Command**: `npm run build` (automático) ✅
- **Output Directory**: `.next` (automático) ✅

### 4.2 Agregar Variables de Entorno ⚠️ **MUY IMPORTANTE**

Click en **"Environment Variables"** (o busca la sección de variables).

Agrega estas variables una por una:

#### Variable 1: Supabase URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: Tu URL de Supabase (ej: `https://lkrwnutofhzyvtbbsrwh.supabase.co`)
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 2: Supabase Anon Key
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Tu anon key de Supabase
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 3: Supabase Service Role Key
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: Tu service role key de Supabase
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 4: Stripe Publishable Key (Si usas Stripe)
- **Name**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: Tu Stripe publishable key
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 5: Stripe Secret Key (Si usas Stripe)
- **Name**: `STRIPE_SECRET_KEY`
- **Value**: Tu Stripe secret key
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 6: Stripe Webhook Secret (Si usas Stripe)
- **Name**: `STRIPE_WEBHOOK_SECRET`
- **Value**: Tu Stripe webhook secret
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

**Verificación:**
- Deberías ver todas las variables listadas
- Cada una debe tener los 3 environments marcados

---

## ✅ PASO 5: Hacer Deploy (5-10 minutos)

1. Revisa que todas las variables estén agregadas
2. Scroll hacia abajo
3. Click en el botón grande **"Deploy"** (abajo)
4. ⏳ **Espera 2-5 minutos** mientras Vercel:
   - Instala dependencias
   - Hace build del proyecto
   - Despliega la app

**Verás un progreso en tiempo real:**
```
✓ Installing dependencies...
✓ Building...
✓ Deploying...
```

**Verificación:**
- Deberías ver: **"Deployment successful!"** o **"Ready"**

---

## ✅ PASO 6: Obtener tu Dominio (Automático) 🎉

### 6.1 El Dominio Aparece Automáticamente

Cuando el deploy termine, verás:

```
✅ Deployment successful!

Your project is live at:
https://validarfcmx.vercel.app
```

**¡Ese es tu dominio!** 🎉

### 6.2 Dónde Ver el Dominio

El dominio aparece en varios lugares:

1. **En la página del deploy**:
   - Arriba verás: **"Domains"**
   - Ejemplo: `validarfcmx.vercel.app`

2. **En el dashboard del proyecto**:
   - Click en tu proyecto
   - Arriba verás la URL

3. **En Settings → Domains**:
   - Settings → Domains
   - Verás todos los dominios

### 6.3 Copiar el Dominio

1. **Copia la URL completa**: `https://validarfcmx.vercel.app`
2. **Guárdala** en un lugar seguro
3. **Pruébala**: Abre la URL en tu navegador
4. Deberías ver tu landing page

---

## ✅ PASO 7: Verificar que Todo Funciona (2 minutos)

### 7.1 Probar el Dominio

Abre en tu navegador:

1. **Landing page**: `https://validarfcmx.vercel.app`
   - Deberías ver tu página principal ✅

2. **Privacy Policy**: `https://validarfcmx.vercel.app/privacidad`
   - Deberías ver la política de privacidad ✅

3. **Terms**: `https://validarfcmx.vercel.app/terminos`
   - Deberías ver los términos de servicio ✅

### 7.2 Si Algo No Funciona

- **Espera 1-2 minutos** (puede tardar en propagarse)
- **Refresca la página** (Ctrl + F5)
- **Revisa los logs** en Vercel (pestaña "Logs")

---

## ✅ PASO 8: Usar el Dominio en Google Cloud Console (5 minutos)

Ahora que tienes el dominio, úsalo en Google:

### 8.1 Actualizar OAuth Consent Screen

1. Ve a: **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
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

4. Click en **"SAVE AND CONTINUE"** en cada paso

### 8.2 Actualizar OAuth Credentials

1. Ve a: **APIs & Services** → **Credentials**
2. Click en tu **OAuth 2.0 Client ID**
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://validarfcmx.vercel.app
   ```
   (Reemplaza con tu URL real de Vercel)

4. Click en **"SAVE"**

---

## ✅ PASO 9: Actualizar Supabase (3 minutos)

1. Ve a: **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   https://validarfcmx.vercel.app/auth/callback
   ```
   (Reemplaza con tu URL real de Vercel)

3. Guarda los cambios

---

## 🎉 ¡Listo!

Ahora tienes:

- ✅ **Hosting**: Gratis en Vercel
- ✅ **Dominio**: `https://validarfcmx.vercel.app` (gratis)
- ✅ **HTTPS**: Automático (gratis)
- ✅ **App en producción**: Funcionando

---

## 📝 Checklist Final

- [ ] Código subido a GitHub
- [ ] Cuenta creada en Vercel
- [ ] Proyecto conectado con GitHub
- [ ] Variables de entorno agregadas
- [ ] Deploy completado
- [ ] Dominio obtenido (ej: `validarfcmx.vercel.app`)
- [ ] Probado que la app funciona
- [ ] URLs actualizadas en Google Cloud Console
- [ ] URLs actualizadas en Supabase

---

## 🆘 Si Tienes Problemas

### Error: "Build Failed"
- Revisa los logs en Vercel
- Verifica que todas las variables de entorno estén agregadas
- Prueba hacer build localmente: `npm run build`

### Error: "Environment Variables Missing"
- Ve a Settings → Environment Variables
- Agrega todas las variables necesarias
- Haz un nuevo deploy

### El Dominio No Funciona
- Espera 2-3 minutos después del deploy
- Refresca la página
- Verifica que el deploy esté completo ("Ready")

---

## 🚀 Siguiente Paso

Una vez que todo funcione:
1. Prueba el flujo completo de registro/login
2. Verifica que Google OAuth funcione
3. ¡Tu MVP está en producción! 🎉

¿Necesitas ayuda con algún paso específico? 🤔

