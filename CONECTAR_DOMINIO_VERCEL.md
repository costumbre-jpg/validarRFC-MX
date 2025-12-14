# 🔗 Conectar Dominio con Vercel - Guía Paso a Paso

Esta guía te muestra exactamente cómo conectar tu dominio recién comprado con Vercel.

---

## 📋 Paso 1: Agregar Dominio en Vercel (5 minutos)

### 1.1 Ir a Vercel Dashboard
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Selecciona tu proyecto (validarFC.MX o el nombre que tenga)
3. Click en **Settings** (Configuración)
4. Click en **Domains** (Dominios)

### 1.2 Agregar el Dominio
1. Click en el botón **Add Domain** (Agregar Dominio)
2. En el campo de texto, ingresa tu dominio:
   - Ejemplo: `maflipp.com` (sin `https://` ni `www`)
3. Click en **Add**

### 1.3 Agregar www (Opcional pero Recomendado)
1. Click en **Add Domain** de nuevo
2. Ingresa: `www.maflipp.com`
3. Click en **Add**

**✅ Completado:** Dominio agregado en Vercel (aparecerá como "Pending" o "Configuring")

---

## 📋 Paso 2: Obtener Registros DNS de Vercel (2 minutos)

### 2.1 Ver los Registros DNS
Después de agregar el dominio, Vercel te mostrará los registros DNS que necesitas configurar.

**Ejemplo de lo que verás:**

```
Para maflipp.com:
Tipo: A
Nombre: @
Valor: 76.76.21.21

Para www.maflipp.com:
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

**⚠️ IMPORTANTE:** 
- **Copia estos valores** - los necesitarás en el siguiente paso
- Los valores pueden ser diferentes para tu dominio
- Anota exactamente lo que Vercel te muestra

---

## 📋 Paso 3: Configurar DNS en tu Proveedor de Dominio (10-15 minutos)

### 3.1 Identificar tu Proveedor
¿Dónde compraste el dominio?
- **Namecheap** → Ve a la sección 3.2
- **GoDaddy** → Ve a la sección 3.3
- **Cloudflare** → Ve a la sección 3.4
- **Otro** → Ve a la sección 3.5

---

### 3.2 Si compraste en Namecheap

1. **Inicia sesión** en [namecheap.com](https://www.namecheap.com)
2. Ve a **Domain List** (Lista de Dominios)
3. Click en **Manage** al lado de tu dominio
4. Ve a la pestaña **Advanced DNS**
5. **Elimina registros existentes** (si hay):
   - Click en el ícono de basura (🗑️) de cada registro
6. **Agrega el registro A:**
   - Click en **Add New Record**
   - Tipo: **A Record**
   - Host: `@` (o deja en blanco)
   - Value: `76.76.21.21` (el valor que Vercel te dio)
   - TTL: **Automatic** (o 30 min)
   - Click en el checkmark (✓) para guardar
7. **Agrega el registro CNAME para www:**
   - Click en **Add New Record**
   - Tipo: **CNAME Record**
   - Host: `www`
   - Value: `cname.vercel-dns.com` (el valor que Vercel te dio)
   - TTL: **Automatic** (o 30 min)
   - Click en el checkmark (✓) para guardar
8. **Espera 1-2 minutos** y verifica que los registros se guardaron

**✅ Completado:** DNS configurado en Namecheap

---

### 3.3 Si compraste en GoDaddy

1. **Inicia sesión** en [godaddy.com](https://www.godaddy.com)
2. Ve a **My Products** → **Domains**
3. Click en tu dominio
4. Click en **DNS** (o **Manage DNS**)
5. **Elimina registros existentes** (si hay):
   - Click en los 3 puntos (⋯) → **Delete** de cada registro
6. **Agrega el registro A:**
   - Click en **Add**
   - Tipo: **A**
   - Nombre: `@` (o deja en blanco)
   - Valor: `76.76.21.21` (el valor que Vercel te dio)
   - TTL: **600** (10 minutos)
   - Click en **Save**
7. **Agrega el registro CNAME para www:**
   - Click en **Add**
   - Tipo: **CNAME**
   - Nombre: `www`
   - Valor: `cname.vercel-dns.com` (el valor que Vercel te dio)
   - TTL: **600** (10 minutos)
   - Click en **Save**

**✅ Completado:** DNS configurado en GoDaddy

---

### 3.4 Si compraste en Cloudflare

1. **Inicia sesión** en [cloudflare.com](https://www.cloudflare.com)
2. Selecciona tu dominio
3. Ve a **DNS** en el menú lateral
4. **Elimina registros existentes** (si hay):
   - Click en **Delete** de cada registro
5. **Agrega el registro A:**
   - Click en **Add record**
   - Tipo: **A**
   - Nombre: `@` (o tu dominio sin www)
   - IPv4 address: `76.76.21.21` (el valor que Vercel te dio)
   - Proxy status: **DNS only** (nube gris, no naranja)
   - Click en **Save**
6. **Agrega el registro CNAME para www:**
   - Click en **Add record**
   - Tipo: **CNAME**
   - Nombre: `www`
   - Target: `cname.vercel-dns.com` (el valor que Vercel te dio)
   - Proxy status: **DNS only** (nube gris, no naranja)
   - Click en **Save**

**✅ Completado:** DNS configurado en Cloudflare

---

### 3.5 Si compraste en Otro Proveedor

**Pasos generales:**
1. Inicia sesión en tu proveedor de dominio
2. Busca la sección de **DNS Management**, **DNS Records**, o **Zone File**
3. **Elimina registros existentes** (si hay)
4. **Agrega registro A:**
   - Tipo: **A**
   - Nombre/Host: `@` o dominio raíz
   - Valor/Value: El valor que Vercel te dio (ej: `76.76.21.21`)
5. **Agrega registro CNAME:**
   - Tipo: **CNAME**
   - Nombre/Host: `www`
   - Valor/Value: El valor que Vercel te dio (ej: `cname.vercel-dns.com`)
6. Guarda los cambios

**✅ Completado:** DNS configurado

---

## 📋 Paso 4: Verificar en Vercel (5-10 minutos)

### 4.1 Esperar Propagación DNS
1. Vuelve a Vercel Dashboard → Tu Proyecto → **Settings** → **Domains**
2. Verás el estado de tu dominio:
   - **"Pending"** o **"Configuring"** = Esperando DNS
   - **"Valid"** ✅ = ¡Funcionando!
   - **"Invalid"** ❌ = Error en configuración

### 4.2 Tiempo de Espera
- **Mínimo:** 1-5 minutos
- **Típico:** 15-60 minutos
- **Máximo:** 48 horas (raro)

**💡 Tip:** Puedes verificar la propagación en [whatsmydns.net](https://www.whatsmydns.net)

### 4.3 Verificar SSL/HTTPS
Una vez que el dominio esté "Valid":
1. Vercel configurará automáticamente el SSL/HTTPS
2. Esto puede tardar 1-10 minutos adicionales
3. Verás un candado verde (🔒) cuando esté listo

**✅ Completado:** Dominio conectado y funcionando

---

## 📋 Paso 5: Probar que Funciona (2 minutos)

### 5.1 Probar el Dominio
1. Abre una nueva pestaña en tu navegador
2. Ve a: `https://tu-dominio.com` (ej: `https://maflipp.com`)
3. **Debería cargar tu sitio** ✅

### 5.2 Probar www
1. Ve a: `https://www.tu-dominio.com` (ej: `https://www.maflipp.com`)
2. **Debería redirigir o cargar tu sitio** ✅

**✅ Completado:** Dominio funcionando correctamente

---

## 🆘 Troubleshooting

### El dominio sigue en "Pending" después de 1 hora

**Verifica:**
1. Los registros DNS están correctos en tu proveedor
2. Los valores coinciden exactamente con lo que Vercel te dio
3. No hay espacios extra o caracteres incorrectos

**Solución:**
- Usa [whatsmydns.net](https://www.whatsmydns.net) para verificar propagación
- Verifica que los registros A y CNAME estén correctos
- Espera hasta 48 horas (aunque generalmente es más rápido)

### Error: "Invalid Configuration"

**Causas comunes:**
- Registros DNS incorrectos
- Valores mal copiados
- TTL muy alto (usa 600 o Automatic)

**Solución:**
- Verifica que los valores coincidan exactamente
- Elimina y vuelve a agregar los registros
- Espera unos minutos y verifica de nuevo

### El dominio carga pero muestra error 404

**Causa:** El dominio está conectado pero el proyecto no está desplegado

**Solución:**
1. Ve a Vercel Dashboard → **Deployments**
2. Verifica que hay un deployment activo
3. Si no hay, haz un nuevo deploy

---

## ✅ Checklist Rápido

- [ ] Dominio agregado en Vercel Dashboard
- [ ] Registros DNS copiados de Vercel
- [ ] Registro A configurado en proveedor de dominio
- [ ] Registro CNAME configurado en proveedor de dominio
- [ ] Esperado 15-60 minutos para propagación
- [ ] Dominio aparece como "Valid" en Vercel
- [ ] SSL/HTTPS activo (candado verde)
- [ ] Sitio carga en `https://tu-dominio.com`
- [ ] Sitio carga en `https://www.tu-dominio.com`

---

## 🎯 Siguiente Paso

Una vez que el dominio esté funcionando en Vercel:

1. ✅ **Actualizar `NEXT_PUBLIC_SITE_URL`** en Vercel (Settings → Environment Variables)
2. ✅ **Configurar Supabase** (Authentication → URL Configuration)
3. ✅ **Configurar Stripe** (Webhook URL)
4. ✅ **Configurar Resend** (si usas emails)

**Ver guía completa:** `GUIA_COMPLETA_DOMINIO.md`

---

**✅ ¡Listo! Tu dominio está conectado con Vercel**

