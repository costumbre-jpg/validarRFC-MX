# ⚙️ Configurar Identidad de Git

## ✅ Problema Resuelto

Git está funcionando correctamente. Solo necesitas configurar tu nombre y email.

---

## ✅ PASO 1: Configurar tu Nombre y Email

Ejecuta estos comandos en PowerShell (reemplaza con tu información real):

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

**Ejemplo:**
```powershell
git config --global user.name "Javier Loor"
git config --global user.email "loorjimenezyandryjavier@gmail.com"
```

**Importante:**
- Usa el **mismo email** que usarás en GitHub
- El nombre puede ser tu nombre real o un alias

---

## ✅ PASO 2: Verificar Configuración

Ejecuta para verificar:

```powershell
git config --global user.name
git config --global user.email
```

Deberías ver tu nombre y email.

---

## ✅ PASO 3: Hacer el Commit

Ahora puedes hacer el commit:

```powershell
git commit -m "Initial commit"
```

Debería funcionar sin errores.

---

## 📝 Comandos Completos (Copia y Pega)

Reemplaza con tu información y ejecuta:

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
git commit -m "Initial commit"
```

---

## 🎯 Siguiente Paso

Después de configurar Git y hacer el commit, continúa con:
1. Crear repositorio en GitHub
2. Subir el código
3. Hacer deploy en Vercel

---

¿Ya configuraste tu nombre y email? 🤔

