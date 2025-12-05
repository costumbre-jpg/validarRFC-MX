/**
 * Tipo para el usuario
 */
export type User = {
  id: string;
  email: string;
  subscription_status: 'free' | 'pro' | 'enterprise';
  rfc_queries_this_month: number;
  stripe_customer_id: string | null;
  created_at: string;
};

/**
 * Tipo para una validación de RFC
 */
export type Validation = {
  id: string;
  user_id: string;
  rfc: string;
  is_valid: boolean;
  response_time: number;
  created_at: string;
};

/**
 * Tipo para una suscripción
 */
export type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  plan: 'pro' | 'enterprise';
  status: 'active' | 'canceled';
  current_period_end: string;
  created_at: string;
};

/**
 * Tipo para crear un nuevo usuario
 */
export type CreateUserInput = {
  email: string;
  subscription_status?: 'free' | 'pro' | 'enterprise';
  rfc_queries_this_month?: number;
  stripe_customer_id?: string | null;
};

/**
 * Tipo para actualizar un usuario
 */
export type UpdateUserInput = {
  email?: string;
  subscription_status?: 'free' | 'pro' | 'enterprise';
  rfc_queries_this_month?: number;
  stripe_customer_id?: string | null;
};

/**
 * Tipo para crear una nueva validación
 */
export type CreateValidationInput = {
  user_id: string;
  rfc: string;
  is_valid: boolean;
  response_time: number;
};

/**
 * Tipo para crear una nueva suscripción
 */
export type CreateSubscriptionInput = {
  user_id: string;
  stripe_subscription_id: string;
  plan: 'pro' | 'enterprise';
  status: 'active' | 'canceled';
  current_period_end: string;
};

/**
 * Tipo para actualizar una suscripción
 */
export type UpdateSubscriptionInput = {
  stripe_subscription_id?: string;
  plan?: 'pro' | 'enterprise';
  status?: 'active' | 'canceled';
  current_period_end?: string;
};

