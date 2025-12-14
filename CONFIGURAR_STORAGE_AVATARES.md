# 📸 Configurar Supabase Storage para Avatares

Para que la funcionalidad de subir fotos de perfil funcione, necesitas crear un bucket en Supabase Storage.

## Pasos:

1. **Ve a Supabase Dashboard** → **Storage** (en el menú lateral)

2. **Crea un nuevo bucket:**
   - Click en **"New bucket"**
   - Nombre: `avatars`
   - Marca **"Public bucket"** (para que las imágenes sean accesibles públicamente)
   - Click en **"Create bucket"**

3. **Configurar políticas RLS (Row Level Security):**
   - Ve a **Storage** → **Policies** → Selecciona el bucket `avatars`
   - Click en **"New Policy"** → **"For full customization"**
   - Nombre: `Users can upload their own avatars`
   - Política de INSERT:
     ```sql
     (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```
   - Política de SELECT (lectura pública):
     ```sql
     (bucket_id = 'avatars'::text)
     ```
   - Política de UPDATE:
     ```sql
     (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```
   - Política de DELETE:
     ```sql
     (bucket_id = 'avatars'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])
     ```

**Nota:** Las políticas permiten que los usuarios solo puedan subir/editar/eliminar sus propias fotos, pero cualquiera puede verlas (necesario para mostrar avatares).

## Alternativa Simple (Menos seguro pero más fácil):

Si prefieres algo más simple para empezar, puedes crear políticas que permitan a cualquier usuario autenticado subir:

```sql
-- INSERT
(bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)

-- SELECT (público)
(bucket_id = 'avatars'::text)

-- UPDATE
(bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)

-- DELETE
(bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)
```

---

**Una vez configurado, la funcionalidad de subir fotos de perfil estará lista para usar.**

