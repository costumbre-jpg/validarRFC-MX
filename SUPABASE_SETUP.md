# Guía de Configuración de Supabase

## Paso 1: Crear cuenta y proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (si no tienes una)
2. Crea un nuevo proyecto
3. Nombre del proyecto: `validarfcmx`
4. Selecciona una región cercana a tu ubicación
5. Establece una contraseña segura para la base de datos

## Paso 2: Obtener credenciales

1. En el dashboard de Supabase, ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (mantén esto seguro, solo para server-side)

## Paso 3: Configurar variables de entorno

1. Copia el archivo `env.template` a `.env.local`:
   ```bash
   cp env.template .env.local
   ```

2. Edita `.env.local` y reemplaza los valores con tus credenciales de Supabase

## Paso 4: Crear tablas y políticas RLS

1. En el dashboard de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Ejecuta los archivos de migración en orden:
   - Copia y pega `supabase/migrations/001_initial_schema.sql` y ejecuta
   - Copia y pega `supabase/migrations/002_api_keys.sql` y ejecuta
   - Copia y pega `supabase/migrations/003_create_user_trigger.sql` y ejecuta

Esto creará:
- ✅ Tabla `users` con RLS habilitado
- ✅ Tabla `validations` con RLS habilitado
- ✅ Tabla `subscriptions` con RLS habilitado
- ✅ Tabla `api_keys` y `api_usage_logs` con RLS habilitado
- ✅ Todas las políticas RLS necesarias
- ✅ Índices para optimización
- ✅ **Trigger automático** para crear usuarios en tabla `users` cuando se registran en Auth

## Paso 5: Verificar configuración

1. Ve a **Table Editor** en el dashboard de Supabase
2. Deberías ver las tres tablas: `users`, `validations`, `subscriptions`
3. Ve a **Authentication** → **Policies** para verificar que las políticas RLS están activas

## Paso 6: Configurar Autenticación (Opcional)

Si planeas usar autenticación de Supabase:

1. Ve a **Authentication** → **Providers**
2. Habilita los proveedores que necesites (Email, Google, etc.)
3. Configura las URLs de redirección en **Authentication** → **URL Configuration**

## Notas importantes

- **RLS está habilitado**: Todas las tablas tienen Row Level Security activo
- **Políticas**: Los usuarios solo pueden acceder a sus propios datos
- **Índices**: Se crearon índices en `user_id` y `created_at` para mejor rendimiento
- **Foreign Keys**: Las relaciones entre tablas están configuradas con `ON DELETE CASCADE`

## Solución de problemas

### Error: "relation does not exist"
- Asegúrate de haber ejecutado el archivo SQL completo
- Verifica que estás en el proyecto correcto de Supabase

### Error: "permission denied"
- Verifica que las políticas RLS están creadas correctamente
- Asegúrate de estar autenticado cuando intentas acceder a los datos

### Error: "invalid input syntax for type uuid"
- Verifica que los IDs de usuario coinciden con los de Supabase Auth
- Asegúrate de usar `auth.uid()` en las políticas RLS

