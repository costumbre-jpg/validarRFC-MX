# 🚀 Hacer Deploy en Vercel - Pasos Finales

## ✅ Estado Actual

- ✅ Variables de entorno agregadas
- ✅ Proyecto configurado
- ✅ Listo para deploy

---

## ✅ PASO 1: Hacer Deploy

1. **Scroll hacia abajo** en la página de configuración de Vercel
2. Busca el botón grande **"Deploy"** (generalmente abajo, puede ser azul o verde)
3. **Click en "Deploy"**

---

## ✅ PASO 2: Esperar el Deploy (2-5 minutos)

Después de hacer click en "Deploy", verás un progreso en tiempo real:

```
✓ Installing dependencies...
✓ Building...
✓ Deploying...
```

**⏳ Espera 2-5 minutos** mientras Vercel:
- Instala todas las dependencias
- Hace build del proyecto
- Despliega la app

**No cierres la página**, puedes ver el progreso.

---

## ✅ PASO 3: Ver el Resultado

Cuando termine, verás:

```
✅ Deployment successful!

Your project is live at:
https://validar-rfc-mx.vercel.app
```

**¡Ese es tu dominio!** 🎉

---

## ✅ PASO 4: Probar tu App

1. **Copia la URL** que te dio Vercel (ej: `https://validar-rfc-mx.vercel.app`)
2. **Abre la URL en tu navegador**
3. Deberías ver tu landing page ✅

**Prueba también:**
- `https://tu-dominio.vercel.app/privacidad` → Debería mostrar la política
- `https://tu-dominio.vercel.app/terminos` → Debería mostrar los términos

---

## ✅ PASO 5: Usar el Dominio en Google Cloud Console

Ahora que tienes el dominio, actualiza Google:

### 5.1 Actualizar OAuth Consent Screen

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

### 5.2 Actualizar OAuth Credentials

1. Ve a: **APIs & Services** → **Credentials**
2. Click en tu **OAuth 2.0 Client ID**
3. En **Authorized JavaScript origins**, agrega:
   ```
   https://tu-dominio.vercel.app
   ```
   (Reemplaza con tu URL real de Vercel)

4. Click en **"SAVE"**

---

## ✅ PASO 6: Actualizar Supabase

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

- [ ] Click en "Deploy" en Vercel
- [ ] Deploy completado exitosamente
- [ ] Dominio obtenido
- [ ] App probada en el navegador
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

¿Ya hiciste click en "Deploy"? ¿Qué ves en la pantalla? 🤔

