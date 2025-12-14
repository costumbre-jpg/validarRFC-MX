-- ============================================
-- VERIFICAR MIGRACIÓN DE GESTIÓN DE EQUIPOS
-- ============================================
-- Ejecuta esto en Supabase SQL Editor para verificar si la migración ya está ejecutada
-- ============================================

-- 1. Verificar que la tabla team_members existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'team_members'
    ) 
    THEN '✅ Tabla team_members EXISTE'
    ELSE '❌ Tabla team_members NO EXISTE - Necesitas ejecutar la migración'
  END as tabla_status;

-- 2. Verificar las columnas de team_members
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'team_members'
ORDER BY ordinal_position;

-- 3. Verificar que RLS está habilitado
SELECT 
  tablename, 
  CASE 
    WHEN rowsecurity THEN '✅ RLS HABILITADO'
    ELSE '❌ RLS NO HABILITADO'
  END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'team_members';

-- 4. Verificar las políticas RLS
SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN policyname IS NOT NULL THEN '✅ Política existe'
    ELSE '❌ Política faltante'
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'team_members'
ORDER BY policyname;

-- 5. Verificar que los índices existen
SELECT 
  indexname,
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ Índice existe'
    ELSE '❌ Índice faltante'
  END as index_status
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename = 'team_members'
ORDER BY indexname;

-- 6. Verificar el trigger
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ Trigger existe'
    ELSE '❌ Trigger faltante'
  END as trigger_status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'team_members';

-- ============================================
-- RESUMEN
-- ============================================
-- Si ves:
-- ✅ Tabla team_members EXISTE
-- ✅ RLS HABILITADO
-- ✅ 5 políticas (Team owners can view/insert/update/delete, Active members can view)
-- ✅ 4 índices
-- ✅ 1 trigger
-- 
-- Entonces la migración YA ESTÁ EJECUTADA ✅
-- 
-- Si ves algún ❌, necesitas ejecutar: EJECUTAR_MIGRACION_EQUIPOS.sql
-- ============================================

