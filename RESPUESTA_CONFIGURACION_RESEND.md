# 📧 Respuestas: Configuración de Resend

## 🌐 ¿Qué Dominio Poner?

### Para DESARROLLO (Ahora mismo):
**NO necesitas agregar un dominio todavía.** 

Resend te da un dominio de prueba automáticamente que puedes usar:
- **Dominio de prueba**: `onboarding@resend.dev`
- Este dominio funciona **solo para desarrollo/testing**
- **No requiere verificación**
- Tiene límites (solo para pruebas)

**Recomendación**: Por ahora, **SALTA la configuración de dominio** y usa el dominio de prueba.

### Para PRODUCCIÓN (Más adelante):
Cuando estés listo para producción:
1. Usa el **dominio real** que tienes en Vercel (ej: `maflipp.com` o `www.maflipp.com`)
2. **NO uses** `localhost:3000` (eso no es un dominio válido)
3. Necesitarás verificar el dominio agregando registros DNS

---

## 🌍 ¿Qué Región Elegir?

### Opciones de Región en Resend:

1. **us-east-1 (N. Virginia, USA)** ⭐ **RECOMENDADO**
   - La más común y estable
   - Mejor para audiencia global
   - Latencia baja para la mayoría de usuarios

2. **eu-west-1 (Irlanda)**
   - Mejor si tu audiencia principal está en Europa
   - Cumple con GDPR

3. **us-west-2 (Oregón, USA)**
   - Alternativa a us-east-1
   - Similar rendimiento

### Mi Recomendación:
**Elige `us-east-1 (N. Virginia)`** porque:
- ✅ Es la región más estable
- ✅ Funciona bien para México y Latinoamérica
- ✅ Es la opción por defecto más común
- ✅ Mejor soporte y documentación

---

## ✅ Pasos Correctos para Configurar Resend AHORA:

### 1. Crear API Key (SIN configurar dominio todavía)

1. Ve a **"API Keys"** (no "Domains")
2. Haz clic en **"Create API Key"**
3. Nombre: `Maflipp Development`
4. Permisos: **"Sending access"**
5. **Región**: `us-east-1 (N. Virginia)` ⭐
6. Haz clic en **"Add"**
7. **Copia la API Key** (empieza con `re_`)

### 2. Usar Dominio de Prueba

- Resend automáticamente te da acceso a `onboarding@resend.dev`
- Este dominio funciona **sin configuración adicional**
- Úsalo para desarrollo/testing

### 3. Configurar en tu Código

En `lib/email.ts`, el código ya está configurado para usar:
```typescript
from: options.from || "Maflipp <noreply@maflipp.com>"
```

**Para desarrollo**, cambia temporalmente a:
```typescript
from: "Maflipp <onboarding@resend.dev>"
```

O mejor aún, usa una variable de entorno:

```typescript
from: process.env.RESEND_FROM_EMAIL || "Maflipp <onboarding@resend.dev>"
```

---

## 📝 Resumen Rápido:

1. **Dominio**: NO lo configures todavía, usa el de prueba
2. **Región**: Elige `us-east-1 (N. Virginia)` ⭐
3. **API Key**: Cópiala y guárdala en `.env.local`
4. **Para desarrollo**: Usa `onboarding@resend.dev` como remitente

---

## 🔄 Más Adelante (Producción):

Cuando estés listo para producción:

1. Ve a **"Domains"** en Resend
2. Agrega tu dominio real (ej: `maflipp.com`)
3. Agrega los registros DNS que te da Resend en tu proveedor de dominio
4. Espera la verificación (puede tardar unos minutos)
5. Actualiza el código para usar tu dominio verificado

---

## ⚠️ Importante:

- **localhost:3000 NO es un dominio válido** para Resend
- Solo puedes usar dominios reales (ej: `maflipp.com`)
- Para desarrollo, usa el dominio de prueba `onboarding@resend.dev`
- La región se puede cambiar después si es necesario

