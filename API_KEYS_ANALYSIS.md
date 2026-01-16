# 📊 Análisis: API Keys y Equipo

## 🔗 Relación entre API Keys y Equipo

### Estado Actual: **NO HAY RELACIÓN DIRECTA**

- ✅ **API Keys son personales**: Cada usuario tiene sus propias API Keys
- ❌ **Los miembros del equipo NO pueden ver** las API Keys del owner
- ❌ **Los miembros del equipo NO pueden usar** las API Keys del owner
- ❌ **No hay compartición de API Keys** entre miembros del equipo

### ¿Por qué no hay relación?

1. **Seguridad**: Las API Keys son credenciales sensibles
2. **Trazabilidad**: Cada key está asociada a un `user_id` específico
3. **Límites**: Los límites de llamadas se calculan por usuario, no por equipo

### ¿Qué comparten?

- ✅ **Límite de llamadas mensuales**: Basado en el plan del **owner**
  - Si el owner tiene plan Pro (2,000 llamadas/mes)
  - Todos los miembros del equipo comparten ese límite (pero cada uno tiene sus propias keys)

---

## 🔑 Función de las API Keys

### ¿Qué son?

Las API Keys son **credenciales de autenticación** que permiten usar la API sin estar logueado en el dashboard.

### ¿Cómo funcionan?

1. **Creación**:
   - Usuario crea una API Key con un nombre (ej: "Producción", "Desarrollo")
   - Se genera un token único: `sk_live_abc123...xyz789`
   - Solo se muestra **una vez** al crear (por seguridad)

2. **Almacenamiento**:
   - Se guarda un **hash** de la key (no el valor completo)
   - Se guarda un **prefijo** para mostrar en el dashboard (ej: `sk_live_abc123...`)

3. **Uso**:
   ```bash
   curl -X POST https://maflipp.com/api/public/validate \
     -H "X-API-Key: sk_live_abc123...xyz789" \
     -H "Content-Type: application/json" \
     -d '{"rfc": "ABC123456789"}'
   ```

4. **Contadores**:
   - `total_used`: Total de llamadas desde que se creó
   - `api_calls_this_month`: Llamadas en el mes actual
   - `last_used_at`: Última vez que se usó

### Límites de Llamadas

#### Plan Pro:
- **2,000 llamadas/mes**
- **5 API Keys máximo**
- Todas las keys comparten el mismo límite de 2,000 llamadas

#### Plan Business:
- **10,000 llamadas/mes**
- **20 API Keys máximo**
- Todas las keys comparten el mismo límite de 10,000 llamadas

### Ejemplo Práctico:

**Usuario con Plan Pro:**
- Tiene 3 API Keys: "Producción", "Desarrollo", "Testing"
- Límite total: 2,000 llamadas/mes
- Si "Producción" usa 1,500 llamadas
- Y "Desarrollo" usa 300 llamadas
- Quedan **200 llamadas** para todas las keys

---

## ✅ Estado Actual del Apartado de API Keys

### Funcionalidades Implementadas:

1. ✅ **Crear API Keys** (con límite según plan)
2. ✅ **Ver lista de API Keys** (con prefijo, no la key completa)
3. ✅ **Ver estadísticas** (llamadas totales, llamadas del mes, último uso)
4. ✅ **Eliminar API Keys**
5. ✅ **Validar API Key** (endpoint `/api/public/ping`)
6. ✅ **Usar API Key** (endpoint `/api/public/validate`)
7. ✅ **Contador de llamadas** (se actualiza automáticamente)
8. ✅ **Límite de cantidad de keys** (Pro: 5, Business: 20)

### Funcionalidades FALTANTES:

1. ❌ **Activar/Desactivar keys** (existe `is_active` pero no hay UI)
2. ❌ **Renombrar keys** (cambiar el nombre después de crear)
3. ❌ **Ver historial detallado** (logs de cada llamada)
4. ❌ **Rotar/Regenerar keys** (generar nueva key manteniendo la anterior)
5. ❌ **Fechas de expiración** (existe `expires_at` pero no se usa)
6. ❌ **Compartir keys con equipo** (feature opcional futura)
7. ❌ **Webhooks** (notificaciones cuando se usa una key)
8. ❌ **Rate limiting por key** (límite de llamadas por minuto por key)

---

## 🎯 Recomendaciones

### Prioridad ALTA (Implementar ahora):

1. **Activar/Desactivar keys** ⭐
   - Permite desactivar temporalmente sin eliminar
   - Útil para debugging o seguridad

2. **Renombrar keys** ⭐
   - Cambiar nombre después de crear
   - Mejora la organización

3. **Ver historial básico** ⭐
   - Últimas 50 llamadas por key
   - Ver RFC validado, fecha, resultado

### Prioridad MEDIA (Implementar después):

4. **Fechas de expiración**
   - Permitir crear keys con fecha de expiración
   - Útil para keys temporales

5. **Rotar keys**
   - Generar nueva key manteniendo la anterior activa
   - Útil para migración sin downtime

### Prioridad BAJA (Futuro):

6. **Compartir keys con equipo**
   - Permitir que miembros del equipo vean/usen keys del owner
   - Requiere cambios en RLS y seguridad

7. **Webhooks**
   - Notificaciones cuando se alcanza el límite
   - Notificaciones de uso sospechoso

8. **Rate limiting por key**
   - Límite de llamadas por minuto por key individual
   - Útil para prevenir abuso

---

## 📝 Resumen Ejecutivo

### Relación API Keys ↔ Equipo:
- **Actualmente**: NO hay relación directa
- **Cada usuario** tiene sus propias API Keys
- **Los límites** se basan en el plan del usuario, no del equipo

### Funcionalidades API Keys:
- ✅ **Básicas**: Crear, ver, eliminar, usar
- ❌ **Avanzadas**: Activar/desactivar, renombrar, historial

### Recomendación:
Implementar **Activar/Desactivar** y **Renombrar** como mínimo antes del lanzamiento.

