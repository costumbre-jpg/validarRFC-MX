
-- Agregar columna de estado de lista negra a la tabla de validaciones
ALTER TABLE validations 
ADD COLUMN IF NOT EXISTS blacklist_status TEXT DEFAULT 'CLEAN';

-- Comentario para documentar los valores posibles
COMMENT ON COLUMN validations.blacklist_status IS 'Status en listas negras del SAT: CLEAN, EFO, EDO, NO_LOCALIZADO';

-- Crear índice para búsquedas rápidas por estado de lista negra
CREATE INDEX IF NOT EXISTS idx_validations_blacklist_status ON validations(blacklist_status);
