-- ============================================
-- MIGRACIONES PARA API KEYS - LÍMITES MENSUALES
-- ============================================
-- Ejecutar este archivo en Supabase SQL Editor
-- ============================================

-- 1. Agregar campo para rastrear llamadas API mensuales
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER NOT NULL DEFAULT 0;

-- Índice para mejorar consultas de uso mensual
CREATE INDEX IF NOT EXISTS idx_api_keys_api_calls_this_month ON api_keys(api_calls_this_month);

-- 2. Función para resetear contadores mensuales de API calls
CREATE OR REPLACE FUNCTION reset_monthly_api_calls()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE api_keys
  SET api_calls_this_month = 0
  WHERE api_calls_this_month > 0;
END;
$$;

-- 3. Programar reset mensual (1er día de cada mes a las 06:00 UTC)
-- Nota: Requiere que pg_cron esté habilitado
-- Si ya existe el cron job, esto fallará silenciosamente (está bien)
DO $$
BEGIN
  -- Intentar eliminar el cron job si ya existe
  PERFORM cron.unschedule('reset-monthly-api-calls');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignorar si no existe
END $$;

-- Crear el cron job
SELECT cron.schedule(
  'reset-monthly-api-calls',
  '0 6 1 * *', -- 1er día de cada mes a las 06:00 UTC
  $$SELECT reset_monthly_api_calls()$$
);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto después para verificar que todo se creó correctamente:

-- Verificar que el campo existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'api_keys' AND column_name = 'api_calls_this_month';

-- Verificar que la función existe
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name = 'reset_monthly_api_calls';

-- Verificar que el cron job está programado
SELECT * FROM cron.job WHERE jobname = 'reset-monthly-api-calls';

