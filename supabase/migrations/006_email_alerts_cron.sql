-- Función para verificar y enviar alertas por email
-- Esta función será llamada por pg_cron o por un endpoint API

CREATE OR REPLACE FUNCTION check_and_send_email_alerts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  plan_limit INTEGER;
  usage_percentage NUMERIC;
  current_month VARCHAR(7);
  alert_sent BOOLEAN;
BEGIN
  -- Obtener el mes actual en formato YYYY-MM
  current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');

  -- Iterar sobre usuarios Pro y Business con alertas habilitadas
  FOR user_record IN
    SELECT 
      u.id,
      u.email,
      u.subscription_status,
      u.rfc_queries_this_month,
      COALESCE(eap.alerts_enabled, true) as alerts_enabled,
      COALESCE(eap.alert_threshold, 80) as alert_threshold
    FROM users u
    LEFT JOIN email_alert_preferences eap ON eap.user_id = u.id
    WHERE u.subscription_status IN ('pro', 'business')
      AND COALESCE(eap.alerts_enabled, true) = true
  LOOP
    -- Obtener límite del plan
    CASE user_record.subscription_status
      WHEN 'pro' THEN plan_limit := 1000;
      WHEN 'business' THEN plan_limit := 5000;
      ELSE plan_limit := 0;
    END CASE;

    -- Calcular porcentaje de uso
    usage_percentage := (user_record.rfc_queries_this_month::NUMERIC / plan_limit::NUMERIC) * 100;

    -- Verificar si ya se envió alerta de umbral este mes
    SELECT EXISTS(
      SELECT 1 FROM email_alerts_sent
      WHERE user_id = user_record.id
        AND alert_type = 'threshold'
        AND month_year = current_month
    ) INTO alert_sent;

    -- Enviar alerta de umbral si se alcanzó y no se ha enviado
    IF usage_percentage >= user_record.alert_threshold 
       AND user_record.rfc_queries_this_month < plan_limit
       AND NOT alert_sent THEN
      -- Aquí se llamaría al endpoint API para enviar el email
      -- Por ahora solo registramos que se debe enviar
      INSERT INTO email_alerts_sent (user_id, alert_type, month_year)
      VALUES (user_record.id, 'threshold', current_month)
      ON CONFLICT (user_id, alert_type, month_year) DO NOTHING;
    END IF;

    -- Verificar si se alcanzó el límite
    SELECT EXISTS(
      SELECT 1 FROM email_alerts_sent
      WHERE user_id = user_record.id
        AND alert_type = 'limit_reached'
        AND month_year = current_month
    ) INTO alert_sent;

    IF user_record.rfc_queries_this_month >= plan_limit AND NOT alert_sent THEN
      INSERT INTO email_alerts_sent (user_id, alert_type, month_year)
      VALUES (user_record.id, 'limit_reached', current_month)
      ON CONFLICT (user_id, alert_type, month_year) DO NOTHING;
    END IF;
  END LOOP;
END;
$$;

-- Programar ejecución diaria a las 9:00 AM UTC
-- Nota: Esto requiere que pg_cron esté habilitado
-- SELECT cron.schedule(
--   'check-email-alerts-daily',
--   '0 9 * * *',
--   $$SELECT check_and_send_email_alerts()$$
-- );

