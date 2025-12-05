# Guía de Deploy en Vercel

## Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. Código en un repositorio de GitHub, GitLab o Bitbucket
3. Variables de entorno configuradas

## Opción 1: Deploy desde GitHub (Recomendado)

### Paso 1: Preparar el Repositorio

1. Asegúrate de que tu código esté en GitHub
2. Verifica que `package.json` tenga los scripts correctos:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start"
     }
   }
   ```

### Paso 2: Conectar con Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente Next.js

### Paso 3: Configurar Variables de Entorno

En la pantalla de configuración del proyecto:

1. Ve a **Environment Variables**
2. Agrega todas las variables necesarias:

```
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
STRIPE_SECRET_KEY=tu_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=tu_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=tu_webhook_secret
STRIPE_PRICE_ID_PRO=tu_price_id_pro
STRIPE_PRICE_ID_ENTERPRISE=tu_price_id_enterprise
NEXT_PUBLIC_SITE_URL=https://tu-proyecto.vercel.app
```

3. Selecciona los ambientes (Production, Preview, Development)
4. Click en **"Deploy"**

### Paso 4: Configurar Dominio Personalizado (Opcional)

1. Ve a **Settings** → **Domains**
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

## Opción 2: Deploy con Vercel CLI

### Instalación

```bash
npm i -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
# Deploy a preview
vercel

# Deploy a producción
vercel --prod
```

### Configurar Variables de Entorno

```bash
# Agregar variable
vercel env add NEXT_PUBLIC_SUPABASE_URL

# Listar variables
vercel env ls

# Pull variables locales
vercel env pull .env.local
```

## Configuración Post-Deploy

### 1. Configurar Webhook de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com) → **Webhooks**
2. Click en **"Add endpoint"**
3. URL: `https://tu-proyecto.vercel.app/api/stripe/webhook`
4. Selecciona eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copia el **Signing secret** y agrégalo a Vercel como `STRIPE_WEBHOOK_SECRET`

### 2. Actualizar URLs en Supabase

1. Ve a Supabase Dashboard → **Authentication** → **URL Configuration**
2. Actualiza:
   - **Site URL**: `https://tu-proyecto.vercel.app`
   - **Redirect URLs**: 
     - `https://tu-proyecto.vercel.app/auth/callback`
     - `https://tu-proyecto.vercel.app/**`

### 3. Verificar Build

1. Ve a Vercel Dashboard → **Deployments**
2. Verifica que el build fue exitoso
3. Revisa los logs si hay errores

## Configuración Avanzada

### Build Settings

Vercel detecta automáticamente Next.js, pero puedes personalizar en `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Environment Variables por Ambiente

Puedes configurar variables diferentes para cada ambiente:

1. Ve a **Settings** → **Environment Variables**
2. Selecciona el ambiente (Production, Preview, Development)
3. Agrega las variables específicas

### Preview Deployments

Cada push a una rama crea automáticamente un preview deployment:
- URL única por commit
- Perfecto para testing
- Se eliminan automáticamente después de 14 días

## Monitoreo y Logs

### Ver Logs en Tiempo Real

```bash
vercel logs
```

### Analytics

1. Ve a **Analytics** en Vercel Dashboard
2. Habilita Web Analytics para métricas de rendimiento

## Troubleshooting

### Build Fails

1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que `next.config.js` esté configurado correctamente

### Environment Variables Not Working

1. Verifica que las variables estén configuradas en Vercel
2. Asegúrate de que las variables `NEXT_PUBLIC_*` tengan el prefijo correcto
3. Reinicia el deployment después de agregar variables

### API Routes Not Working

1. Verifica que las rutas estén en `app/api/`
2. Asegúrate de que los métodos HTTP estén correctos
3. Revisa los logs de Vercel Functions

## Mejores Prácticas

1. **Usa Preview Deployments**: Prueba cambios antes de producción
2. **Configura CI/CD**: Automatiza tests antes de deploy
3. **Monitorea Performance**: Usa Vercel Analytics
4. **Backup de Base de Datos**: Configura backups automáticos en Supabase
5. **Environment Variables**: Nunca commitees `.env.local` al repositorio

## Recursos

- [Documentación de Vercel](https://vercel.com/docs)
- [Next.js en Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

