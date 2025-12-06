# 📤 Subir Código a GitHub - Paso a Paso

## ✅ Estado Actual

- ✅ Git configurado
- ✅ Commit realizado (104 archivos)
- ✅ Código listo para subir

---

## ✅ PASO 1: Crear Repositorio en GitHub (5 minutos)

### 1.1 Ir a GitHub

1. Ve a: **https://github.com**
2. Inicia sesión (o crea cuenta si no tienes)

### 1.2 Crear Nuevo Repositorio

1. Click en el **"+"** (arriba a la derecha)
2. Selecciona **"New repository"**

### 1.3 Configurar Repositorio

Completa el formulario:

- **Repository name**: `validarfcmx` (o el nombre que prefieras)
- **Description**: (opcional) "ValidaRFC.mx - Validación de RFC para México"
- **Visibility**: 
  - **Public** (recomendado para empezar, más fácil)
  - O **Private** (si prefieres que sea privado)
- **NO marques** ninguna de estas opciones:
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

3. Click en **"Create repository"**

---

## ✅ PASO 2: Conectar Repositorio Local con GitHub

GitHub te mostrará instrucciones. Ejecuta estos comandos en PowerShell:

### 2.1 Agregar Remote

```powershell
git remote add origin https://github.com/TU_USUARIO/validarfcmx.git
```

**⚠️ IMPORTANTE**: Reemplaza `TU_USUARIO` con tu usuario de GitHub.

**Ejemplo:**
```powershell
git remote add origin https://github.com/javierloor/validarfcmx.git
```

### 2.2 Cambiar Branch a Main

```powershell
git branch -M main
```

### 2.3 Subir Código

```powershell
git push -u origin main
```

---

## ⚠️ Si Te Pide Usuario/Contraseña

Git te pedirá:
- **Username**: Tu usuario de GitHub
- **Password**: Necesitas un **Personal Access Token** (NO tu contraseña normal)

### Cómo Crear Personal Access Token:

1. Ve a: **https://github.com/settings/tokens**
2. Click en **"Generate new token"** → **"Generate new token (classic)"**
3. Completa:
   - **Note**: "Vercel Deploy" (o cualquier nombre)
   - **Expiration**: 90 days (o el que prefieras)
   - **Select scopes**: Marca **"repo"** (todos los permisos de repo)
4. Click en **"Generate token"**
5. **⚠️ COPIA EL TOKEN INMEDIATAMENTE** (no lo verás de nuevo)
6. Úsalo como contraseña cuando Git te lo pida

---

## ✅ PASO 3: Verificar que se Subió

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/validarfcmx`
2. Deberías ver todos tus archivos
3. Deberías ver 104 archivos

**Si ves los archivos, ¡está listo!** ✅

---

## 📝 Comandos Completos (Copia y Pega)

Reemplaza `TU_USUARIO` con tu usuario de GitHub y ejecuta:

```powershell
git remote add origin https://github.com/TU_USUARIO/validarfcmx.git
git branch -M main
git push -u origin main
```

---

## 🆘 Problemas Comunes

### Error: "remote origin already exists"

**Solución:**
```powershell
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/validarfcmx.git
```

### Error: "authentication failed"

**Solución:**
- Asegúrate de usar un **Personal Access Token** (no tu contraseña)
- Verifica que el token tenga permisos de "repo"

### Error: "repository not found"

**Solución:**
- Verifica que el nombre del repositorio sea correcto
- Verifica que el repositorio exista en GitHub
- Verifica que tengas permisos para acceder

---

## 🎯 Siguiente Paso

Una vez que el código esté en GitHub:

1. Ve a Vercel
2. Conecta tu repositorio
3. Haz deploy
4. Obtén tu dominio gratis

---

¿Ya creaste el repositorio en GitHub? ¿Necesitas ayuda con algún paso? 🤔

