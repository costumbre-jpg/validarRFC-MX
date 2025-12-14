# 🔍 Revisión: White Label - Plan BUSINESS

## ⚠️ Estado: PARCIALMENTE IMPLEMENTADO

---

## Qué se implementó (v1)
- Página de configuración `Dashboard > White Label` (solo Business).
- Guardado de ajustes en Supabase vía `/api/branding`:
  - Nombre de marca.
  - URL de logo.
  - Colores primario y secundario.
  - Opción de ocultar marca Maflipp.
- Tabla y RLS: migración `010_white_label.sql` (`white_label_settings` con updated_at y políticas por usuario).
- Branding aplicado en navegación:
  - Sidebar y Mobile Sidebar muestran logo/brand name personalizado y pueden ocultar la marca Maflipp.
  - Link de menú “White Label” visible solo para Business.

## Qué falta para llamarlo “completo”
- Aplicar colores personalizados al resto del dashboard (botones, acentos, gráficos) usando los colores guardados.
- Aplicar branding en header/títulos/CTA de Dashboard.
- Dominios personalizados / favicons / meta-tags.
- Emails con branding del cliente.

## Detalles técnicos
- API `app/api/branding/route.ts`: GET/POST con verificación de plan Business.
- Migración `010_white_label.sql`: tabla `white_label_settings`, RLS, trigger updated_at.
- UI `app/dashboard/white-label/page.tsx`: formulario con brand name, logo URL, colores, toggle ocultar marca.
- Sidebar/MobileSidebar consumen `branding` (logo o texto, y opción de ocultar Maflipp).
- Layout (`app/dashboard/layout.tsx`) carga branding autenticado y pasa a Sidebar/MobileSidebar; en modo diseño usa valores por defecto.

## Checklist
- [x] Tabla + RLS en Supabase (`010_white_label.sql`)
- [x] API GET/POST con verificación de plan Business
- [x] UI de configuración en dashboard (Business)
- [x] Logo/nombre personalizado en sidebar/mobile
- [x] Opción para ocultar marca Maflipp en la navegación
- [ ] Colores aplicados globalmente al dashboard
- [ ] Branding en header/CTA/gráficos
- [ ] Dominio/Favicon/Emails custom

## Recomendación
Completar la segunda fase para marcar White Label como “completo”:
- Inyectar colores (CSS vars) desde `branding` para botones, links y acentos.
- Branding en header y acciones principales.
- (Opcional) Dominio personalizado y emails brandizados.

---

**Estado actual:** usable en navegación con logo y nombre propios; configuración persistente en BD; falta aplicar colores y resto del branding global.***

