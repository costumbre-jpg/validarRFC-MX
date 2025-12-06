# 🚀 Deploy en Vercel - Paso Final

## ✅ Estado Actual

- ✅ Código subido a GitHub exitosamente
- ✅ Repositorio: `costumbre-jpg/validarRFC-MX`
- ✅ 147 archivos en GitHub
- ✅ Listo para deploy en Vercel

---

## ✅ PASO 1: Crear Cuenta en Vercel (2 minutos)

1. Ve a: **https://vercel.com**
2. Click en **"Sign Up"** (arriba a la derecha)
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel a acceder a tu GitHub
5. Completa el registro si es necesario

**Verificación:**
- Deberías ver el dashboard de Vercel

---

## ✅ PASO 2: Crear Nuevo Proyecto (1 minuto)

1. En Vercel, click en **"Add New Project"** o **"New Project"** (botón grande)
2. Verás una lista de tus repositorios de GitHub
3. Busca **`validarRFC-MX`** (o `costumbre-jpg/validarRFC-MX`)
4. Click en **"Import"** al lado del repositorio

**Verificación:**
- Deberías ver la página de configuración del proyecto

---

## ✅ PASO 3: Configurar el Proyecto (5 minutos)

### 3.1 Configuración Básica

Vercel detectará automáticamente que es Next.js. Verifica:

- **Framework Preset**: Debe decir **"Next.js"** ✅
- **Root Directory**: Déjalo en `./` (por defecto) ✅
- **Build Command**: `npm run build` (automático) ✅
- **Output Directory**: `.next` (automático) ✅

### 3.2 Agregar Variables de Entorno ⚠️ **MUY IMPORTANTE**

Click en **"Environment Variables"** (o busca la sección de variables).

Agrega estas variables una por una:

#### Variable 1: Supabase URL
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- **Environments**: Marca **Production**, **Preview**, y **Development**
- Click en **"Add"**

#### Variable 2: Supabase Anon Key
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: Tu anon key de Supabase (cópiala de tu `.env.local`)
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

## ✅ PASO 4: Hacer Deploy (5-10 minutos)

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

## ✅ PASO 5: Obtener tu Dominio 🎉

### 5.1 El Dominio Aparece Automáticamente

Cuando el deploy termine, verás:

```
✅ Deployment successful!

Your project is live at:
https://validar-rfc-mx.vercel.app
```

**¡Ese es tu dominio!** 🎉

### 5.2 Dónde Ver el Dominio

El dominio aparece en varios lugares:

1. **En la página del deploy**:
   - Arriba verás: **"Domains"**
   - Ejemplo: `validar-rfc-mx.vercel.app`

2. **En el dashboard del proyecto**:
   - Click en tu proyecto
   - Arriba verás la URL

3. **En Settings → Domains**:
   - Settings → Domains
   - Verás todos los dominios

### 5.3 Copiar el Dominio

1. **Copia la URL completa**: `https://validar-rfc-mx.vercel.app`
2. **Guárdala** en un lugar seguro
3. **Pruébala**: Abre la URL en tu navegador
4. Deberías ver tu landing page

---

## ✅ PASO 6: Verificar que Todo Funciona (2 minutos)

### 6.1 Probar el Dominio

Abre en tu navegador:

1. **Landing page**: `https://tu-dominio.vercel.app`
   - Deberías ver tu página principal ✅

2. **Privacy Policy**: `https://tu-dominio.vercel.app/privacidad`
   - Deberías ver la política de privacidad ✅

3. **Terms**: `https://tu-dominio.vercel.app/terminos`
   - Deberías ver los términos de servicio ✅

### 6.2 Si Algo No Funciona

- **Espera 1-2 minutos** (puede tardar en propagarse)
- **Refresca la página** (Ctrl + F5)
- **Revisa los logs** en Vercel (pestaña "Logs")

---

## ✅ PASO 7: Usar el Dominio en Google Cloud Console (5 minutos)

Ahora que tienes el dominio, úsalo en Google:

### 7.1 Actualizar OAuth Consent Screen

1. Ve a: **Google Cloud Console** → **APIs & Services** → **OAuth consent screen**
2. Click en **"EDIT APP"**
3. En **App information**, actualiza:

   - **Privacy policy link**: 
     ```
     https://tu-dominio.vercel.app/privacidad
     ```
     (Reemplaza con tu URL real de Vercel)

   - **Terms of service link**: 
     ```
     https://tu-dominio.vercel.app/terminos
     ```
     (Reemplaza con tu URL real de Vercel)

4. Click en **"SAVE AND CONTINUE"** en cada paso

### 7.2 Actualizar OAuth Credentials

1. Ve a: **APIs & Services** → **Credentials**
2. Click en tu **OAuth 2.0 Client ID**
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://tu-dominio.vercel.app
   ```
   (Reemplaza con tu URL real de Vercel)

4. Click en **"SAVE"**

---

## ✅ PASO 8: Actualizar Supabase (3 minutos)

1. Ve a: **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. En **Redirect URLs**, agrega:
   ```
   https://tu-dominio.vercel.app/auth/callback
   ```
   (Reemplaza con tu URL real de Vercel)

3. Guarda los cambios

---

## 🎉 ¡Listo!

Ahora tienes:

- ✅ **Hosting**: Gratis en Vercel
- ✅ **Dominio**: `https://tu-dominio.vercel.app` (gratis)
- ✅ **HTTPS**: Automático (gratis)
- ✅ **App en producción**: Funcionando
- ✅ **Google OAuth**: Configurado para cualquier usuario

---

## 📝 Checklist Final

- [ ] Código subido a GitHub ✅
- [ ] Cuenta creada en Vercel
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno agregadas
- [ ] Deploy completado
- [ ] Dominio obtenido
- [ ] Probado que la app funciona
- [ ] URLs actualizadas en Google Cloud Console
- [ ] URLs actualizadas en Supabase

---

## 🚀 Siguiente Paso

Prueba el flujo completo:
1. Ve a tu dominio de Vercel
2. Prueba registro/login
3. Verifica que Google OAuth funcione
4. ¡Tu MVP está en producción! 🎉

---

¿Ya estás en Vercel? ¿Necesitas ayuda con algún paso específico? 🤔

