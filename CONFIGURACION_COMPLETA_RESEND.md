# 📬 Configuración Completa de Resend - Guía Paso a Paso

Esta guía te lleva paso a paso para configurar Resend completamente y que los emails funcionen con tu dominio real.

---

## 📋 Paso 1: Crear Cuenta en Resend (5 minutos)

### 1.1 Registrarse
1. Ve a [resend.com](https://resend.com)
2. Click en **Sign Up** (Registrarse)
3. Puedes registrarte con:
   - Email y contraseña
   - Google
   - GitHub
4. Completa el registro

### 1.2 Verificar Email
1. Revisa tu email
2. Click en el link de verificación
3. Serás redirigido a Resend Dashboard

**✅ Completado:** Cuenta creada en Resend

---

## 📋 Paso 2: Obtener API Key (5 minutos)

### 2.1 Crear API Key
1. En Resend Dashboard, ve a **API Keys** (en el menú lateral)
2. Click en **Create API Key**
3. Dale un nombre (ej: "Maflipp Production")
4. Selecciona permisos:
   - **Full Access** (recomendado para empezar)
   - O **Sending Access** (solo para enviar emails)
5. Click en **Add**

### 2.2 Copiar API Key
1. **⚠️ IMPORTANTE:** Copia la API Key inmediatamente
2. Empieza con `re_...` (ej: `re_1234567890abcdefghijklmnopqrstuvwxyz`)
3. **No podrás verla de nuevo** después de cerrar esta ventana
4. Si la pierdes, tendrás que crear una nueva

### 2.3 Agregar a Vercel
1. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Environment Variables**
2. Busca `RESEND_API_KEY` (o créala si no existe)
3. Pega tu API Key
4. Selecciona los entornos: **Production**, **Preview**, **Development**
5. Click en **Save**

**✅ Completado:** API Key configurada

---

## 📋 Paso 3: Agregar Dominio en Resend (5 minutos)

### 3.1 Ir a Domains
1. En Resend Dashboard, ve a **Domains** (en el menú lateral)
2. Click en **Add Domain**

### 3.2 Agregar tu Dominio
1. En el campo de texto, ingresa tu dominio:
   - Ejemplo: `maflipp.com` (sin `https://` ni `www`)
2. Click en **Add Domain**

### 3.3 Ver Estado
Después de agregar, verás:
- **Estado:** "Pending" o "Verifying"
- **Mensaje:** "Add the following DNS records to verify your domain"

**✅ Completado:** Dominio agregado (pendiente de verificación)

---

## 📋 Paso 4: Obtener Registros DNS de Resend (2 minutos)

### 4.1 Ver Registros DNS
Después de agregar el dominio, Resend te mostrará los registros DNS que necesitas configurar.

**Ejemplo de lo que verás:**

```
SPF Record:
Tipo: TXT
Nombre: @
Valor: v=spf1 include:resend.com ~all

DKIM Record:
Tipo: CNAME
Nombre: resend._domainkey (o similar, Resend te dará el nombre exacto)
Valor: [VALOR ÚNICO QUE RESEND TE DA] (NO es "resend.com", es un valor único para tu dominio)

DMARC Record (Opcional pero Recomendado):
Tipo: TXT
Nombre: _dmarc
Valor: v=DMARC1; p=none; rua=mailto:dmarc@tu-dominio.com
```

**⚠️ IMPORTANTE:** 
- **Copia estos valores EXACTAMENTE como Resend te los muestra**
- **NO uses valores de ejemplo** - cada dominio tiene valores únicos
- El valor del CNAME de DKIM NO es "resend.com", es un valor único que Resend genera
- El nombre del CNAME también puede variar (puede ser `resend._domainkey` o similar)
- **Copia literalmente** lo que Resend te muestra en la pantalla

---

## 📋 Paso 5: Configurar DNS en tu Proveedor de Dominio (15-20 minutos)

### 5.1 Identificar tu Proveedor
¿Dónde compraste el dominio?
- **Namecheap** → Ve a la sección 5.2
- **GoDaddy** → Ve a la sección 5.3
- **Cloudflare** → Ve a la sección 5.4
- **Otro** → Ve a la sección 5.5

**⚠️ IMPORTANTE:** 
- **NO elimines** los registros DNS de Vercel
- Agrega los registros de Resend **además** de los de Vercel
- Ambos deben coexistir

---

### 5.2 Si compraste en Namecheap

1. **Inicia sesión** en [namecheap.com](https://www.namecheap.com)
2. Ve a **Domain List** → **Manage** → **Advanced DNS**
3. **Agrega el registro TXT para SPF:**
   - Click en **Add New Record**
   - Tipo: **TXT Record**
   - Host: `@` (o deja en blanco)
   - Value: `v=spf1 include:resend.com ~all` (el valor que Resend te dio)
   - TTL: **Automatic** (o 30 min)
   - Click en el checkmark (✓) para guardar
4. **Agrega el registro CNAME para DKIM:**
   - Click en **Add New Record**
   - Tipo: **CNAME Record**
   - Host: **[COPIA EXACTAMENTE el nombre que Resend te muestra]** (ej: `resend._domainkey` o similar)
   - Value: **[COPIA EXACTAMENTE el valor que Resend te muestra]** (NO uses "resend.com", es un valor único)
   - TTL: **Automatic** (o 30 min)
   - Click en el checkmark (✓) para guardar
5. **Agrega el registro TXT para DMARC (Opcional pero Recomendado):**
   - Click en **Add New Record**
   - Tipo: **TXT Record**
   - Host: `_dmarc`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com` (el valor que Resend te dio)
   - TTL: **Automatic** (o 30 min)
   - Click en el checkmark (✓) para guardar
6. **Espera 1-2 minutos** y verifica que los registros se guardaron

**✅ Completado:** DNS configurado en Namecheap

---

### 5.3 Si compraste en GoDaddy

1. **Inicia sesión** en [godaddy.com](https://www.godaddy.com)
2. Ve a **My Products** → **Domains** → **DNS**
3. **Agrega el registro TXT para SPF:**
   - Click en **Add**
   - Tipo: **TXT**
   - Nombre: `@` (o deja en blanco)
   - Valor: `v=spf1 include:resend.com ~all` (el valor que Resend te dio)
   - TTL: **600** (10 minutos)
   - Click en **Save**
4. **Agrega el registro CNAME para DKIM:**
   - Click en **Add**
   - Tipo: **CNAME**
   - Nombre: **[COPIA EXACTAMENTE el nombre que Resend te muestra]** (ej: `resend._domainkey` o similar)
   - Valor: **[COPIA EXACTAMENTE el valor que Resend te muestra]** (NO uses "resend.com", es un valor único)
   - TTL: **600** (10 minutos)
   - Click en **Save**
5. **Agrega el registro TXT para DMARC (Opcional pero Recomendado):**
   - Click en **Add**
   - Tipo: **TXT**
   - Nombre: `_dmarc`
   - Valor: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com` (el valor que Resend te dio)
   - TTL: **600** (10 minutos)
   - Click en **Save**

**✅ Completado:** DNS configurado en GoDaddy

---

### 5.4 Si compraste en Cloudflare

1. **Inicia sesión** en [cloudflare.com](https://www.cloudflare.com)
2. Selecciona tu dominio
3. Ve a **DNS** en el menú lateral
4. **Agrega el registro TXT para SPF:**
   - Click en **Add record**
   - Tipo: **TXT**
   - Nombre: `@` (o tu dominio sin www)
   - Content: `v=spf1 include:resend.com ~all` (el valor que Resend te dio)
   - Proxy status: **DNS only** (nube gris, no naranja)
   - Click en **Save**
5. **Agrega el registro CNAME para DKIM:**
   - Click en **Add record**
   - Tipo: **CNAME**
   - Nombre: **[COPIA EXACTAMENTE el nombre que Resend te muestra]** (ej: `resend._domainkey` o similar)
   - Target: **[COPIA EXACTAMENTE el valor que Resend te muestra]** (NO uses "resend.com", es un valor único)
   - Proxy status: **DNS only** (nube gris, no naranja)
   - Click en **Save**
6. **Agrega el registro TXT para DMARC (Opcional pero Recomendado):**
   - Click en **Add record**
   - Tipo: **TXT**
   - Nombre: `_dmarc`
   - Content: `v=DMARC1; p=none; rua=mailto:dmarc@maflipp.com` (el valor que Resend te dio)
   - Proxy status: **DNS only** (nube gris, no naranja)
   - Click en **Save**

**✅ Completado:** DNS configurado en Cloudflare

---

### 5.5 Si compraste en Otro Proveedor

**Pasos generales:**
1. Inicia sesión en tu proveedor de dominio
2. Busca la sección de **DNS Management**, **DNS Records**, o **Zone File**
3. **Agrega registro TXT para SPF:**
   - Tipo: **TXT**
   - Nombre/Host: `@` o dominio raíz
   - Valor/Value: El valor que Resend te dio para SPF
4. **Agrega registro CNAME para DKIM:**
   - Tipo: **CNAME**
   - Nombre/Host: **[COPIA EXACTAMENTE el nombre que Resend te muestra]** (ej: `resend._domainkey` o similar)
   - Valor/Value: **[COPIA EXACTAMENTE el valor que Resend te muestra]** (NO uses "resend.com", es un valor único generado por Resend)
5. **Agrega registro TXT para DMARC (Opcional):**
   - Tipo: **TXT**
   - Nombre/Host: `_dmarc`
   - Valor/Value: El valor que Resend te dio para DMARC
6. Guarda los cambios

**✅ Completado:** DNS configurado

---

## 📋 Paso 6: Esperar Verificación de Resend (1-24 horas)

### 6.1 Verificar Estado
1. Vuelve a Resend Dashboard → **Domains**
2. Verás el estado de tu dominio:
   - **"Pending"** o **"Verifying"** = Esperando verificación DNS
   - **"Verified"** ✅ = ¡Dominio verificado y listo!
   - **"Failed"** ❌ = Error en configuración DNS

### 6.2 Tiempo de Espera
- **Mínimo:** 5-15 minutos
- **Típico:** 1-4 horas
- **Máximo:** 24 horas (raro)

**💡 Tip:** Puedes verificar la propagación DNS en [whatsmydns.net](https://www.whatsmydns.net)

### 6.3 Verificar Manualmente
Si quieres verificar que los DNS están correctos:
1. Ve a [mxtoolbox.com](https://mxtoolbox.com)
2. Busca tu dominio
3. Verifica que los registros SPF y DKIM aparezcan

**✅ Completado:** Dominio verificado en Resend

---

## 📋 Paso 7: Actualizar Variable de Entorno en Vercel (5 minutos)

### 7.1 Actualizar RESEND_FROM_EMAIL
Una vez que el dominio esté verificado en Resend:

1. Ve a Vercel Dashboard → Tu Proyecto → **Settings** → **Environment Variables**
2. Busca `RESEND_FROM_EMAIL` (o créala si no existe)
3. Click en **Edit**
4. Cambia el valor:
   - **Antes:** `Maflipp <onboarding@resend.dev>` (dominio de prueba)
   - **Después:** `Maflipp <noreply@maflipp.com>` (tu dominio verificado)
5. Selecciona los entornos: **Production**, **Preview**, **Development**
6. Click en **Save**

### 7.2 Redeploy
1. Ve a **Deployments**
2. Click en los **3 puntos** del último deployment
3. Click en **Redeploy**
4. O simplemente haz un nuevo commit y push

**✅ Completado:** Variables actualizadas

---

## 📋 Paso 8: Probar Envío de Emails (5 minutos)

### 8.1 Probar desde Resend Dashboard
1. Ve a Resend Dashboard → **Emails**
2. Click en **Send Test Email**
3. Ingresa tu email
4. Click en **Send**
5. Revisa tu bandeja de entrada

### 8.2 Probar desde tu Aplicación
1. Ve a tu aplicación: `https://maflipp.com`
2. Prueba una funcionalidad que envíe email:
   - Invitar miembro del equipo
   - Configurar alertas por email
3. Verifica que recibes el email
4. Verifica que el remitente es `noreply@maflipp.com`

### 8.3 Verificar Logs
1. Ve a Resend Dashboard → **Emails**
2. Verás todos los emails enviados
3. Puedes ver el estado: **Delivered**, **Bounced**, **Failed**

**✅ Completado:** Emails funcionando correctamente

---

## 📋 Checklist Completo

### ✅ FASE 1: Cuenta y API Key
- [ ] Cuenta creada en Resend
- [ ] Email verificado
- [ ] API Key creada
- [ ] API Key agregada a Vercel (`RESEND_API_KEY`)

### ✅ FASE 2: Dominio
- [ ] Dominio agregado en Resend Dashboard
- [ ] Registros DNS copiados de Resend

### ✅ FASE 3: Configurar DNS
- [ ] Registro TXT para SPF configurado
- [ ] Registro CNAME para DKIM configurado
- [ ] Registro TXT para DMARC configurado (opcional)
- [ ] DNS guardado en proveedor de dominio

### ✅ FASE 4: Verificación
- [ ] Esperado 1-24 horas para verificación
- [ ] Dominio aparece como "Verified" en Resend

### ✅ FASE 5: Variables de Entorno
- [ ] `RESEND_FROM_EMAIL` actualizada en Vercel
- [ ] Redeploy realizado

### ✅ FASE 6: Pruebas
- [ ] Email de prueba enviado desde Resend Dashboard
- [ ] Email recibido correctamente
- [ ] Remitente es `noreply@maflipp.com`
- [ ] Emails de la aplicación funcionan

---

## 🆘 Troubleshooting

### El dominio no se verifica después de 24 horas

**Verifica:**
1. Los registros DNS están correctos en tu proveedor
2. Los valores coinciden exactamente con lo que Resend te dio
3. No hay espacios extra o caracteres incorrectos
4. Los registros tienen TTL bajo (600 o Automatic)

**Solución:**
- Usa [mxtoolbox.com](https://mxtoolbox.com) para verificar los registros DNS
- Verifica que SPF, DKIM y DMARC estén configurados
- Espera hasta 24 horas
- Contacta soporte de Resend si sigue fallando

### Error: "Invalid API Key"

**Causa:** La API Key no está configurada o es incorrecta

**Solución:**
1. Verifica que `RESEND_API_KEY` esté en Vercel
2. Verifica que la key empiece con `re_...`
3. Crea una nueva API Key si es necesario
4. Haz redeploy después de actualizar

### Error: "Domain not verified"

**Causa:** El dominio no está verificado en Resend

**Solución:**
1. Verifica que el dominio aparezca como "Verified" en Resend Dashboard
2. Si está "Pending", espera más tiempo
3. Si está "Failed", verifica los registros DNS

### Los emails no se envían

**Verifica:**
1. `RESEND_API_KEY` está configurada
2. `RESEND_FROM_EMAIL` usa el dominio verificado
3. El dominio está "Verified" en Resend
4. Revisa los logs en Resend Dashboard → Emails

**Solución:**
- Verifica los logs en Resend para ver el error específico
- Asegúrate de que el dominio esté verificado
- Verifica que `RESEND_FROM_EMAIL` use el dominio correcto

---

## 📊 Límites de Resend

### Plan Gratuito
- **3,000 emails/mes** gratis
- **100 emails/día** máximo
- Perfecto para empezar

### Plan Pro ($20/mes)
- **50,000 emails/mes**
- **Sin límite diario**
- Para producción

**💡 Recomendación:** Empieza con el plan gratuito. Si necesitas más, actualiza después.

---

## ✅ Resumen Ejecutivo

**Para configurar Resend completamente:**

1. **Crear cuenta** en Resend - 5 minutos
2. **Obtener API Key** y agregar a Vercel - 5 minutos
3. **Agregar dominio** en Resend - 5 minutos
4. **Configurar DNS** en tu proveedor - 15-20 minutos
5. **Esperar verificación** - 1-24 horas
6. **Actualizar variables** en Vercel - 5 minutos
7. **Probar emails** - 5 minutos

**Tiempo activo:** 35-45 minutos  
**Tiempo total:** 1-24 horas (incluyendo espera de verificación)

**Costo:** Gratis (hasta 3,000 emails/mes)

---

## 🎯 Siguiente Paso

Una vez que Resend esté configurado:

1. ✅ **Probar invitaciones de equipo** - Deben enviar emails
2. ✅ **Probar alertas por email** - Deben funcionar
3. ✅ **Verificar logs** en Resend Dashboard

**✅ ¡Listo! Resend está completamente configurado y funcionando!**

