# 🚀 Configuración de Supabase - Paso a Paso

## 📋 Resumen

Vamos a configurar Supabase en **4 pasos simples**:
1. Crear cuenta y proyecto (5 min)
2. Ejecutar migraciones SQL (10 min)
3. Obtener credenciales (5 min)
4. Configurar variables de entorno (5 min)

**Total: ~25 minutos**

---

## ✅ PASO 1: Crear Cuenta y Proyecto en Supabase

### 1.1 Ir a Supabase
- Abre tu navegador y ve a: **https://supabase.com**
- Click en **"Start your project"** o **"Sign in"** si ya tienes cuenta

### 1.2 Crear cuenta (si no tienes)
- Puedes usar GitHub, Google, o email
- Completa el registro

### 1.3 Crear nuevo proyecto
1. Click en **"New Project"** (botón verde)
2. Completa el formulario:
   - **Name**: `validarfcmx` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (⚠️ **GUÁRDALA**, la necesitarás)
   - **Region**: Selecciona la más cercana (México si está disponible, o US East/West)
   - **Pricing Plan**: Free tier está bien para empezar
3. Click en **"Create new project"**
4. ⏳ Espera 2-3 minutos mientras se crea el proyecto

### 1.4 Verificar que el proyecto está listo
- Deberías ver el dashboard de Supabase
- Si dice "Setting up your project", espera hasta que termine

---

## ✅ PASO 2: Ejecutar Migraciones SQL

### 2.1 Abrir SQL Editor
1. En el menú lateral izquierdo, click en **"SQL Editor"** (ícono de terminal/código)
2. Click en **"New query"** (botón verde arriba a la derecha)

### 2.2 Ejecutar Primera Migración (001_initial_schema.sql)

1. **Copia TODO el contenido** del archivo `supabase/migrations/001_initial_schema.sql`
2. Pégalo en el SQL Editor de Supabase
3. Click en **"Run"** (botón verde) o presiona `Ctrl+Enter`
4. ✅ Deberías ver: **"Success. No rows returned"**

**Esto crea:**
- Tabla `users`
- Tabla `validations`
- Tabla `subscriptions`
- Políticas RLS (Row Level Security)
- Índices para optimización

### 2.3 Ejecutar Segunda Migración (002_api_keys.sql)

1. **Copia TODO el contenido** del archivo `supabase/migrations/002_api_keys.sql`
2. Pégalo en el SQL Editor (puedes borrar el contenido anterior o crear nueva query)
3. Click en **"Run"**
4. ✅ Deberías ver: **"Success. No rows returned"**

**Esto crea:**
- Tabla `api_keys`
- Tabla `api_usage_logs`
- Políticas RLS para API keys

### 2.4 Ejecutar Tercera Migración (003_create_user_trigger.sql) ⚠️ **IMPORTANTE**

1. **Copia TODO el contenido** del archivo `supabase/migrations/003_create_user_trigger.sql`
2. Pégalo en el SQL Editor
3. Click en **"Run"**
4. ✅ Deberías ver: **"Success. No rows returned"**

**Esto crea:**
- Trigger automático que crea usuarios en la tabla `users` cuando se registran en Auth
- ⚠️ **Sin esto, el registro de usuarios no funcionará**

### 2.5 Verificar que las tablas se crearon

1. En el menú lateral, click en **"Table Editor"**
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `validations`
   - ✅ `subscriptions`
   - ✅ `api_keys`
   - ✅ `api_usage_logs`

Si ves todas las tablas, ¡perfecto! ✅

---

## ✅ PASO 3: Obtener Credenciales

### 3.1 Ir a Settings → API
1. En el menú lateral, click en **"Settings"** (ícono de engranaje)
2. Click en **"API"** en el submenú

### 3.2 Copiar Credenciales

Verás una sección llamada **"Project API keys"**. Necesitas 3 valores:

#### 3.2.1 Project URL
- Busca **"Project URL"**
- Copia el valor (algo como: `https://xxxxx.supabase.co`)
- ⚠️ **Este será tu `NEXT_PUBLIC_SUPABASE_URL`**

#### 3.2.2 anon public key
- Busca **"anon"** o **"public"** key
- Click en el ícono de "eye" para revelar la key
- Copia TODO el valor (es muy largo, empieza con `eyJ...`)
- ⚠️ **Este será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`**

#### 3.2.3 service_role key
- Busca **"service_role"** key
- ⚠️ **ADVERTENCIA**: Esta key es muy poderosa, no la compartas
- Click en el ícono de "eye" para revelar la key
- Copia TODO el valor
- ⚠️ **Este será tu `SUPABASE_SERVICE_ROLE_KEY`**

---

## ✅ PASO 4: Configurar Variables de Entorno

### 4.1 Crear archivo `.env.local`

1. En la raíz de tu proyecto (donde está `package.json`), crea un archivo llamado `.env.local`
2. Si ya existe, ábrelo

### 4.2 Agregar credenciales de Supabase

Copia este template y reemplaza con tus valores:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Stripe Configuration (Opcional por ahora)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_ENTERPRISE=

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Ejemplo real:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTI3ODQwMCwiZXhwIjoxOTYwODU0NDAwfQ.abcdefghijklmnopqrstuvwxyz1234567890
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1Mjc4NDAwLCJleHAiOjE5NjA4NTQ0MDB9.abcdefghijklmnopqrstuvwxyz1234567890
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4.3 Guardar el archivo

- Guarda el archivo `.env.local`
- ⚠️ **IMPORTANTE**: Este archivo NO debe subirse a Git (ya está en `.gitignore`)

---

## ✅ PASO 5: Configurar Autenticación (Opcional pero Recomendado)

### 5.1 Ir a Authentication → Providers
1. En el menú lateral, click en **"Authentication"**
2. Click en **"Providers"**

### 5.2 Habilitar Email Provider
1. Busca **"Email"** en la lista
2. Asegúrate de que esté **habilitado** (toggle ON)
3. Puedes dejar la configuración por defecto

### 5.3 Configurar URLs de Redirección
1. Click en **"URL Configuration"** en el menú de Authentication
2. Configura:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Agrega:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**` (para desarrollo)

---

## ✅ PASO 6: Verificar y Probar

### 6.1 Reiniciar el servidor
1. Detén el servidor si está corriendo (`Ctrl+C`)
2. Ejecuta: `npm run dev`
3. Deberías ver que inicia sin errores

### 6.2 Probar en el navegador
1. Abre: **http://localhost:3000**
2. Deberías ver la landing page sin errores
3. Click en **"Registrarse"**
4. Intenta crear una cuenta con tu email
5. Deberías poder registrarte e iniciar sesión

### 6.3 Verificar en Supabase
1. Ve a Supabase Dashboard → **Authentication** → **Users**
2. Deberías ver tu usuario recién creado
3. Ve a **Table Editor** → **users**
4. Deberías ver tu usuario en la tabla `users` (gracias al trigger)

---

## ✅ Verificación Final

### Checklist de Verificación:

- [ ] Proyecto creado en Supabase
- [ ] 3 migraciones SQL ejecutadas sin errores
- [ ] 5 tablas creadas: `users`, `validations`, `subscriptions`, `api_keys`, `api_usage_logs`
- [ ] Credenciales copiadas (URL, anon key, service_role key)
- [ ] Archivo `.env.local` creado con las credenciales
- [ ] Servidor inicia sin errores
- [ ] Puedo crear cuenta nueva
- [ ] Puedo iniciar sesión
- [ ] Usuario aparece en tabla `users` de Supabase

---

## 🆘 Solución de Problemas

### Error: "relation does not exist"
- **Solución**: Asegúrate de haber ejecutado TODAS las migraciones SQL en orden

### Error: "permission denied"
- **Solución**: Verifica que las políticas RLS están creadas (deberían crearse automáticamente con las migraciones)

### Error: "invalid input syntax for type uuid"
- **Solución**: Verifica que el trigger `003_create_user_trigger.sql` se ejecutó correctamente

### Error: "Your project's URL and Key are required"
- **Solución**: Verifica que el archivo `.env.local` existe y tiene las credenciales correctas
- Reinicia el servidor después de crear/editar `.env.local`

### No puedo crear cuenta
- **Solución**: 
  1. Verifica que el trigger `003_create_user_trigger.sql` se ejecutó
  2. Verifica que el provider Email está habilitado en Authentication → Providers
  3. Revisa la consola del navegador (F12) para ver errores

---

## 🎉 ¡Listo!

Si completaste todos los pasos y la verificación, **¡Supabase está configurado!**

**Próximos pasos:**
- Probar funcionalidad básica (validación RFC)
- Configurar Stripe (opcional para desarrollo)
- Deploy a producción

---

## 📝 Notas Importantes

1. **Service Role Key**: ⚠️ NUNCA la expongas en el frontend. Solo se usa en el servidor.

2. **Anon Key**: Es segura para usar en el frontend, pero tiene limitaciones por RLS.

3. **Trigger**: El trigger `003_create_user_trigger.sql` es CRÍTICO. Sin él, los usuarios no se crearán en la tabla `users` cuando se registren.

4. **RLS**: Row Level Security está habilitado. Los usuarios solo pueden ver/modificar sus propios datos.

5. **Free Tier**: El plan gratuito de Supabase es generoso y suficiente para empezar.

---

**¿Necesitas ayuda?** Revisa los errores en la consola del navegador (F12) o en la terminal donde corre el servidor.

