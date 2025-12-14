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
SELECT cron.schedule(
  'reset-monthly-api-calls',
  '0 6 1 * *', -- 1er día de cada mes a las 06:00 UTC
  $$SELECT reset_monthly_api_calls()$$
);

