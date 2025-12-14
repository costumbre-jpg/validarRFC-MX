-- ============================================
-- VERIFICAR QUE LA MIGRACIÓN SE EJECUTÓ CORRECTAMENTE
-- ============================================
-- Ejecuta esto en Supabase SQL Editor para verificar

-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('email_alert_preferences', 'email_alerts_sent')
ORDER BY table_name;

-- 2. Verificar las columnas de email_alert_preferences
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'email_alert_preferences'
ORDER BY ordinal_position;

-- 3. Verificar las columnas de email_alerts_sent
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'email_alerts_sent'
ORDER BY ordinal_position;

-- 4. Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('email_alert_preferences', 'email_alerts_sent');

-- 5. Verificar las políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename IN ('email_alert_preferences', 'email_alerts_sent')
ORDER BY tablename, policyname;

-- 6. Verificar el trigger
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table = 'email_alert_preferences';

