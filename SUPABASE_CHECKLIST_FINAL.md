# ✅ Checklist Final de Supabase

## 🎯 Lo que DEBES hacer (Esencial)

### ✅ 1. Crear Proyecto en Supabase
- [ ] Ir a supabase.com y crear cuenta
- [ ] Crear proyecto nuevo
- [ ] Esperar a que termine de configurarse

### ✅ 2. Ejecutar Migraciones SQL
- [ ] SQL Editor → Ejecutar `001_initial_schema.sql`
- [ ] SQL Editor → Ejecutar `002_api_keys.sql`
- [ ] SQL Editor → Ejecutar `003_create_user_trigger.sql` ⚠️ **CRÍTICO**

### ✅ 3. Obtener Credenciales
- [ ] Settings → API → Copiar Project URL
- [ ] Settings → API → Copiar anon public key
- [ ] Settings → API → Copiar service_role key

### ✅ 4. Configurar Variables de Entorno
- [ ] Abrir `.env.local` (ya está creado)
- [ ] Pegar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Pegar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Pegar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Guardar archivo

### ⚠️ 5. Configurar URLs de Redirección (IMPORTANTE)
- [ ] Ir a **Authentication** → **URL Configuration**
- [ ] **Site URL**: `http://localhost:3000`
- [ ] **Redirect URLs**: Agregar:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**` (para desarrollo)

**Sin esto, el registro/login no funcionará correctamente.**

---

## ✅ Lo que es OPCIONAL (pero recomendado)

### Email Provider
- Por defecto ya viene habilitado, pero verifica:
  - [ ] Authentication → Providers → Email está ON

---

## 🧪 Verificación Final

Después de completar todo:

1. **Reinicia el servidor:**
   ```bash
   # Detén (Ctrl+C) y reinicia:
   npm run dev
   ```

2. **Prueba en el navegador:**
   - [ ] Abre http://localhost:3000
   - [ ] Click en "Registrarse"
   - [ ] Crea una cuenta con tu email
   - [ ] Deberías poder registrarte e iniciar sesión

3. **Verifica en Supabase:**
   - [ ] Authentication → Users → Deberías ver tu usuario
   - [ ] Table Editor → users → Deberías ver tu usuario en la tabla

---

## ✅ Resumen: ¿Qué falta?

### **ESENCIAL (para que funcione):**
1. ✅ Crear proyecto
2. ✅ Ejecutar 3 migraciones SQL
3. ✅ Obtener credenciales
4. ✅ Pegar credenciales en `.env.local`
5. ⚠️ **Configurar URLs de redirección** ← **ESTO ES LO ÚNICO QUE FALTA**

### **OPCIONAL:**
- Verificar que Email provider está habilitado (ya viene ON por defecto)

---

## 🎉 Una vez completado esto:

**¡Supabase estará 100% configurado!**

Ya podrás:
- ✅ Registrar usuarios
- ✅ Iniciar sesión
- ✅ Validar RFCs
- ✅ Ver dashboard
- ✅ Guardar historial

**Próximo paso:** Configurar Stripe (opcional para desarrollo)

