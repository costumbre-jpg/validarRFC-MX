-- ============================================
-- MIGRACIÓN 2: Tracking mensual de API calls
-- ============================================
-- Ejecutar este archivo DESPUÉS de la migración 1
-- ============================================

-- Agregar campo para rastrear llamadas API mensuales
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER NOT NULL DEFAULT 0;

-- Índice para mejorar consultas de uso mensual
CREATE INDEX IF NOT EXISTS idx_api_keys_api_calls_this_month ON api_keys(api_calls_this_month);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que la columna existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'api_keys'
      AND column_name = 'api_calls_this_month'
    ) 
    THEN '✅ Columna api_calls_this_month EXISTE'
    ELSE '❌ Columna api_calls_this_month NO EXISTE'
  END as status;

-- Verificar el índice
SELECT 
  indexname,
  '✅ Índice existe' as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename = 'api_keys'
AND indexname = 'idx_api_keys_api_calls_this_month';

