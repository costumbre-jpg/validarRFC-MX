# 📧 Configurar Resend para Alertas por Email

## Paso 1: Crear Cuenta en Resend

1. Ve a https://resend.com
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Crea tu cuenta (puedes usar Google, GitHub o email)
4. Verifica tu email si es necesario

## Paso 2: Obtener API Key

1. Una vez dentro del dashboard de Resend:
2. Ve a **"API Keys"** en el menú lateral
3. Haz clic en **"Create API Key"**
4. Dale un nombre (ej: "Maflipp Production" o "Maflipp Development")
5. Selecciona los permisos: **"Sending access"**
6. Haz clic en **"Add"**
7. **IMPORTANTE**: Copia la API Key inmediatamente (empieza con `re_`)
   - ⚠️ Solo se muestra una vez, guárdala en un lugar seguro

## Paso 3: Verificar Dominio (Opcional para Producción)

Para producción, necesitas verificar tu dominio:

1. Ve a **"Domains"** en Resend
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio (ej: `maflipp.com`)
4. Agrega los registros DNS que te proporciona Resend
5. Espera a que se verifique (puede tardar unos minutos)

**Para desarrollo/testing**: Puedes usar el dominio de prueba de Resend sin verificar.

## Paso 4: Configurar Variables de Entorno

1. Crea o edita el archivo `.env.local` en la raíz del proyecto
2. Agrega las siguientes variables:

```env
# Resend API Key (obtenida en el paso 2)
RESEND_API_KEY=re_tu_api_key_aqui

# Secret para proteger el endpoint de cron job
CRON_SECRET=tu-secret-super-seguro-aqui-cambiar-en-produccion

# URL de tu sitio (para links en los emails)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Ejemplo completo de `.env.local`:**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend (Alertas por Email)
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz
CRON_SECRET=mi-secret-super-seguro-123456
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (si ya lo tienes configurado)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Paso 5: Probar el Sistema

### Probar Guardar Preferencias

1. Inicia el servidor: `npm run dev`
2. Ve a `/dashboard/cuenta` (con plan Pro o Business)
3. Configura las alertas
4. Haz clic en "Guardar Preferencias"
5. Deberías ver el mensaje de éxito

### Probar Envío de Email (Opcional)

Puedes probar manualmente llamando al endpoint:

```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Authorization: Bearer tu-cron-secret"
```

O crea un script de prueba en `test-email.ts`:

```typescript
// test-email.ts
import { sendThresholdAlert } from './lib/email';

sendThresholdAlert(
  'tu-email@ejemplo.com',
  85,
  850,
  1000
).then(sent => {
  console.log('Email enviado:', sent);
});
```

## ✅ Verificación

Después de configurar todo, verifica:

- [ ] Cuenta creada en Resend
- [ ] API Key obtenida y guardada
- [ ] Variables agregadas a `.env.local`
- [ ] Migración SQL ejecutada en Supabase
- [ ] Preferencias se guardan correctamente en `/dashboard/cuenta`

## 📝 Notas Importantes

1. **Límites de Resend**:
   - Plan gratuito: 3,000 emails/mes
   - Plan Pro: 50,000 emails/mes
   - Para producción, considera el plan Pro

2. **Dominio de Prueba**:
   - Resend te da un dominio de prueba: `onboarding@resend.dev`
   - Solo funciona para desarrollo, no para producción

3. **Seguridad**:
   - Nunca subas `.env.local` a Git
   - Usa variables de entorno en producción (Vercel, etc.)
   - Cambia `CRON_SECRET` por algo único y seguro

4. **Cron Job**:
   - Para producción, configura el cron job (ver `README_ALERTAS_EMAIL.md`)
   - Puedes usar Vercel Cron o Supabase pg_cron

## 🆘 Problemas Comunes

**Error: "RESEND_API_KEY no está configurada"**
- Verifica que el archivo `.env.local` existe
- Verifica que la variable se llama exactamente `RESEND_API_KEY`
- Reinicia el servidor después de agregar variables

**Error: "Unauthorized" al enviar email**
- Verifica que la API Key es correcta
- Verifica que no tiene espacios extra
- Verifica que la API Key tiene permisos de "Sending access"

**Emails no llegan**
- Revisa la carpeta de spam
- Verifica que el dominio está verificado (si usas dominio propio)
- Usa el dominio de prueba para desarrollo

