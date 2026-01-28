# Script de Backup - Maflipp
## Comandos para hacer backups antes de la venta

---

## 📦 Backup de Base de Datos (Supabase)

### Opción 1: Desde Dashboard (Más fácil)

1. Ir a Supabase Dashboard
2. Settings → Database → Backups
3. Click en "Download backup" o "Create backup"
4. Guardar archivo como: `backup_maflipp_YYYY-MM-DD.sql`

### Opción 2: Desde CLI (pg_dump)

```bash
# Obtener connection string desde Supabase Dashboard:
# Settings → Database → Connection string → URI

# Ejemplo de comando:
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql

# O usando variables:
export PGPASSWORD="tu-password"
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup_maflipp_2025-01-27.sql
```

### Verificar Backup

```bash
# Verificar que el archivo existe y tiene contenido
ls -lh backup_maflipp_*.sql

# Ver primeras líneas para confirmar
head -20 backup_maflipp_*.sql
```

---

## 📁 Backup de Storage (Supabase)

### Desde Dashboard

1. Ir a Supabase Dashboard
2. Storage → Buckets
3. Para cada bucket (`avatars`, `branding`):
   - Abrir bucket
   - Seleccionar todos los archivos
   - Download (si hay muchos, hacerlo por lotes)

### Guardar en carpeta organizada

```bash
# Crear estructura de carpetas
mkdir -p backups/storage/avatars
mkdir -p backups/storage/branding

# Mover archivos descargados a estas carpetas
# (hacerlo manualmente desde el explorador de archivos)
```

---

## 💻 Backup de Código (Git)

### Crear Tag de Versión

```bash
# Asegurar que todo está commiteado
git status

# Si hay cambios, commitear:
git add .
git commit -m "Preparación para venta - backup final"

# Crear tag de versión
git tag -a v1.0-transfer -m "Versión para transferencia - Enero 2025"

# Push del tag
git push origin v1.0-transfer
```

### Crear Branch de Transferencia

```bash
# Crear branch
git checkout -b transfer-ready

# Push del branch
git push origin transfer-ready
```

### Verificar que no hay credenciales

```bash
# Buscar posibles credenciales hardcodeadas
grep -r "sk_live\|sk_test" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "eyJ" . --exclude-dir=node_modules --exclude-dir=.git | head -5
grep -r "supabase.co" . --exclude-dir=node_modules --exclude-dir=.git | grep -v ".md\|.template"
```

---

## 📋 Checklist de Backups

Después de ejecutar los comandos, verificar:

- [ ] Backup SQL creado: `backup_maflipp_YYYY-MM-DD.sql`
- [ ] Archivos de Storage descargados (si hay)
- [ ] Tag de versión creado: `v1.0-transfer`
- [ ] Branch de transferencia creado: `transfer-ready`
- [ ] Todo documentado en `CREDENCIALES_ACTUALES.md`

---

## 🔒 Seguridad

**IMPORTANTE**:
- Guardar backups en lugar seguro (encriptado si es posible)
- NO subir backups a repositorios públicos
- NO compartir backups hasta cerrar la venta
- Después de la venta, mantener backups por seguridad (30-60 días)

---

**Fecha de backup**: `________________________________`  
**Ubicación de backups**: `________________________________`
