# 🚀 Pasos para Configurar Alertas por Email

## ✅ Paso 1: Ejecutar Migración SQL en Supabase

1. **Abre tu proyecto en Supabase Dashboard**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en **"SQL Editor"**
   - Haz clic en **"New query"**

3. **Copia y pega el SQL**
   - Abre el archivo `EJECUTAR_MIGRACION_ALERTAS.sql` en tu proyecto
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase

4. **Ejecuta la migración**
   - Haz clic en **"Run"** o presiona `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
   - Deberías ver: "Success. No rows returned"

5. **Verifica que se crearon las tablas**
   - Ejecuta esta query para verificar:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('email_alert_preferences', 'email_alerts_sent');
   ```
   - Deberías ver ambas tablas listadas

---

## ✅ Paso 2: Configurar Resend

### 2.1 Crear Cuenta

1. Ve a **https://resend.com**
2. Haz clic en **"Sign Up"** o **"Get Started"**
3. Crea tu cuenta (puedes usar Google, GitHub o email)
4. Verifica tu email si es necesario

### 2.2 Obtener API Key

1. Una vez dentro del dashboard de Resend
2. Ve a **"API Keys"** en el menú lateral
3. Haz clic en **"Create API Key"**
4. Dale un nombre: **"Maflipp Production"** o **"Maflipp Development"**
5. Selecciona permisos: **"Sending access"**
6. Haz clic en **"Add"**
7. **⚠️ IMPORTANTE**: Copia la API Key inmediatamente
   - Empieza con `re_`
   - Solo se muestra una vez
   - Guárdala en un lugar seguro

### 2.3 (Opcional) Verificar Dominio

Para producción:
1. Ve a **"Domains"** en Resend
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio (ej: `maflipp.com`)
4. Agrega los registros DNS que te proporciona
5. Espera la verificación

**Para desarrollo**: Puedes usar el dominio de prueba sin verificar.

---

## ✅ Paso 3: Crear Archivo .env.local

1. **Crea el archivo `.env.local`** en la raíz del proyecto
   - Si no existe, créalo manualmente
   - Está en `.gitignore`, así que no se subirá a Git

2. **Agrega estas variables** (reemplaza con tus valores reales):

```env
# Resend API Key (obtenida en el paso 2.2)
RESEND_API_KEY=re_tu_api_key_aqui

# Secret para proteger el endpoint de cron job
# Genera uno seguro o usa: openssl rand -base64 32
CRON_SECRET=tu-secret-super-seguro-aqui-cambiar-en-produccion

# URL de tu sitio (para links en los emails)
# Desarrollo: http://localhost:3000
# Producción: https://maflipp.com
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Si ya tienes otras variables** (Supabase, Stripe, etc.), agrégalas también:

```env
# Supabase (si ya las tienes)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Resend (Alertas por Email)
RESEND_API_KEY=re_tu_api_key_aqui
CRON_SECRET=tu-secret-super-seguro
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Stripe (si ya lo tienes)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## ✅ Paso 4: Reiniciar el Servidor

1. **Detén el servidor** si está corriendo (`Ctrl+C`)
2. **Inicia el servidor de nuevo**:
   ```bash
   npm run dev
   ```
3. Esto carga las nuevas variables de entorno

---

## ✅ Paso 5: Probar el Sistema

### 5.1 Probar Guardar Preferencias

1. Ve a `http://localhost:3000/dashboard/cuenta`
2. Debes tener plan Pro o Business (usa `?plan=pro` en la URL si estás en modo diseño)
3. Busca la sección **"Alertas por Email"**
4. Configura las alertas (umbral, activar/desactivar)
5. Haz clic en **"Guardar Preferencias"**
6. Deberías ver: **"✅ Preferencias de alertas guardadas correctamente"**

### 5.2 Verificar en Base de Datos

Ejecuta en Supabase SQL Editor:
```sql
SELECT * FROM email_alert_preferences;
```

Deberías ver tu registro con tus preferencias guardadas.

---

## ✅ Paso 6: (Opcional) Configurar Cron Job

Para que las alertas se envíen automáticamente, configura un cron job:

### Opción A: Vercel Cron (Recomendado si usas Vercel)

Crea `vercel.json` en la raíz:
```json
{
  "crons": [
    {
      "path": "/api/alerts/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### Opción B: Llamada Manual

Puedes llamar manualmente al endpoint:
```bash
curl -X POST http://localhost:3000/api/alerts/send \
  -H "Authorization: Bearer tu-cron-secret"
```

---

## ✅ Checklist Final

- [ ] Migración SQL ejecutada en Supabase
- [ ] Tablas `email_alert_preferences` y `email_alerts_sent` creadas
- [ ] Cuenta creada en Resend
- [ ] API Key obtenida de Resend
- [ ] Archivo `.env.local` creado con las variables
- [ ] Variables `RESEND_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` configuradas
- [ ] Servidor reiniciado
- [ ] Preferencias se guardan correctamente en `/dashboard/cuenta`

---

## 🆘 Si Algo No Funciona

### Error: "RESEND_API_KEY no está configurada"
- Verifica que `.env.local` existe en la raíz del proyecto
- Verifica que la variable se llama exactamente `RESEND_API_KEY`
- Reinicia el servidor después de agregar variables

### Error: "No autenticado" al guardar preferencias
- Asegúrate de estar logueado
- O usa modo diseño: `/dashboard/cuenta?plan=pro`

### Las preferencias no se guardan
- Abre la consola del navegador (F12) y revisa errores
- Verifica que la migración SQL se ejecutó correctamente
- Verifica que las políticas RLS están activas

---

## 📝 Archivos Creados

- ✅ `EJECUTAR_MIGRACION_ALERTAS.sql` - SQL listo para ejecutar
- ✅ `CONFIGURAR_RESEND.md` - Guía detallada de Resend
- ✅ `PASOS_CONFIGURACION_ALERTAS.md` - Este archivo (guía paso a paso)

¡Listo! Sigue estos pasos en orden y tendrás el sistema de alertas funcionando. 🎉

