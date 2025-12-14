-- ============================================
-- VERIFICAR MIGRACIÓN: White Label Settings
-- ============================================
-- Este script verifica si la migración de White Label ya se ejecutó
-- Ejecuta este script ANTES de ejecutar la migración para evitar duplicados

-- 1. Verificar si la tabla existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'white_label_settings'
        ) 
        THEN '✅ La tabla white_label_settings YA EXISTE - No necesitas ejecutar la migración'
        ELSE '❌ La tabla white_label_settings NO EXISTE - Necesitas ejecutar la migración 010_white_label.sql'
    END AS estado_tabla;

-- 2. Si la tabla existe, mostrar su estructura
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'white_label_settings'
    ) THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'ESTRUCTURA DE LA TABLA:';
        RAISE NOTICE '========================================';
    END IF;
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'white_label_settings'
ORDER BY ordinal_position;

-- 3. Verificar si RLS está habilitado
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'white_label_settings'
        ) AND EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'white_label_settings'
        )
        THEN '✅ RLS está habilitado y tiene políticas'
        WHEN EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'white_label_settings'
        )
        THEN '⚠️ La tabla existe pero RLS podría no estar configurado'
        ELSE '❌ La tabla no existe'
    END AS estado_rls;

-- 4. Mostrar políticas RLS si existen
SELECT 
    policyname AS nombre_politica,
    permissive AS tipo,
    roles AS roles,
    cmd AS comando
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'white_label_settings';

-- 5. Verificar si el trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM pg_trigger 
            WHERE tgname = 'update_white_label_settings_updated_at'
        )
        THEN '✅ El trigger update_white_label_settings_updated_at existe'
        ELSE '❌ El trigger no existe'
    END AS estado_trigger;

-- 6. Resumen final
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'white_label_settings'
        ) 
        AND EXISTS (
            SELECT FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'white_label_settings'
        )
        AND EXISTS (
            SELECT FROM pg_trigger 
            WHERE tgname = 'update_white_label_settings_updated_at'
        )
        THEN '✅✅✅ MIGRACIÓN COMPLETA - No necesitas ejecutar nada más'
        ELSE '⚠️⚠️⚠️ MIGRACIÓN INCOMPLETA - Ejecuta 010_white_label.sql'
    END AS resultado_final;

