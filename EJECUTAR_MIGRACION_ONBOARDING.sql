-- ============================================
-- MIGRACIÓN COMPLETA: Onboarding Personalizado
-- ============================================
-- Este script crea la tabla onboarding_requests para el plan Business
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- 1. Crear tabla onboarding_requests
CREATE TABLE IF NOT EXISTS onboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  industry TEXT,
  team_size TEXT,
  use_cases TEXT,
  data_sources TEXT,
  integration_preferences TEXT,
  webhook_url TEXT,
  sandbox BOOLEAN DEFAULT false,
  contact_name TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'pendiente',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now())
);

-- 2. Crear índice único en user_id (un usuario solo puede tener una solicitud)
CREATE UNIQUE INDEX IF NOT EXISTS onboarding_requests_user_id_idx 
  ON onboarding_requests (user_id);

-- 3. Eliminar función y trigger existentes si existen (para evitar errores)
DROP TRIGGER IF EXISTS trg_update_onboarding_requests_updated_at ON onboarding_requests;
DROP FUNCTION IF EXISTS update_updated_at_onboarding_requests();

-- 4. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_onboarding_requests()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear trigger para actualizar updated_at
CREATE TRIGGER trg_update_onboarding_requests_updated_at
  BEFORE UPDATE ON onboarding_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_onboarding_requests();

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE onboarding_requests ENABLE ROW LEVEL SECURITY;

-- 7. Eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Users can manage their onboarding request" ON onboarding_requests;
DROP POLICY IF EXISTS "Users can insert their onboarding request" ON onboarding_requests;
DROP POLICY IF EXISTS "Users can update their onboarding request" ON onboarding_requests;

-- 8. Crear políticas RLS
CREATE POLICY "Users can manage their onboarding request"
  ON onboarding_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their onboarding request"
  ON onboarding_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their onboarding request"
  ON onboarding_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Verificar que todo se creó correctamente
SELECT 
  '✅ Tabla onboarding_requests creada' AS resultado
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'onboarding_requests'
);

SELECT 
  COUNT(*) AS total_politicas,
  '✅ Políticas RLS creadas' AS resultado
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'onboarding_requests';

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger 
      WHERE tgname = 'trg_update_onboarding_requests_updated_at'
    )
    THEN '✅ Trigger creado correctamente'
    ELSE '❌ Error al crear trigger'
  END AS resultado_trigger;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND tablename = 'onboarding_requests'
      AND indexname = 'onboarding_requests_user_id_idx'
    )
    THEN '✅ Índice único creado correctamente'
    ELSE '❌ Error al crear índice'
  END AS resultado_indice;

-- ============================================
-- RESUMEN
-- ============================================
-- Si ves los 4 mensajes ✅, la migración se ejecutó correctamente
-- La tabla onboarding_requests está lista para usar
-- ============================================

