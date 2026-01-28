# Lista de Migraciones SQL - Supabase

Este documento lista todas las migraciones SQL que deben ejecutarse en orden en Supabase para que la plataforma funcione correctamente.

**⚠️ IMPORTANTE**: Ejecutar las migraciones **en el orden numérico** mostrado abajo. No saltar ninguna.

---

## Orden de ejecución (CRÍTICO)

### 1. `001_initial_schema.sql`
**Descripción**: Esquema base de la aplicación
- Crea tablas: `users`, `validations`, `subscriptions`
- Habilita Row Level Security (RLS) en todas las tablas
- Crea políticas RLS básicas
- **Estado**: ✅ CRÍTICA - Base de todo

### 2. `002_api_keys.sql`
**Descripción**: Sistema de API Keys para API pública
- Crea tabla: `api_keys` (almacena API keys hasheadas)
- Crea tabla: `api_usage_logs` (logs de uso de API)
- Habilita RLS y políticas
- **Estado**: ✅ CRÍTICA - Requerida para API pública

### 3. `003_create_user_trigger.sql`
**Descripción**: Trigger automático para crear registro en `users` cuando se registra en Auth
- Crea función trigger que sincroniza `auth.users` con `public.users`
- **Estado**: ✅ CRÍTICA - Sin esto, los usuarios no aparecen en la BD

### 4. `004_reset_monthly_rfc_counts.sql`
**Descripción**: Función para resetear contador mensual de validaciones RFC
- Crea función `reset_monthly_rfc_counts()` 
- Usada por cron job (opcional) para resetear contadores el día 1 de cada mes
- **Estado**: ⚠️ OPCIONAL - Solo si usas cron para resetear contadores

### 5. `005_email_alerts_preferences.sql`
**Descripción**: Preferencias de alertas por email
- Crea tabla: `email_alert_preferences`
- Permite a usuarios configurar umbrales y tipos de alertas
- **Estado**: ✅ RECOMENDADA - Para sistema de alertas

### 6. `006_email_alerts_cron.sql`
**Descripción**: Historial de alertas enviadas
- Crea tabla: `email_alerts_sent`
- Evita enviar alertas duplicadas
- **Estado**: ✅ RECOMENDADA - Para sistema de alertas

### 7. `007_add_api_calls_monthly_tracking.sql`
**Descripción**: Tracking mensual de llamadas API
- Agrega columna `api_calls_this_month` a tabla `api_keys`
- **Estado**: ✅ CRÍTICA - Requerida para límites mensuales de API

### 8. `008_reset_monthly_api_calls.sql`
**Descripción**: Función para resetear contador mensual de llamadas API
- Crea función `reset_monthly_api_calls()`
- Similar a `004`, pero para API calls
- **Estado**: ⚠️ OPCIONAL - Solo si usas cron

### 9. `009_team_management.sql`
**Descripción**: Sistema de gestión de equipos
- Crea tabla: `team_members`
- Permite invitar miembros a equipos, roles (owner/member)
- **Estado**: ✅ RECOMENDADA - Para funcionalidad de equipos

### 10. `010_white_label.sql`
**Descripción**: Configuración de white label (Business plan)
- Crea tabla: `white_label_settings`
- Permite personalizar marca, logo, colores
- **Estado**: ✅ RECOMENDADA - Para funcionalidad white label

### 11. `011_onboarding_personalizado.sql`
**Descripción**: Sistema de onboarding personalizado
- Crea tabla: `onboarding_requests`
- Para clientes Business que requieren onboarding guiado
- **Estado**: ⚠️ OPCIONAL - Solo si ofreces onboarding personalizado

### 12. `012_add_profile_fields.sql`
**Descripción**: Campos adicionales de perfil de usuario
- Agrega columnas a tabla `users`: `full_name`, `phone`
- **Estado**: ✅ RECOMENDADA - Para perfiles completos

### 13. `012_show_brand_name.sql`
**Descripción**: Soporte para mostrar nombre de marca personalizado
- Agrega columna `show_brand_name` a `white_label_settings`
- **Estado**: ✅ RECOMENDADA - Si usas white label

### 14. `013_add_profile_photo_phone.sql`
**Descripción**: Avatar/foto de perfil y teléfono
- Agrega columna `avatar_url` a tabla `users`
- Mejora campos de perfil
- **Estado**: ✅ RECOMENDADA - Para perfiles completos

### 15. `014_update_subscription_status_business.sql`
**Descripción**: Actualiza enum de planes para incluir "business"
- Actualiza CHECK constraint en `users.subscription_status` para incluir 'business'
- Actualiza CHECK constraint en `subscriptions.plan` para incluir 'business'
- **Estado**: ✅ CRÍTICA - Requerida si usas plan Business

### 16. `015_notifications.sql`
**Descripción**: Sistema de notificaciones in-app
- Crea tabla: `notifications`
- Permite mostrar notificaciones en el dashboard
- **Estado**: ✅ RECOMENDADA - Para sistema de notificaciones

---

## Resumen por prioridad

### 🔴 CRÍTICAS (deben ejecutarse sí o sí):
1. `001_initial_schema.sql`
2. `002_api_keys.sql`
3. `003_create_user_trigger.sql`
4. `007_add_api_calls_monthly_tracking.sql`
5. `014_update_subscription_status_business.sql`

### 🟡 RECOMENDADAS (funcionalidades importantes):
- `005_email_alerts_preferences.sql`
- `006_email_alerts_cron.sql`
- `009_team_management.sql`
- `010_white_label.sql`
- `012_add_profile_fields.sql`
- `012_show_brand_name.sql`
- `013_add_profile_photo_phone.sql`
- `015_notifications.sql`

### 🟢 OPCIONALES (solo si usas esa funcionalidad):
- `004_reset_monthly_rfc_counts.sql` (solo si usas cron)
- `008_reset_monthly_api_calls.sql` (solo si usas cron)
- `011_onboarding_personalizado.sql` (solo si ofreces onboarding)

---

## Cómo ejecutar las migraciones

### Opción 1: Desde Supabase Dashboard (RECOMENDADA)

1. Ir a Supabase Dashboard → SQL Editor
2. Abrir cada archivo `.sql` en orden (001, 002, 003, ...)
3. Copiar y pegar el contenido completo
4. Click en "Run" o presionar `Ctrl+Enter`
5. Verificar que no hay errores
6. Repetir para la siguiente migración

### Opción 2: Desde CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
supabase db push
```

### Opción 3: Desde psql (PostgreSQL)

```bash
# Conectar a Supabase
psql -h db.xxxxx.supabase.co -U postgres -d postgres

# Ejecutar cada migración
\i supabase/migrations/001_initial_schema.sql
\i supabase/migrations/002_api_keys.sql
# ... etc
```

---

## Verificar migraciones ejecutadas

Para ver qué migraciones ya están ejecutadas en tu Supabase:

```sql
-- Ver todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Ver todas las funciones creadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```

---

## Notas importantes

1. **Orden es crítico**: Algunas migraciones dependen de tablas creadas en migraciones anteriores.
2. **No ejecutar dos veces**: Si una migración ya se ejecutó, puede fallar si intentas ejecutarla de nuevo (usa `IF NOT EXISTS` cuando sea posible).
3. **Backup antes**: Siempre haz backup de la BD antes de ejecutar migraciones en producción.
4. **Probar en desarrollo primero**: Ejecuta las migraciones en un proyecto de desarrollo antes de producción.

---

**Última actualización**: Enero 2025  
**Total de migraciones**: 16 archivos
