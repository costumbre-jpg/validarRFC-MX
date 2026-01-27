# ValidaRFC.mx

Sistema de validación de RFC construido con Next.js 14, TypeScript, Tailwind CSS y Supabase.

> Última actualización: Diseño responsive completo y optimizaciones móvil - Enero 2025

## ✅ Checklist para venta (estado actual)

- Core funcional: validaciones RFC, dashboard, white label, onboarding, API, Stripe.
- Integraciones listas: Supabase, Stripe, Resend (email).
- Falta solo afinar despliegue y documentación técnica para terceros.
- CFDI requiere integración con proveedor PAC/SAT (no incluido).
- Recarga de API Keys y test-upgrade deshabilitados por defecto (flags en env).

Si vendes el código hoy, el comprador solo necesita configurar credenciales y producción.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm
- Cuenta en [Supabase](https://supabase.com)
- Cuenta en [Stripe](https://stripe.com) (para pagos)
- Cuenta en [Vercel](https://vercel.com) (para deploy)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `env.template` a `.env.local` y completa las variables:

```bash
cp env.template .env.local
```

Luego edita `.env.local` con tus credenciales:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe
STRIPE_SECRET_KEY=tu_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=tu_webhook_secret
STRIPE_PRICE_ID_PRO=tu_price_id_pro
STRIPE_PRICE_ID_ENTERPRISE=tu_price_id_enterprise

# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2.1 Migraciones recientes

- Ejecuta todas las migraciones, incluyendo `supabase/migrations/014_update_subscription_status_business.sql`, que alinea el plan `business` en la base de datos.

**Nota**: Consulta `DOMAIN_SETUP.md` y `GOOGLE_OAUTH_SETUP.md` si necesitas dominio y OAuth.

### 3. Configurar Supabase

1. Crea una cuenta en [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto llamado `validarfcmx`
3. Ve a SQL Editor en el dashboard de Supabase
4. Ejecuta los archivos de migración en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_api_keys.sql`

### 4. Ejecutar localmente

#### Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

#### Producción local

```bash
npm run build
npm start
```

## 📦 Comandos Útiles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Inicia servidor de producción local

# Linting
npm run lint         # Ejecuta ESLint
```

## 🌐 Deploy en Vercel

### Opción 1: Deploy desde GitHub

1. Haz push de tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com) e inicia sesión
3. Click en "New Project"
4. Importa tu repositorio de GitHub
5. Vercel detectará automáticamente Next.js y configurará el proyecto

### Opción 2: Deploy con Vercel CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### Configurar Variables de Entorno en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega todas las variables de `.env.local` (puedes copiar `env.template`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_ID_PRO` / `STRIPE_PRICE_ID_BUSINESS` / `STRIPE_PRICE_ID_ENTERPRISE`
   - `NEXT_PUBLIC_SITE_URL` (tu dominio de Vercel)

### Configurar Webhook de Stripe

1. En Stripe Dashboard → Webhooks
2. Agrega endpoint: `https://tu-dominio.vercel.app/api/stripe/webhook`
3. Selecciona eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copia el signing secret y agrégalo a Vercel como `STRIPE_WEBHOOK_SECRET`

## 📁 Estructura del Proyecto

```
validarFC.MX/
├── app/                          # App Router de Next.js
│   ├── api/                      # API Routes
│   │   ├── api-keys/            # Gestión de API Keys
│   │   ├── public/              # API pública
│   │   ├── stripe/              # Integración Stripe
│   │   └── validate/            # Validación interna
│   ├── auth/                    # Páginas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── callback/
│   ├── dashboard/               # Dashboard de usuario
│   │   ├── billing/
│   │   ├── cuenta/
│   │   ├── historial/
│   │   └── api-keys/
│   ├── developers/              # Documentación API
│   ├── pricing/                 # Página de precios
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Estilos globales
├── components/                   # Componentes React
│   └── dashboard/               # Componentes del dashboard
├── lib/                          # Utilidades y helpers
│   ├── supabase/                # Clientes de Supabase
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api-keys.ts              # Utilidades para API Keys
│   ├── stripe.ts                # Cliente de Stripe
│   └── utils.ts                 # Funciones helper
├── types/                        # Tipos TypeScript
│   ├── database.ts              # Tipos de Supabase
│   └── index.ts                 # Tipos generales
├── supabase/
│   └── migrations/              # Migraciones SQL
│       ├── 001_initial_schema.sql
│       └── 002_api_keys.sql
├── middleware.ts                # Middleware para rutas protegidas
├── next.config.js               # Configuración de Next.js
├── vercel.json                  # Configuración de Vercel
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript
├── tailwind.config.ts           # Configuración Tailwind
├── postcss.config.mjs           # Configuración PostCSS
├── env.template                 # Template de variables de entorno
├── HANDOFF.md                   # Guía rápida para entrega/venta
└── README.md                    # Este archivo
```

## 🗄️ Base de Datos

### Tablas

- **users**: Información de usuarios y suscripciones
- **validations**: Historial de validaciones de RFC
- **subscriptions**: Suscripciones de Stripe
- **api_keys**: API Keys para acceso a la API pública
- **api_usage_logs**: Logs de uso de la API

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas que permiten:
- Los usuarios solo pueden leer/escribir sus propios datos
- Las validaciones solo son visibles para el usuario que las creó
- Las API Keys solo son accesibles por su propietario

## 🛠️ Tecnologías

- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático estricto
- **Tailwind CSS**: Estilos utility-first
- **Supabase**: Backend como servicio (BaaS)
- **Stripe**: Procesamiento de pagos
- **Vercel**: Hosting y deployment

## 📚 Documentación Adicional

- `DOMAIN_SETUP.md`: Guía para configurar dominio
- `GOOGLE_OAUTH_SETUP.md`: Guía para OAuth de Google
- `HANDOFF.md`: Resumen para entregar o vender
- `SELLING_NOTES.md`: Argumentos para venta y valor
- `COSTS.md`: Costos operativos estimados
- `PITCH_DECK_OUTLINE.md`: Estructura de pitch deck
- `PITCH_DECK_CONTENT.md`: Texto final de pitch deck
- `SLIDES_CONTENT_ES.md`: Pitch deck en español (México/SAT)
- `DEMO_SCRIPT.md`: Guion de demo
- `SALES_EMAIL.md`: Email de venta
- `ONE_PAGER.md`: Resumen comercial 1 página
- `INVESTOR_FAQ.md`: Preguntas frecuentes de venta
- `PRODUCT_SPEC.md`: Resumen de producto
- `SECURITY_NOTES.md`: Seguridad y compliance
- `COMPETITIVE_POSITIONING.md`: Posicionamiento competitivo
- `LAUNCH_CHECKLIST.md`: Checklist de lanzamiento
- `PITCH_DECK_LAYOUT.md`: Guía de diseño para slides
- `ONE_PAGER_LAYOUT.md`: Guía de diseño one‑pager
- `SCREENSHOTS_GUIDE.md`: Guía completa de capturas de pantalla para venta
- `BRAND_GUIDE.md`: Guía rápida de marca
- `SALES_ASSETS.md`: Lista de assets recomendados
- `env.template`: Template de variables de entorno
- `supabase/migrations/`: Migraciones SQL de la base de datos

## ⚙️ Variables de Entorno

### Requeridas

| Variable | Descripción | Dónde obtener |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side) | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | Secret key de Stripe | Stripe Dashboard → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key de Stripe | Stripe Dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Webhooks |
| `STRIPE_PRICE_ID_PRO` | Price ID del plan Pro | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_BUSINESS` | Price ID del plan Business | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_ENTERPRISE` | Price ID del plan Enterprise | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_BASIC` | Price ID del plan Basic (si aplica) | Stripe Dashboard → Products |
| `STRIPE_PRICE_ID_API_PREMIUM` | Price ID API Premium (si aplica) | Stripe Dashboard → Products |
| `NEXT_PUBLIC_SITE_URL` | URL del sitio (producción) | Tu dominio de Vercel |

### Opcionales

- `STRIPE_PRICE_ID_PRO_ANNUAL`: Price ID anual Pro
- `STRIPE_PRICE_ID_BUSINESS_ANNUAL`: Price ID anual Business
- `STRIPE_PRICE_ID_ENTERPRISE_ANNUAL`: Price ID anual Enterprise
- `STRIPE_PRICE_ID_BASIC_ANNUAL`: Price ID anual Basic (si aplica)
- `STRIPE_PRICE_ID_API_PREMIUM_ANNUAL`: Price ID anual API Premium (si aplica)
- `RESEND_API_KEY`: API Key de Resend para emails
- `RESEND_FROM_EMAIL`: Remitente de emails (Resend)
- `CRON_SECRET`: Token para /api/alerts/send
- `UPSTASH_REDIS_REST_URL`: Redis (rate limit/cache, opcional)
- `UPSTASH_REDIS_REST_TOKEN`: Redis (rate limit/cache, opcional)
- `NODE_ENV`: Entorno (development/production)

## 🧾 Handoff rápido (para vender)

1. Crear buckets en Supabase Storage:
   - `avatars` (público)
   - `branding` (público)
2. Configurar Resend (emails):
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
3. Configurar Stripe Webhooks:
   - `/api/stripe/webhook`
4. Opcional: programar cron para alertas
   - Endpoint: `/api/alerts/send`
   - Header: `x-cron-secret: <CRON_SECRET>`

## 🔧 Configuración de Supabase para Producción

### 1. Habilitar Servicios

- ✅ Authentication (Email)
- ✅ Database (PostgreSQL)
- ✅ Storage (si necesitas archivos)
- ✅ Edge Functions (si planeas usarlas)

### 2. Configurar Email Templates

1. Ve a **Authentication** → **Email Templates**
2. Personaliza los templates:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

### 3. Setup Backups Automáticos

1. Ve a **Settings** → **Database**
2. Habilita **Point-in-time Recovery (PITR)**
3. Configura backups diarios automáticos

### 4. Configurar URLs de Redirección

1. Ve a **Authentication** → **URL Configuration**
2. Agrega tus URLs:
   - Site URL: `https://tu-dominio.vercel.app`
   - Redirect URLs: 
     - `https://tu-dominio.vercel.app/auth/callback`
     - `https://tu-dominio.vercel.app/**`

## 🚨 Troubleshooting

### Error: "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Environment variables not found"

- Verifica que `.env.local` existe y tiene todas las variables
- En Vercel, verifica que las variables estén configuradas en Settings → Environment Variables

### Error: "Supabase connection failed"

- Verifica que las URLs y keys sean correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Verifica que las políticas RLS estén configuradas correctamente

### Error: "Stripe webhook verification failed"

- Verifica que `STRIPE_WEBHOOK_SECRET` sea correcto
- Asegúrate de que la URL del webhook en Stripe coincida con tu dominio de Vercel

## 📝 Licencia

Este proyecto es privado y propietario.

## 🤝 Soporte

Para soporte, contacta: hola@validarfcmx.mx

