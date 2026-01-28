# Encontrar dónde está instalado PostgreSQL

## Método 1: Buscar manualmente

1. **Abre el Explorador de archivos** (Win + E)

2. **Busca en estas ubicaciones**:
   - `C:\Program Files\PostgreSQL\`
   - `C:\Program Files (x86)\PostgreSQL\`
   - `C:\PostgreSQL\`

3. **Dentro encontrarás carpetas con números** (versiones):
   - Ejemplo: `PostgreSQL\16\` o `PostgreSQL\15\` o `PostgreSQL\14\`

4. **Dentro de la carpeta de versión, busca**:
   - `bin\pg_dump.exe`

5. **Anota la ruta completa**, por ejemplo:
   - `C:\Program Files\PostgreSQL\16\bin\pg_dump.exe`

---

## Método 2: Buscar desde PowerShell

Ejecuta esto en PowerShell:

```powershell
# Buscar en Program Files
Get-ChildItem "C:\Program Files\PostgreSQL" -Recurse -Filter "pg_dump.exe" -ErrorAction SilentlyContinue | Select-Object FullName

# Buscar en Program Files (x86)
Get-ChildItem "C:\Program Files (x86)\PostgreSQL" -Recurse -Filter "pg_dump.exe" -ErrorAction SilentlyContinue | Select-Object FullName

# Buscar en otras ubicaciones comunes
Get-ChildItem "C:\PostgreSQL" -Recurse -Filter "pg_dump.exe" -ErrorAction SilentlyContinue | Select-Object FullName
```

---

## Una vez que encuentres la ruta

Usa la ruta completa en el comando:

```powershell
# Ejemplo (reemplaza con tu ruta real):
"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" "postgresql://postgres:TU_PASSWORD@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
```

---

## Alternativa: Agregar al PATH (permanente)

Si quieres que funcione sin la ruta completa:

1. **Busca la carpeta `bin`** donde está `pg_dump.exe`
   - Ejemplo: `C:\Program Files\PostgreSQL\16\bin\`

2. **Agregar al PATH**:
   - Presiona `Win + X` → Sistema
   - Click en "Configuración avanzada del sistema"
   - Click en "Variables de entorno"
   - En "Variables del sistema", busca "Path"
   - Click en "Editar"
   - Click en "Nuevo"
   - Pega la ruta: `C:\Program Files\PostgreSQL\16\bin\` (o la que encontraste)
   - Click en "Aceptar" en todas las ventanas
   - **Cierra y abre PowerShell de nuevo**

3. **Verificar**:
   ```powershell
   pg_dump --version
   ```

---

**¿Puedes buscar la carpeta de PostgreSQL y decirme qué ruta encontraste?**
