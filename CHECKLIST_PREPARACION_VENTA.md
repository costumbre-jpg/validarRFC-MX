# Checklist de Preparación para Venta
## Lo que SÍ puedes hacer SIN comprador

---

## ✅ Fase 1: Documentación (HACER AHORA)

### Credenciales
- [ ] Llenar `CREDENCIALES_ACTUALES.md` con toda la información
- [ ] Documentar URLs de proyectos (Supabase, Vercel)
- [ ] Listar todas las variables de entorno configuradas
- [ ] Documentar configuración de servicios (Stripe, Resend, etc.)

### Documentación de Venta
- [ ] Revisar y personalizar `SALES_EMAIL.md`
- [ ] Revisar `ONE_PAGER.md` (ya está listo)
- [ ] Revisar `RESUMEN_EJECUTIVO_VENTA.md` (ya está listo)
- [ ] Revisar `DATASHEET_VENTA.md` (ya está listo)
- [ ] Revisar `ANUNCIO_VENTA.md` (creado)

---

## ✅ Fase 2: Backups (HACER AHORA)

### Base de Datos
- [ ] Exportar backup SQL desde Supabase Dashboard
  - Settings → Database → Backups → Download backup
  - O usar: `pg_dump` desde CLI
- [ ] Guardar backup en lugar seguro
- [ ] Nombrar archivo: `backup_maflipp_YYYY-MM-DD.sql`
- [ ] Verificar que el backup se puede importar (probar localmente si es posible)

### Storage (Supabase)
- [ ] Descargar todos los archivos del bucket `avatars` (si hay)
- [ ] Descargar todos los archivos del bucket `branding` (si hay)
- [ ] Guardar archivos en carpeta: `backups/storage/`
- [ ] Documentar ubicación en `CREDENCIALES_ACTUALES.md`

### Código
- [ ] Asegurar que el repo Git está actualizado
- [ ] Crear tag de versión: `git tag v1.0-transfer`
- [ ] Crear branch de transferencia: `git checkout -b transfer-ready`
- [ ] Verificar que no hay credenciales hardcodeadas en el código
- [ ] Verificar que `.env.local` está en `.gitignore`

---

## ✅ Fase 3: Verificación (HACER AHORA)

### Demo Funcional
- [ ] Verificar que login/registro funciona
- [ ] Verificar que validación RFC funciona (modo demo)
- [ ] Verificar que dashboard carga correctamente
- [ ] Verificar que exportaciones funcionan (CSV/Excel/PDF)
- [ ] Verificar que API pública responde (crear API key de prueba)
- [ ] Verificar que white label funciona (si aplica)
- [ ] Verificar que onboarding funciona
- [ ] Documentar cualquier problema encontrado

### Documentación Técnica
- [ ] Verificar que `README.md` está actualizado
- [ ] Verificar que `HANDOFF.md` está completo
- [ ] Verificar que `TRANSFERENCIA_CUENTAS.md` está completo
- [ ] Verificar que `API_DOCUMENTATION.md` está completo
- [ ] Verificar que `MIGRACIONES_LISTA.md` está completo

---

## ✅ Fase 4: Materiales Visuales (RECOMENDADO)

### Screenshots
- [ ] Landing page
- [ ] Dashboard principal
- [ ] Historial de validaciones
- [ ] Exportaciones (CSV/Excel/PDF)
- [ ] White label (si aplica)
- [ ] API documentation page
- [ ] Pricing page
- [ ] Guardar en carpeta: `screenshots/`

### Video Demo (Opcional pero recomendado)
- [ ] Grabar video demo corto (2-3 min)
- [ ] Mostrar: registro → login → validación → historial → exportación
- [ ] Subir a YouTube (unlisted) o guardar localmente

---

## ✅ Fase 5: Preparar Anuncio (HACER AHORA)

### Anuncio para Marketplaces
- [ ] Revisar `ANUNCIO_VENTA.md`
- [ ] Personalizar con tu información
- [ ] Preparar para Microacquire.com
- [ ] Preparar para Flippa.com
- [ ] Preparar para Indie Hackers / Twitter

### Email de Outreach
- [ ] Personalizar `SALES_EMAIL.md` con tu nombre
- [ ] Preparar lista de contactos potenciales
- [ ] Preparar mensaje para LinkedIn

---

## ✅ Fase 6: Git y Repositorio (HACER AHORA)

- [ ] Verificar que todo está commiteado
- [ ] Crear tag de versión para transferencia
- [ ] Verificar que no hay información sensible en el repo
- [ ] Preparar repo para compartir (privado o público según prefieras)

---

## 📝 Notas Importantes

### NO Hacer (hasta tener comprador)
- ❌ NO transferir cuentas (necesitas destino del comprador)
- ❌ NO compartir credenciales (hasta cerrar venta)
- ❌ NO cambiar configuraciones de producción

### SÍ Hacer (ahora)
- ✅ Documentar todo
- ✅ Hacer backups
- ✅ Verificar que todo funciona
- ✅ Preparar materiales de venta
- ✅ Publicar anuncio

---

## 🎯 Próximos Pasos

Una vez completes este checklist:

1. **Publicar anuncio** en marketplaces
2. **Enviar emails** de outreach
3. **Compartir en redes** (Twitter, LinkedIn, Indie Hackers)
4. **Esperar respuestas** de compradores potenciales
5. **Hacer demo** a interesados
6. **Negociar términos** con compradores serios
7. **Cerrar venta** y hacer transferencia

---

**Fecha de inicio**: `________________________________`  
**Fecha de finalización**: `________________________________`
