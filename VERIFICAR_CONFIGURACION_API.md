# ✅ Verificación: ¿Las APIs están listas para uso real?

## 🔍 Checklist de Verificación

### 1. Variables de Entorno ✅/❌

Verifica que tengas estas variables en tu `.env.local`:

```bash
# Ejecuta este comando en la terminal:
cat .env.local | grep -E "SUPABASE|RESEND|CRON"
```

**Debes ver:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `RESEND_API_KEY` (para alertas)
- ✅ `CRON_SECRET` (para alertas)
- ✅ `NEXT_PUBLIC_SITE_URL`

### 2. Base de Datos ✅/❌

**Verifica en Supabase Dashboard → Table Editor:**
- ✅ Tabla `api_keys` existe
- ✅ Tabla `api_usage_logs` existe
- ✅ Tabla `users` existe
- ✅ Tabla `validations` existe

### 3. Probar Crear API Key ✅/❌

1. Ve a: `/dashboard/api-keys?plan=pro`
2. Crea una API Key con nombre "Prueba"
3. ✅ Debe mostrarte la API Key completa
4. ✅ Debe aparecer en la lista

### 4. Probar Validación con API ✅/❌

Usa esta prueba (reemplaza `TU_API_KEY` y `TU_DOMINIO`):

```bash
curl -X POST https://TU_DOMINIO.com/api/public/validate \
  -H "X-API-Key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"rfc": "ABC123456789"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "valid": true/false,
  "rfc": "ABC123456789",
  "remaining": 1999,
  "message": "RFC válido" o "RFC inválido"
}
```

### 5. Verificar Logs ✅/❌

Después de validar, verifica en Supabase:
- ✅ `api_usage_logs` tiene un nuevo registro
- ✅ `api_keys.total_used` se incrementó

## 🚨 Si algo falla

### Error: "API Key requerida"
- ✅ Normal, significa que el endpoint funciona
- Agrega el header `X-API-Key`

### Error: "Formato de API Key inválido"
- ✅ La API Key no tiene el formato correcto
- Verifica que empiece con `sk_live_`

### Error: "API Key inválida o no encontrada"
- ❌ La API Key no existe en la base de datos
- Verifica que la creaste correctamente

### Error: "Your project's URL and Key are required"
- ❌ Faltan variables de entorno
- Configura `.env.local` con las credenciales de Supabase

## ✅ Estado Final

**Si todos los checks pasan:**
- ✅ APIs listas para uso real
- ✅ Puedes dar API Keys a tus clientes
- ✅ Las validaciones funcionarán correctamente

**Si falta algo:**
- Sigue las instrucciones arriba
- Revisa los errores específicos

