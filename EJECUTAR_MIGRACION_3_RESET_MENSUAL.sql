-- ============================================
-- MIGRACIÓN 3: Reset automático mensual
-- ============================================
-- Ejecutar este archivo DESPUÉS de la migración 2
-- ============================================

-- Función para resetear contadores mensuales de API calls
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

-- Programar reset mensual (1er día de cada mes a las 06:00 UTC)
-- Nota: Requiere que pg_cron esté habilitado
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
-- Verificar que la función existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'reset_monthly_api_calls'
    ) 
    THEN '✅ Función reset_monthly_api_calls EXISTE'
    ELSE '❌ Función reset_monthly_api_calls NO EXISTE'
  END as status;

-- Verificar que el cron job está programado
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'reset-monthly-api-calls'
    ) 
    THEN '✅ Cron job reset-monthly-api-calls EXISTE'
    ELSE '❌ Cron job reset-monthly-api-calls NO EXISTE'
  END as status;

