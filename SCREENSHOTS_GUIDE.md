# Guía de Capturas de Pantalla para Venta

## 📸 Capturas Esenciales (Mínimo 5)

### 1. Dashboard Principal
**Qué capturar:**
- Dashboard completo con estadísticas visibles
- Header con usuario y plan
- Contador de validaciones (ej: "4/5,000")
- Gráficos de "RFCs Válidos vs Inválidos"
- Gráfico de "Uso Mensual"

**Cómo:**
- Haz 2-3 validaciones primero para que se vean datos
- Asegúrate de que los números sean visibles
- Captura toda la pantalla del dashboard

**Dónde usar:**
- Slide 3 del pitch deck (La Solución)
- One-pager
- Listing en Flippa/Microacquire

---

### 2. Analytics Avanzados (Business Plan)
**Qué capturar:**
- Sección "Analytics Avanzados" completa
- Gráfico "Uso Diario" con barras visibles
- Gráfico "Tendencias Mensuales"
- Métricas: "Promedio Diario", "Proyección Mensual", "Día Pico"
- Sección "Análisis por Hora del Día"

**Cómo:**
- Asegúrate de estar en plan Business (o usar `?plan=business`)
- Haz scroll para capturar toda la sección
- Que se vean los tooltips si es posible

**Dónde usar:**
- Slide 5 del pitch deck (Features Principales)
- Demuestra valor premium del plan Business

---

### 3. White Label Funcionando
**Qué capturar:**
- Sidebar con logo personalizado
- Dashboard con colores personalizados (si aplica)
- Sección "White Label" en el dashboard
- Botones con colores personalizados

**Cómo:**
- Configura white label con logo y colores
- Captura el sidebar completo
- Muestra que la marca Maflipp está oculta

**Dónde usar:**
- Slide 5 del pitch deck
- Demuestra diferenciador clave

---

### 4. Historial de Validaciones
**Qué capturar:**
- Tabla completa de validaciones
- Columnas: RFC, Estado, Fecha, Tiempo de respuesta
- Paginación funcionando (si hay muchas)
- Botón "Exportar PDF" visible

**Cómo:**
- Asegúrate de tener al menos 5-10 validaciones
- Captura la tabla completa
- Que se vea el diseño profesional

**Dónde usar:**
- Slide 5 del pitch deck
- Muestra funcionalidad completa

---

### 5. API Documentation
**Qué capturar:**
- Página `/developers` completa
- Ejemplos de código en diferentes lenguajes
- Endpoints documentados
- Ejemplo de respuesta JSON

**Cómo:**
- Ve a `/developers` en tu plataforma
- Haz scroll para capturar toda la documentación
- Que se vea profesional y completa

**Dónde usar:**
- Slide 5 del pitch deck
- Demuestra que la API está documentada

---

## 📸 Capturas Adicionales (Opcional pero Recomendado)

### 6. Validación en Tiempo Real
**Qué capturar:**
- Formulario de validación
- Resultado exitoso mostrado
- Mensaje "RFC válido" o "RFC inválido"
- Tiempo de respuesta visible

**Dónde usar:**
- Demo script
- Video demo (si lo haces)

---

### 7. Planes y Precios
**Qué capturar:**
- Página `/pricing` completa
- Los 3 planes visibles (Free, Pro, Business)
- Características de cada plan
- Botones de "Comenzar" visibles

**Dónde usar:**
- Slide 6 del pitch deck
- One-pager

---

### 8. Onboarding Form
**Qué capturar:**
- Formulario de onboarding completo
- Campos visibles
- Botón "Guardar" visible
- Diseño profesional

**Dónde usar:**
- Muestra que hay flujo de onboarding
- Slide 5 (Features)

---

### 9. Testimonios reales (cuando los tengas)
**Qué capturar:**
- Seccion "Lo que dicen nuestros clientes" con citas reales
- Nombre y cargo visibles

**Cómo:**
- Actualiza `components/home/Testimonials.tsx` con testimonios reales
- Captura la seccion en home

**Dónde usar:**
- Slide de pruebas sociales
- One-pager y listings

## 🎨 Cómo Tomar las Capturas

### Herramientas Recomendadas:
- **Windows:** `Win + Shift + S` (Snipping Tool)
- **Chrome:** Extensión "Full Page Screen Capture"
- **Herramienta online:** https://www.screencapture.com

### Configuración:
1. **Resolución:**** Mínimo 1920x1080
2. **Formato:** PNG (mejor calidad) o JPG
3. **Navegador:** Chrome en modo incógnito (sin extensiones)
4. **Zoom:** 100% (no hacer zoom)

### Antes de Capturar:
- ✅ Limpia el navegador (sin pestañas extra)
- ✅ Usa modo incógnito si es posible
- ✅ Asegúrate de tener datos reales (no todo en 0)
- ✅ Verifica que no haya información sensible visible

---

## 📁 Organización de Archivos

Crea esta estructura:

```
screenshots/
├── 01-dashboard-principal.png
├── 02-analytics-avanzados.png
├── 03-white-label.png
├── 04-historial-validaciones.png
├── 05-api-documentation.png
├── 06-validacion-tiempo-real.png
├── 07-planes-precios.png
└── 08-onboarding-form.png
```

---

## 🎯 Dónde Usar Cada Captura

### Pitch Deck (Google Slides):
- **Slide 3:** Dashboard principal
- **Slide 5:** Analytics avanzados + White label + API docs
- **Slide 6:** Planes y precios

### One-Pager:
- Dashboard principal (arriba)
- Analytics (medio)
- White label (abajo)

### Listing en Flippa/Microacquire:
- Dashboard principal (imagen principal)
- Analytics avanzados
- White label
- API documentation

### Email de Venta:
- Dashboard principal (una sola imagen)
- Link al pitch deck completo

---

## ✅ Checklist Final

Antes de publicar, verifica:

- [ ] Todas las capturas tienen buena calidad (no pixeladas)
- [ ] No hay información sensible (emails personales, datos reales de clientes)
- [ ] Los números se ven claros (no todo en 0)
- [ ] El diseño se ve profesional
- [ ] Las capturas están organizadas y nombradas
- [ ] Tienes al menos 5 capturas esenciales

---

## 💡 Tips Pro

1. **Usa datos de prueba:** Haz validaciones con RFCs de ejemplo para que se vean datos reales
2. **Configura white label:** Usa colores llamativos para que se note la personalización
3. **Muestra diferentes estados:** Válido, inválido, en proceso
4. **Captura en diferentes resoluciones:** Desktop (1920x1080) y móvil (opcional)
5. **Edita si es necesario:** Usa herramientas como Canva para agregar flechas o destacar features

---

## 🚀 Próximo Paso

Una vez tengas las capturas:
1. Agréguelas al pitch deck (Insertar → Imagen)
2. Crea el one-pager con las mejores 3-4 capturas
3. Prepárate para publicar en Flippa/Microacquire

---

**Contacto para dudas:**
- loorjimenezyandryjavier@gmail.com
- soporte@maflipp.com

