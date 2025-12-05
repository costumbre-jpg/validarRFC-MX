# 🚀 Publicar App para que Cualquier Usuario Use Google OAuth

## ✅ Lo que Ya Está Listo

- ✅ Páginas de Privacy Policy creadas: `/app/privacidad/page.tsx`
- ✅ Páginas de Terms of Service creadas: `/app/terminos/page.tsx`
- ✅ URLs disponibles:
  - Desarrollo: `http://localhost:3000/privacidad`
  - Desarrollo: `http://localhost:3000/terminos`

---

## 📋 Pasos para Publicar la App

### PASO 1: Verificar que las Páginas Funcionen

1. Asegúrate de que tu servidor esté corriendo: `npm run dev`
2. Abre en tu navegador:
   - `http://localhost:3000/privacidad` → Debería mostrar la política de privacidad
   - `http://localhost:3000/terminos` → Debería mostrar los términos de servicio

Si ambas páginas se ven correctamente, continúa al siguiente paso.

---

### PASO 2: Actualizar OAuth Consent Screen en Google Cloud Console

1. Ve a **Google Cloud Console**: https://console.cloud.google.com/
2. Selecciona tu proyecto (el que usas para ValidaRFC)
3. En el menú lateral, ve a **APIs & Services** → **OAuth consent screen**
4. Click en **"EDIT APP"** (arriba a la derecha, al lado del estado)

#### 2.1 Actualizar App Information

En la sección **"App information"**, actualiza:

- **Privacy policy link**: 
  ```
  http://localhost:3000/privacidad
  ```
  ⚠️ **IMPORTANTE**: Usa `http://localhost:3000/privacidad` para desarrollo. Cuando despliegues a producción, actualiza a `https://tu-dominio.com/privacidad`

- **Terms of service link**: 
  ```
  http://localhost:3000/terminos
  ```
  ⚠️ **IMPORTANTE**: Usa `http://localhost:3000/terminos` para desarrollo. Cuando despliegues a producción, actualiza a `https://tu-dominio.com/terminos`

- **Authorized domains**: 
  ```
  localhost
  ```
  (Para producción, agrega tu dominio real)

5. Click en **"SAVE AND CONTINUE"**

#### 2.2 Revisar Scopes (Ya deberían estar configurados)

1. En la pantalla de **Scopes**, verifica que tengas:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
2. Si están bien, click en **"SAVE AND CONTINUE"**

#### 2.3 Revisar Test Users (Opcional)

1. Puedes mantener usuarios de prueba o eliminarlos
2. Click en **"SAVE AND CONTINUE"**

#### 2.4 Revisar Resumen

1. Revisa que todo esté correcto
2. Click en **"BACK TO DASHBOARD"**

---

### PASO 3: Publicar la App

1. En la página de **OAuth consent screen** (deberías estar en el dashboard)
2. Arriba a la derecha, verás el estado actual:
   - Probablemente dice **"Testing"** con un botón **"PUBLISH APP"** al lado
3. Click en **"PUBLISH APP"**
4. Aparecerá un diálogo de confirmación que dice algo como:
   ```
   Publishing your app will make it available to any user with a Google account.
   ```
5. Lee la advertencia (dice que la app estará disponible públicamente)
6. Click en **"CONFIRM"** o **"PUBLISH"**
7. ⏳ Espera 1-5 minutos para que se propague

**Verificación:**
- El estado debería cambiar de **"Testing"** a **"In production"**
- Deberías ver un mensaje de éxito o el estado actualizado

---

## ✅ Verificar que Funciona

### Prueba 1: Con tu cuenta

1. Ve a `http://localhost:3000/auth/register`
2. Haz clic en **"Google"**
3. Deberías ver el selector de cuentas de Google
4. Selecciona una cuenta
5. Deberías llegar al dashboard

### Prueba 2: Con otra persona (o cuenta diferente)

1. Pide a alguien que vaya a `http://localhost:3000/auth/register`
2. Que haga clic en **"Google"**
3. Debería ver el selector de cuentas de Google
4. Debería poder autenticarse sin problemas

**Si ambas pruebas funcionan, ¡está listo!** ✅

---

## 🆘 Problemas Comunes

### Error: "Access blocked: This app's request is invalid"

**Causa**: La app no está publicada o hay un problema con la configuración.

**Solución**:
1. Verifica que el estado diga **"In production"** (no "Testing")
2. Si dice "Testing", vuelve a hacer clic en **"PUBLISH APP"**
3. Espera 5 minutos y prueba de nuevo

### Error: "This app isn't verified"

**Causa**: La app está publicada pero no verificada por Google.

**Solución**:
- Esto es **normal** para MVPs
- Los usuarios verán una advertencia que dice "This app isn't verified by Google"
- Pueden hacer clic en **"Advanced"** → **"Go to [App Name] (unsafe)"** para continuar
- Para eliminar la advertencia, necesitas verificar la app (proceso más complejo que requiere más información)

### Las páginas de Privacy/Terms no se ven

**Causa**: El servidor no está corriendo o hay un error en las páginas.

**Solución**:
1. Verifica que `npm run dev` esté corriendo
2. Abre `http://localhost:3000/privacidad` directamente
3. Revisa la consola del navegador (F12) por errores
4. Revisa la terminal donde corre el servidor por errores

### El botón "PUBLISH APP" no aparece

**Causa**: Puede que ya esté publicado o falta completar algún paso.

**Solución**:
1. Verifica el estado actual (arriba a la derecha)
2. Si dice "In production", ya está publicado
3. Si dice "Testing" pero no ves el botón, completa todos los pasos del OAuth Consent Screen primero

---

## 📝 Checklist Final

Marca cada item cuando lo completes:

- [ ] Páginas de Privacy Policy y Terms funcionan en el navegador
- [ ] OAuth Consent Screen actualizado con los links de Privacy y Terms
- [ ] App publicada (estado dice "In production")
- [ ] Probado con tu cuenta (funciona)
- [ ] Probado con otra cuenta/persona (funciona)

---

## 🚀 Para Producción (Más Adelante)

Cuando despliegues a producción (ej: Vercel):

1. **Actualizar OAuth Consent Screen**:
   - Cambia los links de `http://localhost:3000/...` a `https://tu-dominio.com/...`
   - Agrega tu dominio a "Authorized domains"

2. **Actualizar Google Cloud Console Credentials**:
   - Agrega `https://tu-dominio.com` a "Authorized JavaScript origins"

3. **Actualizar Supabase**:
   - Agrega `https://tu-dominio.com/auth/callback` a Redirect URLs

---

## ✅ ¡Listo!

Una vez que completes estos pasos, **cualquier usuario** podrá usar Google OAuth en tu MVP.

¿Necesitas ayuda con algún paso? 🤔

