# Seguridad y compliance (resumen)

## Seguridad técnica
- RLS en Supabase para separar datos por usuario
- Autenticación JWT con Supabase
- APIs protegidas y validación de entrada

## Datos sensibles
- No se almacenan credenciales del SAT
- Emails de onboarding y notificaciones gestionados por Resend

## Recomendaciones
- Activar backups (PITR)
- Revisar políticas RLS antes de producción
- Habilitar rate limiting en endpoints públicos

