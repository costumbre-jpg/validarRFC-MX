# 🔧 Solución de Problemas de Autenticación

## 🚨 Problemas Identificados y Soluciones

### Problema 1: "Invalid login credentials" después de registrarse

**Causa**: Supabase requiere confirmación de email por defecto. Cuando te registras, no puedes iniciar sesión hasta que confirmes tu email.

**Solución 1: Deshabilitar confirmación de email (Para desarrollo)**

1. Ve a **Supabase Dashboard**
2. **Authentication** → **Providers** → **Email**
3. Desactiva **"Confirm email"** (toggle OFF)
4. Guarda

**Solución 2: Confirmar email manualmente**

1. Revisa tu email (incluida la carpeta de spam)
2. Busca el email de Supabase con el asunto "Confirm your signup"
3. Haz clic en el enlace de confirmación
4. Después podrás iniciar sesión

---

### Problema 2: OAuth con Google no funciona después de aceptar

**Causa**: El callback puede no estar manejando correctamente la sesión.

**Solución**: Ya actualicé el código del callback para manejar mejor los errores.

**Verificar**:
1. Reinicia el servidor: `npm run dev`
2. Intenta de nuevo con Google
3. Revisa la consola del navegador (F12) para ver errores

---

### Problema 3: Registro redirige a login (Es normal)

**Causa**: Por defecto, Supabase requiere confirmación de email.

**Solución**: 
- Si deshabilitaste la confirmación de email → El usuario debería poder iniciar sesión inmediatamente
- Si mantienes la confirmación → El usuario debe confirmar su email primero

---

## ✅ Configuración Recomendada para Desarrollo

### 1. Deshabilitar Confirmación de Email

1. Supabase Dashboard → **Authentication** → **Providers** → **Email**
2. Desactiva **"Confirm email"**
3. Guarda

**Ventajas**:
- Registro e inicio de sesión inmediato
- No necesitas revisar emails
- Perfecto para desarrollo y pruebas

**Desventajas**:
- Cualquiera puede crear cuentas con cualquier email
- No verifica que el email sea real

### 2. Verificar URLs de Redirección

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Verifica:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**`

---

## 🧪 Probar Ahora

### 1. Reiniciar Servidor

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

### 2. Probar Registro con Email

1. Ve a http://localhost:3000/auth/register
2. Crea una cuenta nueva
3. Si deshabilitaste confirmación de email → Deberías poder iniciar sesión inmediatamente
4. Si mantienes confirmación → Revisa tu email y confirma

### 3. Probar OAuth con Google

1. Ve a http://localhost:3000/auth/login
2. Click en botón "Google"
3. Acepta en Google
4. Deberías ser redirigido al dashboard

### 4. Verificar en Supabase

1. Supabase Dashboard → **Authentication** → **Users**
2. Deberías ver tus usuarios creados
3. Supabase Dashboard → **Table Editor** → **users**
4. Deberías ver los usuarios en la tabla (gracias al trigger)

---

## 🆘 Si Aún No Funciona

### Verificar Trigger SQL

Asegúrate de que ejecutaste el trigger:

1. Supabase Dashboard → **SQL Editor**
2. Ejecuta:
```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

Si no existe, ejecuta `003_create_user_trigger.sql` de nuevo.

### Verificar Variables de Entorno

1. Verifica que `.env.local` existe
2. Verifica que tiene las credenciales correctas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Revisar Consola del Navegador

1. Abre la consola (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Comparte el error si lo hay

---

## 📝 Cambios Realizados

1. ✅ Mejorado el callback de OAuth para manejar errores
2. ✅ Agregado mensaje cuando se requiere confirmación de email
3. ✅ Mejorado el manejo de errores en login

---

## ✅ Checklist de Verificación

- [ ] Confirmación de email deshabilitada (para desarrollo)
- [ ] URLs de redirección configuradas en Supabase
- [ ] Trigger SQL ejecutado (003_create_user_trigger.sql)
- [ ] Variables de entorno configuradas (.env.local)
- [ ] Servidor reiniciado
- [ ] Probado registro con email
- [ ] Probado OAuth con Google
- [ ] Usuarios aparecen en Supabase

---

**¿Necesitas ayuda con algún paso específico?** Dime qué error ves y te ayudo a resolverlo.

