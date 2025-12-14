# Sistema de Alertas por Email - Configuración

## ✅ Implementación Completa

El sistema de alertas por email está completamente implementado. Aquí está lo que se creó:

### 1. Base de Datos
- **Tabla `email_alert_preferences`**: Almacena las preferencias de cada usuario
- **Tabla `email_alerts_sent`**: Registra las alertas enviadas para evitar duplicados
- **Migración**: `supabase/migrations/005_email_alerts_preferences.sql`

### 2. API Endpoints
- **GET/POST `/api/alerts/preferences`**: Obtener y guardar preferencias de alertas
- **POST `/api/alerts/send`**: Verificar y enviar alertas (para cron job)

### 3. Servicio de Email
- **Archivo**: `lib/email.ts`
- **Servicio**: Resend (https://resend.com)
- **Funciones**:
  - `sendThresholdAlert()`: Alerta cuando se alcanza el umbral configurado
  - `sendLimitReachedAlert()`: Alerta cuando se alcanza el 100% del límite
  - `sendMonthlySummary()`: Resumen mensual al final del mes

### 4. Componente UI
- **Archivo**: `components/dashboard/EmailAlerts.tsx`
- **Ubicación**: Página "Mi Cuenta" (solo Pro/Business)
- **Funcionalidades**:
  - Activar/desactivar alertas
  - Configurar umbral (50-100%)
  - Guardar preferencias

## 🔧 Configuración Requerida

### 1. Ejecutar Migración SQL

Ejecuta en Supabase SQL Editor:
```sql
-- Archivo: supabase/migrations/005_email_alerts_preferences.sql
```

### 2. Configurar Resend

1. Crea una cuenta en https://resend.com
2. Obtén tu API Key
3. Agrega a `.env.local`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 3. Configurar Cron Job

Tienes dos opciones:

#### Opción A: Usar Vercel Cron (Recomendado)

Crea `vercel.json` en la raíz:
```json
{
  "crons": [
    {
      "path": "/api/alerts/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Opción B: Usar Supabase pg_cron

Ejecuta en Supabase SQL Editor:
```sql
-- Habilitar pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Programar verificación diaria a las 9:00 AM UTC
SELECT cron.schedule(
  'check-email-alerts-daily',
  '0 9 * * *',
  $$SELECT net.http_post(
    url := 'https://tu-dominio.com/api/alerts/send',
    headers := '{"Authorization": "Bearer ' || current_setting('app.cron_secret') || '"}'::jsonb
  )$$
);
```

### 4. Configurar Variables de Entorno

Agrega a `.env.local`:
```env
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Secret para proteger el endpoint de cron
CRON_SECRET=tu-secret-super-seguro-aqui

# URL de tu sitio (para links en emails)
NEXT_PUBLIC_SITE_URL=https://maflipp.com
```

## 📧 Tipos de Alertas

### 1. Alerta de Umbral
- **Cuándo**: Cuando el uso alcanza el porcentaje configurado (default: 80%)
- **Frecuencia**: Una vez por mes
- **Ejemplo**: "Has alcanzado el 80% de tu límite mensual"

### 2. Alerta de Límite Alcanzado
- **Cuándo**: Cuando se alcanza el 100% del límite
- **Frecuencia**: Una vez por mes
- **Ejemplo**: "Has alcanzado tu límite mensual"

### 3. Resumen Mensual
- **Cuándo**: Último día del mes
- **Frecuencia**: Una vez al mes
- **Contenido**: Estadísticas del mes (total, válidos, inválidos, tasa de éxito)

## 🧪 Probar el Sistema

### Probar Guardar Preferencias
1. Ve a `/dashboard/cuenta` (con plan Pro o Business)
2. Configura las alertas
3. Haz clic en "Guardar Preferencias"
4. Verifica que se guarde correctamente

### Probar Envío de Alertas (Manual)
```bash
curl -X POST https://tu-dominio.com/api/alerts/send \
  -H "Authorization: Bearer tu-cron-secret"
```

## 📝 Notas Importantes

1. **Evitar Duplicados**: El sistema registra cada alerta enviada en `email_alerts_sent` para evitar enviar la misma alerta múltiples veces en un mes.

2. **Solo Pro/Business**: Las alertas solo están disponibles para usuarios con planes Pro o Business.

3. **Valores por Defecto**: Si un usuario no tiene preferencias configuradas, se usan:
   - Alertas habilitadas: `true`
   - Umbral: `80%`

4. **Resend**: Asegúrate de verificar tu dominio en Resend o usar el dominio de prueba para desarrollo.

## ✅ Estado

- ✅ Base de datos creada
- ✅ API endpoints implementados
- ✅ Servicio de email implementado
- ✅ Componente UI actualizado
- ⚠️ Pendiente: Configurar Resend API Key
- ⚠️ Pendiente: Configurar Cron Job
- ⚠️ Pendiente: Ejecutar migración SQL

