# Configuración de Google OAuth para Maflipp

## Problema Actual

Cuando un usuario invitado hace clic en "Aceptar Invitación" desde otro dispositivo, recibe el error:

```
Error 400: redirect_uri_mismatch
La solicitud de esta app no es válida.
No puedes acceder porque esta app envió una solicitud no válida.
```

## Causa

Google Console no tiene configurados los redirect URIs correctos para tu dominio.

## Solución

### 1. Ve a Google Cloud Console

1. Abre: https://console.cloud.google.com/
2. Selecciona tu proyecto (el que configuraste para Maflipp)
3. Ve a "APIs y Servicios" > "Credenciales"

### 2. Edita las credenciales OAuth

1. Busca tu "ID de cliente de OAuth 2.0"
2. Haz clic en el ícono de editar (lápiz)
3. En "URIs de redirección autorizados", agrega:

```
https://maflipp.com/auth/callback
https://maflipp.com/auth/reset-password
```

**Importante:**
- Si estás en desarrollo local, también agrega:
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

### 3. Verifica la configuración

Los URIs autorizados deben incluir:
- ✅ `https://maflipp.com/auth/callback`
- ✅ `https://maflipp.com/auth/reset-password`
- ✅ `http://localhost:3000/auth/callback` (desarrollo)
- ✅ `http://localhost:3000/auth/reset-password` (desarrollo)

### 4. Verifica el dominio

**Importante:** Asegúrate de que `maflipp.com` esté verificado en Google:

1. Ve a: https://search.google.com/search-console
2. Agrega tu propiedad `https://maflipp.com`
3. Verifica el dominio siguiendo las instrucciones
4. Una vez verificado, Google permitirá OAuth para ese dominio

### 4. Guarda los cambios

1. Haz clic en "Guardar"
2. Espera 5-10 minutos para que los cambios se propaguen

### 5. Verifica en Vercel

Asegúrate de que en Vercel tengas configurada la variable:
```
NEXT_PUBLIC_SITE_URL=https://maflipp.com
```

## Cómo probar

1. Invita a un email desde tu cuenta
2. Abre el email desde otro dispositivo
3. Haz clic en "Aceptar Invitación"
4. Debería redirigir correctamente a login/registro
5. Crea cuenta o inicia sesión con el email invitado
6. La invitación se aceptará automáticamente

## Comandos útiles

```bash
# Verificar variables de entorno
echo $NEXT_PUBLIC_SITE_URL

# En Vercel
vercel env ls
```

## Troubleshooting

Si el error persiste:

### Verificaciones básicas
1. ✅ Los URIs están exactamente correctos (sin espacios, barras finales, etc.)
2. ✅ El dominio `maflipp.com` está verificado en Google Search Console
3. ✅ Esperaste 15-30 minutos después de guardar
4. ✅ Borraste caché del navegador
5. ✅ Probaste con ventana de incógnito

### Verificaciones avanzadas

#### Verifica el proyecto correcto
1. En Google Cloud Console, confirma que estás editando el proyecto correcto
2. El proyecto debe tener habilitada la "Google+ API" o "Google People API"
3. El "ID de cliente" debe ser del tipo "Aplicación web"

#### Verifica el dominio
1. Ve a: https://search.google.com/search-console
2. Confirma que `maflipp.com` aparece como "Verificado"
3. Si no está verificado, verifica el dominio primero

#### Prueba con diferentes dispositivos
1. Prueba desde el mismo dispositivo donde funciona (debería funcionar)
2. Prueba desde otro dispositivo (este es donde falla)
3. Compara si hay diferencias en la URL

#### Verifica las credenciales
1. Asegúrate de que las credenciales OAuth están activas
2. Confirma que no están restringidas a ciertos usuarios
3. Verifica que el estado sea "Publicado" (no "En prueba")
4. Confirma que el tipo sea "Aplicación web" (no "Android", "iOS", etc.)

#### Verifica Vercel
1. Ve a tu proyecto en Vercel
2. Ve a "Settings" > "Domains"
3. Confirma que `maflipp.com` esté verificado y apuntando correctamente
4. Verifica que no haya problemas de DNS

#### Verifica el redirect URI exacto
Cuando veas el error, copia la URL completa del error. Debería mostrar algo como:
```
redirect_uri=https://maflipp.com/auth/callback
```
Asegúrate de que este URI exacto esté en la lista autorizada.

### Comandos de debug
```bash
# Verificar que las variables estén configuradas en Vercel
vercel env ls | grep NEXT_PUBLIC_SITE_URL

# Verificar DNS (desde terminal)
nslookup maflipp.com

# Verificar que el sitio responda
curl -I https://maflipp.com
```

### Solución de último recurso

Si nada funciona, puede ser un problema con Google bloqueando tu dominio. En ese caso:

1. **Crea nuevas credenciales OAuth** desde cero
2. **Usa un dominio diferente** temporalmente para probar
3. **Contacta a Google Support** si el dominio está siendo bloqueado

### URLs importantes
- Google Cloud Console: https://console.cloud.google.com/
- Google Search Console: https://search.google.com/search-console
- Vercel Dashboard: https://vercel.com/dashboard

## Contacto

Si el problema persiste, revisa:
- https://console.cloud.google.com/ (proyecto correcto)
- https://search.google.com/search-console (dominio verificado)
- https://vercel.com/dashboard (variables de entorno)

## Debug adicional

Si aún no funciona, intenta crear nuevas credenciales OAuth:

1. En Google Cloud Console > APIs y Servicios > Credenciales
2. Crea nuevas "Credenciales OAuth 2.0"
3. Configura como "Aplicación web"
4. Agrega los URIs autorizados
5. Actualiza las variables en Vercel con el nuevo Client ID y Secret
