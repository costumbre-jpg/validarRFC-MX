-- ============================================
-- MIGRACIÓN 1: Tablas básicas de API Keys
-- ============================================
-- Ejecutar este archivo PRIMERO en Supabase SQL Editor
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
-- VERIFICACIÓN
-- ============================================
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

-- Verificar políticas
SELECT 
  policyname, 
  tablename,
  '✅ Política existe' as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('api_keys', 'api_usage_logs')
ORDER BY tablename, policyname;

