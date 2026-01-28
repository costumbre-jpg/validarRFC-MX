# Instrucciones para hacer Backup con pg_dump
## Opción 2: Gratis (requiere instalar PostgreSQL)

---

## Paso 1: Instalar PostgreSQL

### Opción A: Instalar PostgreSQL completo (Recomendado)

1. **Descargar PostgreSQL**:
   - Ve a: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - O directamente: [enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
   - Descarga la versión más reciente (ej: PostgreSQL 16)

2. **Instalar**:
   - Ejecuta el instalador descargado
   - Durante la instalación:
     - ✅ Marca "Command Line Tools" (incluye pg_dump)
     - Anota la contraseña que pongas para el usuario `postgres` (la necesitarás)
     - Deja todo lo demás por defecto
   - Completa la instalación

3. **Verificar instalación**:
   - Abre PowerShell
   - Ejecuta:
     ```powershell
     pg_dump --version
     ```
   - Debería mostrar algo como: `pg_dump (PostgreSQL) 16.x`

---

### Opción B: Solo herramientas de línea de comandos (Más ligero)

Si no quieres instalar PostgreSQL completo, puedes usar solo las herramientas:

1. **Descargar solo las herramientas**:
   - Ve a: [postgresql.org/ftp/binary](https://www.postgresql.org/ftp/binary/)
   - Busca la versión más reciente
   - Descarga el archivo "win-x64-binaries" o similar
   - Extrae en una carpeta (ej: `C:\PostgreSQL\tools`)

2. **Agregar a PATH**:
   - Busca la carpeta `bin` dentro de lo que descargaste
   - Agrega esa ruta a las variables de entorno PATH de Windows
   - O usa la ruta completa en el comando

---

## Paso 2: Obtener Connection String de Supabase

1. **Ir a Supabase Dashboard**:
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión
   - Selecciona tu proyecto: `validaRFC-MX`

2. **Obtener Connection String**:
   - Settings (⚙️) → Database
   - Scroll hacia abajo hasta "Connection string"
   - Selecciona la pestaña **"URI"**
   - Copia el string completo
   - Tiene este formato:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres
     ```

3. **Obtener la contraseña**:
   - Si no la recuerdas, ve a Settings → Database → Database password
   - Puedes resetearla si es necesario
   - **IMPORTANTE**: Anota la contraseña, la necesitarás

---

## Paso 3: Hacer el Backup

### Método 1: Usando Connection String completo (Más fácil)

1. **Abrir PowerShell**:
   - Presiona `Win + X`
   - Selecciona "Windows PowerShell" o "Terminal"
   - O busca "PowerShell" en el menú inicio

2. **Navegar a donde quieres guardar el backup**:
   ```powershell
   cd C:\Users\loorj\Documents
   mkdir backups_maflipp
   cd backups_maflipp
   ```

3. **Ejecutar pg_dump**:
   ```powershell
   # Reemplaza [YOUR-PASSWORD] con tu contraseña real de Supabase
   # Reemplaza la fecha con la de hoy
   
   pg_dump "postgresql://postgres:TU_PASSWORD_AQUI@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
   ```

   **Ejemplo real** (reemplaza con tus datos):
   ```powershell
   pg_dump "postgresql://postgres:MiPassword123@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
   ```

4. **Esperar**:
   - El proceso puede tardar varios minutos
   - Verás que el cursor parpadea, es normal
   - No cierres la ventana hasta que termine

5. **Verificar**:
   ```powershell
   # Ver si el archivo se creó
   ls backup_maflipp_*.sql
   
   # Ver el tamaño del archivo
   (Get-Item backup_maflipp_*.sql).Length
   ```
   - El archivo debería tener varios MB (no estar vacío)

---

### Método 2: Usando variables separadas (Más seguro)

Si prefieres no poner la contraseña directamente en el comando:

1. **En PowerShell**:
   ```powershell
   # Establecer variable de entorno (solo para esta sesión)
   $env:PGPASSWORD = "TU_PASSWORD_AQUI"
   
   # Ejecutar pg_dump
   pg_dump -h db.lkrwnutofhzyvtbbsrwh.supabase.co -U postgres -d postgres > backup_maflipp_2025-01-27.sql
   ```

2. **Limpiar variable** (opcional, por seguridad):
   ```powershell
   $env:PGPASSWORD = $null
   ```

---

## Paso 4: Verificar el Backup

1. **Verificar que el archivo existe**:
   ```powershell
   ls backup_maflipp_*.sql
   ```

2. **Ver el tamaño**:
   - El archivo debería tener al menos algunos MB
   - Si está vacío o muy pequeño (menos de 1 KB), algo salió mal

3. **Abrir y revisar** (opcional):
   - Abre el archivo `.sql` con un editor de texto (Notepad++, VS Code)
   - Deberías ver comandos SQL como `CREATE TABLE`, `INSERT INTO`, etc.
   - Si solo ves errores o está vacío, repite el proceso

---

## 🆘 Solución de Problemas

### Problema: "pg_dump: command not found" o "no se reconoce como comando"

**Solución**:
- PostgreSQL no está instalado o no está en el PATH
- Instala PostgreSQL completo (Paso 1, Opción A)
- O usa la ruta completa: `C:\Program Files\PostgreSQL\16\bin\pg_dump.exe`

### Problema: "password authentication failed"

**Solución**:
- La contraseña es incorrecta
- Ve a Supabase → Settings → Database → Database password
- Resetea la contraseña si es necesario
- Usa la contraseña correcta en el comando

### Problema: "could not connect to server"

**Solución**:
- Verifica que el Connection String es correcto
- Verifica que tu conexión a internet funciona
- Verifica que el proyecto de Supabase está activo

### Problema: El archivo está vacío o muy pequeño

**Solución**:
- Puede que no haya datos en la base de datos (normal si es un MVP)
- O hubo un error durante el backup
- Revisa si hay mensajes de error en PowerShell
- Intenta de nuevo

### Problema: "permission denied" o errores de escritura

**Solución**:
- Verifica que tienes permisos para escribir en la carpeta
- Intenta guardar en otra ubicación (ej: `C:\Users\loorj\Desktop\`)

---

## ✅ Checklist Final

Después de hacer el backup:

- [ ] Archivo `.sql` creado: `backup_maflipp_2025-01-27.sql`
- [ ] Archivo tiene tamaño (no está vacío)
- [ ] Archivo guardado en lugar seguro
- [ ] Documentado en `CREDENCIALES_ACTUALES.md`:
  - [ ] Ubicación del backup
  - [ ] Fecha del backup

---

## 📝 Notas Importantes

- **Seguridad**: El archivo `.sql` contiene todos tus datos. Guárdalo en lugar seguro.
- **NO compartir**: No compartas este archivo hasta cerrar la venta.
- **Tamaño**: El backup puede ser grande si tienes muchos datos. Es normal.
- **Tiempo**: El proceso puede tardar 5-15 minutos dependiendo del tamaño de la base de datos.

---

**¿Listo?** Sigue estos pasos y tendrás tu backup completo. 🎉

---

**Última actualización**: Enero 2025
