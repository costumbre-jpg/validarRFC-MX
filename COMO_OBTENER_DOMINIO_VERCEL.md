# 🌐 Cómo Obtener el Dominio en Vercel (Súper Simple)

## ✅ Respuesta Rápida

**El dominio se crea AUTOMÁTICAMENTE cuando haces el deploy.** No necesitas hacer nada especial, Vercel te lo da gratis.

---

## 🚀 Proceso Completo (Paso a Paso)

### PASO 1: Subir Código a GitHub (5 min)

1. Ve a: https://github.com
2. Crea un nuevo repositorio (o usa uno existente)
3. Sube tu código:
   ```powershell
   git add .
   git commit -m "Ready for Vercel"
   git push
   ```

### PASO 2: Conectar con Vercel (2 min)

1. Ve a: https://vercel.com
2. Click en **"Sign Up"** → **"Continue with GitHub"**
3. Autoriza a Vercel

### PASO 3: Hacer Deploy (5 min)

1. Click en **"Add New Project"**
2. Selecciona tu repositorio de GitHub
3. Agrega tus variables de entorno (Supabase, Stripe, etc.)
4. Click en **"Deploy"**

### PASO 4: ¡Obtener el Dominio! (Automático)

**Cuando el deploy termine, Vercel te mostrará:**

```
✅ Deployment successful!

Your project is live at:
https://validarfcmx.vercel.app
```

**¡Ese es tu dominio!** 🎉

---

## 📍 Dónde Ver el Dominio

Después del deploy, el dominio aparece en:

1. **Página del proyecto en Vercel**:
   - Arriba verás: **"Domains"**
   - Ejemplo: `validarfcmx.vercel.app`

2. **En el dashboard**:
   - Cada deploy muestra la URL
   - Click en el deploy para ver la URL

3. **En la configuración**:
   - Settings → Domains
   - Ahí verás todos los dominios

---

## 🎯 El Dominio es Automático

- ✅ **No necesitas configurar nada**
- ✅ **No necesitas comprar nada**
- ✅ **Se crea automáticamente**
- ✅ **Es gratis**
- ✅ **Tiene HTTPS incluido**

---

## 📝 Ejemplo Real

Cuando haces deploy, Vercel crea algo como:

```
https://validarfcmx.vercel.app
```

O puede ser:

```
https://validarfcmx-abc123.vercel.app
```

**Ambos funcionan igual de bien.** ✅

---

## ✅ Después de Obtener el Dominio

Una vez que tengas el dominio (ej: `https://validarfcmx.vercel.app`):

1. **Úsalo en Google Cloud Console**:
   - Privacy: `https://validarfcmx.vercel.app/privacidad`
   - Terms: `https://validarfcmx.vercel.app/terminos`

2. **Agrégalo a Google OAuth Credentials**:
   - Authorized JavaScript origins: `https://validarfcmx.vercel.app`

3. **Agrégalo a Supabase**:
   - Redirect URLs: `https://validarfcmx.vercel.app/auth/callback`

---

## 🆘 Si No Ves el Dominio

1. **Espera 1-2 minutos** después del deploy
2. **Refresca la página** en Vercel
3. **Verifica que el deploy esté completo** (debe decir "Ready")
4. **Busca en la parte superior** de la página del proyecto

---

## 🎉 Resumen

1. Haces deploy en Vercel
2. Vercel crea el dominio automáticamente
3. Copias el dominio
4. Lo usas en Google Cloud Console

**¡Es así de simple!** 🚀

¿Quieres que te guíe paso a paso para hacer el deploy? Puedo ayudarte con cada paso. 🤔

