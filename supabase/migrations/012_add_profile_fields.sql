-- Agregar campos de perfil a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN users.full_name IS 'Nombre completo del usuario';
COMMENT ON COLUMN users.company_name IS 'Nombre de la empresa (opcional)';

