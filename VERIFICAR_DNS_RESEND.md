# 🔍 Verificar DNS de Resend - Paso a Paso

Guía para verificar qué registros DNS tienes y qué te falta para Resend.

---

## 📋 Paso 1: Ver qué Registros Necesitas en Resend

### 1.1 Ver Registros Requeridos
1. Ve a Resend Dashboard → **Domains**
2. Click en tu dominio (`maflipp.com`)
3. Verás una sección que dice "Add the following DNS records"
4. **Copia exactamente** los 3 registros que te muestra:
   - **SPF (TXT)**
   - **DKIM (CNAME)**
   - **DMARC (TXT)** - Opcional pero recomendado

**⚠️ IMPORTANTE:** Anota exactamente:
- El **nombre** de cada registro
- El **valor** de cada registro
- El **tipo** de cada registro

---

## 📋 Paso 2: Ver qué Registros Tienes en Namecheap

### 2.1 Ir a Advanced DNS
1. Ve a Namecheap → **Domain List** → **Manage** → **Advanced DNS**
2. Verás una lista de todos tus registros DNS

### 2.2 Identificar Registros de Resend
Busca estos registros:

**Registro 1 - SPF (TXT):**
- Tipo: **TXT Record**
- Host: `@` (o en blanco)
- Value: Debe contener `include:resend.com`

**Registro 2 - DKIM (CNAME):**
- Tipo: **CNAME Record**
- Host: `resend._domainkey` (o similar)
- Value: Debe ser un dominio como `[algo].resend.com`

**Registro 3 - DMARC (TXT):**
- Tipo: **TXT Record**
- Host: `_dmarc`
- Value: Debe contener `v=DMARC1`

---

## 📋 Paso 3: Comparar y Corregir

### 3.1 Verificar SPF

**En Namecheap, busca un registro TXT con:**
- Host: `@`
- Value que contenga: `include:resend.com`

**Si NO existe o está mal:**
1. Elimina el registro incorrecto (si existe)
2. Agrega nuevo registro:
   - Tipo: **TXT Record**
   - Host: `@`
   - Value: `v=spf1 include:resend.com ~all` (el valor exacto que Resend te muestra)
   - TTL: **Automatic**

**⚠️ NOTA:** Si tienes un registro SPF de Amazon SES (`include:amazonses.com`), puedes:
- **Opción A:** Eliminarlo y usar solo Resend
- **Opción B:** Combinar ambos: `v=spf1 include:amazonses.com include:resend.com ~all`

### 3.2 Verificar DKIM

**En Namecheap, busca un registro CNAME con:**
- Host: `resend._domainkey` (o el nombre que Resend te dio)
- Value que sea un dominio (ej: `[algo].resend.com`)

**Si NO existe o el valor está mal:**
1. **Elimina el registro incorrecto** (el que tiene `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBIQKBgG`)
2. Ve a Resend Dashboard y copia el valor EXACTO del CNAME
3. Agrega nuevo registro:
   - Tipo: **CNAME Record**
   - Host: `resend._domainkey` (o el nombre exacto que Resend te muestra)
   - Value: **[COPIA EXACTAMENTE el valor que Resend te muestra]** (debe ser un dominio, no una clave)
   - TTL: **Automatic**

**⚠️ IMPORTANTE:** 
- El valor del CNAME debe ser un **dominio/hostname** (ej: `abc123.resend.com`)
- **NO** debe ser una clave pública que empieza con `p=`
- **NO** debe tener punto al final

### 3.3 Verificar DMARC

**En Namecheap, busca un registro TXT con:**
- Host: `_dmarc`
- Value que contenga: `v=DMARC1`

**Si NO existe:**
1. Agrega nuevo registro:
   - Tipo: **TXT Record**
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com` (o el valor que Resend te muestra)
   - TTL: **Automatic**

---

## 📋 Paso 4: Checklist de Verificación

### En Namecheap, verifica que tengas:

- [ ] **Registro TXT para SPF:**
  - Host: `@`
  - Value: `v=spf1 include:resend.com ~all` (o el valor exacto de Resend)

- [ ] **Registro CNAME para DKIM:**
  - Host: `resend._domainkey` (o el nombre exacto de Resend)
  - Value: Un dominio como `[algo].resend.com` (NO una clave pública)

- [ ] **Registro TXT para DMARC (Opcional):**
  - Host: `_dmarc`
  - Value: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com` (o el valor de Resend)

### Registros que DEBES mantener (de Vercel):

- [ ] **Registro A:**
  - Host: `@`
  - Value: `216.198.79.1` (o el IP de Vercel)

- [ ] **Registro CNAME para www:**
  - Host: `www`
  - Value: `764af5942c9b622c.vercel-dns-017.com.` (o el de Vercel)

**⚠️ NO elimines estos registros de Vercel!**

---

## 📋 Paso 5: Pasos Específicos para Corregir

### 5.1 Eliminar Registro CNAME Incorrecto
1. En Namecheap Advanced DNS
2. Encuentra el registro CNAME con Host `resend._domainke` (o similar)
3. Click en el ícono de basura (🗑️) para eliminarlo
4. Click en **SAVE ALL CHANGES**

### 5.2 Agregar Registro CNAME Correcto
1. Click en **+ ADD NEW RECORD**
2. Selecciona **CNAME Record** del dropdown
3. **Host:** Ingresa exactamente el nombre que Resend te muestra (ej: `resend._domainkey`)
4. **Value:** Copia EXACTAMENTE el valor que Resend te muestra (debe ser un dominio)
5. **TTL:** Selecciona **Automatic**
6. Click en el checkmark (✓) para guardar
7. Click en **SAVE ALL CHANGES**

### 5.3 Verificar SPF
1. Busca el registro TXT con Host `@`
2. Si el Value es `v=spf1 include:amazonses.com ~all`:
   - **Opción A:** Elimínalo y agrega el de Resend
   - **Opción B:** Cámbialo a: `v=spf1 include:amazonses.com include:resend.com ~all`
3. Si no existe, agrega el de Resend

### 5.4 Agregar DMARC (si no existe)
1. Click en **+ ADD NEW RECORD**
2. Selecciona **TXT Record**
3. **Host:** `_dmarc`
4. **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com`
5. **TTL:** **Automatic**
6. Click en el checkmark (✓)
7. Click en **SAVE ALL CHANGES**

---

## 📋 Paso 6: Esperar y Verificar

### 6.1 Esperar Propagación
1. Espera **15-60 minutos** después de guardar los cambios
2. Los DNS necesitan tiempo para propagarse

### 6.2 Verificar en Resend
1. Vuelve a Resend Dashboard → **Domains**
2. Click en tu dominio
3. Click en **Refresh** o **Verify**
4. El estado debería cambiar de "Pending" a "Verified"

### 6.3 Verificar con Herramientas Externas
1. Ve a [mxtoolbox.com](https://mxtoolbox.com)
2. Verifica SPF: Busca `maflipp.com` → SPF Record
3. Verifica DKIM: Busca `resend._domainkey.maflipp.com` → CNAME Record
4. Verifica DMARC: Busca `maflipp.com` → DMARC Record

---

## 🆘 Si Sigue Pendiente

### Verificar Errores Comunes:

1. **Valor del CNAME incorrecto:**
   - ❌ `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBIQKBgG` (clave pública)
   - ✅ `[código-único].resend.com` (dominio)

2. **Nombre del CNAME incorrecto:**
   - ❌ `resend._domainkey.maflipp.com` (con dominio completo)
   - ✅ `resend._domainkey` (solo el nombre)

3. **Espacios extra:**
   - ❌ ` v=spf1 include:resend.com ~all ` (con espacios)
   - ✅ `v=spf1 include:resend.com ~all` (sin espacios)

4. **Punto al final:**
   - ❌ `algo.resend.com.` (con punto)
   - ✅ `algo.resend.com` (sin punto)

---

## ✅ Resumen de Acciones

1. **Eliminar** el registro CNAME incorrecto (el que tiene la clave pública)
2. **Agregar** el registro CNAME correcto con el valor de Resend (debe ser un dominio)
3. **Verificar** que el SPF incluya `include:resend.com`
4. **Agregar** DMARC si no existe
5. **Guardar** todos los cambios
6. **Esperar** 15-60 minutos
7. **Verificar** en Resend Dashboard

---

**✅ Sigue estos pasos y debería funcionar!**

