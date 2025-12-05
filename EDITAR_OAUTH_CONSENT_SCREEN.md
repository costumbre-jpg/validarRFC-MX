# 🔧 Cómo Editar OAuth Consent Screen (Incluso en Producción)

## 📋 Situación

Tu app ya está en producción, pero necesitas agregar/actualizar las URLs de Privacy Policy y Terms of Service.

---

## ✅ PASO 1: Ir a OAuth Consent Screen

1. Ve a **Google Cloud Console**: https://console.cloud.google.com/
2. Selecciona tu proyecto (el que usas para ValidaRFC)
3. En el menú lateral izquierdo, busca **"APIs & Services"**
4. Click en **"OAuth consent screen"**

---

## ✅ PASO 2: Encontrar el Botón de Editar

Una vez en la página de OAuth consent screen, verás:

### Opción A: Si ves un botón "EDIT APP" o "EDIT"

1. Arriba a la derecha, deberías ver un botón que dice:
   - **"EDIT APP"** o
   - **"EDIT"** o
   - Un ícono de lápiz ✏️
2. Click en ese botón
3. Continúa al **PASO 3**

### Opción B: Si NO ves el botón "EDIT APP"

Puede que estés viendo el dashboard/resumen. Busca:

1. **Pestañas o secciones** en la parte superior:
   - **"OAuth consent screen"** (pestaña principal)
   - Puede haber otras pestañas como "Publishing status", "Scopes", etc.

2. **En la parte superior de la página**, busca:
   - Un botón **"EDIT APP"** o **"EDIT"**
   - O un enlace que diga **"Edit app"**

3. **Si ves información de la app** (App name, Support email, etc.):
   - Busca un botón o enlace que diga **"Edit"** o **"Modify"** al lado de cada sección
   - O busca un botón general **"EDIT APP"** en la parte superior

4. **Si aún no lo encuentras**, intenta:
   - Scroll hacia arriba en la página
   - Busca en la parte superior derecha
   - Puede estar oculto o requerir hacer scroll

---

## ✅ PASO 3: Editar App Information

Una vez que hagas clic en "EDIT APP" o "EDIT", deberías ver un formulario con varias secciones:

### 3.1 Navegar a "App information"

1. Verás varias pestañas o secciones:
   - **"App information"** ← Esta es la que necesitas
   - "Scopes"
   - "Test users"
   - "Summary"

2. Si estás en otra sección, click en **"App information"** o usa las flechas/continuar para llegar ahí

### 3.2 Actualizar Privacy Policy y Terms

En la sección **"App information"**, busca estos campos:

1. **Privacy policy link**:
   - Campo de texto donde puedes escribir la URL
   - Escribe: `http://localhost:3000/privacidad`
   - ⚠️ Si ya hay algo escrito, reemplázalo

2. **Terms of service link**:
   - Campo de texto donde puedes escribir la URL
   - Escribe: `http://localhost:3000/terminos`
   - ⚠️ Si ya hay algo escrito, reemplázalo

3. **Authorized domains** (si aparece):
   - Debe tener: `localhost`
   - Si no está, agrégalo

### 3.3 Guardar Cambios

1. Después de actualizar los campos, busca un botón:
   - **"SAVE AND CONTINUE"** o
   - **"NEXT"** o
   - **"CONTINUE"**

2. Click en ese botón

3. Si te lleva a otra sección (como "Scopes"), simplemente:
   - Click en **"SAVE AND CONTINUE"** en cada sección
   - O click en **"BACK TO DASHBOARD"** si ya completaste todo

---

## 🆘 Si Aún No Puedes Editar

### Alternativa 1: Verificar Permisos

1. Verifica que estés usando la cuenta correcta de Google
2. Asegúrate de tener permisos de **Owner** o **Editor** en el proyecto
3. Si no tienes permisos, pide al dueño del proyecto que te los dé

### Alternativa 2: Buscar en Otra Ubicación

1. Ve a **APIs & Services** → **Credentials**
2. Busca tu **OAuth 2.0 Client ID**
3. Click en el nombre del cliente
4. Puede haber un enlace a "OAuth consent screen" desde ahí

### Alternativa 3: Usar el Menú de Navegación

1. En el menú lateral, busca:
   - **"APIs & Services"** → **"OAuth consent screen"**
   - O directamente busca **"OAuth consent screen"** en el buscador de Google Cloud Console

2. Asegúrate de estar en el proyecto correcto (verifica el dropdown superior)

---

## 📸 Ubicación Visual del Botón

El botón "EDIT APP" generalmente está:
- **Arriba a la derecha** de la página
- Al lado del estado de la app ("In production" o "Testing")
- Puede ser un botón azul o verde que dice "EDIT APP"

---

## ✅ Verificar que se Guardó

Después de guardar:

1. Vuelve al dashboard de OAuth consent screen
2. Busca la sección **"App information"** o **"App details"**
3. Verifica que aparezcan:
   - Privacy policy link: `http://localhost:3000/privacidad`
   - Terms of service link: `http://localhost:3000/terminos`

Si aparecen, ¡está guardado correctamente! ✅

---

## 🆘 Si Nada Funciona

Si después de intentar todo esto aún no puedes editar:

1. **Toma una captura de pantalla** de la página de OAuth consent screen
2. **Dime exactamente qué ves** en la página:
   - ¿Qué botones ves?
   - ¿Qué secciones o pestañas hay?
   - ¿Qué dice el estado de la app?

Con esa información puedo darte instrucciones más específicas.

---

## 📝 Checklist

- [ ] Encontré la página de OAuth consent screen
- [ ] Encontré el botón "EDIT APP" o "EDIT"
- [ ] Actualicé Privacy policy link: `http://localhost:3000/privacidad`
- [ ] Actualicé Terms of service link: `http://localhost:3000/terminos`
- [ ] Guardé los cambios
- [ ] Verifiqué que se guardaron correctamente

---

¿Puedes ver la página de OAuth consent screen? ¿Qué botones o secciones ves? 🤔

