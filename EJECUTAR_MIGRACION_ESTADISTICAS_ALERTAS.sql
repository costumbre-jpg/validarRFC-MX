-- ============================================
-- MIGRACIÓN: Estadísticas de Uso y Alertas por Email
-- ============================================
-- Este script agrega los campos necesarios para:
-- 1. Estadísticas de uso (total_validations, api_calls_this_month en users)
-- 2. Alertas por email (tablas y políticas)
-- ============================================

-- ============================================
-- PARTE 1: Agregar campos de estadísticas a la tabla users
-- ============================================

-- Agregar campo total_validations (total de validaciones históricas)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS total_validations INTEGER NOT NULL DEFAULT 0;

-- Agregar campo api_calls_this_month (llamadas API del mes actual)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER NOT NULL DEFAULT 0;

-- Crear función para calcular total_validations automáticamente
-- Esta función actualiza total_validations basándose en el conteo real de validations
CREATE OR REPLACE FUNCTION update_user_total_validations()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET total_validations = (
    SELECT COUNT(*) 
    FROM public.validations 
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar total_validations cuando se inserta una validación
DROP TRIGGER IF EXISTS trigger_update_total_validations ON public.validations;
CREATE TRIGGER trigger_update_total_validations
  AFTER INSERT ON public.validations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_validations();

-- Actualizar total_validations para usuarios existentes
UPDATE public.users u
SET total_validations = (
  SELECT COUNT(*) 
  FROM public.validations v 
  WHERE v.user_id = u.id
);

-- ============================================
-- PARTE 2: Tablas de Alertas por Email
-- ============================================

-- Tabla para almacenar preferencias de alertas por email
CREATE TABLE IF NOT EXISTS public.email_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,
  alert_threshold INTEGER NOT NULL DEFAULT 80, -- Porcentaje (50-100)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.email_alert_preferences ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver/editar sus propias preferencias
DROP POLICY IF EXISTS "Users can view own alert preferences" ON public.email_alert_preferences;
CREATE POLICY "Users can view own alert preferences"
  ON public.email_alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alert preferences" ON public.email_alert_preferences;
CREATE POLICY "Users can insert own alert preferences"
  ON public.email_alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alert preferences" ON public.email_alert_preferences;
CREATE POLICY "Users can update own alert preferences"
  ON public.email_alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tabla para registrar alertas enviadas (evitar duplicados)
CREATE TABLE IF NOT EXISTS public.email_alerts_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'threshold', 'limit_reached', 'monthly_summary'
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  month_year VARCHAR(7) NOT NULL, -- Formato: 'YYYY-MM'
  UNIQUE(user_id, alert_type, month_year)
);

-- Habilitar RLS
ALTER TABLE public.email_alerts_sent ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propias alertas enviadas
DROP POLICY IF EXISTS "Users can view own sent alerts" ON public.email_alerts_sent;
CREATE POLICY "Users can view own sent alerts"
  ON public.email_alerts_sent
  FOR SELECT
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_email_alert_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_email_alert_preferences_updated_at ON public.email_alert_preferences;
CREATE TRIGGER update_email_alert_preferences_updated_at
  BEFORE UPDATE ON public.email_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_alert_preferences_updated_at();

-- ============================================
-- PARTE 3: Índices para optimización
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_total_validations ON public.users(total_validations);
CREATE INDEX IF NOT EXISTS idx_users_api_calls_this_month ON public.users(api_calls_this_month);
CREATE INDEX IF NOT EXISTS idx_email_alert_preferences_user_id ON public.email_alert_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_email_alerts_sent_user_id ON public.email_alerts_sent(user_id);
CREATE INDEX IF NOT EXISTS idx_email_alerts_sent_month_year ON public.email_alerts_sent(month_year);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que los campos se agregaron correctamente
DO $$
BEGIN
  -- Verificar campos en users
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'total_validations'
  ) THEN
    RAISE NOTICE '✅ Campo total_validations agregado correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Campo total_validations NO se agregó';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'api_calls_this_month'
  ) THEN
    RAISE NOTICE '✅ Campo api_calls_this_month agregado correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Campo api_calls_this_month NO se agregó';
  END IF;

  -- Verificar tablas de alertas
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_alert_preferences'
  ) THEN
    RAISE NOTICE '✅ Tabla email_alert_preferences creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla email_alert_preferences NO se creó';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'email_alerts_sent'
  ) THEN
    RAISE NOTICE '✅ Tabla email_alerts_sent creada correctamente';
  ELSE
    RAISE EXCEPTION '❌ Error: Tabla email_alerts_sent NO se creó';
  END IF;

  RAISE NOTICE '✅✅✅ MIGRACIÓN COMPLETADA EXITOSAMENTE ✅✅✅';
END $$;

