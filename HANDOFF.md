# Handoff para venta

Este documento resume lo mínimo que un comprador necesita para poner la plataforma en producción.

**📋 Para proceso completo de transferencia de cuentas, ver**: `TRANSFERENCIA_CUENTAS.md`

## 1) Setup rápido

- Instalar dependencias: `npm install`
- Crear `.env.local` desde `env.template`
- Ejecutar migraciones SQL en Supabase (ver `MIGRACIONES_LISTA.md` para orden y descripción)
- Levantar local: `npm run dev`

**📋 Lista completa de migraciones**: Ver `MIGRACIONES_LISTA.md` para orden de ejecución y descripción de cada una.

## 2) Servicios externos

### Supabase
- Authentication habilitado (Email + Google si aplica)
- Database + RLS activado (ver migraciones)
- Storage buckets públicos:
  - `avatars`
  - `branding`

### Stripe
- Productos + precios configurados
- Webhook en: `/api/stripe/webhook`
- Variables de entorno `STRIPE_*`

### Resend (emails)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Cron (opcional)
- Endpoint: `/api/alerts/send`
- Header: `x-cron-secret: <CRON_SECRET>`

### Upstash Redis (opcional)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 3) Notas operativas

- El SAT puede fallar por disponibilidad externa.
- Existe modo demo solo para RFCs de ejemplo si el SAT no responde.
- El dashboard se actualiza en tiempo real con validaciones nuevas.
- El conteo de validaciones en modo demo se guarda en `localStorage`.
- La recarga de API Keys está deshabilitada por defecto (`ENABLE_API_KEY_RECHARGE=false`).
- El endpoint de test-upgrade está deshabilitado en producción (`ALLOW_TEST_UPGRADE=false`).
- La validación CFDI requiere integración con proveedor PAC/SAT.

### Nuevas funcionalidades (2025)

- **Google Analytics 4**: Integrado opcionalmente. Configurar `NEXT_PUBLIC_GA_MEASUREMENT_ID` en variables de entorno.
- **Health Check**: Endpoint `/api/health` verifica estado de servicios (Supabase, Stripe). Página pública `/status` muestra estado en tiempo real.
- **SEO**: Sitemap dinámico (`/sitemap.xml`) y robots.txt (`/robots.txt`) optimizados para indexación.

## 4) Checklist de producción

- Configurar dominio y SSL
- Backups automáticos en Supabase (PITR)
- Logs y monitoreo (Vercel + Supabase)
- Política de privacidad y términos

## 5) Known Issues / Edge Cases

### Autenticación
- **PWA móvil**: El login puede requerir ajustes en algunos dispositivos específicos. El flujo funciona correctamente en escritorio y la mayoría de móviles, pero algunos edge cases pueden necesitar refinamiento según el dispositivo/navegador.
- **Middleware de auth**: Recién implementado. Si se cambia el flujo de login, revisar que las cookies se sincronicen correctamente con `/api/auth/set-cookie`.

### Validación SAT
- **Dependencia externa**: La validación depende del sitio web del SAT. Si cambian su estructura HTML, puede requerir ajustes en `lib/rfc.ts`.
- **Timeouts**: Configurado con timeout de 12s. Si el SAT está muy lento, puede fallar. El sistema tiene fallback a modo demo para RFCs de ejemplo.

### Testing
- **E2E básicos**: Solo smoke tests implementados. Flujos complejos (checkout completo, onboarding completo) pueden necesitar más cobertura según necesidades del comprador.

### Performance
- **Alertas por email**: Procesamiento síncrono. Con muchos usuarios simultáneos, considerar implementar queue system (ej: BullMQ, Inngest).

## 6) Qué revisar después de la venta

- Actualizar branding final
- Revisar planes y precios en Stripe
- Validar onboarding real con emails
- Ampliar tests E2E según necesidades específicas
- Considerar queue system para alertas si escalan usuarios

