# 🧪 Test Mode vs Live Mode en Stripe

## 📋 Diferencia Importante

### Test Mode (Modo de Prueba) 🧪
- **Para**: Desarrollo y pruebas
- **Pagos**: Simulados (no se cobra dinero real)
- **API Keys**: Empiezan con `sk_test_` y `pk_test_`
- **Tarjetas de prueba**: Puedes usar `4242 4242 4242 4242`
- **Gratis**: No hay comisiones
- **Cuándo usar**: Durante desarrollo, pruebas, MVP

### Live Mode (Modo de Producción) 🚀
- **Para**: Producción real
- **Pagos**: Reales (se cobra dinero real)
- **API Keys**: Empiezan con `sk_live_` y `pk_live_`
- **Tarjetas reales**: Solo tarjetas reales funcionan
- **Comisiones**: Stripe cobra comisiones (2.9% + $0.30 MXN por transacción)
- **Cuándo usar**: Cuando tengas usuarios reales pagando

---

## 🎯 Para tu MVP: Usa Test Mode

### ¿Por qué Test Mode?

**✅ Ventajas:**
- No se cobra dinero real
- Puedes probar todo sin riesgo
- No necesitas activar tu cuenta completamente
- Puedes usar tarjetas de prueba
- Perfecto para desarrollo

**❌ Desventajas:**
- Los pagos son simulados
- No recibes dinero real
- No puedes procesar pagos reales

### ¿Cuándo cambiar a Live Mode?

**Cambia a Live Mode cuando:**
- ✅ Tu MVP esté completamente funcional
- ✅ Tengas usuarios reales que quieran pagar
- ✅ Hayas probado todo en Test Mode
- ✅ Estés listo para recibir pagos reales

---

## 🔄 Cómo Cambiar entre Test y Live

### En Stripe Dashboard:

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. En la esquina superior derecha, verás un toggle:
   - **"Test mode"** (modo de prueba) - Toggle a la izquierda
   - **"Live mode"** (modo de producción) - Toggle a la derecha
3. Click en el toggle para cambiar

**⚠️ IMPORTANTE**: 
- Cada modo tiene sus propias API Keys
- Las keys de Test Mode NO funcionan en Live Mode
- Las keys de Live Mode NO funcionan en Test Mode
- Debes actualizar las variables de entorno cuando cambies

---

## 📝 Para tu MVP: Pasos Recomendados

### Paso 1: Usar Test Mode (Ahora)

1. Ve a Stripe Dashboard
2. Asegúrate de que el toggle esté en **"Test mode"**
3. Obtén las API Keys de Test Mode:
   - `sk_test_...` (Secret Key)
   - `pk_test_...` (Publishable Key)
4. Configura todo con estas keys
5. Prueba todo con tarjetas de prueba

### Paso 2: Cambiar a Live Mode (Después)

**Cuando estés listo para producción:**

1. Activa tu cuenta de Stripe completamente:
   - Completa información de negocio
   - Agrega información bancaria
   - Verifica identidad
2. Cambia el toggle a **"Live mode"**
3. Obtén las nuevas API Keys de Live Mode:
   - `sk_live_...` (Secret Key)
   - `pk_live_...` (Publishable Key)
4. Actualiza las variables de entorno en Vercel
5. Actualiza el webhook con la nueva URL
6. Haz redeploy

---

## 🎯 Respuesta a tu Pregunta

### ¿Cuál escoger?

**Para tu MVP ahora:**
- ✅ **Test Mode** (Modo de Prueba)
- ❌ NO necesitas cambiar de cuenta (a menos que no sea México)
- ❌ NO necesitas Live Mode todavía

**Razón:**
- Estás en desarrollo/pruebas
- No tienes usuarios reales pagando todavía
- Puedes probar todo sin riesgo
- Es gratis

**Cuando cambies a Live Mode:**
- Cuando tengas usuarios reales
- Cuando quieras recibir pagos reales
- Cuando tu MVP esté completamente funcional

---

## ✅ Checklist para Test Mode

- [ ] Toggle en Stripe Dashboard está en **"Test mode"**
- [ ] API Keys empiezan con `sk_test_` y `pk_test_`
- [ ] Variables de entorno tienen keys de Test Mode
- [ ] Puedes probar con tarjetas de prueba: `4242 4242 4242 4242`

---

## 🆘 Preguntas Frecuentes

### ¿Puedo tener Test y Live al mismo tiempo?
- ✅ Sí, puedes cambiar entre ellos con el toggle
- Cada modo tiene sus propias keys y datos

### ¿Los datos de Test Mode se pierden al cambiar a Live?
- ❌ No, cada modo mantiene sus propios datos
- Puedes cambiar entre ellos cuando quieras

### ¿Necesito activar mi cuenta para Test Mode?
- ❌ No, Test Mode funciona sin activar la cuenta
- Solo necesitas activar para Live Mode

### ¿Cuándo debo activar mi cuenta?
- Cuando quieras usar Live Mode
- Cuando quieras recibir pagos reales

---

## 🎯 Resumen

**Para tu MVP ahora:**
1. ✅ Usa **Test Mode** (modo de prueba)
2. ✅ No necesitas cambiar de cuenta (a menos que no sea México)
3. ✅ Configura todo con keys de Test Mode
4. ✅ Prueba con tarjetas de prueba

**Más adelante:**
1. Cuando tengas usuarios reales
2. Cambia a **Live Mode**
3. Actualiza las keys
4. Recibe pagos reales

---

¿Listo para configurar Stripe en Test Mode? 🚀

