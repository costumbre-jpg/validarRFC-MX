-- White Label settings for Business plan
CREATE TABLE IF NOT EXISTS public.white_label_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL DEFAULT 'Tu Marca',
  custom_logo_url TEXT,
  primary_color TEXT DEFAULT '#2F7E7A',
  secondary_color TEXT DEFAULT '#1F5D59',
  hide_maflipp_brand BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.white_label_settings ENABLE ROW LEVEL SECURITY;

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

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_white_label_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_white_label_settings_updated_at
  BEFORE UPDATE ON public.white_label_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_white_label_settings_updated_at();

