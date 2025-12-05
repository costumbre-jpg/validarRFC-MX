# 🐛 Debug: Problema con OAuth Google en Registro

## 🔍 Problema Reportado

Cuando haces clic en el botón de Google en la página de **registro**, te redirige a **iniciar sesión** en lugar de al dashboard.

---

## ✅ Soluciones Aplicadas

1. ✅ Mejorado el callback para verificar sesión correctamente
2. ✅ Agregada verificación de usuario y sesión después de OAuth

---

## 🧪 Pasos para Verificar

### 1. Verificar que el Trigger SQL está ejecutado

El trigger es **CRÍTICO** para que funcione OAuth:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Ejecuta esta query para verificar:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Si no devuelve resultados, ejecuta `003_create_user_trigger.sql` de nuevo.

### 2. Verificar URLs de Redirección en Supabase

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Verifica:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`

### 3. Verificar Google OAuth en Supabase

1. Supabase Dashboard → **Authentication** → **Providers** → **Google**
2. Verifica que esté **habilitado** (toggle ON)
3. Verifica que tenga **Client ID** y **Client Secret** configurados

### 4. Reiniciar Servidor

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### 5. Probar de Nuevo

1. Ve a http://localhost:3000/auth/register
2. Click en botón **"Google"**
3. Acepta en Google
4. Deberías ser redirigido al **dashboard** (no a login)

---

## 🆘 Si Aún Redirige a Login

### Verificar en Consola del Navegador

1. Abre la consola (F12)
2. Ve a la pestaña **"Console"**
3. Busca errores en rojo
4. Comparte el error si lo hay

### Verificar en Supabase

1. Supabase Dashboard → **Authentication** → **Users**
2. Después de hacer clic en Google, ¿aparece un usuario nuevo?
3. Si NO aparece → El problema es con OAuth
4. Si SÍ aparece → El problema es con el callback

### Verificar en Tabla Users

1. Supabase Dashboard → **Table Editor** → **users**
2. Después de hacer clic en Google, ¿aparece un usuario en la tabla?
3. Si NO aparece → El trigger no está funcionando
4. Si SÍ aparece → El problema es con el callback o middleware

---

## 🔧 Posibles Causas

### 1. Trigger SQL no ejecutado
**Solución**: Ejecuta `003_create_user_trigger.sql` de nuevo

### 2. Callback no está recibiendo el código
**Solución**: Verifica que la URL de redirección en Google sea correcta

### 3. Sesión no se está estableciendo
**Solución**: Verifica que las cookies se estén guardando (consola del navegador → Application → Cookies)

### 4. Middleware está redirigiendo antes de tiempo
**Solución**: El middleware debería permitir `/auth/callback` sin autenticación

---

## 📝 Checklist de Debug

- [ ] Trigger SQL ejecutado y verificado
- [ ] URLs de redirección configuradas en Supabase
- [ ] Google OAuth habilitado en Supabase
- [ ] Credenciales de Google configuradas correctamente
- [ ] Servidor reiniciado
- [ ] Probado de nuevo
- [ ] Revisada consola del navegador (sin errores)
- [ ] Usuario aparece en Supabase Auth → Users
- [ ] Usuario aparece en Table Editor → users

---

**¿Qué error específico ves?** Comparte:
- El mensaje de error (si hay)
- Si el usuario aparece en Supabase
- Si hay errores en la consola del navegador

