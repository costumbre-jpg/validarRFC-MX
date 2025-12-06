# 🔧 Solucionar Error de Variables de Entorno en Vercel

## ❌ Problema

Error: `La variable de entorno "NEXT_PUBLIC_SUPABASE_URL" hace referencia a la "supabase_url" secreta, que no existe.`

**Causa**: El archivo `vercel.json` está intentando usar secretos que no existen.

---

## ✅ SOLUCIÓN: Eliminar o Corregir vercel.json

### Opción 1: Eliminar vercel.json (Recomendado)

Vercel detecta automáticamente Next.js, no necesitas `vercel.json` para este proyecto.

1. **Elimina el archivo `vercel.json`** de tu proyecto
2. **Haz commit y push** a GitHub:
   ```powershell
   git add .
   git commit -m "Remove vercel.json"
   git push
   ```
3. **Vercel hará un nuevo deploy automáticamente**

### Opción 2: Corregir vercel.json

Si quieres mantener `vercel.json`, elimina la sección `env`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

**Elimina esta parte:**
```json
"env": {
  "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key",
  "STRIPE_SECRET_KEY": "@stripe_secret_key",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe_publishable_key"
}
```

---

## ✅ PASO 1: Eliminar vercel.json

### Desde PowerShell:

```powershell
cd C:\Users\loorj\Documents\validarFC.MX
del vercel.json
```

O simplemente elimínalo desde el Explorador de Archivos.

---

## ✅ PASO 2: Hacer Commit y Push

```powershell
git add .
git commit -m "Remove vercel.json - not needed for Next.js"
git push
```

---

## ✅ PASO 3: Verificar Variables en Vercel

Después de eliminar `vercel.json`, asegúrate de que las variables estén configuradas directamente en Vercel:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"**
3. Click en **"Environment Variables"**
4. Verifica que tengas estas variables (con sus valores reales, no referencias):

**Obligatorias:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://lkrwnutofhzyvtbbsrwh.supabase.co`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key real)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (tu service role key real)

**Opcionales (si usas Stripe):**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = (tu publishable key real)
- `STRIPE_SECRET_KEY` = (tu secret key real)
- `STRIPE_WEBHOOK_SECRET` = (tu webhook secret real)

**⚠️ IMPORTANTE**: Los valores deben ser los valores reales, NO referencias como `@supabase_url`.

---

## ✅ PASO 4: Hacer Deploy de Nuevo

1. Vercel debería hacer un nuevo deploy automáticamente después del push
2. O puedes hacer click en **"Redeploy"** en Vercel
3. Espera a que termine
4. Debería funcionar ahora

---

## 🆘 Si Aún Tienes Problemas

### Verificar que las Variables Tengan Valores Reales

En Vercel → Settings → Environment Variables:

**❌ INCORRECTO:**
```
NEXT_PUBLIC_SUPABASE_URL = @supabase_url
```

**✅ CORRECTO:**
```
NEXT_PUBLIC_SUPABASE_URL = https://lkrwnutofhzyvtbbsrwh.supabase.co
```

---

## 📝 Checklist

- [ ] Eliminé el archivo `vercel.json`
- [ ] Hice commit y push a GitHub
- [ ] Verifiqué que las variables en Vercel tengan valores reales (no referencias)
- [ ] Vercel hizo un nuevo deploy
- [ ] El deploy fue exitoso

---

## 🎯 Siguiente Paso

1. Elimina `vercel.json`
2. Haz commit y push
3. Verifica las variables en Vercel
4. Espera el nuevo deploy

---

¿Ya eliminaste `vercel.json`? ¿Hiciste commit y push? 🤔

