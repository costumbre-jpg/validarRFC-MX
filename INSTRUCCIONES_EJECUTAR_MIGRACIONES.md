# 🚀 Instrucciones para Ejecutar Todas las Migraciones SQL

## 📋 Paso a Paso

### 1. Abrir Supabase Dashboard
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto `validarfcmx` (o el nombre que le pusiste)

### 2. Abrir SQL Editor
1. En el menú lateral izquierdo, click en **"SQL Editor"** (ícono de terminal/código)
2. Click en **"New query"** (botón verde arriba a la derecha)

### 3. Copiar y Ejecutar el SQL Completo
1. Abre el archivo `EJECUTAR_TODAS_LAS_MIGRACIONES.sql` en tu editor
2. **Copia TODO el contenido** del archivo (Ctrl+A, Ctrl+C)
3. Pégalo en el SQL Editor de Supabase (Ctrl+V)
4. Click en **"Run"** (botón verde) o presiona `Ctrl+Enter`
5. ⏳ Espera unos segundos mientras se ejecuta

### 4. Verificar Resultado
✅ **Deberías ver:**
- Al final, una tabla con todas las tablas creadas
- Cada tabla debe mostrar "✅ Creada"
- Mensaje de éxito: "Success. No rows returned" o similar

### 5. Verificar en Table Editor
1. En el menú lateral, click en **"Table Editor"**
2. Deberías ver estas tablas:
   - ✅ `users`
   - ✅ `validations`
   - ✅ `subscriptions`
   - ✅ `api_keys`
   - ✅ `api_usage_logs`
   - ✅ `email_alert_preferences`
   - ✅ `email_alerts_sent`

## ⚠️ Si hay Errores

### Error: "relation already exists"
- **Significa:** La tabla ya existe
- **Solución:** No pasa nada, el script usa `IF NOT EXISTS` para evitar duplicados
- **Acción:** Continúa, el resto se creará correctamente

### Error: "policy already exists"
- **Significa:** La política RLS ya existe
- **Solución:** No pasa nada, el script verifica antes de crear
- **Acción:** Continúa normalmente

### Error: "extension pg_cron does not exist"
- **Significa:** pg_cron no está disponible en tu plan
- **Solución:** Esto es normal en el plan Free de Supabase
- **Acción:** Las funciones se crearán, pero el cron job no se programará. Esto no afecta las APIs, solo el reseteo automático mensual (se puede hacer manualmente)

## ✅ ¿Qué se Creó?

### Tablas Principales:
- **users**: Usuarios de la plataforma
- **validations**: Historial de validaciones RFC
- **subscriptions**: Suscripciones de Stripe

### Tablas de API:
- **api_keys**: API Keys para integración
- **api_usage_logs**: Logs de uso de la API

### Tablas de Alertas:
- **email_alert_preferences**: Preferencias de alertas por email
- **email_alerts_sent**: Registro de alertas enviadas

### Funciones y Triggers:
- **handle_new_user()**: Crea usuario automáticamente al registrarse
- **reset_monthly_rfc_counts()**: Reinicia contadores mensuales
- **update_email_alert_preferences_updated_at()**: Actualiza timestamps

### Políticas RLS:
- Todas las tablas tienen Row Level Security habilitado
- Usuarios solo pueden ver/editar sus propios datos

## 🎉 ¡Listo!

Una vez ejecutado, las APIs del plan Pro estarán completamente funcionales:
- ✅ Crear API Keys
- ✅ Validar RFCs vía API
- ✅ Registrar uso de API
- ✅ Alertas por email
- ✅ Historial de validaciones

## 📝 Nota Final

Si ya ejecutaste algunas migraciones antes, no pasa nada. El script usa `IF NOT EXISTS` y verificaciones para evitar duplicados. Puedes ejecutarlo sin problemas.

