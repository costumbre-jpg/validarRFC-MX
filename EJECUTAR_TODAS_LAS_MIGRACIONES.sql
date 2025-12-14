-- ============================================
-- MIGRACIÓN COMPLETA - MAFLIPP
-- Ejecuta TODO este archivo en Supabase SQL Editor
-- ============================================

-- ============================================
-- MIGRACIÓN 1: Esquema Inicial
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'business', 'enterprise')),
  rfc_queries_this_month INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create validations table
CREATE TABLE IF NOT EXISTS validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rfc TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  response_time FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'business', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled')),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own data') THEN
    CREATE POLICY "Users can view own data"
      ON users
      FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can update own data') THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can insert own data') THEN
    CREATE POLICY "Users can insert own data"
      ON users
      FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- RLS Policies for validations table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'validations' AND policyname = 'Users can view own validations') THEN
    CREATE POLICY "Users can view own validations"
      ON validations
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'validations' AND policyname = 'Users can insert own validations') THEN
    CREATE POLICY "Users can insert own validations"
      ON validations
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'validations' AND policyname = 'Users can delete own validations') THEN
    CREATE POLICY "Users can delete own validations"
      ON validations
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for subscriptions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can view own subscriptions') THEN
    CREATE POLICY "Users can view own subscriptions"
      ON subscriptions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can insert own subscriptions') THEN
    CREATE POLICY "Users can insert own subscriptions"
      ON subscriptions
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscriptions' AND policyname = 'Users can update own subscriptions') THEN
    CREATE POLICY "Users can update own subscriptions"
      ON subscriptions
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_validations_user_id ON validations(user_id);
CREATE INDEX IF NOT EXISTS idx_validations_created_at ON validations(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================
-- MIGRACIÓN 2: API Keys
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

-- RLS Policies for api_keys
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can view own API keys') THEN
    CREATE POLICY "Users can view own API keys"
      ON api_keys
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can insert own API keys') THEN
    CREATE POLICY "Users can insert own API keys"
      ON api_keys
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can update own API keys') THEN
    CREATE POLICY "Users can update own API keys"
      ON api_keys
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can delete own API keys') THEN
    CREATE POLICY "Users can delete own API keys"
      ON api_keys
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for api_usage_logs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_usage_logs' AND policyname = 'Users can view own API usage logs') THEN
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
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);

-- ============================================
-- MIGRACIÓN 3: Trigger para Registro Automático
-- ============================================

-- Trigger para crear usuario en tabla users cuando se registra en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status, rfc_queries_this_month)
  VALUES (NEW.id, NEW.email, 'free', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de insertar en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- MIGRACIÓN 4: Reset Mensual de Contadores
-- ============================================

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

-- ============================================
-- MIGRACIÓN 5: Alertas por Email
-- ============================================

-- Tabla para almacenar preferencias de alertas por email
CREATE TABLE IF NOT EXISTS public.email_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_threshold INTEGER NOT NULL DEFAULT 80,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.email_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para email_alert_preferences
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_alert_preferences' AND policyname = 'Users can view own alert preferences') THEN
    CREATE POLICY "Users can view own alert preferences"
      ON public.email_alert_preferences
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_alert_preferences' AND policyname = 'Users can insert own alert preferences') THEN
    CREATE POLICY "Users can insert own alert preferences"
      ON public.email_alert_preferences
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_alert_preferences' AND policyname = 'Users can update own alert preferences') THEN
    CREATE POLICY "Users can update own alert preferences"
      ON public.email_alert_preferences
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Tabla para registrar alertas enviadas
CREATE TABLE IF NOT EXISTS public.email_alerts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year VARCHAR(7) NOT NULL,
  UNIQUE(user_id, alert_type, month_year)
);

-- Habilitar RLS
ALTER TABLE public.email_alerts_sent ENABLE ROW LEVEL SECURITY;

-- Política RLS para email_alerts_sent
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_alerts_sent' AND policyname = 'Users can view own sent alerts') THEN
    CREATE POLICY "Users can view own sent alerts"
      ON public.email_alerts_sent
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_email_alert_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_email_alert_preferences_updated_at ON public.email_alert_preferences;
CREATE TRIGGER update_email_alert_preferences_updated_at
  BEFORE UPDATE ON public.email_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_alert_preferences_updated_at();

-- ============================================
-- MIGRACIÓN 6: Cron Job para Alertas (Opcional - se maneja desde API)
-- ============================================

-- Esta migración es opcional ya que las alertas se manejan desde el endpoint /api/alerts/send
-- Se deja comentado por si se quiere usar pg_cron en el futuro

-- ============================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'validations', 'subscriptions', 'api_keys', 'api_usage_logs', 'email_alert_preferences', 'email_alerts_sent') 
    THEN '✅ Creada'
    ELSE '⚠️ Extra'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- ✅ MIGRACIÓN COMPLETA
-- ============================================
-- Si ves todas las tablas listadas arriba, ¡todo está listo!
-- ============================================

