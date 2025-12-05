# 📥 Instalar Git en Windows - Paso a Paso

## ❌ Problema

Git no está instalado en tu computadora. Necesitas instalarlo primero.

---

## ✅ SOLUCIÓN: Instalar Git

### Opción 1: Instalador Oficial (Recomendado - 5 minutos)

#### Paso 1: Descargar Git

1. Ve a: **https://git-scm.com/download/win**
2. Click en **"Download for Windows"**
3. Se descargará un archivo `.exe` (ej: `Git-2.43.0-64-bit.exe`)

#### Paso 2: Instalar Git

1. **Abre el archivo descargado** (doble click)
2. Sigue el instalador:
   - Click en **"Next"** en la pantalla de bienvenida
   - **Select Components**: Deja todo marcado (por defecto) ✅
   - Click en **"Next"**
   - **Choosing the default editor**: Puedes dejar "Nano editor" o cambiar a "Visual Studio Code" si lo tienes
   - Click en **"Next"**
   - **Adjusting your PATH environment**: Selecciona **"Git from the command line and also from 3rd-party software"** ✅
   - Click en **"Next"**
   - **Choosing HTTPS transport backend**: Deja "Use the OpenSSL library" ✅
   - Click en **"Next"**
   - **Configuring the line ending conversions**: Deja "Checkout Windows-style, commit Unix-style line endings" ✅
   - Click en **"Next"**
   - **Configuring the terminal emulator**: Deja "Use Windows' default console window" ✅
   - Click en **"Next"**
   - **Configuring extra options**: Deja todo marcado ✅
   - Click en **"Next"**
   - **Configuring experimental options**: Puedes dejar todo desmarcado
   - Click en **"Install"**
   - ⏳ Espera a que termine la instalación
   - Click en **"Finish"**

#### Paso 3: Verificar Instalación

1. **Cierra y vuelve a abrir PowerShell** (importante para que cargue Git)
2. Ejecuta:
   ```powershell
   git --version
   ```

3. **Deberías ver algo como**:
   ```
   git version 2.43.0
   ```

4. Si ves la versión, ¡Git está instalado! ✅

---

### Opción 2: Usar GitHub Desktop (Alternativa Visual)

Si prefieres una interfaz gráfica en lugar de comandos:

1. Ve a: **https://desktop.github.com/**
2. Descarga **GitHub Desktop**
3. Instálalo
4. Inicia sesión con tu cuenta de GitHub
5. Puedes subir archivos desde la interfaz gráfica

**Ventajas:**
- ✅ Más fácil para principiantes
- ✅ Interfaz visual
- ✅ No necesitas usar comandos

**Desventajas:**
- ⚠️ Para Vercel, aún necesitas Git en la terminal (o puedes usar GitHub Desktop y luego Vercel puede conectarse directamente)

---

## ✅ Después de Instalar Git

Una vez que Git esté instalado, vuelve a ejecutar:

```powershell
cd C:\Users\loorj\Documents\validarFC.MX
git init
git add .
git commit -m "Initial commit"
```

**Debería funcionar ahora.** ✅

---

## 🆘 Si Aún No Funciona

### Problema: "git no se reconoce"

**Solución:**
1. **Cierra completamente PowerShell** (cierra todas las ventanas)
2. **Abre PowerShell de nuevo**
3. Prueba de nuevo: `git --version`

Si aún no funciona:
1. Verifica que Git se instaló correctamente
2. Reinicia tu computadora
3. Prueba de nuevo

### Problema: Git está instalado pero no funciona en PowerShell

**Solución:**
1. Abre PowerShell como **Administrador** (click derecho → "Run as Administrator")
2. Prueba de nuevo: `git --version`

---

## 📝 Checklist

- [ ] Git descargado
- [ ] Git instalado
- [ ] PowerShell cerrado y reabierto
- [ ] `git --version` funciona
- [ ] Listo para usar Git

---

## 🚀 Siguiente Paso

Una vez que Git esté instalado y funcionando:

1. Vuelve a ejecutar los comandos de Git
2. Continúa con el proceso de subir a GitHub
3. Luego haz deploy en Vercel

¿Necesitas ayuda con algún paso de la instalación? 🤔

