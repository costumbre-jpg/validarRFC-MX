-- ============================================
-- VERIFICACIÓN: Gestión de Equipo
-- ============================================
-- Este script verifica si la migración de equipo ya se ejecutó
-- ============================================

-- Verificar tabla team_members
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members'
    ) THEN '✅ Tabla team_members existe'
    ELSE '❌ Tabla team_members NO existe'
  END AS team_members_table_status;

-- Verificar columnas importantes
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members' 
      AND column_name = 'team_owner_id'
    ) THEN '✅ Campo team_owner_id existe'
    ELSE '❌ Campo team_owner_id NO existe'
  END AS team_owner_id_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members' 
      AND column_name = 'invitation_token'
    ) THEN '✅ Campo invitation_token existe'
    ELSE '❌ Campo invitation_token NO existe'
  END AS invitation_token_status;

-- Verificar políticas RLS
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'team_members'
      AND policyname = 'Team owners can view team members'
    ) THEN '✅ Política RLS "Team owners can view team members" existe'
    ELSE '❌ Política RLS "Team owners can view team members" NO existe'
  END AS rls_policy_view_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'team_members'
      AND policyname = 'Team owners can invite members'
    ) THEN '✅ Política RLS "Team owners can invite members" existe'
    ELSE '❌ Política RLS "Team owners can invite members" NO existe'
  END AS rls_policy_invite_status;

-- Verificar trigger
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_trigger 
      WHERE tgname = 'update_team_members_updated_at'
    ) THEN '✅ Trigger update_team_members_updated_at existe'
    ELSE '❌ Trigger update_team_members_updated_at NO existe'
  END AS trigger_status;

-- Resumen completo
SELECT 
  '=== RESUMEN DE VERIFICACIÓN GESTIÓN DE EQUIPO ===' AS resumen,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members' 
      AND column_name = 'team_owner_id'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members' 
      AND column_name = 'invitation_token'
    ) THEN '✅✅✅ MIGRACIÓN COMPLETA - Gestión de Equipo está configurada ✅✅✅'
    ELSE '⚠️⚠️⚠️ MIGRACIÓN INCOMPLETA - Faltan elementos por configurar ⚠️⚠️⚠️'
  END AS estado_final;

