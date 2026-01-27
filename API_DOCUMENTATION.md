# Documentación de API - Maflipp

**Versión**: 1.0.0  
**Base URL**: `https://maflipp.com/api`

---

## Autenticación

### Autenticación de Usuario (Dashboard)
Los endpoints protegidos requieren autenticación mediante:
- **Bearer Token**: `Authorization: Bearer <JWT_TOKEN>`
- **Cookie**: Token almacenado en cookies de sesión

### Autenticación de API (Pública)
Los endpoints públicos requieren una **API Key**:
- **Header**: `X-API-Key: <API_KEY>`
- **Alternativa**: `Authorization: Bearer <API_KEY>`

---

## Rate Limiting

Todos los endpoints tienen límites de tasa:

- **Dashboard API** (`/api/validate`): 10 requests/minuto por usuario
- **Public API** (`/api/public/validate`): 60 requests/minuto por API key

**Headers de respuesta**:
- `X-RateLimit-Limit`: Límite máximo
- `X-RateLimit-Remaining`: Solicitudes restantes
- `Retry-After`: Segundos hasta que se reinicia el contador (solo en 429)

**Código de error**: `429 Too Many Requests`

---

## Endpoints Públicos

### 1. Validar RFC (Pública)

**Endpoint**: `POST /api/public/validate`

**Autenticación**: API Key requerida

**Request Body**:
```json
{
  "rfc": "XAXX010101000",
  "forceRefresh": false
}
```

**Parámetros**:
- `rfc` (string, requerido): RFC a validar (formato: 12-13 caracteres)
- `forceRefresh` (boolean, opcional): Forzar consulta al SAT (default: false)

**Response 200**:
```json
{
  "success": true,
  "valid": true,
  "rfc": "XAXX010101000",
  "name": "PUBLICO EN GENERAL",
  "status": "Vigente",
  "remaining": 1999
}
```

**Response 401** (API Key inválida):
```json
{
  "success": false,
  "valid": false,
  "rfc": "",
  "remaining": 0,
  "message": "API Key requerida. Incluye 'X-API-Key' en el header."
}
```

**Response 429** (Rate limit excedido):
```json
{
  "success": false,
  "valid": false,
  "rfc": "",
  "remaining": 0,
  "message": "Límite de solicitudes excedido. Máximo 60 requests por minuto."
}
```

**Ejemplo cURL**:
```bash
curl -X POST https://maflipp.com/api/public/validate \
  -H "X-API-Key: mflp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"rfc": "XAXX010101000"}'
```

**Ejemplo JavaScript**:
```javascript
const response = await fetch('https://maflipp.com/api/public/validate', {
  method: 'POST',
  headers: {
    'X-API-Key': 'mflp_xxxxxxxxxxxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ rfc: 'XAXX010101000' }),
});

const data = await response.json();
console.log(data);
```

**Ejemplo Python**:
```python
import requests

url = "https://maflipp.com/api/public/validate"
headers = {
    "X-API-Key": "mflp_xxxxxxxxxxxx",
    "Content-Type": "application/json"
}
data = {"rfc": "XAXX010101000"}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)
```

---

### 2. Ping (Health Check Público)

**Endpoint**: `GET /api/public/ping`

**Autenticación**: No requerida

**Response 200**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-26T12:00:00.000Z"
}
```

---

## Endpoints Protegidos (Dashboard)

### 1. Validar RFC (Dashboard)

**Endpoint**: `POST /api/validate`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "rfc": "XAXX010101000",
  "forceRefresh": false
}
```

**Response 200**:
```json
{
  "success": true,
  "valid": true,
  "rfc": "XAXX010101000",
  "name": "PUBLICO EN GENERAL",
  "status": "Vigente",
  "remaining": 9
}
```

**Response 401** (No autenticado):
```json
{
  "success": false,
  "valid": false,
  "rfc": "",
  "remaining": 0,
  "message": "No autenticado"
}
```

**Rate Limit**: 10 requests/minuto

---

### 2. Reiniciar Contador de Validaciones

**Endpoint**: `POST /api/validate/reset`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "success": true,
  "message": "Contador reiniciado"
}
```

---

### 3. Obtener Historial de Validaciones

**Endpoint**: `GET /api/validations`

**Autenticación**: JWT Token requerido

**Query Parameters**:
- `limit` (number, opcional): Número de resultados (default: 50, max: 100)
- `offset` (number, opcional): Offset para paginación (default: 0)

**Response 200**:
```json
{
  "validations": [
    {
      "id": "uuid",
      "rfc": "XAXX010101000",
      "is_valid": true,
      "response_time": 0.5,
      "created_at": "2025-01-26T12:00:00.000Z"
    }
  ],
  "total": 100,
  "limit": 50,
  "offset": 0
}
```

---

### 4. Reiniciar Historial de Validaciones

**Endpoint**: `POST /api/validations/reset`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "success": true,
  "message": "Historial reiniciado"
}
```

---

## Gestión de API Keys

### 1. Crear API Key

**Endpoint**: `POST /api/api-keys/create`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "name": "Mi API Key de Producción"
}
```

**Response 200**:
```json
{
  "success": true,
  "apiKey": "mflp_xxxxxxxxxxxx",
  "id": "uuid",
  "name": "Mi API Key de Producción",
  "created_at": "2025-01-26T12:00:00.000Z"
}
```

**⚠️ IMPORTANTE**: La API Key solo se muestra una vez. Guárdala de forma segura.

---

### 2. Actualizar API Key

**Endpoint**: `PUT /api/api-keys/update`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "id": "uuid",
  "name": "Nuevo nombre",
  "is_active": true
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "API Key actualizada"
}
```

---

### 3. Recargar API Key (Deshabilitado por defecto)

**Endpoint**: `POST /api/api-keys/recharge`

**Autenticación**: JWT Token requerido

**Estado**: Deshabilitado por defecto (`ENABLE_API_KEY_RECHARGE=false`)

**Response 503**:
```json
{
  "error": "Esta funcionalidad está deshabilitada"
}
```

---

## Gestión de Perfil

### 1. Actualizar Perfil

**Endpoint**: `PUT /api/profile/update`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "full_name": "Juan Pérez",
  "phone": "+521234567890"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Perfil actualizado"
}
```

---

### 2. Actualizar Email

**Endpoint**: `PUT /api/profile/update-email`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "new_email": "nuevo@email.com"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Email actualizado"
}
```

---

### 3. Eliminar Cuenta

**Endpoint**: `DELETE /api/profile/delete-account`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "success": true,
  "message": "Cuenta eliminada"
}
```

---

## Gestión de Equipo

### 1. Invitar Miembro

**Endpoint**: `POST /api/team/invite`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "email": "nuevo@miembro.com"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Invitación enviada"
}
```

---

### 2. Aceptar Invitación

**Endpoint**: `POST /api/team/accept`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "token": "invitation_token"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Invitación aceptada"
}
```

---

### 3. Obtener Miembros del Equipo

**Endpoint**: `GET /api/team/members`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "members": [
    {
      "id": "uuid",
      "email": "miembro@equipo.com",
      "role": "member",
      "joined_at": "2025-01-26T12:00:00.000Z"
    }
  ]
}
```

---

### 4. Abandonar Equipo

**Endpoint**: `POST /api/team/leave`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "success": true,
  "message": "Has abandonado el equipo"
}
```

---

## Branding (White Label)

### 1. Obtener Configuración de Branding

**Endpoint**: `GET /api/branding`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "brand_name": "Mi Empresa",
  "primary_color": "#2F7E7A",
  "secondary_color": "#1F5D59",
  "logo_url": "https://...",
  "hide_maflipp_brand": false
}
```

---

### 2. Actualizar Branding

**Endpoint**: `PUT /api/branding`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "brand_name": "Mi Empresa",
  "primary_color": "#2F7E7A",
  "secondary_color": "#1F5D59",
  "hide_maflipp_brand": true
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Branding actualizado"
}
```

---

### 3. Subir Logo

**Endpoint**: `POST /api/branding/upload-logo`

**Autenticación**: JWT Token requerido

**Request**: `multipart/form-data` con campo `logo` (archivo imagen)

**Response 200**:
```json
{
  "success": true,
  "logo_url": "https://..."
}
```

---

## Alertas por Email

### 1. Obtener Preferencias de Alertas

**Endpoint**: `GET /api/alerts/preferences`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "threshold_enabled": true,
  "threshold_percentage": 80,
  "limit_reached_enabled": true,
  "monthly_summary_enabled": true
}
```

---

### 2. Actualizar Preferencias de Alertas

**Endpoint**: `PUT /api/alerts/preferences`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "threshold_enabled": true,
  "threshold_percentage": 80,
  "limit_reached_enabled": true,
  "monthly_summary_enabled": true
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Preferencias actualizadas"
}
```

---

## Stripe (Pagos)

### 1. Crear Sesión de Checkout

**Endpoint**: `POST /api/stripe/checkout`

**Autenticación**: JWT Token requerido

**Request Body**:
```json
{
  "plan": "pro",
  "billingCycle": "monthly"
}
```

**Parámetros**:
- `plan` (string, requerido): `"pro"` o `"business"`
- `billingCycle` (string, requerido): `"monthly"` o `"annual"`

**Response 200**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

---

### 2. Portal de Cliente

**Endpoint**: `POST /api/stripe/customer-portal`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

---

### 3. Webhook de Stripe

**Endpoint**: `POST /api/stripe/webhook`

**Autenticación**: Firma de Stripe (automática)

**Nota**: Este endpoint es llamado por Stripe automáticamente. No debe ser llamado manualmente.

---

## Otros Endpoints

### 1. Health Check

**Endpoint**: `GET /api/health`

**Autenticación**: No requerida

**Response 200**:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-26T12:00:00.000Z",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "stripe": "healthy"
  },
  "version": "1.0.0"
}
```

---

### 2. Contacto

**Endpoint**: `POST /api/contact`

**Autenticación**: No requerida

**Request Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "company": "Mi Empresa",
  "message": "Mensaje de contacto"
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Mensaje enviado correctamente"
}
```

---

### 3. Onboarding

**Endpoint**: `GET /api/onboarding`

**Autenticación**: JWT Token requerido

**Response 200**:
```json
{
  "completed": false,
  "step": 1,
  "total_steps": 5
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 400 | Solicitud inválida (parámetros faltantes o incorrectos) |
| 401 | No autenticado (token o API key inválida) |
| 403 | Prohibido (límite mensual alcanzado, plan insuficiente) |
| 404 | Recurso no encontrado |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |
| 502 | Error en servicio externo (SAT no disponible) |
| 503 | Servicio no disponible (endpoint deshabilitado) |

---

## Límites por Plan

### Plan Free
- Validaciones/mes: 10
- API: No disponible
- Historial: No disponible

### Plan Pro
- Validaciones/mes: 1,000
- API calls/mes: 2,000
- API Keys: 5
- Usuarios: 3

### Plan Business
- Validaciones/mes: 5,000
- API calls/mes: 10,000
- API Keys: 20
- Usuarios: Ilimitado
- White Label: Sí

---

## Ejemplos Completos

### JavaScript/TypeScript
```typescript
// Validar RFC con API pública
async function validateRFC(apiKey: string, rfc: string) {
  const response = await fetch('https://maflipp.com/api/public/validate', {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rfc }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return await response.json();
}

// Uso
const result = await validateRFC('mflp_xxxxxxxxxxxx', 'XAXX010101000');
console.log(result);
```

### Python
```python
import requests
from typing import Dict, Optional

def validate_rfc(api_key: str, rfc: str) -> Dict:
    url = "https://maflipp.com/api/public/validate"
    headers = {
        "X-API-Key": api_key,
        "Content-Type": "application/json"
    }
    data = {"rfc": rfc}
    
    response = requests.post(url, json=data, headers=headers)
    response.raise_for_status()
    return response.json()

# Uso
result = validate_rfc("mflp_xxxxxxxxxxxx", "XAXX010101000")
print(result)
```

### cURL
```bash
# Validar RFC
curl -X POST https://maflipp.com/api/public/validate \
  -H "X-API-Key: mflp_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{"rfc": "XAXX010101000"}'

# Health check
curl https://maflipp.com/api/health
```

---

## Notas Importantes

1. **API Keys**: Solo se muestran una vez al crearlas. Guárdalas de forma segura.
2. **Rate Limiting**: Respeta los límites para evitar bloqueos temporales.
3. **Límites Mensuales**: Se reinician el primer día de cada mes.
4. **Formato RFC**: Debe ser válido (12-13 caracteres, formato mexicano).
5. **HTTPS**: Todos los endpoints requieren HTTPS en producción.
6. **Versión**: La versión actual de la API es `1.0.0`.

---

**Última actualización**: Enero 2025
