# Solución: pg_dump no encontrado

## El problema
PostgreSQL no está instalado o no está en el PATH de Windows.

---

## Solución Rápida: Instalar PostgreSQL

### Paso 1: Descargar PostgreSQL

1. **Ve a esta página**:
   - [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - O directamente: [enterprisedb.com/downloads/postgres-postgresql-downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2. **Descarga el instalador**:
   - Busca "Windows x86-64" (64-bit)
   - Descarga la versión más reciente (ej: PostgreSQL 16.x)
   - El archivo será algo como: `postgresql-16.x-x64-windows.exe`

### Paso 2: Instalar

1. **Ejecuta el instalador**:
   - Doble click en el archivo descargado
   - Click en "Next" varias veces

2. **Configuración importante**:
   - **Componentes**: Asegúrate de que "Command Line Tools" esté marcado ✅
   - **Data Directory**: Déjalo por defecto
   - **Password**: Pon una contraseña para el usuario `postgres` (anótala, la necesitarás)
   - **Port**: Déjalo en 5432 (por defecto)
   - **Locale**: Déjalo por defecto

3. **Completa la instalación**:
   - Click en "Next" hasta que termine
   - Marca "Launch Stack Builder" si quieres (opcional, no necesario)

### Paso 3: Verificar instalación

1. **Cerrar y abrir PowerShell de nuevo** (importante, para que cargue el PATH)

2. **Verificar que pg_dump funciona**:
   ```powershell
   pg_dump --version
   ```

3. **Si funciona**, deberías ver algo como:
   ```
   pg_dump (PostgreSQL) 16.x
   ```

### Paso 4: Hacer el backup (de nuevo)

Ahora que PostgreSQL está instalado:

```powershell
# Ya estás en la carpeta correcta, solo ejecuta:
pg_dump "postgresql://postgres:TU_PASSWORD_REAL@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
```

**Reemplaza `TU_PASSWORD_REAL` con tu contraseña real de Supabase**.

---

## Alternativa: Si no quieres instalar PostgreSQL

### Opción A: Upgrade temporal a Pro Plan (MÁS FÁCIL)

1. Ve a Supabase Dashboard
2. Settings → Billing → Upgrade to Pro
3. Espera unos minutos
4. Settings → Database → Backups → Create backup
5. Descarga el backup
6. (Opcional) Cancela el upgrade después

**Cuesta ~$25/mes pero puedes cancelar después del backup.**

---

### Opción B: Usar herramienta online (Alternativa)

Puedes usar herramientas online que no requieren instalación:

1. **Supabase SQL Editor** (exportar manualmente):
   - Dashboard → SQL Editor
   - Ejecutar queries para exportar datos tabla por tabla
   - **Limitación**: No exporta estructura completa automáticamente

2. **Herramientas de terceros**:
   - [dbdiagram.io](https://dbdiagram.io) - Para visualizar schema
   - [pgAdmin](https://www.pgadmin.org/download/) - Interfaz gráfica (también requiere instalación)

---

## Recomendación

**Si quieres hacerlo gratis**: Instala PostgreSQL (Paso 1-3 arriba) - toma 10-15 minutos

**Si quieres hacerlo rápido**: Upgrade temporal a Pro Plan - toma 5 minutos pero cuesta $25

---

## Verificar PATH (si ya instalaste PostgreSQL)

Si ya instalaste PostgreSQL pero sigue sin funcionar:

1. **Buscar dónde está instalado**:
   - Normalmente en: `C:\Program Files\PostgreSQL\16\bin\`
   - O: `C:\Program Files (x86)\PostgreSQL\16\bin\`

2. **Usar la ruta completa**:
   ```powershell
   "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" "postgresql://postgres:TU_PASSWORD@db.lkrwnutofhzyvtbbsrwh.supabase.co:5432/postgres" > backup_maflipp_2025-01-27.sql
   ```

3. **O agregar al PATH**:
   - Busca "Variables de entorno" en Windows
   - Agrega `C:\Program Files\PostgreSQL\16\bin\` al PATH
   - Reinicia PowerShell

---

**¿Cuál opción prefieres?** Te recomiendo instalar PostgreSQL si tienes 15 minutos, o el upgrade temporal si quieres hacerlo rápido.
