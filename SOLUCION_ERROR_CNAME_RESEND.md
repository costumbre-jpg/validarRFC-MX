# 🔧 Solución: Error en Value del CNAME de Resend

Guía para solucionar el error en el campo "Value" del registro CNAME de DKIM.

---

## 🔍 Problema Común

Cuando intentas agregar el registro CNAME para DKIM en Namecheap, el campo "Value" muestra un error (línea roja o exclamación).

---

## ✅ Solución: Verificar el Valor Correcto

### Paso 1: Ver el Valor Exacto en Resend

1. Ve a **Resend Dashboard** → **Domains**
2. Click en tu dominio (`maflipp.com`)
3. Busca la sección **"DKIM Record"** o **"CNAME Record"**
4. Verás algo como:

```
DKIM Record:
Tipo: CNAME
Nombre: resend._domainkey
Valor: [algo-único].resend.com
```

**⚠️ IMPORTANTE:** 
- El valor debe ser un **dominio/hostname** (ej: `abc123.resend.com`)
- **NO** debe ser una clave pública que empieza con `p=`
- **NO** debe tener espacios
- **NO** debe tener punto al final (`.`)

---

## 🔍 Errores Comunes y Soluciones

### Error 1: Valor es una Clave Pública

**❌ Incorrecto:**
```
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBIQKBgG...
```

**✅ Correcto:**
```
Value: abc123.resend.com
```

**Solución:** El valor del CNAME debe ser un dominio, no una clave pública. Si Resend te muestra una clave pública, probablemente estás viendo el registro TXT de DKIM, no el CNAME. Busca el registro **CNAME** específicamente.

---

### Error 2: Punto al Final

**❌ Incorrecto:**
```
Value: abc123.resend.com.
```

**✅ Correcto:**
```
Value: abc123.resend.com
```

**Solución:** Elimina el punto (`.`) al final del valor.

---

### Error 3: Espacios Extra

**❌ Incorrecto:**
```
Value:  abc123.resend.com 
```

**✅ Correcto:**
```
Value: abc123.resend.com
```

**Solución:** Elimina todos los espacios al inicio y final.

---

### Error 4: Nombre Incorrecto

**❌ Incorrecto:**
```
Host: resend._domainkey.maflipp.com
```

**✅ Correcto:**
```
Host: resend._domainkey
```

**Solución:** El nombre del CNAME debe ser solo `resend._domainkey` (o el que Resend te muestra), **sin** el dominio completo.

---

### Error 5: Copiando el Valor Incorrecto

**Problema:** Resend puede mostrar múltiples registros. Asegúrate de copiar el del **CNAME**, no el del TXT.

**Solución:**
1. En Resend Dashboard, busca específicamente el registro **CNAME**
2. NO copies el registro TXT (ese tiene la clave pública)
3. Copia solo el valor del **CNAME**

---

## 📋 Pasos Específicos para Namecheap

### Paso 1: Ver el Valor en Resend
1. Resend Dashboard → Domains → Click en `maflipp.com`
2. Busca el registro que dice **"CNAME"** (no TXT)
3. Copia el **valor** exacto (debe ser un dominio)

### Paso 2: Agregar en Namecheap
1. Namecheap → Advanced DNS
2. Click en **"+ ADD NEW RECORD"**
3. Tipo: **CNAME Record**
4. **Host:** `resend._domainkey` (o el nombre exacto que Resend muestra)
5. **Value:** [Pega el valor que copiaste de Resend]
   - Debe ser un dominio (ej: `abc123.resend.com`)
   - Sin espacios
   - Sin punto al final
6. **TTL:** **Automatic**
7. Click en el checkmark (✓)

### Paso 3: Verificar
- El campo Value NO debe tener línea roja
- NO debe tener ícono de error
- Debe verse como un dominio válido

---

## 🔍 Si el Error Persiste

### Verificar el Formato del Valor

El valor del CNAME debe cumplir estas reglas:
- ✅ Debe ser un hostname/dominio válido
- ✅ Debe contener solo letras, números, puntos y guiones
- ✅ NO debe empezar o terminar con punto
- ✅ NO debe tener espacios
- ✅ Debe terminar en `.resend.com` o similar

### Ejemplos de Valores Correctos:
```
abc123.resend.com
xyz789.dkim.resend.com
key123.resend.com
```

### Ejemplos de Valores Incorrectos:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBIQKBgG (clave pública)
abc123.resend.com. (con punto al final)
 abc123.resend.com  (con espacios)
```

---

## 🆘 Si Resend No Muestra un Valor de CNAME

Si Resend solo muestra un registro TXT con una clave pública, puede ser que:

1. **Resend esté usando un formato diferente:**
   - Algunas veces Resend usa TXT en lugar de CNAME
   - Verifica si hay un registro TXT para DKIM
   - Si es así, usa ese registro TXT en lugar de CNAME

2. **El dominio aún no está completamente configurado:**
   - Espera unos minutos
   - Refresca la página de Resend
   - Los registros pueden aparecer después

3. **Contactar soporte de Resend:**
   - Si no ves ningún registro CNAME o TXT para DKIM
   - Contacta soporte de Resend para verificar

---

## ✅ Checklist de Verificación

Antes de guardar el registro CNAME, verifica:

- [ ] El valor es un dominio (ej: `abc123.resend.com`)
- [ ] NO es una clave pública que empieza con `p=`
- [ ] NO tiene punto al final
- [ ] NO tiene espacios al inicio o final
- [ ] El nombre del Host es correcto (ej: `resend._domainkey`)
- [ ] El tipo es **CNAME Record** (no TXT)
- [ ] TTL está en **Automatic**

---

## 💡 Tip Final

**Si el error persiste:**
1. Toma una captura de pantalla de lo que Resend te muestra
2. Toma una captura de pantalla del error en Namecheap
3. Compara ambos para ver qué está diferente
4. Asegúrate de copiar EXACTAMENTE el valor, carácter por carácter

---

**✅ Sigue estos pasos y el error debería desaparecer!**

