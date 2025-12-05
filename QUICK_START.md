# Guía de Inicio Rápido

## ✅ Verificación Rápida

### 1. Landing Page
```bash
npm run dev
# Abre http://localhost:3000
```
✅ Debe cargar la landing page con todas las secciones

### 2. Registro/Login
1. Ve a `/auth/register`
2. Completa el formulario
3. Verifica que se cree usuario en Supabase Auth
4. **IMPORTANTE**: Ejecuta el trigger SQL (`003_create_user_trigger.sql`) para crear registro en tabla `users`

### 3. Dashboard
1. Login en `/auth/login`
2. Debe redirigir a `/dashboard`
3. Verifica que muestre:
   - Header con email y plan
   - Validador de RFC
   - Estadísticas
   - Historial reciente

### 4. Validación RFC
1. Ingresa un RFC en el validador
2. Click en "Validar RFC"
3. Debe mostrar resultado ✅ o ❌
4. Debe guardarse en historial

### 5. Límites por Plan
- **Free**: Máximo 5 validaciones/mes
- **Pro**: Máximo 100 validaciones/mes
- **Enterprise**: Máximo 1000 validaciones/mes

Verifica que:
- Se muestre el límite correcto en el header
- Se bloquee cuando se alcance el límite
- Se muestre mensaje de error apropiado

### 6. Stripe Checkout
1. Ve a `/dashboard/billing`
2. Click en "Mejorar a Pro" o "Mejorar a Empresa"
3. Debe crear sesión de checkout en Stripe
4. **Requiere**: Configurar Price IDs en `.env.local`

### 7. Historial
1. Ve a `/dashboard/historial`
2. Debe mostrar todas las validaciones
3. Paginación funciona (10 por página)
4. Exportar CSV solo para Pro+ (debe mostrar alert si no es Pro)

### 8. Responsive
Abre en diferentes tamaños:
- **Móvil** (< 640px): Menú hamburguesa, columnas apiladas
- **Tablet** (640px - 1024px): Layout intermedio
- **Desktop** (> 1024px): Sidebar visible, layout completo

## 🔧 Configuración Crítica

### Trigger de Usuarios (OBLIGATORIO)

Sin este trigger, los usuarios no se crearán en la tabla `users` al registrarse:

```sql
-- Ejecuta en Supabase SQL Editor
-- Archivo: supabase/migrations/003_create_user_trigger.sql
```

### Variables de Entorno Mínimas

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_key
```

## 🐛 Problemas Comunes

### "Usuario no encontrado" después de registro
**Solución**: Ejecuta el trigger SQL `003_create_user_trigger.sql`

### "Error al validar RFC"
**Solución**: Verifica que las variables de entorno de Supabase estén correctas

### "Price ID no configurado"
**Solución**: Configura `STRIPE_PRICE_ID_PRO` y `STRIPE_PRICE_ID_ENTERPRISE` en `.env.local`

### Dashboard no carga
**Solución**: Verifica que el usuario tenga registro en tabla `users` (ejecuta trigger)

## ✅ Checklist Final

- [ ] Landing page carga correctamente
- [ ] Registro crea usuario en Auth
- [ ] Trigger SQL ejecutado (crea usuario en tabla `users`)
- [ ] Login redirige a dashboard
- [ ] Dashboard muestra información del usuario
- [ ] Validación RFC funciona
- [ ] Historial guarda validaciones
- [ ] Límites por plan funcionan
- [ ] Responsive en móvil/desktop
- [ ] Stripe checkout crea sesión (si configurado)

