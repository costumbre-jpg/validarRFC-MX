# Guía de Backups - Paso a Paso
## Cómo hacer backups antes de vender

---

## 📦 1. Backup de Base de Datos (Supabase)

### ⚠️ IMPORTANTE: Plan Free de Supabase

**Si estás en el plan Free de Supabase**, NO tienes acceso a backups automáticos.  
Tienes estas opciones:

---

### Opción A: Exportar desde SQL Editor (MÁS FÁCIL para Plan Free)

1. **Ir a Supabase Dashboard**:
   - Abre tu navegador
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión con tu cuenta

2. **Ir a SQL Editor**:
   - En el menú lateral, click en **SQL Editor**
   - Click en **"New query"**

3. **Exportar todas las tablas**:
   - Copia y pega este script SQL (exporta estructura y datos):
   ```sql
   -- Exportar estructura y datos de todas las tablas
   -- Esto creará un script SQL completo
   ```
   
   **Mejor opción**: Usa el botón de exportar del SQL Editor:
   - Ejecuta una query simple: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
   - O ve directamente a la **Opción B** (pg_dump) que es más completa

---

### Opción B: Usar pg_dump desde tu computadora (RECOMENDADO para Plan Free)

**Necesitas tener PostgreSQL instalado o usar una herramienta online**

#### Paso 1: Obtener Connection String

1. En Supabase Dashboard:
   - Settings → Database → Connection string
   - Selecciona **"URI"**
   - Copia el string (tiene formato: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

#### Paso 2: Instalar PostgreSQL (si no lo tienes)

**Opción 1: Instalar PostgreSQL completo**:
- Descarga desde: [postgresql.org/download](https://www.postgresql.org/download/)
- Instala PostgreSQL (incluye `pg_dump`)

**Opción 2: Usar herramienta online** (más fácil):
- Ve a: [supabase-sql-editor.com](https://supabase-sql-editor.com) (herramienta de terceros)
- O usa: [dbdiagram.io](https://dbdiagram.io) para visualizar schema

**Opción 3: Usar Docker** (si tienes Docker):
```bash
docker run --rm -e PGPASSWORD=tu_password postgres:latest pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup.sql
```

#### Paso 3: Ejecutar pg_dump

**En PowerShell (Windows)**:
```powershell
# Reemplaza [PASSWORD] y [PROJECT-REF] con tus datos reales
# Ejemplo: postgresql://postgres:TU_PASSWORD@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres

pg_dump "postgresql://postgres:TU_PASSWORD@db.TU_PROJECT.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
```

**Si tienes problemas con pg_dump**, usa la **Opción C** (upgrade temporal).

---

### Opción C: Upgrade Temporal al Plan Pro (Solo para hacer backup)

1. **Upgrade a Pro Plan** (temporalmente):
   - En Supabase Dashboard → Settings → Billing
   - Click en **"Upgrade to Pro"**
   - El plan Pro cuesta aproximadamente $25/mes
   - **Puedes cancelar después de hacer el backup**

2. **Hacer backup**:
   - Espera unos minutos a que se active el plan Pro
   - Ve a Settings → Database → Backups
   - Click en **"Create backup"**
   - Descarga el backup

3. **Cancelar upgrade** (opcional):
   - Después de hacer el backup, puedes volver al plan Free
   - Settings → Billing → Downgrade

**Nota**: Esta opción cuesta dinero, pero es la más fácil si no quieres instalar herramientas.

---

### Opción D: Exportar Tabla por Tabla (Manual, si no tienes otra opción)

1. **Ir a Table Editor en Supabase**:
   - Dashboard → Table Editor
   - Para cada tabla:
     - Click en la tabla
     - Click en "..." (menú) → "Export" → "CSV" o "JSON"
     - Descarga el archivo
   
2. **Limitation**: Esto solo exporta datos, no la estructura (schema)
   - Necesitarías también exportar el schema desde SQL Editor

**Esta opción es tediosa y no recomendada**, pero funciona si no tienes otra alternativa.

---

### Guardar el Backup

Una vez tengas el archivo `.sql`:
- Renómbralo: `backup_maflipp_2025-01-27.sql` (usa la fecha de hoy)
- Guárdalo en una carpeta segura: `C:\Users\loorj\Documents\backups_maflipp\`
- Verifica que el archivo tiene tamaño (no está vacío)

---

### Opción B: Desde CLI (Si prefieres usar terminal)

**Solo si tienes PostgreSQL instalado localmente**

1. **Obtener Connection String**:
   - Ve a Supabase Dashboard
   - Settings → Database → Connection string
   - Copia el "URI" (tiene formato: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

2. **Abrir PowerShell o Terminal**:
   - Presiona `Win + X` → Windows PowerShell
   - O busca "PowerShell" en el menú inicio

3. **Ejecutar comando**:
   ```powershell
   # Reemplaza [PASSWORD] y [PROJECT-REF] con tus datos reales
   pg_dump "postgresql://postgres:TU_PASSWORD@db.TU_PROJECT.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
   ```

4. **Verificar**:
   ```powershell
   # Ver si el archivo se creó
   ls backup_maflipp_*.sql
   ```

**Nota**: Si no tienes `pg_dump` instalado, usa la Opción A (Dashboard) que es más fácil.

---

## 📁 2. Backup de Storage (Archivos en Supabase)

### Si tienes archivos en Storage buckets:

1. **Ir a Storage en Supabase**:
   - Dashboard → **Storage** (en el menú lateral)
   - Verás una lista de buckets: `avatars`, `branding`, etc.

2. **Para cada bucket que tenga archivos**:

   **Bucket `avatars`** (si tiene archivos):
   - Click en el bucket `avatars`
   - Verás lista de archivos
   - Selecciona todos (Ctrl+A o click en checkbox)
   - Click en **"Download"** o **"Download all"**
   - Guarda los archivos en: `C:\Users\loorj\Documents\backups_maflipp\storage\avatars\`

   **Bucket `branding`** (si tiene archivos):
   - Click en el bucket `branding`
   - Selecciona todos los archivos
   - Click en **"Download"**
   - Guarda en: `C:\Users\loorj\Documents\backups_maflipp\storage\branding\`

3. **Si no hay archivos**:
   - Si los buckets están vacíos, no necesitas hacer backup
   - Puedes saltarte este paso

---

## 💻 3. Backup de Código (Git)

### Crear Tag de Versión

1. **Abrir Terminal en tu proyecto**:
   - Abre VS Code o Cursor
   - Abre la terminal integrada: `Ctrl + Ñ` o `View → Terminal`

2. **Verificar que todo está guardado**:
   ```bash
   git status
   ```
   - Si hay archivos sin guardar, primero haz commit:
   ```bash
   git add .
   git commit -m "Preparación para venta - backup final"
   ```

3. **Crear tag de versión**:
   ```bash
   git tag -a v1.0-transfer -m "Versión para transferencia - Enero 2025"
   ```

4. **Subir el tag a GitHub/GitLab**:
   ```bash
   git push origin v1.0-transfer
   ```

5. **Verificar**:
   ```bash
   git tag
   ```
   - Deberías ver `v1.0-transfer` en la lista

---

## ✅ Checklist de Verificación

Después de hacer los backups, verifica:

- [ ] **Backup de base de datos**:
  - [ ] Archivo descargado: `backup_maflipp_YYYY-MM-DD.sql`
  - [ ] Archivo tiene tamaño (no está vacío)
  - [ ] Guardado en lugar seguro

- [ ] **Backup de Storage** (si aplica):
  - [ ] Archivos de `avatars` descargados (si había)
  - [ ] Archivos de `branding` descargados (si había)
  - [ ] Guardados en carpetas organizadas

- [ ] **Tag de versión en Git**:
  - [ ] Tag creado: `v1.0-transfer`
  - [ ] Tag subido a repositorio remoto
  - [ ] Verificado con `git tag`

---

## 📂 Estructura de Carpetas Recomendada

Crea esta estructura para organizar tus backups:

```
C:\Users\loorj\Documents\backups_maflipp\
├── backup_maflipp_2025-01-27.sql          (Backup de base de datos)
├── storage\
│   ├── avatars\                            (Archivos de avatars, si hay)
│   └── branding\                           (Archivos de branding, si hay)
└── README.txt                              (Nota: "Backups para venta - NO compartir")
```

---

## 🔒 Seguridad de Backups

**IMPORTANTE**:
- ✅ Guarda los backups en lugar seguro (no en carpeta pública)
- ✅ NO subas backups a repositorios públicos de Git
- ✅ NO compartas backups hasta cerrar la venta
- ✅ Mantén backups por 30-60 días después de la venta (por seguridad)

---

## 🆘 Problemas Comunes

### Problema: "Free Plan does not include project backups"
**Solución**: 
- ✅ **Opción B**: Usar `pg_dump` desde tu computadora (gratis)
- ✅ **Opción C**: Upgrade temporal a Pro Plan ($25/mes, cancelable después)
- ✅ **Opción D**: Exportar tabla por tabla manualmente (tedioso)

**Recomendación**: Si no tienes PostgreSQL instalado, la **Opción C** (upgrade temporal) es la más rápida y fácil.

### Problema: El backup es muy grande y tarda mucho
**Solución**:
- Es normal si tienes muchos datos
- Déjalo descargar, puede tardar varios minutos
- Verifica que tu conexión a internet es estable

### Problema: No puedo descargar archivos de Storage
**Solución**:
- Si hay muchos archivos, descárgalos por lotes
- O usa la API de Supabase (más avanzado)
- Si no hay archivos importantes, puedes saltarte este paso

### Problema: No tengo Git configurado
**Solución**:
- Si no usas Git, puedes saltarte el paso del tag
- O simplemente comprimir la carpeta del proyecto en un ZIP
- Guarda el ZIP como: `maflipp_codigo_2025-01-27.zip`

---

## ⏱️ Tiempo Estimado

- **Backup de base de datos**: 5-15 minutos (depende del tamaño)
- **Backup de Storage**: 5-10 minutos (si hay archivos)
- **Tag de Git**: 2 minutos
- **Total**: 15-30 minutos aproximadamente

---

## 📝 Documentar en CREDENCIALES_ACTUALES.md

Después de hacer los backups, actualiza `CREDENCIALES_ACTUALES.md`:

- [ ] Marcar checkbox de "Backup SQL exportado"
- [ ] Escribir ubicación del backup
- [ ] Escribir fecha del backup
- [ ] Si descargaste Storage, marcar esos checkboxes también

---

**¿Listo?** Una vez completes estos pasos, tendrás todos los backups necesarios para la venta. 🎉

---

**Última actualización**: Enero 2025
