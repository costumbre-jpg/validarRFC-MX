-- Trigger para crear usuario en tabla users cuando se registra en Auth
-- Este trigger se ejecuta automáticamente cuando un usuario se registra en Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status, rfc_queries_this_month, created_at)
  VALUES (NEW.id, NEW.email, 'free', 0, COALESCE(NEW.created_at, NOW()));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de insertar en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un registro en la tabla users cuando un usuario se registra en Supabase Auth';

