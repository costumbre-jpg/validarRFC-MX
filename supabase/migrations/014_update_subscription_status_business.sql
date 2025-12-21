-- Alinear los valores permitidos de planes con el código (business vs enterprise)
-- Amplía los CHECK constraints para aceptar el plan "business" y mantiene "enterprise" para compatibilidad.

-- users.subscription_status
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_subscription_status_check;

ALTER TABLE users
  ADD CONSTRAINT users_subscription_status_check
  CHECK (subscription_status IN ('free', 'pro', 'business', 'enterprise'));

-- subscriptions.plan
ALTER TABLE subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_plan_check;

ALTER TABLE subscriptions
  ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('pro', 'business', 'enterprise'));

-- Normalizar valores antiguos si existen
UPDATE users
SET subscription_status = 'business'
WHERE subscription_status = 'enterprise';

UPDATE subscriptions
SET plan = 'business'
WHERE plan = 'enterprise';

