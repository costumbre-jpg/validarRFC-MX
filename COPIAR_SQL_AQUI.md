# 📋 SQL para Copiar y Pegar en Supabase

## 🚀 Instrucciones Rápidas

1. Abre Supabase Dashboard → **SQL Editor** → **New query**
2. Copia y pega cada bloque SQL uno por uno
3. Click en **"Run"** después de cada uno
4. Verifica que dice "Success"

---

## ✅ MIGRACIÓN 1: Esquema Inicial

Copia TODO esto y pégalo en Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
  rfc_queries_this_month INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create validations table
CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rfc TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  response_time FLOAT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled')),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can only read their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own data (typically done via Supabase Auth)
CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for validations table
-- Users can only view their own validations
CREATE POLICY "Users can view own validations"
  ON validations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own validations
CREATE POLICY "Users can insert own validations"
  ON validations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own validations
CREATE POLICY "Users can delete own validations"
  ON validations
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for subscriptions table
-- Users can only view their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscriptions
CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_validations_user_id ON validations(user_id);
CREATE INDEX idx_validations_created_at ON validations(created_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

---

## ✅ MIGRACIÓN 2: API Keys

Copia TODO esto y pégalo en Supabase SQL Editor (nueva query):

```sql
-- Create API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL, -- First 8 chars for display (e.g., "sk_live_")
  name TEXT NOT NULL,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_used INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create API usage logs table
CREATE TABLE api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  rfc TEXT NOT NULL,
  is_valid BOOLEAN,
  response_time FLOAT,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
CREATE POLICY "Users can view own API keys"
  ON api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys"
  ON api_keys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys"
  ON api_keys
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys"
  ON api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for api_usage_logs
CREATE POLICY "Users can view own API usage logs"
  ON api_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.id = api_usage_logs.api_key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_usage_logs_api_key_id ON api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON api_usage_logs(created_at);
```

---

## ✅ MIGRACIÓN 3: Trigger de Usuario (⚠️ IMPORTANTE)

Copia TODO esto y pégalo en Supabase SQL Editor (nueva query):

```sql
-- Trigger para crear usuario en tabla users cuando se registra en Auth
-- Este trigger se ejecuta automáticamente cuando un usuario se registra en Supabase Auth

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, subscription_status, rfc_queries_this_month)
  VALUES (NEW.id, NEW.email, 'free', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecuta después de insertar en auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentario explicativo
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un registro en la tabla users cuando un usuario se registra en Supabase Auth';
```

---

## ✅ Verificación

Después de ejecutar las 3 migraciones:

1. Ve a **Table Editor** en Supabase
2. Deberías ver estas 5 tablas:
   - ✅ `users`
   - ✅ `validations`
   - ✅ `subscriptions`
   - ✅ `api_keys`
   - ✅ `api_usage_logs`

Si ves todas, ¡perfecto! ✅

---

## 🆘 Si hay errores

- **"relation already exists"**: La tabla ya existe, está bien, continúa con la siguiente migración
- **"permission denied"**: Verifica que estás ejecutando como superuser (deberías serlo por defecto)
- **"syntax error"**: Asegúrate de copiar TODO el bloque SQL sin cortar nada

