-- ============================================
-- MIGRACIÓN COMPLETA: White Label Settings
-- ============================================
-- Este script crea la tabla white_label_settings para el plan Business
-- Ejecuta este script en Supabase SQL Editor
-- ============================================

-- 1. Crear tabla white_label_settings
CREATE TABLE IF NOT EXISTS public.white_label_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL DEFAULT 'Tu Marca',
  custom_logo_url TEXT,
  primary_color TEXT DEFAULT '#2F7E7A',
  secondary_color TEXT DEFAULT '#1F5D59',
  hide_maflipp_brand BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si existen (para evitar errores)
DROP POLICY IF EXISTS "Users can view own white label settings" ON public.white_label_settings;
DROP POLICY IF EXISTS "Users can insert own white label settings" ON public.white_label_settings;
DROP POLICY IF EXISTS "Users can update own white label settings" ON public.white_label_settings;

-- 4. Crear políticas RLS
CREATE POLICY "Users can view own white label settings"
  ON public.white_label_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own white label settings"
  ON public.white_label_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own white label settings"
  ON public.white_label_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Eliminar función y trigger existentes si existen (para evitar errores)
DROP TRIGGER IF EXISTS update_white_label_settings_updated_at ON public.white_label_settings;
DROP FUNCTION IF EXISTS update_white_label_settings_updated_at();

-- 6. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_white_label_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear trigger para actualizar updated_at
CREATE TRIGGER update_white_label_settings_updated_at
  BEFORE UPDATE ON public.white_label_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_settings_updated_at();

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Verificar que todo se creó correctamente
SELECT 
  '✅ Tabla white_label_settings creada' AS resultado
WHERE EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'white_label_settings'
);

SELECT 
  COUNT(*) AS total_politicas,
  '✅ Políticas RLS creadas' AS resultado
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'white_label_settings';

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM pg_trigger 
      WHERE tgname = 'update_white_label_settings_updated_at'
    )
    THEN '✅ Trigger creado correctamente'
    ELSE '❌ Error al crear trigger'
  END AS resultado_trigger;

-- ============================================
-- RESUMEN
-- ============================================
-- Si ves los 3 mensajes ✅, la migración se ejecutó correctamente
-- La tabla white_label_settings está lista para usar
-- ============================================

