-- ============================================
-- MIGRACIÓN PARA GESTIÓN DE EQUIPOS
-- ============================================
-- Ejecutar este archivo en Supabase SQL Editor
-- ============================================

-- Tabla para gestionar equipos y miembros
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL si es invitación pendiente
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  invitation_token TEXT UNIQUE, -- Token único para aceptar invitación
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(team_owner_id, email) -- Un email solo puede estar una vez por equipo
);

-- Índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_team_members_team_owner_id ON team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_invitation_token ON team_members(invitation_token);

-- Habilitar RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Política: Los dueños del equipo pueden ver todos los miembros de su equipo
CREATE POLICY "Team owners can view team members"
  ON team_members
  FOR SELECT
  USING (auth.uid() = team_owner_id);

-- Política: Los miembros activos pueden ver información de su equipo
CREATE POLICY "Active members can view team info"
  ON team_members
  FOR SELECT
  USING (
    auth.uid() = user_id AND status = 'active'
  );

-- Política: Solo los dueños pueden invitar miembros
CREATE POLICY "Team owners can invite members"
  ON team_members
  FOR INSERT
  WITH CHECK (auth.uid() = team_owner_id);

-- Política: Los dueños pueden actualizar miembros (cambiar rol, etc.)
CREATE POLICY "Team owners can update members"
  ON team_members
  FOR UPDATE
  USING (auth.uid() = team_owner_id);

-- Política: Los dueños pueden eliminar miembros (excepto a sí mismos)
CREATE POLICY "Team owners can delete members"
  ON team_members
  FOR DELETE
  USING (
    auth.uid() = team_owner_id AND 
    (user_id IS NULL OR user_id != auth.uid()) -- No puede eliminarse a sí mismo
  );

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esto después para verificar que todo se creó correctamente:

-- Verificar que la tabla existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'team_members';

-- Verificar que las políticas existen
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'team_members';

-- Verificar que los índices existen
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'team_members';

