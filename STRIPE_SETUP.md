# Guía de Configuración de Stripe

## Paso 1: Crear cuenta en Stripe

1. Ve a [stripe.com](https://stripe.com) y crea una cuenta
2. Completa la información de tu negocio
3. Activa tu cuenta (puede requerir verificación)

## Paso 2: Obtener API Keys

1. En el dashboard de Stripe, ve a **Developers** → **API keys**
2. Copia las siguientes claves:
   - **Secret key** → `STRIPE_SECRET_KEY` (usa la test key para desarrollo)
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (usa la test key para desarrollo)

## Paso 3: Crear Productos y Precios

### Producto: ValidaRFC Pro

1. Ve a **Products** en el dashboard de Stripe
2. Click en **Add product**
3. Configura:
   - **Name**: `ValidaRFC Pro`
   - **Description**: `Plan Pro con 100 validaciones/mes`
   - **Pricing model**: `Recurring`
   - **Price**: `99 MXN`
   - **Billing period**: `Monthly`
4. Click **Save product**
5. Copia el **Price ID** (empieza con `price_`) → `STRIPE_PRICE_ID_PRO`

### Producto: ValidaRFC Empresa

1. Click en **Add product** nuevamente
2. Configura:
   - **Name**: `ValidaRFC Empresa`
   - **Description**: `Plan Empresarial con 1,000 validaciones/mes`
   - **Pricing model**: `Recurring`
   - **Price**: `499 MXN`
   - **Billing period**: `Monthly`
3. Click **Save product**
4. Copia el **Price ID** (empieza con `price_`) → `STRIPE_PRICE_ID_ENTERPRISE`

## Paso 4: Configurar Webhook

1. Ve a **Developers** → **Webhooks**
2. Click en **Add endpoint**
3. Configura:
   - **Endpoint URL**: `https://tu-dominio.com/api/stripe/webhook`
   - **Description**: `ValidaRFC Webhook`
   - **Events to send**: Selecciona:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Copia el **Signing secret** (empieza con `whsec_`) → `STRIPE_WEBHOOK_SECRET`

### Para desarrollo local:

1. Instala Stripe CLI: https://stripe.com/docs/stripe-cli
2. Ejecuta: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Copia el **webhook signing secret** que aparece → `STRIPE_WEBHOOK_SECRET`

## Paso 5: Configurar Customer Portal

1. Ve a **Settings** → **Billing** → **Customer portal**
2. Habilita el portal del cliente
3. Configura qué opciones quieres que los clientes puedan gestionar:
   - ✅ Update payment method
   - ✅ Cancel subscription
   - ✅ Update billing details
   - ✅ View invoices

## Paso 6: Configurar variables de entorno

Edita tu archivo `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ENTERPRISE=price_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Paso 7: Probar el flujo

### Test Cards de Stripe:

- **Tarjeta exitosa**: `4242 4242 4242 4242`
- **Tarjeta rechazada**: `4000 0000 0000 0002`
- **Requiere autenticación**: `4000 0025 0000 3155`

### Flujo de prueba:

1. Inicia sesión en tu aplicación
2. Ve a `/dashboard/billing`
3. Click en "Mejorar a Pro" o "Mejorar a Empresa"
4. Usa la tarjeta de prueba `4242 4242 4242 4242`
5. Completa el checkout
6. Verifica que:
   - El webhook se ejecutó correctamente
   - El `subscription_status` se actualizó en Supabase
   - Se creó un registro en la tabla `subscriptions`

## Paso 8: Producción

Cuando estés listo para producción:

1. Cambia a **Live mode** en Stripe
2. Obtén las **Live API keys**
3. Crea los productos en modo Live
4. Configura el webhook con tu URL de producción
5. Actualiza todas las variables de entorno con los valores de producción

## Solución de problemas

### Webhook no se ejecuta

- Verifica que la URL del webhook sea accesible públicamente
- Para desarrollo local, usa Stripe CLI
- Revisa los logs en Stripe Dashboard → Webhooks

### Error: "Price ID no configurado"

- Verifica que `STRIPE_PRICE_ID_PRO` y `STRIPE_PRICE_ID_ENTERPRISE` estén en `.env.local`
- Asegúrate de usar los Price IDs correctos (no Product IDs)

### Suscripción no se actualiza en Supabase

- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurado correctamente
- Revisa los logs del webhook en Stripe
- Verifica que las políticas RLS permitan las actualizaciones (el webhook usa service role key)

### Customer Portal no funciona

- Asegúrate de que el usuario tenga un `stripe_customer_id` en la tabla `users`
- Verifica que la suscripción esté activa en Stripe

