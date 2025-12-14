# 🔍 Revisión: Validación CFDI - Plan BUSINESS

## ⏳ Estado: PRÓXIMAMENTE

La validación CFDI se mostrará como “Próximamente” para clientes Business. El formulario y el mock fueron retirados; la integración real (PAC/SAT) está pendiente de proveedor.

---

## Implementación actual
- Página `app/dashboard/cfdi/page.tsx`: muestra mensaje “Próximamente” (solo Business).
- Menú Business incluye “CFDI” apuntando a esa vista informativa.
- Sin formulario ni llamadas; la API real está pendiente del proveedor (PAC/SAT).

## Checklist
- [x] Vista informativa “Próximamente” (solo Business)
- [ ] Integración real con PAC/SAT
- [ ] Endpoint `/api/validate-cfdi` conectado a proveedor

---

## Notas
- Se requiere un PAC o integración SAT CFDI; hoy no se consulta al SAT.

---

**Estado actual:** funcional a nivel de UI/flujo, pero solo mock (sin consulta real al SAT).***

