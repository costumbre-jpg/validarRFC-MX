# 🔧 Solución: Google No Acepta localhost en URLs

## ❌ Problema

Google Cloud Console no permite usar `localhost` en las URLs de Privacy Policy y Terms of Service cuando la app está en producción.

---

## ✅ SOLUCIÓN 1: Usar ngrok (Rápido - 5 minutos)

ngrok crea una URL pública temporal que apunta a tu localhost.

### Paso 1: Instalar ngrok

1. Ve a: https://ngrok.com/download
2. Descarga ngrok para Windows
3. Extrae el archivo `ngrok.exe` a una carpeta (ej: `C:\ngrok\`)

### Paso 2: Iniciar tu servidor

1. Asegúrate de que `npm run dev` esté corriendo en `http://localhost:3000`

### Paso 3: Crear túnel con ngrok

1. Abre una nueva terminal (PowerShell o CMD)
2. Navega a donde está ngrok.exe:
   ```powershell
   cd C:\ngrok
   ```
   (O la ruta donde lo pusiste)

3. Ejecuta:
   ```powershell
   .\ngrok.exe http 3000
   ```

4. Verás algo como:
   ```
   Forwarding  https://abc123.ngrok.io -> http://localhost:3000
   ```

5. **Copia la URL** que aparece (ej: `https://abc123.ngrok.io`)

### Paso 4: Usar las URLs en Google Cloud Console

En Google Cloud Console, usa estas URLs:

- **Privacy policy link**: 
  ```
  https://abc123.ngrok.io/privacidad
  ```
  (Reemplaza `abc123.ngrok.io` con tu URL de ngrok)

- **Terms of service link**: 
  ```
  https://abc123.ngrok.io/terminos
  ```
  (Reemplaza `abc123.ngrok.io` con tu URL de ngrok)

### ⚠️ Importante sobre ngrok

- La URL cambia cada vez que reinicias ngrok (a menos que tengas cuenta gratuita)
- Mantén ngrok corriendo mientras uses Google OAuth
- Para una URL permanente, necesitas cuenta de ngrok (gratuita pero requiere registro)

---

## ✅ SOLUCIÓN 2: Deploy Rápido en Vercel (Recomendado - 10 minutos)

Vercel permite hacer deploy gratuito y rápido. Las URLs serán permanentes.

### Paso 1: Preparar para Deploy

1. Asegúrate de que tu código esté en GitHub (o crea un repo)
2. Si no tienes GitHub, créalo:
   - Ve a: https://github.com
   - Crea un nuevo repositorio
   - Sube tu código

### Paso 2: Deploy en Vercel

1. Ve a: https://vercel.com
2. Inicia sesión con GitHub
3. Click en **"Add New Project"**
4. Selecciona tu repositorio
5. Configura:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (dejar por defecto)
6. Agrega las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Y las demás que necesites
7. Click en **"Deploy"**
8. ⏳ Espera 2-3 minutos

### Paso 3: Obtener URLs

Después del deploy, Vercel te dará una URL como:
```
https://validarfcmx.vercel.app
```

### Paso 4: Usar las URLs en Google Cloud Console

- **Privacy policy link**: 
  ```
  https://validarfcmx.vercel.app/privacidad
  ```
  (Reemplaza con tu URL de Vercel)

- **Terms of service link**: 
  ```
  https://validarfcmx.vercel.app/terminos
  ```
  (Reemplaza con tu URL de Vercel)

### ✅ Ventajas de Vercel

- URL permanente (no cambia)
- Gratis para proyectos personales
- Fácil de actualizar (solo haces push a GitHub)
- Perfecto para MVP

---

## ✅ SOLUCIÓN 3: Usar Servicio de Hosting Gratuito (Alternativa)

Si no quieres usar Vercel, puedes usar:

### Opción A: Netlify
- Similar a Vercel
- URL: `https://tu-proyecto.netlify.app`

### Opción B: GitHub Pages
- Para páginas estáticas
- URL: `https://tu-usuario.github.io/tu-repo`

---

## 🎯 Recomendación para MVP

**Usa Vercel** (Solución 2):
- ✅ URL permanente
- ✅ Gratis
- ✅ Fácil de configurar
- ✅ Perfecto para producción

**O usa ngrok** (Solución 1) si:
- Solo necesitas probar rápidamente
- No quieres hacer deploy completo todavía

---

## 📝 Checklist

### Si usas ngrok:
- [ ] ngrok instalado
- [ ] Servidor corriendo en localhost:3000
- [ ] ngrok corriendo (`ngrok http 3000`)
- [ ] URL de ngrok copiada
- [ ] URLs actualizadas en Google Cloud Console
- [ ] Probado que las páginas funcionan con la URL de ngrok

### Si usas Vercel:
- [ ] Código en GitHub
- [ ] Proyecto creado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Deploy completado
- [ ] URL de Vercel obtenida
- [ ] URLs actualizadas en Google Cloud Console
- [ ] Probado que las páginas funcionan con la URL de Vercel

---

## 🆘 Si Tienes Problemas

### ngrok no funciona:
- Verifica que el servidor esté corriendo en puerto 3000
- Verifica que no haya firewall bloqueando
- Prueba reiniciar ngrok

### Vercel no funciona:
- Verifica que las variables de entorno estén configuradas
- Revisa los logs de deploy en Vercel
- Asegúrate de que el código esté en GitHub

---

¿Cuál solución prefieres? ¿ngrok (rápido) o Vercel (permanente)? 🤔

