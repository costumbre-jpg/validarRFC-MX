-- Add toggle to show/hide brand name under logo
ALTER TABLE public.white_label_settings
  ADD COLUMN IF NOT EXISTS show_brand_name BOOLEAN NOT NULL DEFAULT true;

