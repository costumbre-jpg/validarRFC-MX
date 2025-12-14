-- ============================================
-- VERIFICACIÓN: Estadísticas de Uso y Alertas por Email
-- ============================================
-- Este script verifica si la migración ya se ejecutó
-- ============================================

-- Verificar campos en tabla users
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'total_validations'
    ) THEN '✅ Campo total_validations existe en users'
    ELSE '❌ Campo total_validations NO existe en users'
  END AS total_validations_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'api_calls_this_month'
    ) THEN '✅ Campo api_calls_this_month existe en users'
    ELSE '❌ Campo api_calls_this_month NO existe en users'
  END AS api_calls_status;

-- Verificar tablas de alertas
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_alert_preferences'
    ) THEN '✅ Tabla email_alert_preferences existe'
    ELSE '❌ Tabla email_alert_preferences NO existe'
  END AS email_preferences_table_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_alerts_sent'
    ) THEN '✅ Tabla email_alerts_sent existe'
    ELSE '❌ Tabla email_alerts_sent NO existe'
  END AS email_sent_table_status;

-- Verificar trigger
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'trigger_update_total_validations'
    ) THEN '✅ Trigger trigger_update_total_validations existe'
    ELSE '❌ Trigger trigger_update_total_validations NO existe'
  END AS trigger_status;

-- Verificar función
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'update_user_total_validations'
    ) THEN '✅ Función update_user_total_validations existe'
    ELSE '❌ Función update_user_total_validations NO existe'
  END AS function_status;

-- Resumen completo
SELECT 
  '=== RESUMEN DE VERIFICACIÓN ===' AS resumen,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'total_validations'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'users' 
      AND column_name = 'api_calls_this_month'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_alert_preferences'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'email_alerts_sent'
    ) THEN '✅✅✅ MIGRACIÓN COMPLETA - Todo está configurado ✅✅✅'
    ELSE '⚠️⚠️⚠️ MIGRACIÓN INCOMPLETA - Faltan elementos por configurar ⚠️⚠️⚠️'
  END AS estado_final;

