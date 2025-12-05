# 🔍 Cómo Encontrar el Botón para Editar OAuth Consent Screen

## 📍 Ubicación Exacta del Botón

Cuando la app está en producción, el botón puede estar en diferentes lugares. Sigue estos pasos:

---

## ✅ Método 1: Desde el Dashboard de OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto
3. Menú lateral → **APIs & Services** → **OAuth consent screen**

### Lo que deberías ver:

En la parte **superior de la página**, deberías ver:

```
┌─────────────────────────────────────────────────┐
│ OAuth consent screen                    [In production] │
│                                                  │
│ [EDIT APP]  ← Este botón debería estar aquí     │
└─────────────────────────────────────────────────┘
```

**Si NO ves "EDIT APP"**, busca:
- Un botón que diga **"EDIT"** (sin "APP")
- Un ícono de **lápiz** ✏️
- Un enlace que diga **"Edit app"** o **"Modify app"**

---

## ✅ Método 2: Si Estás Viendo el Resumen

Si ves información de la app (App name, Support email, etc.) pero NO ves un botón de editar:

1. **Scroll hacia arriba** en la página
2. Busca en la **esquina superior derecha**
3. Puede haber un menú de **3 puntos** (⋮) o un botón **"MORE"**
4. Click ahí y busca opciones de editar

---

## ✅ Método 3: Desde Credentials

1. Ve a: **APIs & Services** → **Credentials**
2. Busca tu **OAuth 2.0 Client ID** (el que creaste para ValidaRFC)
3. Click en el **nombre** del cliente (no en el ícono de copiar)
4. En la página de detalles, busca un enlace o botón que diga:
   - **"OAuth consent screen"**
   - **"Edit consent screen"**
   - O simplemente vuelve a **OAuth consent screen** desde el menú

---

## ✅ Método 4: Buscar Directamente

1. En Google Cloud Console, usa el **buscador** (arriba, donde dice "Search products and resources")
2. Escribe: **"OAuth consent screen"**
3. Click en el resultado
4. Ahora deberías ver el botón de editar

---

## 🆘 Si Aún No Lo Encuentras

### Opción A: Verificar que Estás en el Proyecto Correcto

1. Arriba, verifica el **dropdown del proyecto** (donde dice el nombre del proyecto)
2. Asegúrate de que esté seleccionado el proyecto correcto
3. Si no, selecciónalo y vuelve a **OAuth consent screen**

### Opción B: Verificar Permisos

1. Verifica que tengas permisos de **Owner** o **Editor**
2. Si no los tienes, pide al dueño del proyecto que te los dé

### Opción C: Captura de Pantalla

Si nada funciona, **toma una captura de pantalla** de la página de OAuth consent screen y compártela. Con eso puedo indicarte exactamente dónde está el botón.

---

## 📸 Qué Buscar Visualmente

El botón generalmente se ve así:

```
[EDIT APP]  ← Botón azul o verde
```

O puede ser:

```
✏️ Edit     ← Ícono de lápiz + texto
```

O puede estar en un menú:

```
⋮ (3 puntos) → Edit app
```

---

## ✅ Una Vez que Encuentres el Botón

1. Click en **"EDIT APP"** o **"EDIT"**
2. Te llevará a un formulario con varias secciones
3. Busca la sección **"App information"**
4. Ahí encontrarás los campos:
   - **Privacy policy link**
   - **Terms of service link**
5. Actualiza con:
   - Privacy: `http://localhost:3000/privacidad`
   - Terms: `http://localhost:3000/terminos`
6. Guarda los cambios

---

## 🆘 Alternativa: Si Google No Permite Editar

Si Google no te permite editar porque la app está en producción, puedes:

1. **Temporalmente poner la app en modo Testing**:
   - Busca un botón que diga **"UNPUBLISH"** o **"PUT IN TESTING"**
   - Esto te permitirá editar
   - Después vuelve a publicar

2. **O simplemente agrega las URLs sin editar**:
   - A veces Google permite agregar URLs sin entrar al modo de edición
   - Busca campos editables directamente en el dashboard

---

¿Qué ves exactamente en la página de OAuth consent screen? ¿Puedes describir qué botones o secciones aparecen? 🤔

