-- ============================================
-- VERIFICAR MIGRACIONES DE API KEYS
-- ============================================
-- Ejecuta esto en Supabase SQL Editor para verificar si las migraciones ya están ejecutadas
-- ============================================

-- 1. Verificar que las tablas existen
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('api_keys', 'api_usage_logs') 
    THEN '✅ Tabla EXISTE'
    ELSE '⚠️ Tabla Extra'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('api_keys', 'api_usage_logs')
ORDER BY table_name;

-- 2. Verificar columnas de api_keys
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'api_keys'
ORDER BY ordinal_position;

-- 3. Verificar que api_calls_this_month existe (Migración 007)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'api_keys'
      AND column_name = 'api_calls_this_month'
    ) 
    THEN '✅ Columna api_calls_this_month EXISTE'
    ELSE '❌ Columna api_calls_this_month NO EXISTE - Necesitas ejecutar migración 007'
  END as status;

-- 4. Verificar que RLS está habilitado
SELECT 
  tablename, 
  CASE 
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS NO HABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('api_keys', 'api_usage_logs')
ORDER BY tablename;

-- 5. Verificar las políticas RLS de api_keys (deberían ser 4)
SELECT 
  policyname, 
  cmd,
  '✅ Política existe' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'api_keys'
ORDER BY policyname;

-- 6. Verificar las políticas RLS de api_usage_logs (debería ser 1)
SELECT 
  policyname, 
  cmd,
  '✅ Política existe' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'api_usage_logs'
ORDER BY policyname;

-- 7. Verificar que los índices existen
SELECT 
  indexname,
  tablename,
  '✅ Índice existe' as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('api_keys', 'api_usage_logs')
ORDER BY tablename, indexname;

-- 8. Verificar función reset_monthly_api_calls (Migración 008)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'reset_monthly_api_calls'
    ) 
    THEN '✅ Función reset_monthly_api_calls EXISTE'
    ELSE '❌ Función reset_monthly_api_calls NO EXISTE - Necesitas ejecutar migración 008'
  END as status;

-- 9. Verificar cron job reset-monthly-api-calls (Migración 008)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM cron.job 
      WHERE jobname = 'reset-monthly-api-calls'
    ) 
    THEN '✅ Cron job reset-monthly-api-calls EXISTE'
    ELSE '❌ Cron job reset-monthly-api-calls NO EXISTE - Necesitas ejecutar migración 008'
  END as status;

-- ============================================
-- RESUMEN
-- ============================================
-- Si ves:
-- ✅ 2 tablas (api_keys, api_usage_logs)
-- ✅ Columna api_calls_this_month en api_keys
-- ✅ RLS HABILITADO en ambas tablas
-- ✅ 4 políticas en api_keys
-- ✅ 1 política en api_usage_logs
-- ✅ 4+ índices (dependiendo de las migraciones)
-- ✅ Función reset_monthly_api_calls
-- ✅ Cron job reset-monthly-api-calls
-- 
-- Entonces TODAS las migraciones YA ESTÁN EJECUTADAS ✅
-- 
-- Si ves algún ❌, necesitas ejecutar las migraciones faltantes:
-- - 002_api_keys.sql (tablas básicas)
-- - 007_add_api_calls_monthly_tracking.sql (columna api_calls_this_month)
-- - 008_reset_monthly_api_calls.sql (función y cron job)
-- ============================================

