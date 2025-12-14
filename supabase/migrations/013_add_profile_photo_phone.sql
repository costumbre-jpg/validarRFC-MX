-- Agregar campos de foto de perfil y teléfono a la tabla users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN users.phone IS 'Número de teléfono del usuario';
COMMENT ON COLUMN users.avatar_url IS 'URL de la foto de perfil del usuario';

