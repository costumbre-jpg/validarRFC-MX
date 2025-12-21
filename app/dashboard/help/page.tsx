"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function HelpPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const currentPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
  const [expandedFaqs, setExpandedFaqs] = useState<Record<string, boolean>>({});
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactMessage, setContactMessage] = useState<string>("");

  const toggleFaq = (categoryIndex: number, faqIndex: number) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setExpandedFaqs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // FAQs base comunes a todos los planes (sin incluir preguntas específicas de planes)
  const generalFaqs = [
    {
      category: "General",
      questions: [
        {
          question: "¿Qué es Maflipp?",
          answer: "Maflipp es una plataforma profesional de validación de RFCs contra el padrón oficial del SAT (Servicio de Administración Tributaria). Nuestra plataforma te permite verificar en tiempo real si un RFC está activo y válido en el sistema del SAT, proporcionando información precisa y actualizada directamente desde la fuente oficial. Maflipp está diseñado para contadores públicos, empresas, fintechs y desarrolladores que necesitan validar documentos fiscales de forma rápida, confiable y automatizada. Nuestra solución elimina la necesidad de consultas manuales y reduce significativamente los errores humanos en procesos de validación fiscal."
        },
        {
          question: "¿Cómo funciona la validación?",
          answer: "Nuestro sistema consulta directamente el padrón del SAT en tiempo real utilizando conexiones optimizadas y seguras. El proceso es simple: ingresas el RFC que deseas validar en nuestra plataforma, nuestro sistema limpia y formatea automáticamente el RFC (eliminando espacios, guiones o caracteres especiales), luego realiza una consulta directa al padrón del SAT, y en menos de 2 segundos obtienes el resultado completo. El resultado incluye información detallada como el estado del RFC (activo, cancelado, suspendido), el nombre o razón social del contribuyente, el régimen fiscal, y la fecha de inicio de operaciones. Todas las validaciones se realizan de forma segura y encriptada, garantizando la privacidad y seguridad de tus consultas."
        },
        {
          question: "¿Qué formatos de RFC acepta?",
          answer: "Aceptamos RFCs en cualquier formato, ya que nuestro sistema es inteligente y flexible. Puedes ingresar RFCs con guiones (ABC-123456-XYZ), sin guiones (ABC123456XYZ), con espacios, en mayúsculas, minúsculas o una combinación de ambos. Nuestro sistema automáticamente limpia, normaliza y formatea el RFC antes de validarlo, eliminando caracteres especiales, espacios en blanco y ajustando el formato según corresponda. Esto significa que no necesitas preocuparte por el formato exacto del RFC - simplemente ingrésalo como lo tengas y nuestro sistema se encargará del resto. Aceptamos tanto RFCs de personas físicas (13 caracteres) como de personas morales (12 caracteres)."
        },
        {
          question: "¿Qué información proporciona la validación?",
          answer: "Cuando validas un RFC en Maflipp, obtienes información completa y detallada directamente del padrón del SAT. La validación incluye: el estado del RFC (si está activo, cancelado o suspendido), el nombre completo o razón social del contribuyente, el régimen fiscal bajo el cual está registrado, la fecha de inicio de operaciones, y el código postal de la ubicación fiscal. Esta información es crucial para verificar la identidad de proveedores, clientes o socios comerciales antes de realizar transacciones. Además, en los planes Pro y Business, puedes exportar esta información en diferentes formatos (CSV, Excel, PDF) para mantener registros detallados y cumplir con requisitos de auditoría y compliance."
        }
      ]
    },
    {
      category: "Planes y Precios",
      questions: [
        {
          question: "¿Puedo cambiar de plan?",
          answer: "Sí, puedes cambiar de plan en cualquier momento desde tu dashboard en la sección de Facturación. El proceso es muy sencillo: si cambias a un plan superior (por ejemplo, de Free a Pro o de Pro a Business), el upgrade se aplicará inmediatamente y tendrás acceso instantáneo a todas las nuevas funcionalidades. Si cambias a un plan inferior (por ejemplo, de Business a Pro o de Pro a Free), los cambios se aplicarán al final de tu período de facturación actual, permitiéndote aprovechar completamente el plan que ya pagaste. No hay penalizaciones por cambiar de plan, y puedes hacerlo las veces que necesites según las necesidades de tu negocio. Los cambios son instantáneos y no requieren intervención manual de nuestro equipo."
        },
        {
          question: "¿Hay descuento anual?",
          answer: "Sí, ofrecemos un 20% de descuento significativo en planes anuales. Esto significa que si eliges pagar anualmente en lugar de mensualmente, ahorras el equivalente a 2.4 meses de servicio cada año. Por ejemplo, si el plan Pro cuesta $299 MXN mensuales, con el plan anual pagarías aproximadamente $239 MXN por mes, ahorrando más de $700 MXN al año. Puedes cambiar entre facturación mensual y anual en cualquier momento desde tu dashboard, y el cambio se aplicará en tu próximo ciclo de facturación. El pago anual es ideal para empresas que buscan estabilidad en costos y maximizar sus ahorros a largo plazo. Además, con el pago anual recibes la misma calidad de servicio y todas las funcionalidades del plan que elijas."
        },
        {
          question: "¿Facturan con CFDI?",
          answer: "Sí, para los planes Pro y Business emitimos facturas CFDI (Comprobante Fiscal Digital por Internet) electrónicas válidas ante el SAT. Esto significa que cada pago que realices será facturado correctamente y podrás deducir estos gastos en tu contabilidad. Recibirás tu factura CFDI por email inmediatamente después de cada pago exitoso, y también podrás descargarla desde tu dashboard en la sección de Facturación. Las facturas incluyen toda la información fiscal requerida por el SAT, incluyendo el RFC emisor, el RFC receptor, el concepto del servicio, el monto, los impuestos correspondientes, y el UUID (identificador único) del CFDI. Todas nuestras facturas son válidas para deducciones fiscales y cumplen con las normativas mexicanas vigentes."
        },
        {
          question: "¿Tienen prueba gratis?",
          answer: "Sí, el plan Pro incluye 7 días de prueba. Durante esos 7 días tendrás acceso completo a todas las funcionalidades del plan Pro (1,000 validaciones/mes, historial ilimitado, exportación, acceso a API, dashboard avanzado, etc.). Para activar la prueba se solicita un método de pago en Stripe, pero no se cobra hasta que termine el período de prueba. Puedes cancelar en cualquier momento durante los 7 días y no se te cobrará nada. Además, el plan Free siempre está disponible sin límite de tiempo para probar el servicio básico."
        },
        {
          question: "¿Qué métodos de pago aceptan?",
          answer: "Aceptamos múltiples métodos de pago para tu comodidad, incluyendo tarjetas de crédito y débito (Visa, Mastercard, American Express), transferencias bancarias, y pagos a través de plataformas seguras como Stripe. Todos los pagos se procesan de forma segura y encriptada, cumpliendo con los más altos estándares de seguridad PCI DSS. No almacenamos información de tarjetas de crédito en nuestros servidores - toda la información sensible es manejada por nuestros procesadores de pago certificados. Los pagos se procesan de forma automática según el ciclo de facturación que elijas (mensual o anual), y recibirás notificaciones por email antes de cada cargo. Si tienes problemas con algún pago, nuestro equipo de soporte está disponible para ayudarte a resolver cualquier inconveniente; puedes escribirnos a soporte@maflipp.com."
        }
      ]
    },
    {
      category: "Técnico",
      questions: [
        {
          question: "¿Los datos están seguros?",
          answer: "Sí, la seguridad de tus datos es nuestra máxima prioridad. Utilizamos encriptación SSL/TLS de grado bancario para todas las comunicaciones entre tu navegador y nuestros servidores, garantizando que toda la información transmitida esté protegida. Nuestros servidores están alojados en infraestructura de clase empresarial con múltiples capas de seguridad, incluyendo firewalls, sistemas de detección de intrusiones, y monitoreo continuo. Cumplimos con los más altos estándares de seguridad internacionales y las normativas mexicanas de protección de datos personales. Todas las validaciones se realizan de forma segura y no almacenamos información sensible de los RFCs validados más allá de lo necesario para proporcionar el servicio. Además, realizamos copias de seguridad regulares y tenemos planes de recuperación ante desastres para garantizar la continuidad del servicio. Tu privacidad y la seguridad de tus datos están completamente protegidas."
        },
        {
          question: "¿Qué pasa si el SAT no responde?",
          answer: "En caso de que el SAT no responda o esté temporalmente no disponible, nuestro sistema te indicará claramente que no se pudo verificar el RFC en ese momento. Esto puede ocurrir ocasionalmente debido a mantenimiento programado del SAT, problemas de conectividad temporal, o sobrecarga en los servidores del SAT durante horas pico. Cuando esto sucede, te recomendamos intentar nuevamente en unos minutos. Nuestro sistema realiza múltiples intentos automáticos antes de reportar un error, y utilizamos conexiones optimizadas y caché inteligente para minimizar estos casos. Si el problema persiste, puedes contactar a nuestro equipo de soporte para que investiguemos el problema escribiendo a soporte@maflipp.com. Es importante mencionar que estas situaciones son raras y generalmente se resuelven rápidamente. Nuestro sistema está diseñado para ser resiliente y manejar estos casos de manera elegante, sin afectar tu experiencia de usuario."
        },
        {
          question: "¿Puedo usar la API con el plan FREE?",
          answer: "No, el acceso a la API está disponible exclusivamente para los planes Pro y Business. El plan FREE está diseñado para uso manual a través de nuestra interfaz web. Si necesitas integrar la validación de RFCs en tus sistemas, necesitarás mejorar a Pro (2,000 llamadas API/mes) o Business (10,000 llamadas API/mes). Si quieres evaluar la API, puedes activar la prueba de 7 días del plan Pro (se solicita método de pago, pero no se cobra durante la prueba)."
        },
        {
          question: "¿Cuál es el tiempo de respuesta de las validaciones?",
          answer: "Nuestro sistema está optimizado para proporcionar respuestas extremadamente rápidas. En condiciones normales, una validación se completa en menos de 2 segundos desde que ingresas el RFC hasta que recibes el resultado completo. Este tiempo incluye la limpieza y formateo del RFC, la consulta al padrón del SAT, el procesamiento de la respuesta, y la presentación de los resultados en tu dashboard. Utilizamos conexiones optimizadas, caché inteligente para consultas frecuentes, y una infraestructura escalable que puede manejar múltiples validaciones simultáneas sin comprometer la velocidad. El tiempo de respuesta puede variar ligeramente durante horas pico o si el SAT está experimentando alta carga, pero siempre nos esforzamos por mantener los tiempos de respuesta lo más bajos posible. Para usuarios de la API, el tiempo de respuesta promedio es similar, permitiendo integraciones en tiempo real en tus aplicaciones."
        },
        {
          question: "¿Puedo validar múltiples RFCs a la vez?",
          answer: "Sí, aunque la funcionalidad varía según tu plan. En el plan FREE, puedes validar RFCs uno por uno a través de la interfaz web. En los planes Pro y Business, además de validar individualmente, puedes usar nuestra API para validar múltiples RFCs de forma programática, lo que te permite procesar listas completas de RFCs de forma automatizada. La API permite hacer múltiples llamadas en paralelo, permitiéndote validar cientos o miles de RFCs en minutos. Además, en los planes Pro y Business puedes exportar tus validaciones a CSV o Excel, lo que te permite trabajar con listas grandes de RFCs y procesarlas de forma eficiente. Si necesitas validar grandes volúmenes de RFCs regularmente, el plan Business con 5,000 validaciones mensuales y acceso completo a la API es la mejor opción para ti."
        }
      ]
    }
  ];

  // FAQs específicas para Plan Free
  const freeFaqs = [
    {
      category: "Plan FREE",
      questions: [
        {
          question: "¿Qué incluye el plan FREE?",
          answer: "El plan FREE incluye 10 validaciones por mes completamente gratuitas, resultados básicos que muestran si el RFC es válido o inválido, estadísticas básicas de uso que te permiten ver un resumen de tus validaciones realizadas, acceso completo al centro de ayuda y FAQs, y un dashboard básico para gestionar tus validaciones. Este plan es perfecto para usuarios individuales, freelancers, o pequeñas empresas que necesitan validar RFCs ocasionalmente. Aunque el plan FREE tiene limitaciones (como no incluir historial de validaciones, exportación de datos, o acceso a la API), te permite probar completamente el servicio y entender cómo funciona Maflipp antes de decidirte por un plan de pago. El plan FREE no tiene límite de tiempo - puedes usarlo de forma permanente si tus necesidades de validación son limitadas."
        },
        {
          question: "¿El plan FREE tiene límite de tiempo?",
          answer: "No, el plan FREE está disponible sin límite de tiempo. Puedes usarlo de forma completamente gratuita mientras necesites, siempre respetando el límite de 10 validaciones por mes. No hay fecha de expiración, no necesitas renovar nada, y no perderás acceso al plan FREE. Es una opción permanente para usuarios que tienen necesidades básicas de validación. El contador de validaciones se reinicia automáticamente cada mes, dándote 10 nuevas validaciones el primer día de cada mes calendario. Si necesitas más validaciones en algún momento, siempre puedes mejorar a un plan Pro o Business desde tu dashboard, y si más adelante tus necesidades disminuyen, puedes volver al plan FREE sin problemas. El plan FREE es ideal para mantener una cuenta activa y tener acceso básico al servicio cuando lo necesites."
        },
        {
          question: "¿Cómo puedo obtener más validaciones?",
          answer: "Puedes mejorar a un plan Pro o Business en cualquier momento desde tu dashboard, en la sección de Facturación. El plan Pro incluye 1,000 validaciones/mes, historial ilimitado, exportación (CSV/Excel), acceso a API (2,000 llamadas/mes), dashboard avanzado y alertas por email, además de equipo (hasta 3 usuarios). El plan Business incluye 5,000 validaciones/mes, todo lo de Pro y funciones empresariales como white-label, SSO, usuarios ilimitados y exportación a PDF. Si quieres probar antes, puedes activar la prueba de 7 días del plan Pro (se solicita método de pago, pero no se cobra durante la prueba)."
        },
        {
          question: "¿El contador de validaciones se reinicia?",
          answer: "Sí, el contador de validaciones se reinicia automáticamente el primer día de cada mes calendario a las 00:00 horas (hora de México). Esto significa que cada mes recibes un nuevo conjunto de validaciones según tu plan: 10 validaciones para el plan FREE, 1,000 para el plan Pro, y 5,000 para el plan Business. El reinicio es completamente automático y no requiere ninguna acción de tu parte. Puedes ver cuántas validaciones te quedan disponibles en tu dashboard, junto con un indicador visual de tu progreso mensual. Si alcanzas tu límite mensual antes del fin de mes, tendrás que esperar hasta el siguiente mes para obtener más validaciones, o puedes mejorar a un plan superior en cualquier momento para obtener validaciones adicionales inmediatamente. Las validaciones no utilizadas no se acumulan - cada mes comienza con el límite completo de tu plan."
        },
        {
          question: "¿Qué puedo hacer si me quedo sin validaciones?",
          answer: "Si te quedas sin validaciones antes del fin del mes, puedes esperar al reinicio del contador el primer día del siguiente mes o mejorar a un plan superior desde Facturación (el cambio se aplica de inmediato). Si estás en Pro/Business, también puedes usar el historial y exportación para análisis. Si quieres evaluar Pro antes, puedes activar la prueba de 7 días (se solicita método de pago, pero no se cobra durante la prueba)."
        },
        {
          question: "¿Puedo ver mi historial de validaciones en el plan FREE?",
          answer: "No, el plan FREE no incluye historial de validaciones. Esto significa que una vez que realizas una validación, no podrás acceder a ella nuevamente después. Si necesitas revisar validaciones anteriores, tendrías que validar el RFC nuevamente. El historial ilimitado está disponible en los planes Pro y Business, donde todas tus validaciones se guardan permanentemente y puedes acceder a ellas en cualquier momento, buscar, filtrar y exportar. Si necesitas mantener un registro de tus validaciones, te recomendamos considerar el upgrade a un plan Pro o Business."
        },
        {
          question: "¿Puedo exportar mis validaciones en el plan FREE?",
          answer: "No, el plan FREE no incluye la funcionalidad de exportación de datos. Las validaciones que realices solo estarán disponibles en tu dashboard mientras las estés viendo, pero no podrás descargarlas en formato CSV, Excel o PDF. La exportación de datos está disponible en los planes Pro (CSV y Excel) y Business (CSV, Excel y PDF). Si necesitas mantener registros de tus validaciones para auditorías, reportes o análisis, te recomendamos considerar el upgrade a un plan Pro o Business que incluyen estas funcionalidades."
        }
      ]
    }
  ];

  // FAQs específicas para Plan Pro
  const proFaqs = [
    {
      category: "Plan PRO",
      questions: [
        {
          question: "¿Cómo funciona la API en el plan Pro?",
          answer: "El plan Pro incluye acceso completo a nuestra API RESTful con 2,000 llamadas API mensuales. Las 'llamadas API' son solicitudes HTTP que haces usando tu API Key para validar RFCs programáticamente desde tus aplicaciones, sistemas o scripts externos. Puedes generar API keys desde tu dashboard en la sección 'API Keys', y usar estas claves para autenticar tus solicitudes. Cada vez que validas un RFC usando la API (no desde la interfaz web), cuenta como una llamada API. El límite de 2,000 llamadas API es independiente del límite de 1,000 validaciones mensuales - puedes usar la API o la interfaz web, o ambos. La API incluye documentación completa con ejemplos en múltiples lenguajes de programación, autenticación mediante API keys, y rate limiting de 60 requests por minuto. Puedes crear múltiples API keys para diferentes aplicaciones o entornos (producción, desarrollo, testing). Los límites se reinician automáticamente el primer día de cada mes."
        },
        {
          question: "¿Cómo puedo exportar mis validaciones?",
          answer: "En el plan Pro puedes exportar todas tus validaciones en formato CSV o Excel. Para exportar, ve a la sección 'Historial' en tu dashboard, donde verás todas tus validaciones realizadas. Desde allí puedes hacer clic en los botones 'Exportar CSV' o 'Exportar Excel' para descargar un archivo con todos los datos de tus validaciones, incluyendo el RFC validado, el resultado, la fecha y hora, y toda la información adicional obtenida del SAT. Los archivos exportados están listos para usar en Excel, Google Sheets, o cualquier herramienta de análisis de datos. Esto es especialmente útil para mantener registros para auditorías, generar reportes para clientes, o analizar patrones en tus validaciones."
        },
        {
          question: "¿Qué es el historial ilimitado?",
          answer: "El historial ilimitado significa que todas tus validaciones se guardan permanentemente en tu cuenta, sin límite de tiempo ni cantidad. A diferencia del plan Free que no guarda historial, en el plan Pro puedes acceder a todas tus validaciones pasadas en cualquier momento desde la sección 'Historial' de tu dashboard. Puedes buscar, filtrar y exportar cualquier validación histórica. Esto es esencial para cumplir con requisitos de auditoría, mantener registros para compliance, o simplemente para revisar validaciones anteriores sin tener que validar nuevamente. El historial incluye toda la información completa de cada validación, incluyendo timestamps precisos."
        },
        {
          question: "¿Cómo funcionan las alertas por email?",
          answer: "Las alertas por email te permiten recibir notificaciones automáticas sobre tu uso del servicio. Puedes configurar alertas desde la sección 'Mi Cuenta' > 'Alertas por Email'. Puedes establecer un umbral de uso (por ejemplo, recibir una alerta cuando hayas usado el 80% de tus validaciones mensuales), y también recibirás alertas automáticas cuando alcances tu límite mensual. Además, recibirás un resumen mensual con estadísticas de tu uso. Las alertas te ayudan a gestionar mejor tus recursos y planificar cuándo podrías necesitar más validaciones. Puedes habilitar o deshabilitar las alertas en cualquier momento según tus preferencias."
        },
        {
          question: "¿Cómo funciona la gestión de equipo?",
          answer: "El plan Pro incluye gestión de equipo para hasta 3 usuarios. Como propietario de la cuenta, puedes invitar a otros usuarios a tu equipo desde la sección 'Equipo' en tu dashboard. Simplemente ingresa el email del usuario que deseas invitar, y ellos recibirán un correo con un enlace de invitación. Una vez que acepten la invitación, tendrán acceso a tu cuenta y podrán realizar validaciones, ver el historial, y usar todas las funcionalidades del plan Pro. Todos los usuarios comparten el mismo límite mensual de validaciones y tienen acceso a las mismas funcionalidades. Puedes gestionar los miembros de tu equipo, ver quién está activo, y eliminar miembros cuando sea necesario."
        },
        {
          question: "¿Qué es el dashboard avanzado?",
          answer: "El dashboard avanzado incluye gráficas y estadísticas detalladas sobre tu uso del servicio. Verás visualizaciones de tu uso diario en los últimos 7 días, tendencias mensuales de los últimos 6 meses, tasa de éxito de tus validaciones, promedio diario de validaciones, y proyecciones mensuales basadas en tu uso actual. Estas estadísticas te ayudan a entender mejor tus patrones de uso, planificar tus necesidades futuras, y optimizar cómo utilizas el servicio. El dashboard se actualiza en tiempo real y te proporciona insights valiosos sobre tu actividad de validación."
        },
        {
          question: "¿Cuántas API keys puedo crear en el plan Pro?",
          answer: "En el plan Pro puedes crear múltiples API keys según tus necesidades. No hay un límite estricto en la cantidad de API keys que puedes crear, lo que te permite tener diferentes claves para diferentes aplicaciones, entornos (producción, desarrollo, testing), o servicios. Cada API key es independiente y puedes revocarla en cualquier momento desde tu dashboard. Esto te da flexibilidad para gestionar el acceso a la API de forma organizada y segura. Todas las API keys comparten el mismo límite mensual de 2,000 llamadas API y 1,000 validaciones. Cada vez que usas una API key para validar un RFC, cuenta como una llamada API hacia tu límite mensual de 2,000."
        },
        {
          question: "¿Qué pasa si excedo mis límites de validaciones o llamadas API?",
          answer: "Si excedes tu límite mensual de validaciones (1,000 en el plan Pro) o llamadas API (2,000 en el plan Pro), el servicio se pausará temporalmente hasta que se reinicie tu contador el primer día del siguiente mes. Recibirás alertas por email cuando te acerques a tus límites (si las tienes configuradas) y cuando los alcances. Si necesitas más capacidad antes del fin del mes, puedes mejorar a un plan superior (Business) en cualquier momento desde tu dashboard, y el upgrade se aplicará inmediatamente, dándote acceso a más validaciones y llamadas API. Las validaciones y llamadas API no utilizadas no se acumulan al siguiente mes."
        },
        {
          question: "¿Puedo cancelar mi suscripción en cualquier momento?",
          answer: "Sí, puedes cancelar tu suscripción al plan Pro en cualquier momento desde tu dashboard en la sección de Facturación. Al cancelar, tu suscripción seguirá activa hasta el final del período de facturación que ya pagaste, y tendrás acceso completo a todas las funcionalidades del plan Pro durante ese tiempo. Una vez que termine el período pagado, tu cuenta se degradará automáticamente al plan FREE. No hay penalizaciones por cancelar, y puedes reactivar tu suscripción en cualquier momento. Si cancelas durante el período de prueba de 7 días, no se te cobrará nada."
        }
      ]
    }
  ];

  // FAQs específicas para Plan Business
  const businessFaqs = [
    {
      category: "Plan BUSINESS",
      questions: [
        {
          question: "¿Qué es White-Label y cómo funciona?",
          answer: "White-Label te permite personalizar completamente la apariencia de la plataforma con tu propia marca. Puedes subir tu logo, establecer tus colores corporativos (color primario y secundario), cambiar el nombre de la marca que se muestra, y ocultar completamente el branding de Maflipp. Esto significa que cuando tus usuarios accedan a la plataforma, verán tu marca en lugar de la de Maflipp, creando una experiencia completamente personalizada. Puedes configurar el white-label desde la sección 'White Label' en tu dashboard. Los cambios se aplican inmediatamente a toda la interfaz, incluyendo el dashboard, los reportes, y las exportaciones. Esta funcionalidad es ideal para empresas que quieren ofrecer la validación de RFCs como parte de su propia plataforma o servicio."
        },
        {
          question: "¿Cómo funciona el SSO (Single Sign-On)?",
          answer: "El SSO (Single Sign-On) te permite que tus usuarios inicien sesión en Maflipp usando sus credenciales de Google, eliminando la necesidad de crear y recordar contraseñas separadas. Esto mejora la seguridad, simplifica el proceso de acceso, y reduce la fricción para tus usuarios. El SSO está configurado automáticamente y tus usuarios pueden elegir iniciar sesión con Google desde la página de login. Una vez autenticados, tendrán acceso completo a todas las funcionalidades del plan Business. El SSO es especialmente útil para empresas que ya usan Google Workspace, ya que permite una integración seamless con sus sistemas existentes."
        },
        {
          question: "¿Qué significa usuarios ilimitados?",
          answer: "A diferencia del plan Pro que está limitado a 3 usuarios, el plan Business permite agregar tantos usuarios a tu equipo como necesites, sin límite. Puedes invitar a todos los miembros de tu organización, departamentos completos, o cualquier persona que necesite acceso. Todos los usuarios comparten el mismo límite mensual de 5,000 validaciones y tienen acceso a todas las funcionalidades del plan Business. Esto es ideal para empresas grandes, despachos contables con múltiples contadores, o organizaciones que necesitan que muchos usuarios accedan al servicio. Puedes gestionar todos los usuarios desde la sección 'Equipo' en tu dashboard."
        },
        {
          question: "¿Puedo exportar a PDF?",
          answer: "Sí, el plan Business incluye la capacidad de exportar tus validaciones a PDF, además de CSV y Excel. Esta funcionalidad ya está completamente disponible y funcional. Los PDFs exportados incluyen toda la información de tus validaciones en un formato profesional con título, encabezados, tabla de datos, paginación automática y pie de página. Los PDFs están listos para imprimir o compartir, y son especialmente útiles para generar reportes formales, documentación para auditorías, o presentaciones a clientes. Puedes exportar a PDF desde la sección 'Historial' de tu dashboard haciendo clic en el botón 'Exportar PDF'. Los PDFs mantienen el formato y la estructura de tus datos, y pueden incluir tu branding personalizado si has configurado white-label."
        },
        {
          question: "¿Qué es el onboarding personalizado?",
          answer: "El onboarding personalizado es un servicio exclusivo del plan Business donde nuestro equipo trabaja contigo para configurar la plataforma según las necesidades específicas de tu empresa. Puedes solicitar onboarding personalizado desde la sección 'Onboarding' en tu dashboard, donde podrás proporcionar información sobre tu empresa, casos de uso específicos, preferencias de integración, y cualquier requisito especial. Nuestro equipo revisará tu solicitud y trabajará contigo para asegurar que la plataforma esté optimizada para tus necesidades. Esto puede incluir configuración de white-label, integración con tus sistemas existentes, capacitación para tu equipo, y recomendaciones personalizadas sobre cómo maximizar el valor del servicio."
        },
        {
          question: "¿Cuál es la diferencia entre el plan Pro y Business?",
          answer: "El plan Business incluye todo lo del plan Pro, más funcionalidades empresariales avanzadas. Mientras que el Pro tiene 1,000 validaciones/mes, 3 usuarios, y acceso a API con 2,000 llamadas/mes, el Business ofrece 5,000 validaciones/mes, usuarios ilimitados, y 10,000 llamadas API/mes. Además, el Business incluye white-label para personalización completa de marca, SSO para autenticación simplificada, exportación a PDF, y acceso a onboarding personalizado. El plan Business está diseñado para empresas que necesitan escalar, personalizar la experiencia, y tener soporte dedicado. Si tu empresa crece o necesita más funcionalidades, el upgrade a Business es la mejor opción."
        },
        {
          question: "¿Cuántas API keys puedo crear en el plan Business?",
          answer: "En el plan Business puedes crear múltiples API keys sin límite, lo que te permite tener diferentes claves para diferentes aplicaciones, servicios, departamentos, o entornos (producción, desarrollo, testing, staging). Esta flexibilidad es especialmente útil para empresas grandes que necesitan gestionar el acceso a la API de forma organizada y granular. Cada API key es independiente y puedes revocarla en cualquier momento desde tu dashboard. Todas las API keys comparten el mismo límite mensual de 10,000 llamadas API y 5,000 validaciones del plan Business. Cada vez que usas una API key para validar un RFC, cuenta como una llamada API hacia tu límite mensual de 10,000. Los límites se reinician automáticamente el primer día de cada mes."
        },
        {
          question: "¿Qué pasa si excedo mis límites en el plan Business?",
          answer: "Si excedes tu límite mensual de validaciones (5,000) o llamadas API (10,000) en el plan Business, el servicio se pausará temporalmente hasta que se reinicie tu contador el primer día del siguiente mes. Recibirás alertas por email cuando te acerques a tus límites y cuando los alcances. Si necesitas más capacidad de forma permanente, puedes contactar a nuestro equipo de soporte para discutir opciones de planes personalizados o incrementos de límites escribiendo a soporte@maflipp.com. Las validaciones y llamadas API no utilizadas no se acumulan al siguiente mes. Para empresas con necesidades muy altas, ofrecemos soluciones empresariales personalizadas."
        },
        {
          question: "¿Qué es la validación CFDI y cuándo estará disponible?",
          answer: "La validación CFDI (Comprobante Fiscal Digital por Internet) es una funcionalidad avanzada que permitirá validar facturas electrónicas directamente contra el SAT, verificando que los CFDI sean válidos, estén activos, y cumplan con todos los requisitos fiscales. Esta funcionalidad está en desarrollo y estará disponible próximamente para usuarios del plan Business. La validación CFDI será especialmente útil para empresas que necesitan verificar grandes volúmenes de facturas, cumplir con requisitos de auditoría, o integrar la validación en sus procesos contables automatizados. Te notificaremos cuando esta funcionalidad esté disponible."
        },
        {
          question: "¿Cómo funciona el soporte prioritario en el plan Business?",
          answer: "El soporte prioritario es un servicio exclusivo del plan Business que está en desarrollo y estará disponible próximamente. Incluirá tiempos de respuesta más rápidos (objetivo de menos de 4 horas), acceso a un canal de comunicación dedicado, y prioridad en la resolución de problemas técnicos. El soporte prioritario está diseñado para empresas que necesitan asistencia rápida y confiable para mantener sus operaciones sin interrupciones. Mientras tanto, los usuarios del plan Business tienen acceso al soporte por email estándar. Te notificaremos cuando el soporte prioritario esté completamente disponible."
        },
        {
          question: "¿Qué significa SLA 99.9% y cuándo estará disponible?",
          answer: "SLA (Service Level Agreement) 99.9% significa que garantizamos que el servicio estará disponible el 99.9% del tiempo, lo que equivale a aproximadamente 43 minutos de tiempo de inactividad no planificado por mes. Este nivel de disponibilidad es estándar para servicios empresariales críticos. El SLA formal con garantías contractuales está en desarrollo y estará disponible próximamente para usuarios del plan Business. Mientras tanto, nos esforzamos por mantener la máxima disponibilidad posible del servicio. El SLA incluirá compensaciones definidas en caso de que no se cumplan los objetivos de disponibilidad. Te notificaremos cuando el SLA esté completamente implementado."
        }
      ]
    }
  ];

  // Combinar FAQs según el plan - solo mostrar General + el plan específico
  const faqs = currentPlan === "business" 
    ? [...generalFaqs, ...businessFaqs]
    : currentPlan === "pro"
    ? [...generalFaqs, ...proFaqs]
    : [...generalFaqs, ...freeFaqs];

  return (
    <div className="space-y-6 max-md:space-y-4">
      {/* Header con badge */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full bg-[#2F7E7A] bg-opacity-10 text-[#2F7E7A] text-sm max-md:text-xs font-medium mb-3 max-md:mb-2">
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 mr-2 max-md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Centro de Ayuda
          </div>
          <h1 className="text-2xl max-md:text-xl font-bold text-gray-900 mb-2 max-md:mb-1.5">Preguntas Frecuentes</h1>
          <p className="text-gray-600 text-sm max-md:text-xs">
            Encuentra respuestas rápidas a las preguntas más comunes sobre Maflipp
          </p>
        </div>
      </div>

      {/* FAQs por categoría mejoradas */}
      <div className="space-y-4 max-md:space-y-3">
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header de categoría */}
            <div className="bg-gray-50 px-5 max-md:px-4 py-3 max-md:py-2.5 border-b border-gray-200">
              <div className="flex items-center gap-3 max-md:gap-2">
                <div className="p-1.5 max-md:p-1 rounded-md bg-[#2F7E7A] bg-opacity-10">
                  <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h2 className="text-lg max-md:text-base font-semibold text-gray-900">{category.category}</h2>
              </div>
            </div>

            {/* Preguntas */}
            <div className="divide-y divide-gray-100">
              {category.questions.map((faq, faqIndex) => {
                const key = `${categoryIndex}-${faqIndex}`;
                const isExpanded = expandedFaqs[key];
                return (
                  <div key={faqIndex} className="transition-all">
                    <button
                      onClick={() => toggleFaq(categoryIndex, faqIndex)}
                      className="w-full px-5 max-md:px-4 py-3.5 max-md:py-3 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-4 max-md:gap-3"
                    >
                      <h3 className="text-sm max-md:text-xs font-medium text-gray-900 flex-1">{faq.question}</h3>
                      <svg
                        className={`w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400 flex-shrink-0 transition-transform ${
                          isExpanded ? "transform rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <div className="px-5 max-md:px-4 pb-4 max-md:pb-3 pt-0">
                        <div className="pl-4 max-md:pl-3 border-l-2 border-[#2F7E7A]">
                          <p className="text-gray-600 text-sm max-md:text-xs leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Contacto de soporte */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 max-md:p-4">
          <div className="flex items-start gap-4 max-md:gap-3">
            <div className="p-2 max-md:p-1.5 rounded-lg bg-[#2F7E7A] bg-opacity-10">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg max-md:text-base font-semibold text-gray-900 mb-2 max-md:mb-1.5">¿Necesitas ayuda adicional?</h2>
              <p className="text-gray-600 text-sm max-md:text-xs mb-4 max-md:mb-3">
                Si no encuentras la respuesta que buscas en las FAQs, nuestro equipo de soporte está disponible para ayudarte.
              </p>
              <button
                onClick={() => setShowContactForm(!showContactForm)}
                className="inline-flex items-center gap-2 max-md:gap-1.5 px-4 max-md:px-3 py-2 max-md:py-1.5 bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-colors font-medium text-sm max-md:text-xs shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {showContactForm ? "Ocultar formulario" : "Contactar Soporte"}
              </button>
            </div>
          </div>

          {/* Formulario de Contacto */}
          {showContactForm && (
            <div className="mt-4 max-md:mt-3 pt-4 max-md:pt-3 border-t border-gray-200">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const data = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    company: formData.get("company") || "",
                    message: formData.get("message"),
                  };

                  try {
                    setContactStatus("idle");
                    setContactMessage("");
                    const response = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();

                    if (response.ok) {
                      form.reset();
                      setContactStatus("success");
                      setContactMessage(result.message || "¡Mensaje enviado! Te responderemos pronto.");
                      setTimeout(() => {
                        setContactStatus("idle");
                        setContactMessage("");
                        setShowContactForm(false);
                      }, 3000);
                    } else {
                      setContactStatus("error");
                      setContactMessage(result.error || "Error al enviar el mensaje. Por favor intenta de nuevo.");
                      setTimeout(() => {
                        setContactStatus("idle");
                        setContactMessage("");
                      }, 5000);
                    }
                  } catch (error) {
                    setContactStatus("error");
                    setContactMessage("Error al enviar el mensaje. Por favor intenta de nuevo.");
                    setTimeout(() => {
                      setContactStatus("idle");
                      setContactMessage("");
                    }, 5000);
                  }
                }}
                className="space-y-4 max-md:space-y-3"
              >
                <div>
                  <label htmlFor="contact-name" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-1 max-md:mb-0.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    required
                    placeholder="Tu nombre completo"
                    className="w-full px-4 max-md:px-3 py-2.5 max-md:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm max-md:text-sm transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-1 max-md:mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    required
                    placeholder="tu@email.com"
                    className="w-full px-4 max-md:px-3 py-2.5 max-md:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm max-md:text-sm transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-company" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-1 max-md:mb-0.5">
                    Empresa <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    id="contact-company"
                    name="company"
                    placeholder="Nombre de tu empresa"
                    className="w-full px-4 max-md:px-3 py-2.5 max-md:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm max-md:text-sm transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-1 max-md:mb-0.5">
                    Mensaje
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="Cuéntanos cómo podemos ayudarte..."
                    className="w-full px-4 max-md:px-3 py-2.5 max-md:py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm max-md:text-sm resize-none transition-all"
                  />
                </div>
                {contactStatus !== "idle" && contactMessage && (
                  <div
                    className={`rounded-lg px-4 max-md:px-3 py-3 max-md:py-2.5 text-sm max-md:text-xs leading-relaxed ${
                      contactStatus === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {contactMessage}
                  </div>
                )}
                <div className="flex items-center gap-3 max-md:gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-[#2F7E7A] text-white px-4 max-md:px-3 py-2.5 max-md:py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs shadow-md hover:shadow-lg"
                  >
                    Enviar Mensaje
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowContactForm(false);
                      setContactStatus("idle");
                      setContactMessage("");
                    }}
                    className="px-4 max-md:px-3 py-2.5 max-md:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm max-md:text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HelpPageWrapper() {
  return (
    <Suspense fallback={null}>
      <HelpPage />
    </Suspense>
  );
}

