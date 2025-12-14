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
CREATE POLICY "Users can view own alert preferences"
  ON public.email_alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alert preferences"
  ON public.email_alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

CREATE TRIGGER update_email_alert_preferences_updated_at
  BEFORE UPDATE ON public.email_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_email_alert_preferences_updated_at();

