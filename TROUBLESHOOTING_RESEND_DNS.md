# 🔍 Troubleshooting: Resend DNS No Funciona

Guía para diagnosticar y solucionar problemas cuando los registros DNS de Resend no se verifican.

---

## 🔍 Paso 1: Verificar qué Muestra Resend

### 1.1 Ver Estado Actual
1. Ve a Resend Dashboard → **Domains**
2. Click en tu dominio (`maflipp.com`)
3. Verás el estado:
   - **"Pending"** = Esperando verificación
   - **"Verifying"** = Verificando DNS
   - **"Verified"** ✅ = Funcionando
   - **"Failed"** ❌ = Error en DNS

### 1.2 Ver Mensajes de Error
Si hay un error, Resend te mostrará qué registro está fallando:
- "SPF record not found"
- "DKIM record not found"
- "DMARC record not found"

**Anota qué registro está fallando** - ese es el que necesitamos corregir.

---

## 🔍 Paso 2: Verificar DNS con Herramientas Externas

### 2.1 Verificar SPF
1. Ve a [mxtoolbox.com](https://mxtoolbox.com/spf.aspx)
2. Ingresa tu dominio: `maflipp.com`
3. Click en **SPF Record Lookup**
4. **Debería mostrar:** `v=spf1 include:resend.com ~all`

**Si no aparece o está mal:**
- El registro TXT para SPF no está configurado correctamente
- O aún no se ha propagado

### 2.2 Verificar DKIM
1. Ve a [mxtoolbox.com](https://mxtoolbox.com)
2. Busca: `resend._domainkey.maflipp.com` (o el nombre que Resend te dio)
3. Click en **CNAME Record Lookup**
4. **Debería mostrar:** El valor que Resend te dio

**Si no aparece:**
- El registro CNAME para DKIM no está configurado correctamente
- O el nombre del registro está mal

### 2.3 Verificar DMARC
1. Ve a [mxtoolbox.com](https://mxtoolbox.com/dmarc.aspx)
2. Ingresa tu dominio: `maflipp.com`
3. Click en **DMARC Record Lookup**
4. **Debería mostrar:** El valor de DMARC que Resend te dio

---

## 🔍 Paso 3: Verificar en tu Proveedor de Dominio

### 3.1 Verificar que los Registros Existan

**En tu proveedor de dominio (Namecheap, GoDaddy, etc.):**

1. Ve a la sección de DNS Management
2. **Verifica que veas estos 3 registros:**

   **Registro 1 - SPF (TXT):**
   - Tipo: TXT
   - Nombre: `@` (o dominio raíz)
   - Valor: `v=spf1 include:resend.com ~all`

   **Registro 2 - DKIM (CNAME):**
   - Tipo: CNAME
   - Nombre: `resend._domainkey` (o el que Resend te dio)
   - Valor: [El valor único que Resend te dio]

   **Registro 3 - DMARC (TXT - Opcional):**
   - Tipo: TXT
   - Nombre: `_dmarc`
   - Valor: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com`

### 3.2 Errores Comunes

#### Error 1: Espacios Extra
**❌ Incorrecto:**
```
Valor: ` v=spf1 include:resend.com ~all ` (con espacios al inicio/final)
```

**✅ Correcto:**
```
Valor: `v=spf1 include:resend.com ~all` (sin espacios)
```

#### Error 2: Comillas
**❌ Incorrecto:**
```
Valor: `"v=spf1 include:resend.com ~all"` (con comillas)
```

**✅ Correcto:**
```
Valor: `v=spf1 include:resend.com ~all` (sin comillas)
```

#### Error 3: Nombre del CNAME Incorrecto
**❌ Incorrecto:**
```
Nombre: `resend._domainkey.maflipp.com` (con el dominio completo)
```

**✅ Correcto:**
```
Nombre: `resend._domainkey` (solo el nombre, sin el dominio)
```

#### Error 4: Valor del CNAME con Punto Final
**❌ Incorrecto:**
```
Valor: `algo.resend.com.` (con punto al final)
```

**✅ Correcto:**
```
Valor: `algo.resend.com` (sin punto al final)
```

#### Error 5: TTL Muy Alto
**❌ Incorrecto:**
```
TTL: 86400 (24 horas) - Tarda mucho en propagarse
```

**✅ Correcto:**
```
TTL: 600 (10 minutos) o Automatic - Se propaga más rápido
```

---

## 🔍 Paso 4: Verificar Propagación DNS

### 4.1 Usar Herramienta de Verificación
1. Ve a [whatsmydns.net](https://www.whatsmydns.net)
2. Selecciona el tipo de registro:
   - **TXT** para SPF y DMARC
   - **CNAME** para DKIM
3. Ingresa el nombre del registro
4. Verifica en múltiples ubicaciones

**Si aparece en algunas ubicaciones pero no en todas:**
- Los DNS están propagándose (espera más tiempo)

**Si no aparece en ninguna ubicación:**
- Los registros no están configurados correctamente

---

## 🔍 Paso 5: Soluciones Específicas por Problema

### Problema: "SPF record not found"

**Solución:**
1. Verifica que el registro TXT para SPF exista
2. Verifica que el nombre sea `@` (o dominio raíz)
3. Verifica que el valor sea exactamente: `v=spf1 include:resend.com ~all`
4. Sin espacios, sin comillas
5. Espera 15-60 minutos y verifica de nuevo

### Problema: "DKIM record not found"

**Solución:**
1. Verifica que el registro CNAME para DKIM exista
2. Verifica que el nombre sea exactamente el que Resend te dio (ej: `resend._domainkey`)
3. **NO incluyas el dominio completo** en el nombre
4. Verifica que el valor sea exactamente el que Resend te dio
5. Sin punto al final del valor
6. Espera 15-60 minutos y verifica de nuevo

### Problema: "DMARC record not found"

**Solución:**
1. Verifica que el registro TXT para DMARC exista
2. Verifica que el nombre sea exactamente `_dmarc`
3. Verifica que el valor sea el que Resend te dio
4. Sin espacios, sin comillas
5. Espera 15-60 minutos y verifica de nuevo

### Problema: "All records found but still pending"

**Solución:**
1. Espera más tiempo (puede tardar hasta 24 horas)
2. Click en **Refresh** o **Verify** en Resend Dashboard
3. Verifica que los TTL sean bajos (600 o Automatic)
4. Contacta soporte de Resend si pasa más de 24 horas

---

## 🔍 Paso 6: Verificar Formato Correcto

### Ejemplo Correcto para Namecheap:

```
Registro 1:
Tipo: TXT Record
Host: @
Value: v=spf1 include:resend.com ~all
TTL: Automatic

Registro 2:
Tipo: CNAME Record
Host: resend._domainkey
Value: [valor-único-de-resend].resend.com
TTL: Automatic

Registro 3:
Tipo: TXT Record
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com
TTL: Automatic
```

### Ejemplo Correcto para GoDaddy:

```
Registro 1:
Tipo: TXT
Nombre: @
Valor: v=spf1 include:resend.com ~all
TTL: 600

Registro 2:
Tipo: CNAME
Nombre: resend._domainkey
Valor: [valor-único-de-resend].resend.com
TTL: 600

Registro 3:
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com
TTL: 600
```

---

## 🔍 Paso 7: Eliminar y Recrear Registros

Si nada funciona, intenta esto:

### 7.1 Eliminar Registros Existentes
1. En tu proveedor de dominio, **elimina** los registros de Resend
2. Espera 5-10 minutos

### 7.2 Recrear Registros
1. Vuelve a Resend Dashboard → Domains
2. Copia **nuevamente** los valores exactos
3. Agrega los registros uno por uno en tu proveedor
4. Verifica que no haya espacios o caracteres extra
5. Guarda cada registro

### 7.3 Esperar y Verificar
1. Espera 15-60 minutos
2. Vuelve a Resend Dashboard
3. Click en **Refresh** o **Verify**
4. Verifica el estado

---

## 🆘 Si Nada Funciona

### Contactar Soporte de Resend
1. Ve a Resend Dashboard → **Support** o **Help**
2. Explica el problema
3. Incluye:
   - Tu dominio
   - Qué registros configuraste
   - Capturas de pantalla de tus DNS
   - Resultados de mxtoolbox.com

### Verificar con tu Proveedor de Dominio
1. Contacta soporte de tu proveedor (Namecheap, GoDaddy, etc.)
2. Pregunta si hay algún problema con los registros DNS
3. Pregunta si hay algún límite o restricción

---

## ✅ Checklist de Verificación

- [ ] Los 3 registros (SPF, DKIM, DMARC) están en tu proveedor de dominio
- [ ] Los valores coinciden EXACTAMENTE con lo que Resend muestra
- [ ] No hay espacios extra al inicio o final
- [ ] No hay comillas alrededor de los valores
- [ ] El nombre del CNAME es correcto (sin dominio completo)
- [ ] El valor del CNAME no tiene punto al final
- [ ] TTL está en 600 o Automatic
- [ ] Esperaste al menos 15-60 minutos
- [ ] Verificaste en mxtoolbox.com que los registros aparecen
- [ ] Click en Refresh/Verify en Resend Dashboard

---

## 💡 Tips Finales

1. **Paciencia:** Los DNS pueden tardar hasta 24 horas en propagarse completamente
2. **Verifica en múltiples herramientas:** mxtoolbox.com, whatsmydns.net
3. **Copia y pega directamente:** No escribas manualmente, copia exactamente
4. **Un registro a la vez:** Agrega un registro, guarda, verifica, luego el siguiente
5. **Screenshots:** Toma capturas de pantalla de lo que configuraste para referencia

---

**✅ Sigue estos pasos y deberías poder resolver el problema!**

