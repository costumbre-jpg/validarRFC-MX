-- Agregar campo para rastrear llamadas API mensuales
ALTER TABLE api_keys 
ADD COLUMN IF NOT EXISTS api_calls_this_month INTEGER NOT NULL DEFAULT 0;

-- Índice para mejorar consultas de uso mensual
CREATE INDEX IF NOT EXISTS idx_api_keys_api_calls_this_month ON api_keys(api_calls_this_month);

