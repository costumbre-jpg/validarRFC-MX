# 📋 Funcionalidades del Plan BUSINESS - Maflipp

## 💰 Precio
- **Mensual:** $999 MXN/mes
- **Anual:** $9,590 MXN/año (20% descuento)

---

## ✅ Lista de Funcionalidades a Revisar

### Funcionalidades Básicas (Heredadas de PRO)
1. ✅ Validaciones RFC (5,000/mes)
2. ✅ Historial de Validaciones (Ilimitado)
3. ✅ Exportación de Datos (CSV, Excel, PDF)
4. ✅ API Keys y Integración (10,000 llamadas/mes)
5. ✅ Alertas por Email
6. ✅ Dashboard Avanzado

### Funcionalidades Exclusivas de BUSINESS
7. ✅ Gestión de Equipo (Usuarios Ilimitados)
8. ✅ White Label
9. ✅ SSO (Single Sign-On)
10. ✅ SLA 99.9%
11. ✅ Soporte Prioritario (9am-6pm)
12. ✅ Dashboard Analytics
13. ✅ Validación CFDI
14. ✅ Onboarding Personalizado

---

## 📝 Estado de Revisión

| # | Funcionalidad | Estado | Notas |
|---|------| 1 | Validaciones RFC (5,000/mes) | ✅ Completo | Verificado: lib/plans.ts:96 → 5000, API y frontend usan getPlanValidationLimit |
| 2 | Historial de Validaciones | ✅ Completo | Ilimitado (sin restricción de días), paginación, exportación CSV/Excel |
| 3 | Exportación de Datos (CSV, Excel, PDF) | ✅ Completo | CSV ✅, Excel ✅, PDF ✅ (implementado con jsPDF) |
| 4 | API Keys (10,000 llamadas/mes) | ✅ Completo | Límite configurado, verificación en API, reset mensual, gestión completa |
| 5 | Alertas por Email | ✅ Completo | Preferencias, envíos (umbral/100%), resumen mensual, cron listo |
| 6 | Dashboard Avanzado | ✅ Completo | Uso diario 7d, tendencias 6m, tasa éxito, promedio diario, proyección |
| 7 | Gestión de Equipo (Ilimitado) | ✅ Completo | Invitaciones, roles, eliminación, RLS, sin límite de usuarios |
| 8 | White Label | ✅ Completo | Logo/nombre, ocultar Maflipp, colores en navegación/header/validador/exportación/botones; API y migración listas |
| 9 | SSO (Single Sign-On) | ✅ Completo | Login con Google OAuth (Supabase Auth), UI lista |
| 10 | SLA 99.9% | ⏳ Pendiente | No implementado; requiere monitoreo/status page |
| 11 | Soporte Prioritario | ⏳ Pendiente | |
| 12 | Dashboard Analytics | ✅ Completo | Uso diario 7d, tendencias 6m, tasa de éxito, promedio diario, proyección |
| 13 | Validación CFDI | ⏳ Próximamente | Vista informativa (solo Business); API real pendiente de PAC/SAT |
| 14 | Onboarding Personalizado | ✅ Completo | Formulario Business, guarda requerimientos en Supabase; endpoint `/api/onboarding` |

---

**Fecha de creación:** Diciembre 2024
**Estado:** En revisión

