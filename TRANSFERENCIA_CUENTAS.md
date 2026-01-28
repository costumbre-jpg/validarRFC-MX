# Guía de Transferencia de Cuentas - Maflipp

Este documento detalla cómo transferir todas las cuentas y servicios necesarios para que el comprador pueda operar la plataforma en producción.

---

## ⚠️ IMPORTANTE: Antes de empezar

1. **NO compartas credenciales hasta cerrar la venta** (firma de contrato/acuerdo).
2. **Haz backup de todo** antes de transferir.
3. **Coordina con el comprador** cada paso para evitar interrupciones.
4. **Tiempo estimado total**: 1-2 semanas (depende de transferencia de dominio).
5. **Documenta tus credenciales** en `CREDENCIALES_ACTUALES.md` (NO compartir hasta venta).

---

## 🗓️ Orden Recomendado de Transferencia

Para minimizar interrupciones, sigue este orden:

1. **Preparación** (Vendedor):
   - Documentar todas las credenciales
   - Hacer backups completos
   - Preparar documentación

2. **Setup inicial** (Comprador):
   - Crear cuentas nuevas (Supabase, Stripe, Vercel)
   - Configurar productos en Stripe
   - Importar repo en Vercel

3. **Migración de datos** (Comprador con ayuda del Vendedor):
   - Importar base de datos en Supabase
   - Configurar Storage buckets
   - Configurar Auth

4. **Configuración** (Comprador):
   - Configurar variables de entorno
   - Configurar webhooks
   - Probar funcionalidades básicas

5. **Dominio y DNS** (Último paso):
   - Transferir dominio o cambiar nameservers
   - Verificar dominio en servicios (Resend, etc.)

6. **Verificación final** (Ambos):
   - Testing completo
   - Handoff técnico

---

## 📋 Checklist de preparación (VENDEDOR)

Antes de iniciar la transferencia, prepara esta información (guárdala en un documento seguro, NO compartir hasta cerrar venta):

**💡 Usa el archivo `CREDENCIALES_ACTUALES.md` para documentar toda esta información de forma organizada.**

- [ ] **Supabase**:
  - URL del proyecto: `https://xxxxx.supabase.co`
  - Service Role Key (para exportar datos)
  - Anon Key (ya está en código)
  - Lista de migraciones ejecutadas

- [ ] **Stripe**:
  - Account ID
  - Product IDs:
    - Plan Pro: `prod_XXXXX`
    - Plan Business: `prod_XXXXX`
  - Price IDs (mensuales y anuales):
    - Price ID Pro Mes: `price_XXXXX`
    - Price ID Pro Annual: `price_XXXXX`
    - Price ID Business Mes: `price_XXXXX`
    - Price ID Business Annual: `price_XXXXX`
  - Webhook endpoint actual: `https://tu-dominio.vercel.app/api/stripe/webhook`

- [ ] **Vercel**:
  - Project name
  - Domain actual
  - Lista de variables de entorno configuradas

- [ ] **Dominio**:
  - Registrador (ej: Namecheap, GoDaddy, etc.)
  - Email de la cuenta del registrador
  - Estado del dominio (locked/unlocked)
  - Auth code / EPP code (si está disponible)

- [ ] **Upstash Redis** (si aplica):
  - REST URL
  - REST Token

- [ ] **Resend** (si aplica):
  - API Key
  - Dominio verificado

---

## 1️⃣ Supabase (Base de datos + Auth)

### Opción A: Migración completa (RECOMENDADA)

**Vendedor hace:**

1. **Exportar base de datos**:
   ```bash
   # Desde Supabase Dashboard:
   # Settings → Database → Backups → Download backup
   # O usar pg_dump:
   pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
   ```

2. **Exportar Storage buckets** (si hay archivos):
   - Dashboard → Storage → `avatars` → Download todos los archivos
   - Dashboard → Storage → `branding` → Download todos los archivos

3. **Documentar configuración de Auth**:
   - Email providers habilitados
   - OAuth providers (Google, etc.)
   - Redirect URLs configuradas

4. **Compartir con comprador**:
   - Archivo SQL de backup
   - Archivos de Storage (si aplica)
   - Lista de migraciones (`supabase/migrations/` ya está en el repo)

**Comprador hace:**

1. **Crear nuevo proyecto Supabase**:
   - Ir a [supabase.com](https://supabase.com)
   - Crear nuevo proyecto
   - Anotar nueva URL y keys

2. **Importar base de datos**:
   
   **IMPORTANTE**: Si el backup SQL es muy grande (>10MB), usa la CLI. Para backups pequeños, usa el dashboard.
   
   **Opción 1: Desde dashboard (recomendado para backups pequeños)**:
   - Ir a SQL Editor en Supabase Dashboard
   - Click en "New Query"
   - Abrir el archivo `backup.sql` y copiar todo el contenido
   - Pegar en el editor SQL
   - Click en "Run" (o Ctrl+Enter)
   - Esperar a que termine (puede tardar varios minutos)
   
   **Opción 2: Desde CLI (recomendado para backups grandes)**:
   ```bash
   # Obtener connection string desde Supabase Dashboard:
   # Settings → Database → Connection string → URI
   
   # Importar backup
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < backup.sql
   
   # O usando variables de entorno
   export PGPASSWORD="tu-password"
   psql -h db.nuevo-proyecto.supabase.co -U postgres -d postgres < backup.sql
   ```

3. **Verificar importación**:
   - Verificar que las tablas se crearon: SQL Editor → `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
   - Verificar que hay datos: `SELECT COUNT(*) FROM users;` (debe haber registros si había usuarios)

4. **Ejecutar migraciones** (si es necesario):
   ```bash
   # NOTA: Si el backup ya incluye todas las migraciones, este paso puede no ser necesario
   # Verificar con el vendedor qué migraciones ya están aplicadas
   
   # Si necesitas ejecutar migraciones adicionales:
   # Desde el repo, ejecutar migraciones en orden en SQL Editor:
   # supabase/migrations/001_initial_schema.sql
   # supabase/migrations/002_api_keys.sql
   # ... (solo las que falten)
   ```

4. **Configurar Storage buckets**:
   - Crear buckets: `avatars` y `branding`
   - Marcar como públicos
   - Subir archivos exportados (si aplica)

5. **Configurar Authentication**:
   - Habilitar Email provider
   - Habilitar Google OAuth (si aplica)
   - Configurar redirect URLs:
     - `https://nuevo-dominio.com/auth/callback`
     - `https://nuevo-dominio.com/pwa`

6. **Actualizar variables de entorno**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://nuevo-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=nueva-anon-key
   SUPABASE_SERVICE_ROLE_KEY=nueva-service-role-key
   ```

### Opción B: Transferir proyecto (NO RECOMENDADA)

Supabase no permite transferencia directa de proyectos. La única forma es:
- Dar acceso temporal como colaborador
- El comprador hace backup
- Eliminar acceso después

**No recomendado** porque:
- Mantiene dependencia del vendedor
- Más complejo de gestionar
- Riesgo de acceso accidental

---

## 2️⃣ Stripe (Pagos y suscripciones)

### Opción A: Nueva cuenta Stripe (RECOMENDADA)

**Comprador hace:**

1. **Crear cuenta Stripe**:
   - Ir a [stripe.com](https://stripe.com)
   - Crear cuenta nueva (modo Test primero, luego Live)
   - Completar onboarding (verificación de identidad, etc.)

2. **Crear productos y precios**:
   - Products → Add product
   - Crear productos:
     - **Pro Plan**: Crear precio mensual y anual (recurring)
     - **Business Plan**: Crear precio mensual y anual (recurring)
   - **IMPORTANTE**: Anotar los **Price IDs** de cada precio:
     - Price ID Pro Mes (mensual)
     - Price ID Pro Annual (anual)
     - Price ID Business Mes (mensual)
     - Price ID Business Annual (anual)

3. **Configurar webhook**:
   - Developers → Webhooks → Add endpoint
   - URL: `https://nuevo-dominio.com/api/stripe/webhook`
   - Eventos a escuchar:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copiar **Signing secret**

4. **Actualizar variables de entorno** (en Vercel y `.env.local`):
   ```env
   STRIPE_SECRET_KEY=sk_live_nueva_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_nueva_key
   STRIPE_WEBHOOK_SECRET=whsec_nuevo_secret
   STRIPE_PRICE_ID_PRO=price_nuevo_id_pro_mes
   STRIPE_PRICE_ID_PRO_ANNUAL=price_nuevo_id_pro_anual
   STRIPE_PRICE_ID_BUSINESS=price_nuevo_id_business_mes
   STRIPE_PRICE_ID_BUSINESS_ANNUAL=price_nuevo_id_business_anual
   ```

5. **Actualizar `lib/plans.ts`** (si los Price IDs cambian):
   ```typescript
   // Actualizar los priceIds según los nuevos Price IDs de Stripe
   ```

**Nota importante**: 
- Los usuarios existentes NO se migran (son del proyecto anterior)
- Si hay suscripciones activas, el comprador debe migrarlas manualmente o empezar desde cero

### Opción B: Transferir cuenta Stripe (COMPLEJO)

Solo si hay suscripciones activas que deben mantenerse:

1. Contactar soporte de Stripe: `support@stripe.com`
2. Solicitar transferencia de cuenta
3. Requiere:
   - Verificación de identidad de ambas partes
   - Documentación legal
   - Proceso puede tardar semanas

**No recomendado** para MVP sin usuarios activos.

---

## 3️⃣ Vercel (Hosting y deployment)

### Opción A: Importar repo (RECOMENDADA)

**Comprador hace:**

1. **Conectar GitHub a Vercel**:
   - Ir a [vercel.com](https://vercel.com)
   - Sign up / Login
   - Dashboard → Add New Project
   - Conectar cuenta de GitHub
   - Seleccionar el repo `validarRFC-MX`

2. **Configurar proyecto**:
   - Framework: Next.js (detectado automáticamente)
   - Root Directory: `/` (o dejar por defecto)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)

3. **Configurar variables de entorno**:
   - Settings → Environment Variables
   - Agregar TODAS las variables de `env.template`:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     STRIPE_SECRET_KEY
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
     STRIPE_WEBHOOK_SECRET
     STRIPE_PRICE_ID_PRO
     STRIPE_PRICE_ID_PRO_ANNUAL
     STRIPE_PRICE_ID_BUSINESS
     STRIPE_PRICE_ID_BUSINESS_ANNUAL
     NEXT_PUBLIC_SITE_URL
     UPSTASH_REDIS_REST_URL (si aplica)
     UPSTASH_REDIS_REST_TOKEN (si aplica)
     RESEND_API_KEY (si aplica)
     RESEND_FROM_EMAIL (si aplica)
     ```

4. **Conectar dominio**:
   - Settings → Domains → Add Domain
   - Ingresar dominio (ej: `maflipp.com`)
   - Seguir instrucciones de DNS

5. **Primer deploy**:
   - Vercel hará deploy automático al hacer push a `main`
   - O hacer deploy manual: Deployments → Redeploy

### Opción B: Transferir proyecto Vercel

**Vendedor hace:**

1. Ir a proyecto en Vercel
2. Settings → General → Scroll hasta "Transfer Project"
3. Ingresar email del comprador
4. Confirmar transferencia

**Comprador hace:**

1. Recibir email de Vercel
2. Aceptar transferencia
3. El proyecto aparece en su dashboard
4. Actualizar variables de entorno si es necesario

**Nota**: El dominio NO se transfiere automáticamente, debe transferirse por separado.

---

## 4️⃣ Dominio (DNS y propiedad)

### Opción A: Transferir dominio completo (RECOMENDADA para venta completa)

**Vendedor hace:**

1. **Desbloquear dominio**:
   - Login en registrador (Namecheap, GoDaddy, etc.)
   - Ir a configuración del dominio
   - Desactivar "Domain Lock" / "Transfer Lock"

2. **Obtener Auth Code / EPP Code**:
   - En configuración del dominio
   - Buscar "Authorization Code" / "EPP Code" / "Transfer Code"
   - Copiar código (ej: `ABC123XYZ789`)

3. **Desactivar privacidad WHOIS** (temporalmente):
   - Algunos registradores requieren esto para transferir
   - Reactivar después de transferir

4. **Compartir con comprador**:
   - Auth Code
   - Nombre del registrador
   - Email de la cuenta

**Comprador hace:**

1. **Iniciar transferencia**:
   - Login en su registrador
   - Buscar "Transfer Domain" / "Transfer In"
   - Ingresar nombre del dominio
   - Ingresar Auth Code recibido
   - Pagar tarifa de transferencia (si aplica)

2. **Aceptar transferencia**:
   - Vendedor recibe email de confirmación
   - Vendedor acepta transferencia
   - Proceso tarda **5-7 días** normalmente

3. **Configurar DNS en nuevo registrador**:
   - Apuntar a Vercel:
     - Tipo: `A` → `76.76.21.21`
     - Tipo: `CNAME` (www) → `cname.vercel-dns.com`
   - O usar nameservers de Vercel (más fácil)

### Opción B: Cambiar nameservers (MÁS RÁPIDO, pero dominio sigue del vendedor)

**Vendedor hace:**

1. Obtener nameservers de Vercel del comprador:
   - Comprador: Vercel → Settings → Domains → Ver nameservers
   - Ejemplo: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`

2. **Cambiar nameservers en registrador**:
   - Login en registrador
   - DNS Settings → Custom Nameservers
   - Ingresar nameservers de Vercel del comprador
   - Guardar cambios

**Tiempo**: 24-48 horas para propagar DNS

**Nota**: El dominio sigue siendo propiedad del vendedor. Si quieres transferir propiedad completa, usa Opción A.

---

## 5️⃣ Upstash Redis (Rate limiting y caché)

**Comprador hace:**

1. **Crear cuenta Upstash**:
   - Ir a [upstash.com](https://upstash.com)
   - Sign up / Login
   - Crear nuevo proyecto

2. **Crear base de datos Redis**:
   - Dashboard → Create Database
   - Tipo: Regional (o Global según necesidad)
   - Región: más cercana a México (ej: `us-east-1`)
   - Crear database

3. **Obtener credenciales**:
   - Dashboard → Database → Ver detalles
   - Copiar:
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`

4. **Actualizar variables de entorno**:
   ```env
   UPSTASH_REDIS_REST_URL=https://nueva-url.upstash.io
   UPSTASH_REDIS_REST_TOKEN=nuevo-token
   ```

**Nota**: No hay datos críticos que migrar (solo caché temporal que se regenera automáticamente).

---

## 6️⃣ Resend (Emails transaccionales)

**Comprador hace:**

1. **Crear cuenta Resend**:
   - Ir a [resend.com](https://resend.com)
   - Sign up / Login

2. **Verificar dominio**:
   - Dashboard → Domains → Add Domain
   - Ingresar dominio (ej: `maflipp.com`)
   - Agregar registros DNS en el registrador:
     - SPF record
     - DKIM records
     - DMARC record (opcional)
   - Esperar verificación (puede tardar horas)

3. **Obtener API Key**:
   - Dashboard → API Keys → Create API Key
   - Copiar API key

4. **Actualizar variables de entorno**:
   ```env
   RESEND_API_KEY=re_nueva_key
   RESEND_FROM_EMAIL=noreply@nuevo-dominio.com
   ```

**Nota**: No hay emails históricos que migrar, solo configuración.

---

## 7️⃣ Google Analytics 4 (Opcional)

**Comprador hace:**

1. **Crear propiedad GA4**:
   - Ir a [analytics.google.com](https://analytics.google.com)
   - Crear nueva propiedad
   - Obtener Measurement ID (ej: `G-XXXXXXXXXX`)

2. **Actualizar variable de entorno**:
   ```env
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

**Nota**: Los datos históricos NO se migran, empieza desde cero.

---

## 8️⃣ Sentry (Monitoreo de errores - Opcional)

**Comprador hace:**

1. **Crear cuenta Sentry**:
   - Ir a [sentry.io](https://sentry.io)
   - Crear nuevo proyecto (Next.js)

2. **Obtener DSN**:
   - Project Settings → Client Keys (DSN)
   - Copiar DSN

3. **Actualizar variables de entorno**:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://nuevo-dsn@sentry.io/project-id
   SENTRY_AUTH_TOKEN=nuevo-token
   ```

**Nota**: Los errores históricos NO se migran.

---

## 📝 Checklist final de transferencia

### Vendedor debe entregar:

- [ ] Backup completo de base de datos Supabase (SQL)
- [ ] Archivos de Storage (avatars, branding) si aplica
- [ ] Lista de migraciones ejecutadas (ya está en repo)
- [ ] Auth Code del dominio (si se transfiere)
- [ ] Acceso temporal a Vercel (si se transfiere proyecto)
- [ ] Documentación de configuración actual

### Comprador debe hacer:

- [ ] Crear todas las cuentas nuevas (Supabase, Stripe, Vercel, etc.)
- [ ] Importar base de datos en nuevo Supabase
- [ ] Ejecutar migraciones SQL en orden
- [ ] Configurar productos/precios en Stripe
- [ ] Configurar webhook de Stripe
- [ ] Importar repo en Vercel
- [ ] Configurar todas las variables de entorno
- [ ] Conectar dominio (transferir o cambiar nameservers)
- [ ] Verificar dominio en Resend
- [ ] Probar flujo completo: registro → login → validación → exportación
- [ ] Verificar que webhook de Stripe funciona
- [ ] Probar API pública con nueva API key

---

## ⏱️ Timeline estimado

- **Día 1-2**: Comprador crea cuentas (Supabase, Stripe, Vercel, etc.)
- **Día 2-3**: Migración de datos y configuración inicial
- **Día 3-4**: Configuración de DNS y dominio
- **Día 4-5**: Testing completo y ajustes
- **Día 5-7**: Transferencia de dominio (si aplica Opción A)
- **Día 7-14**: Handoff y soporte post-transferencia

**Total**: 1-2 semanas dependiendo de transferencia de dominio.

---

## 🆘 Troubleshooting común

### Problema: Base de datos no importa correctamente

**Síntomas**: 
- Error al ejecutar backup SQL
- Tablas faltantes después de importar
- Errores de permisos

**Soluciones**:
1. Verificar que el backup SQL está completo (debe incluir CREATE TABLE, INSERT, etc.)
2. Si el backup es muy grande, dividirlo en partes o usar CLI en lugar de dashboard
3. Verificar que no hay conflictos con migraciones ya ejecutadas
4. Ejecutar migraciones faltantes en orden después de importar
5. Verificar políticas RLS: `SELECT * FROM pg_policies;`

### Problema: Webhook de Stripe no funciona

**Síntomas**:
- Eventos de Stripe no se procesan
- Error 401/403 en webhook
- Suscripciones no se actualizan

**Soluciones**:
1. Verificar que la URL del webhook es correcta: `https://nuevo-dominio.com/api/stripe/webhook`
2. Verificar que el `STRIPE_WEBHOOK_SECRET` coincide con el signing secret de Stripe
3. Verificar que los eventos están seleccionados: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Probar webhook desde Stripe Dashboard → Webhooks → Send test webhook
5. Revisar logs de Vercel para ver errores específicos

### Problema: Dominio no resuelve después de cambiar DNS

**Síntomas**:
- Dominio muestra error o no carga
- DNS no propaga

**Soluciones**:
1. Esperar 24-48 horas para propagación DNS completa
2. Verificar DNS con herramientas online:
   - `dig nuevo-dominio.com`
   - `nslookup nuevo-dominio.com`
   - [whatsmydns.net](https://www.whatsmydns.net)
3. Verificar que los registros DNS están correctos en el registrador
4. Si usas nameservers de Vercel, verificar que están configurados correctamente
5. Limpiar caché DNS local: `ipconfig /flushdns` (Windows) o `sudo dscacheutil -flushcache` (Mac)

### Problema: Emails no se envían desde Resend

**Síntomas**:
- Emails no llegan
- Error al enviar emails

**Soluciones**:
1. Verificar que el dominio está verificado en Resend Dashboard
2. Verificar que los registros DNS están correctos (SPF, DKIM, DMARC)
3. Verificar que `RESEND_API_KEY` es correcta
4. Verificar que `RESEND_FROM_EMAIL` usa el dominio verificado
5. Revisar logs de Resend Dashboard para ver errores específicos
6. Verificar que no están en spam (puede tardar en llegar)

### Problema: Usuarios no pueden hacer login

**Síntomas**:
- Error al hacer login
- "Invalid credentials"
- Redirect loops

**Soluciones**:
1. Verificar que las variables de entorno de Supabase están correctas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Verificar que Auth está configurado en Supabase Dashboard
3. Verificar redirect URLs en Supabase:
   - `https://nuevo-dominio.com/auth/callback`
   - `https://nuevo-dominio.com/pwa`
4. Verificar que los usuarios existen en la nueva base de datos (si se migraron)
5. Si migraste usuarios, verificar que las contraseñas se migraron correctamente (puede requerir reset)

### Problema: API pública no responde

**Síntomas**:
- Error 401/403 al usar API
- API key no funciona

**Soluciones**:
1. Verificar que la API key existe en la base de datos: `SELECT * FROM api_keys WHERE key = 'xxx';`
2. Verificar que el usuario tiene permisos para crear API keys
3. Verificar rate limiting (puede estar bloqueando requests)
4. Revisar logs de Vercel para ver errores específicos
5. Verificar que el endpoint de API está correcto: `/api/public/validate`

### Problema: Variables de entorno no se aplican

**Síntomas**:
- App usa valores antiguos
- Variables no se actualizan

**Soluciones**:
1. En Vercel, verificar que las variables están en el entorno correcto (Production, Preview, Development)
2. Después de actualizar variables, hacer redeploy: Deployments → Redeploy
3. Verificar que las variables están escritas correctamente (sin espacios, mayúsculas/minúsculas)
4. Para variables `NEXT_PUBLIC_*`, verificar que están disponibles en el cliente
5. Limpiar caché del navegador si es necesario

---

## 📞 Contacto durante transferencia

Mantén comunicación constante con el comprador durante todo el proceso. Usa un canal seguro (email, Slack, etc.) para compartir credenciales temporalmente.

**IMPORTANTE**: Una vez completada la transferencia, cambia todas tus contraseñas y revoca accesos temporales.

---

## ✅ Confirmación de transferencia completa

### Checklist de Verificación (Comprador)

**Infraestructura**:
- [ ] Deploy en Vercel funciona correctamente
- [ ] Dominio resuelve correctamente (verificar con `dig` o herramientas online)
- [ ] SSL/HTTPS está activo
- [ ] Health check endpoint responde: `https://nuevo-dominio.com/api/health`

**Autenticación**:
- [ ] Registro de nuevo usuario funciona
- [ ] Login con email/password funciona
- [ ] Login con Google OAuth funciona (si aplica)
- [ ] Recuperación de contraseña funciona
- [ ] Verificación de email funciona

**Funcionalidades Core**:
- [ ] Validación RFC funciona (probar con RFC real)
- [ ] Dashboard carga correctamente
- [ ] Historial de validaciones se muestra
- [ ] Exportaciones funcionan (CSV, Excel, PDF)
- [ ] Analytics y métricas se muestran correctamente

**Pagos y Suscripciones**:
- [ ] Checkout de Stripe funciona (probar en modo test)
- [ ] Webhook de Stripe recibe eventos correctamente
- [ ] Actualización de suscripción funciona
- [ ] Cancelación de suscripción funciona
- [ ] Planes se muestran correctamente en pricing page

**API Pública**:
- [ ] Crear API key funciona
- [ ] API responde correctamente: `GET /api/public/validate?rfc=XXXXX&apiKey=XXXXX`
- [ ] Rate limiting funciona
- [ ] Autenticación por API key funciona

**Emails**:
- [ ] Emails de registro se envían
- [ ] Emails de recuperación de contraseña se envían
- [ ] Alertas por email funcionan (si están configuradas)
- [ ] Emails llegan a inbox (verificar spam)

**White Label** (si aplica):
- [ ] Logo personalizado se muestra
- [ ] Colores personalizados se aplican
- [ ] Branding funciona correctamente

### Acciones Post-Transferencia (Vendedor)

Una vez que el comprador confirma que todo funciona:

1. **Revocar accesos temporales**:
   - Eliminar colaboradores de Supabase (si se dio acceso temporal)
   - Revocar acceso a Vercel (si se transfirió proyecto)
   - Eliminar cualquier acceso compartido

2. **Cambiar credenciales**:
   - Cambiar contraseñas de cuentas que ya no uses
   - Rotar API keys que ya no necesites
   - Revocar tokens de acceso

3. **Cerrar/Archivar cuentas antiguas** (después de período de gracia):
   - Considerar cerrar proyecto Vercel antiguo (después de 30 días)
   - Considerar cerrar cuenta Supabase antigua (después de período de gracia)
   - **NO cerrar inmediatamente** por si hay problemas durante handoff

4. **Documentación final**:
   - Actualizar `CREDENCIALES_ACTUALES.md` marcando como "transferido"
   - Guardar backups en lugar seguro (por si acaso)
   - Documentar fecha de transferencia completa

---

**Última actualización**: Enero 2025
