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
1. Verifica que los URIs estén exactamente correctos
2. Espera 15 minutos después de guardar
3. Borra caché del navegador
4. Prueba con ventana de incógnito

## Contacto

Si el problema persiste, revisa:
- https://console.cloud.google.com/
- Asegúrate de estar editando el proyecto correcto
- Verifica que el dominio `maflipp.com` esté verificado en Google
