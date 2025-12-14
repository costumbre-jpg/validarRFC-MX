-- Habilitar pg_cron (si no está habilitado)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Función para reiniciar el contador mensual de validaciones
CREATE OR REPLACE FUNCTION public.reset_monthly_rfc_counts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.users
  SET rfc_queries_this_month = 0;
$$;

-- Programar el reseteo el día 1 de cada mes a las 06:00 UTC
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'reset-monthly-rfc-counts') THEN
    PERFORM cron.schedule(
      'reset-monthly-rfc-counts',
      '0 6 1 * *',
      'SELECT public.reset_monthly_rfc_counts();'
    );
  END IF;
END;
$$;

COMMENT ON FUNCTION public.reset_monthly_rfc_counts() IS
  'Reinicia rfc_queries_this_month a 0 para todos los usuarios el día 1 de cada mes.';

