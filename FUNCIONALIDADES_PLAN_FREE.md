# 📋 Funcionalidades del Plan FREE - Maflipp

Este documento detalla todas las funcionalidades incluidas en el Plan FREE de Maflipp, diseñado para usuarios individuales que quieren probar el servicio.

---

## 📊 Resumen Ejecutivo

El Plan FREE incluye:
- ✅ **10 validaciones/mes** (sin tarjeta de crédito)
- ✅ **Resultados básicos** (válido/inválido)
- ✅ **Estadísticas básicas de uso**
- ✅ **1 usuario**
- ✅ **Soporte: FAQs**
- ❌ **Sin historial de validaciones**
- ❌ **Sin exportación de datos**
- ❌ **Sin acceso a API**

**Precio:** $0 MXN/mes (Gratis)

**Ideal para:** Usuarios individuales, prueba del servicio, validaciones esporádicas.

---

## 1. Validaciones RFC

### ✅ Funcionalidad Implementada
- **10 validaciones por mes**: Límite generoso para probar el servicio.
- **Validación en tiempo real contra el SAT**: Conexión directa con el padrón del SAT.
- **Respuesta en menos de 2 segundos**: Optimizado para velocidad.
- **Contador mensual que se reinicia automáticamente**: El contador se resetea el primer día de cada mes.
- **Validación de RFCs físicas y morales**: Soporta ambos tipos de RFC.
- **Formato automático**: Limpia y formatea el RFC antes de validar.

### 📁 Archivos Relacionados
- `app/api/validate/route.ts` - Endpoint de validación
- `components/dashboard/RFCValidator.tsx` - Componente de validación
- `lib/plans.ts` - Configuración del límite (10 validaciones/mes)

### 🔍 Verificación
- ✅ Límite de 10 validaciones/mes implementado
- ✅ Contador `rfc_queries_this_month` se actualiza correctamente
- ✅ Reset mensual programado (cron job)
- ✅ Validación de formato RFC antes de consultar SAT
- ✅ Manejo de errores cuando se alcanza el límite

### ⚠️ Limitaciones
- Solo 10 validaciones por mes
- No se puede validar más hasta el próximo ciclo mensual
- Mensaje de error cuando se alcanza el límite sugiere mejorar el plan

---

## 2. Resultados Básicos

### ✅ Funcionalidad Implementada
- **Resultado válido/inválido**: Indica si el RFC existe en el SAT.
- **Mensaje descriptivo**: Explica el resultado de la validación.
- **Tiempo de respuesta**: Muestra cuánto tardó la consulta.
- **RFC formateado**: Muestra el RFC en formato estándar.

### 📁 Archivos Relacionados
- `components/dashboard/RFCValidator.tsx` - Muestra el resultado
- `app/api/validate/route.ts` - Retorna el resultado

### 🔍 Verificación
- ✅ Muestra si el RFC es válido o inválido
- ✅ Mensaje claro y descriptivo
- ✅ Tiempo de respuesta visible
- ✅ Iconos visuales (check verde / X roja)

### ⚠️ Limitaciones
- No muestra información adicional del RFC (razón social, régimen fiscal, etc.)
- Solo indica si existe o no en el SAT

---

## 3. Estadísticas Básicas de Uso

### ✅ Funcionalidad Implementada
- **Total de validaciones realizadas**: Contador general.
- **Validaciones válidas vs inválidas**: Desglose por resultado.
- **Uso mensual con barra de progreso**: Visualización del uso actual.
- **Alertas visuales cuando se acerca al límite**: Indicadores de advertencia.

### 📁 Archivos Relacionados
- `components/dashboard/DashboardStats.tsx` - Componente de estadísticas
- `components/dashboard/DashboardHeader.tsx` - Header con uso mensual
- `app/dashboard/page.tsx` - Página principal del dashboard

### 🔍 Verificación
- ✅ Muestra total de validaciones
- ✅ Separa válidas e inválidas
- ✅ Barra de progreso del uso mensual
- ✅ Alertas cuando quedan 3 o menos validaciones
- ✅ Alerta cuando se alcanza el 100% del límite

### ⚠️ Limitaciones
- No incluye gráficos avanzados
- No muestra tendencias históricas
- No incluye proyecciones de uso

---

## 4. Sin Historial de Validaciones

### ❌ Funcionalidad NO Disponible
- **No se guarda historial**: Las validaciones no se almacenan para consulta posterior.
- **No se puede ver validaciones pasadas**: No hay acceso a validaciones anteriores.
- **No hay búsqueda**: No se puede buscar RFCs validados previamente.

### 📁 Archivos Relacionados
- `components/dashboard/ValidationHistory.tsx` - Componente de historial (solo Pro+)
- `app/dashboard/historial/page.tsx` - Página de historial completo (solo Pro+)

### 🔍 Verificación
- ✅ Plan FREE no tiene acceso a la página de historial
- ✅ Componente `ValidationHistory` no se muestra para plan FREE
- ✅ Las validaciones se guardan en BD pero no se muestran al usuario FREE

### ⚠️ Limitaciones
- No se puede consultar validaciones anteriores
- No hay registro de validaciones pasadas visible
- Si necesitas ver una validación anterior, debes validarla de nuevo

---

## 5. Sin Exportación de Datos

### ❌ Funcionalidad NO Disponible
- **No se puede exportar a CSV**: No hay opción de descargar datos.
- **No se puede exportar a Excel**: No hay exportación a formatos de hoja de cálculo.
- **No hay reportes**: No se pueden generar reportes de validaciones.

### 📁 Archivos Relacionados
- `components/dashboard/ValidationHistory.tsx` - Botones de exportación (solo Pro+)

### 🔍 Verificación
- ✅ Botones de exportación no están visibles para plan FREE
- ✅ Funcionalidad de exportación está restringida por plan

### ⚠️ Limitaciones
- No se pueden descargar datos para análisis externo
- No se pueden generar reportes para auditorías
- No hay integración con herramientas de análisis

---

## 6. Sin Acceso a API

### ❌ Funcionalidad NO Disponible
- **No se pueden crear API Keys**: No hay acceso a la sección de API Keys.
- **No se puede integrar con sistemas externos**: No hay acceso a la API REST.
- **No hay documentación de API disponible**: La documentación está restringida.

### 📁 Archivos Relacionados
- `app/dashboard/api-keys/page.tsx` - Página de API Keys (solo Pro+)
- `app/api/public/validate/route.ts` - Endpoint público de API
- `app/developers/page.tsx` - Documentación de API

### 🔍 Verificación
- ✅ Plan FREE no tiene acceso a la página de API Keys
- ✅ Mensaje de "mejorar plan" cuando intenta acceder
- ✅ API pública requiere API Key válida (solo Pro/Business)

### ⚠️ Limitaciones
- No se puede automatizar validaciones
- No se puede integrar con sistemas contables
- No se puede usar en aplicaciones propias

---

## 7. 1 Usuario

### ✅ Funcionalidad Implementada
- **Solo el propietario de la cuenta**: No se pueden agregar usuarios adicionales.
- **Sin gestión de equipo**: No hay opción de invitar miembros.

### 📁 Archivos Relacionados
- `app/dashboard/equipo/page.tsx` - Página de gestión de equipo (solo Pro+)
- `lib/plans.ts` - Configuración: `users: 1`

### 🔍 Verificación
- ✅ Plan FREE no tiene acceso a la página de equipo
- ✅ Límite de 1 usuario está configurado correctamente

### ⚠️ Limitaciones
- No se puede compartir la cuenta con otros usuarios
- No hay roles ni permisos (solo un usuario)
- No se puede colaborar con un equipo

---

## 8. Soporte: FAQs

### ✅ Funcionalidad Implementada
- **Acceso a preguntas frecuentes**: Documentación básica disponible.
- **Sin soporte por email**: No hay soporte directo para plan FREE.
- **Sin soporte prioritario**: No hay canales de soporte dedicados.

### 📁 Archivos Relacionados
- Páginas de ayuda/FAQs (si existen)
- `lib/plans.ts` - Configuración: `support: "FAQs"`

### 🔍 Verificación
- ✅ Configuración correcta en `lib/plans.ts`
- ⚠️ Página de FAQs/ayuda podría necesitar implementación

### ⚠️ Limitaciones
- No hay soporte directo por email
- No hay chat en vivo
- Solo documentación y FAQs disponibles

---

## 9. Dashboard Básico

### ✅ Funcionalidad Implementada
- **Vista principal del dashboard**: Interfaz limpia y funcional.
- **Validación de RFCs**: Formulario principal para validar.
- **Estadísticas básicas**: Total, válidas, inválidas, uso mensual.
- **Header con información del plan**: Muestra plan actual y uso.

### 📁 Archivos Relacionados
- `app/dashboard/page.tsx` - Página principal del dashboard
- `components/dashboard/DashboardHeader.tsx` - Header con info del plan
- `components/dashboard/RFCValidator.tsx` - Formulario de validación
- `components/dashboard/DashboardStats.tsx` - Estadísticas básicas

### 🔍 Verificación
- ✅ Dashboard se carga correctamente para plan FREE
- ✅ Todas las funcionalidades básicas están disponibles
- ✅ Interfaz es clara y fácil de usar

### ⚠️ Limitaciones
- No incluye dashboard avanzado con gráficos
- No incluye análisis de tendencias
- No incluye proyecciones de uso

---

## 10. Límite: 10 Validaciones/Mes

### ✅ Funcionalidad Implementada
- **Límite mensual de 10 validaciones**: Configurado en `lib/plans.ts`.
- **Contador que se reinicia mensualmente**: Reset automático el día 1 de cada mes.
- **Alertas cuando se acerca al límite**: Notificaciones visuales.

### 📁 Archivos Relacionados
- `lib/plans.ts` - Configuración: `validationsPerMonth: 10`
- `app/api/validate/route.ts` - Verificación del límite
- `supabase/migrations/004_reset_monthly_rfc_counts.sql` - Reset mensual

### 🔍 Verificación
- ✅ Límite de 10 validaciones configurado correctamente
- ✅ Verificación del límite antes de validar
- ✅ Mensaje de error cuando se alcanza el límite
- ✅ Reset mensual programado con cron job

### ⚠️ Limitaciones
- Solo 10 validaciones por mes
- No se puede validar más hasta el próximo ciclo
- Debe mejorar el plan para obtener más validaciones

---

## 📝 Resumen de Funcionalidades

| # | Funcionalidad | Estado | Limitaciones |
|---|--------------|--------|--------------|
| 1 | Validaciones RFC (10/mes) | ✅ Completo | Solo 10 por mes |
| 2 | Resultados básicos | ✅ Completo | Solo válido/inválido |
| 3 | Estadísticas básicas | ✅ Completo | Sin gráficos avanzados |
| 4 | Historial | ❌ No disponible | No se guarda historial |
| 5 | Exportación | ❌ No disponible | No se puede exportar |
| 6 | API | ❌ No disponible | No hay acceso a API |
| 7 | Usuarios (1) | ✅ Completo | Solo 1 usuario |
| 8 | Soporte (FAQs) | ✅ Completo | Solo FAQs, sin email |
| 9 | Dashboard básico | ✅ Completo | Sin gráficos avanzados |
| 10 | Límite mensual | ✅ Completo | 10 validaciones/mes |

---

## 🎯 Objetivo del Plan FREE

El Plan FREE está diseñado para:
- **Probar el servicio**: Permitir que los usuarios prueben la plataforma sin compromiso.
- **Validaciones esporádicas**: Para usuarios que necesitan validar RFCs ocasionalmente.
- **Conversión a planes de pago**: Mostrar el valor del servicio para incentivar upgrades.

---

## 🔄 Flujo de Usuario FREE

1. **Registro**: Usuario se registra (sin tarjeta de crédito)
2. **Acceso al Dashboard**: Ve el dashboard básico
3. **Validar RFCs**: Puede validar hasta 10 RFCs por mes
4. **Ver Resultados**: Ve si cada RFC es válido o inválido
5. **Ver Estadísticas**: Ve total de validaciones y uso mensual
6. **Alcanzar Límite**: Cuando alcanza 10 validaciones, ve mensaje de upgrade
7. **Mejorar Plan**: Opción de mejorar a Pro o Business

---

## ✅ Checklist de Implementación

- [x] Límite de 10 validaciones/mes
- [x] Validación en tiempo real contra SAT
- [x] Resultados básicos (válido/inválido)
- [x] Estadísticas básicas de uso
- [x] Dashboard básico funcional
- [x] Contador mensual con reset automático
- [x] Alertas cuando se acerca al límite
- [x] Restricción de historial (no visible)
- [x] Restricción de exportación (no disponible)
- [x] Restricción de API (no disponible)
- [x] Límite de 1 usuario
- [x] Soporte: FAQs

---

## 🚀 Próximos Pasos

Para mejorar el Plan FREE, se podría considerar:
1. **Agregar página de FAQs**: Documentación básica para usuarios FREE
2. **Mejorar mensajes de upgrade**: Hacer más atractiva la conversión
3. **Agregar tutorial**: Guía rápida para nuevos usuarios
4. **Mostrar preview de features Pro**: Mostrar qué se obtiene al mejorar

---

**Fecha de revisión:** Diciembre 2024
**Estado:** ✅ COMPLETO Y FUNCIONAL

