# 📧 Estado de Configuración de Resend

## ✅ PARA DESARROLLO (Ahora mismo) - COMPLETO

**Estado**: ✅ **100% Configurado y Funcionando**

- ✅ API Key configurada en `.env.local`
- ✅ Dominio de prueba activo (`onboarding@resend.dev`)
- ✅ Variables de entorno listas
- ✅ Código implementado
- ✅ Base de datos configurada

**Puedes usar las alertas por email en desarrollo ahora mismo.**

---

## ⚠️ PARA PRODUCCIÓN - FALTA CONFIGURAR

### Lo que falta para producción:

### 1. Verificar Dominio Real en Resend

**Pasos:**
1. Ve a Resend Dashboard → **"Domains"**
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio real de Vercel (ej: `maflipp.com`)
4. Resend te dará registros DNS para agregar:
   - Registro TXT para verificación
   - Registro MX (opcional)
   - Registro SPF (opcional)
5. Agrega estos registros en tu proveedor de dominio (donde compraste el dominio)
6. Espera la verificación (puede tardar unos minutos a horas)

### 2. Actualizar Variables de Entorno en Vercel

Cuando despliegues a producción en Vercel:

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a **Settings** → **Environment Variables**
3. Agrega/actualiza estas variables:

```env
RESEND_API_KEY=re_tu_api_key_produccion
RESEND_FROM_EMAIL=Maflipp <noreply@maflipp.com>
CRON_SECRET=tu-secret-super-seguro-produccion
NEXT_PUBLIC_SITE_URL=https://maflipp.com
```

**Nota**: 
- Usa el mismo `RESEND_API_KEY` o crea una nueva para producción
- Cambia `RESEND_FROM_EMAIL` a tu dominio verificado
- Cambia `CRON_SECRET` por uno más seguro
- Cambia `NEXT_PUBLIC_SITE_URL` a tu URL de producción

### 3. Configurar Cron Job en Producción

**Opción A: Vercel Cron (Recomendado)**

Crea `vercel.json` en la raíz del proyecto:

```json
{
  "crons": [
    {
      "path": "/api/alerts/send",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Opción B: Servicio Externo**

Usa un servicio como:
- Cron-job.org
- EasyCron
- GitHub Actions

Que llame a: `https://maflipp.com/api/alerts/send` con el header:
```
Authorization: Bearer tu-cron-secret-produccion
```

---

## 📋 Checklist Producción

- [ ] Dominio verificado en Resend
- [ ] Variables de entorno configuradas en Vercel
- [ ] `RESEND_FROM_EMAIL` actualizado a dominio real
- [ ] `CRON_SECRET` cambiado por uno seguro
- [ ] `NEXT_PUBLIC_SITE_URL` actualizado a URL de producción
- [ ] Cron job configurado (Vercel Cron o servicio externo)
- [ ] Probar envío de email en producción

---

## 🎯 Resumen

**Desarrollo**: ✅ **COMPLETO** - Ya funciona
**Producción**: ⚠️ **FALTA** - Verificar dominio y configurar variables en Vercel

---

## 💡 Recomendación

**Para ahora (desarrollo)**: Todo está listo, puedes probar las alertas.

**Para producción**: Cuando estés listo para desplegar:
1. Verifica tu dominio en Resend
2. Actualiza las variables en Vercel
3. Configura el cron job

