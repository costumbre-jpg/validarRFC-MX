-- ============================================
-- MIGRACIONES COMPLETAS PARA API KEYS
-- ============================================
-- Ejecutar este archivo en Supabase SQL Editor
-- Esta versión no falla si ya existe algo
-- ============================================

-- ============================================
-- MIGRACIÓN 1: Tablas básicas (002_api_keys.sql)
-- ============================================

-- Create API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create API usage logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  rfc TEXT NOT NULL,
  is_valid BOOLEAN,
  response_time FLOAT,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si existen (para recrearlas)
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can insert own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
DROP POLICY IF EXISTS "Users can view own API usage logs" ON api_usage_logs;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view own API usage logs"
  ON api_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.id = api_usage_logs.api_key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- ============================================
-- MIGRACIÓN 2: Tracking mensual (007_add_api_calls_monthly_tracking.sql)
-- ============================================

-- Agregar campo para rastrear llamadas API mensuales
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER NOT NULL DEFAULT 0;

-- Índice para mejorar consultas de uso mensual
CREATE INDEX IF NOT EXISTS idx_api_keys_api_calls_this_month ON api_keys(api_calls_this_month);

-- ============================================
-- MIGRACIÓN 3: Reset automático mensual (008_reset_monthly_api_calls.sql)
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
-- Ejecuta esto después para verificar que todo se creó correctamente:

-- Verificar que las tablas existen
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

-- Verificar que api_calls_this_month existe
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

