 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/layout/Logo";

export default function PrivacidadPage() {
  const [fromOauth, setFromOauth] = useState(false);
  const [fromLogin, setFromLogin] = useState(false);
  const [fromRegister, setFromRegister] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const ref = document.referrer || "";
    const search = new URLSearchParams(window.location.search);
    const hinted = search.get("from") === "oauth";
    const hintedLogin = search.get("from") === "login";
    const hintedRegister = search.get("from") === "register";
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("auth-from");
    } catch (_e) {
      // ignore
    }
    const isOauthRef =
      ref.includes("accounts.google.com") ||
      ref.includes("accounts.google.") ||
      ref.includes("google.com");
    setFromOauth(Boolean(isOauthRef || hinted || stored === "oauth"));
    setFromLogin(Boolean(hintedLogin || stored === "login"));
    setFromRegister(Boolean(hintedRegister || stored === "register"));
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    if (!(fromOauth || fromLogin || fromRegister)) return;
    e.preventDefault();
    if (fromLogin) {
      window.location.href = "/?auth=login";
      return;
    }
    if (fromRegister) {
      window.location.href = "/?auth=register";
      return;
    }
    if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
      window.close();
      return;
    }
    if (document.referrer) {
      window.history.back();
      return;
    }
    window.location.href = "https://accounts.google.com/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="transform scale-125 origin-left">
              <Logo size="md" showText={false} />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Política de Privacidad
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8 text-xs sm:text-sm leading-relaxed">
            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                1. Introducción y Alcance
              </h2>
              <p className="text-gray-600 mb-3">
                Maflipp (&quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la Empresa&quot;) se compromete a proteger la privacidad y seguridad de la información personal de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos, protegemos y compartimos su información personal cuando utiliza nuestro sitio web <strong>maflipp.com</strong> y nuestros servicios (en adelante, el &quot;Servicio&quot;).
              </p>
              <p className="text-gray-600">
                Al utilizar nuestro Servicio, usted acepta las prácticas descritas en esta Política de Privacidad. Si no está de acuerdo con esta política, le solicitamos que no utilice nuestro Servicio.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                2. Información que Recopilamos
              </h2>
              <p className="text-gray-600 mb-3">
                Recopilamos diferentes tipos de información para proporcionar y mejorar nuestro Servicio:
              </p>
              
              <p className="text-gray-600 mb-2 mt-4">
                <strong>2.1. Información que Usted Nos Proporciona Directamente:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Información de cuenta:</strong> Dirección de correo electrónico, nombre completo, nombre de usuario y contraseña (encriptada)</li>
                <li><strong>Información de perfil:</strong> Nombre de empresa, información de contacto adicional, preferencias de cuenta</li>
                <li><strong>Información de facturación:</strong> Datos de tarjeta de crédito o débito (procesados de forma segura a través de Stripe), dirección de facturación, información fiscal</li>
                <li><strong>Información de comunicación:</strong> Mensajes, consultas o comentarios que nos envía a través de formularios de contacto, correo electrónico o soporte</li>
              </ul>

              <p className="text-gray-600 mb-2 mt-4">
                <strong>2.2. Información Recopilada Automáticamente:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Información de uso del servicio:</strong> RFCs validados, fecha y hora de validaciones, resultados de consultas, historial de actividad, métricas de uso</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo, proveedor de servicios de Internet, identificadores de dispositivo, páginas visitadas, tiempo de permanencia, patrones de navegación</li>
                <li><strong>Cookies y tecnologías similares:</strong> Información recopilada mediante cookies, píxeles de seguimiento, web beacons y tecnologías similares (consulte la Sección 7 para más detalles)</li>
                <li><strong>Información de API:</strong> Llamadas realizadas, endpoints utilizados, tiempos de respuesta, códigos de estado HTTP</li>
              </ul>

              <p className="text-gray-600 mb-2 mt-4">
                <strong>2.3. Información de Terceros:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Información de proveedores de servicios de pago (Stripe) relacionada con transacciones</li>
                <li>Información de proveedores de autenticación (Google OAuth) cuando utiliza inicio de sesión con terceros</li>
                <li>Información de servicios de análisis y monitoreo para mejorar nuestro Servicio</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                3. Cómo Utilizamos su Información
              </h2>
              <p className="text-gray-600 mb-3">
                Utilizamos la información recopilada para los siguientes fines:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Prestación del Servicio:</strong> Procesar y completar sus solicitudes de validación de RFC, proporcionar acceso al Dashboard y API, gestionar su cuenta y suscripción</li>
                <li><strong>Procesamiento de Pagos:</strong> Procesar transacciones, gestionar facturación, verificar métodos de pago, prevenir fraudes</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones sobre su cuenta, cambios en el servicio, actualizaciones de seguridad, respuestas a consultas de soporte</li>
                <li><strong>Mejora del Servicio:</strong> Analizar patrones de uso, identificar problemas técnicos, desarrollar nuevas funcionalidades, optimizar el rendimiento</li>
                <li><strong>Seguridad:</strong> Detectar, prevenir y abordar fraudes, abusos, actividades ilegales y violaciones de seguridad</li>
                <li><strong>Cumplimiento Legal:</strong> Cumplir con obligaciones legales, responder a solicitudes gubernamentales, hacer valer nuestros términos y condiciones</li>
                <li><strong>Marketing y Promociones:</strong> Enviar comunicaciones promocionales (con su consentimiento), realizar análisis de mercado, personalizar contenido (puede optar por no recibir estas comunicaciones en cualquier momento)</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                4. Base Legal para el Procesamiento
              </h2>
              <p className="text-gray-600 mb-3">
                Procesamos su información personal basándonos en las siguientes bases legales:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Ejecución de contrato:</strong> Para proporcionar el Servicio según los términos de su suscripción</li>
                <li><strong>Consentimiento:</strong> Cuando nos ha dado su consentimiento explícito para procesar su información para fines específicos</li>
                <li><strong>Interés legítimo:</strong> Para mejorar nuestro Servicio, prevenir fraudes, garantizar la seguridad y realizar análisis</li>
                <li><strong>Cumplimiento legal:</strong> Para cumplir con obligaciones legales y regulatorias aplicables</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                5. Compartir y Divulgación de Información
              </h2>
              <p className="text-gray-600 mb-3">
                No vendemos, alquilamos ni comercializamos su información personal a terceros. Compartimos su información únicamente en las siguientes circunstancias:
              </p>
              
              <p className="text-gray-600 mb-2 mt-4">
                <strong>5.1. Proveedores de Servicios:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Stripe:</strong> Para procesamiento seguro de pagos y gestión de suscripciones</li>
                <li><strong>Supabase:</strong> Para almacenamiento seguro de datos y gestión de bases de datos</li>
                <li><strong>Resend:</strong> Para envío de correos electrónicos transaccionales y notificaciones</li>
                <li><strong>Vercel:</strong> Para alojamiento y entrega de nuestro sitio web y servicios</li>
                <li><strong>Proveedores de análisis:</strong> Para análisis de uso y mejora del Servicio (datos agregados y anonimizados cuando sea posible)</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Estos proveedores están contractualmente obligados a proteger su información y utilizarla únicamente para los fines especificados.
              </p>

              <p className="text-gray-600 mb-2 mt-4">
                <strong>5.2. Requisitos Legales y Protección de Derechos:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Cuando sea requerido por ley, orden judicial, proceso legal o solicitud gubernamental</li>
                <li>Para hacer valer nuestros términos y condiciones, políticas o acuerdos</li>
                <li>Para proteger los derechos, propiedad o seguridad de Maflipp, nuestros usuarios o terceros</li>
                <li>En relación con una investigación de fraude, seguridad o actividad ilegal</li>
              </ul>

              <p className="text-gray-600 mb-2 mt-4">
                <strong>5.3. Transferencias Comerciales:</strong>
              </p>
              <p className="text-gray-600">
                En el caso de una fusión, adquisición, reorganización, quiebra u otra transacción comercial, su información puede ser transferida como parte de los activos de la empresa.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                6. Seguridad de los Datos
              </h2>
              <p className="text-gray-600 mb-3">
                Implementamos medidas de seguridad técnicas, administrativas y físicas diseñadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Encriptación:</strong> Utilizamos encriptación SSL/TLS para todas las transmisiones de datos y encriptación en reposo para información sensible</li>
                <li><strong>Autenticación:</strong> Implementamos autenticación de múltiples factores y gestión segura de contraseñas</li>
                <li><strong>Control de acceso:</strong> Limitamos el acceso a información personal únicamente a empleados, contratistas y agentes que necesitan conocerla para operar, desarrollar o mejorar nuestro Servicio</li>
                <li><strong>Monitoreo y detección:</strong> Monitoreamos continuamente nuestros sistemas para detectar y responder a amenazas de seguridad</li>
                <li><strong>Respaldo y recuperación:</strong> Mantenemos copias de seguridad regulares y planes de recuperación ante desastres</li>
                <li><strong>Certificaciones:</strong> Nuestros proveedores de servicios cumplen con estándares de seguridad reconocidos (PCI-DSS, SOC 2, ISO 27001, según corresponda)</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por utilizar medios comercialmente aceptables para proteger su información, no podemos garantizar su seguridad absoluta.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                7. Cookies y Tecnologías de Seguimiento
              </h2>
              <p className="text-gray-600 mb-3">
                Utilizamos cookies y tecnologías similares (píxeles de seguimiento, web beacons, etiquetas de scripts) para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Mantener su sesión activa y autenticada</li>
                <li>Recordar sus preferencias y configuraciones</li>
                <li>Analizar el tráfico y uso del sitio web</li>
                <li>Mejorar la funcionalidad y experiencia del usuario</li>
                <li>Personalizar contenido y publicidad (con su consentimiento)</li>
              </ul>
              <p className="text-gray-600 mt-3 mb-3">
                <strong>Tipos de cookies que utilizamos:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento del Servicio (no se pueden desactivar)</li>
                <li><strong>Cookies de rendimiento:</strong> Recopilan información sobre cómo utiliza el sitio (puede optar por no recibirlas)</li>
                <li><strong>Cookies de funcionalidad:</strong> Permiten recordar sus preferencias (puede optar por no recibirlas)</li>
                <li><strong>Cookies de marketing:</strong> Utilizadas para personalizar anuncios (requieren su consentimiento explícito)</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Puede gestionar sus preferencias de cookies a través de la configuración de su navegador. Tenga en cuenta que desactivar ciertas cookies puede afectar la funcionalidad del Servicio.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                8. Retención de Datos
              </h2>
              <p className="text-gray-600 mb-3">
                Conservamos su información personal durante el tiempo necesario para cumplir con los fines descritos en esta Política de Privacidad, a menos que la ley requiera o permita un período de retención más largo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Información de cuenta:</strong> Mientras su cuenta esté activa y hasta 2 años después de la cancelación (para cumplir con obligaciones legales y resolver disputas)</li>
                <li><strong>Información de facturación:</strong> Según lo requerido por ley fiscal (generalmente 5-7 años)</li>
                <li><strong>Historial de validaciones:</strong> Según su plan de suscripción (Free: no se almacena; Pro/Business: según límites del plan)</li>
                <li><strong>Logs y datos técnicos:</strong> Hasta 90 días para fines de seguridad y resolución de problemas</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Al final del período de retención, eliminaremos o anonimizaremos su información personal de forma segura, a menos que la ley requiera que la conservemos por más tiempo.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                9. Sus Derechos de Privacidad
              </h2>
              <p className="text-gray-600 mb-3">
                Dependiendo de su jurisdicción, usted puede tener los siguientes derechos respecto a su información personal:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li><strong>Derecho de acceso:</strong> Solicitar una copia de la información personal que tenemos sobre usted</li>
                <li><strong>Derecho de rectificación:</strong> Corregir información inexacta o incompleta</li>
                <li><strong>Derecho de eliminación:</strong> Solicitar la eliminación de su información personal (sujeto a obligaciones legales)</li>
                <li><strong>Derecho de oposición:</strong> Oponerse al procesamiento de su información para ciertos fines</li>
                <li><strong>Derecho de limitación:</strong> Solicitar la limitación del procesamiento de su información</li>
                <li><strong>Derecho de portabilidad:</strong> Recibir su información en un formato estructurado y comúnmente utilizado</li>
                <li><strong>Derecho de retirar consentimiento:</strong> Retirar su consentimiento cuando el procesamiento se base en consentimiento</li>
                <li><strong>Derecho de presentar una queja:</strong> Presentar una queja ante la autoridad de protección de datos competente</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Para ejercer cualquiera de estos derechos, puede contactarnos a través de <a href="mailto:soporte@maflipp.com" className="text-[#2F7E7A] hover:underline">soporte@maflipp.com</a>. Responderemos a su solicitud dentro de los plazos establecidos por la ley aplicable.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                10. Transferencias Internacionales de Datos
              </h2>
              <p className="text-gray-600">
                Su información puede ser transferida y procesada en países distintos al suyo, incluidos Estados Unidos y otros países donde operan nuestros proveedores de servicios. Al utilizar nuestro Servicio, usted consiente la transferencia de su información a estos países. Nos aseguramos de que dichas transferencias cumplan con las leyes de protección de datos aplicables mediante cláusulas contractuales estándar y otras salvaguardas apropiadas.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                11. Privacidad de Menores
              </h2>
              <p className="text-gray-600">
                Nuestro Servicio no está dirigido a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor sin el consentimiento de los padres, tomaremos medidas para eliminar esa información de nuestros servidores. Si cree que un menor nos ha proporcionado información personal, contáctenos inmediatamente.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                12. Enlaces a Sitios de Terceros
              </h2>
              <p className="text-gray-600">
                Nuestro Servicio puede contener enlaces a sitios web de terceros que no son operados por nosotros. No tenemos control sobre el contenido, políticas de privacidad o prácticas de estos sitios de terceros. Le recomendamos encarecidamente que revise las políticas de privacidad de cualquier sitio de terceros que visite.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                13. Cambios a esta Política de Privacidad
              </h2>
              <p className="text-gray-600 mb-3">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras prácticas, servicios o requisitos legales. Le notificaremos sobre cambios materiales mediante:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Correo electrónico a la dirección asociada con su cuenta</li>
                <li>Aviso prominente en nuestro sitio web</li>
                <li>Notificación dentro del Servicio</li>
              </ul>
              <p className="text-gray-600 mt-3">
                La fecha de &quot;Última actualización&quot; en la parte superior de esta política indica cuándo se realizó la última revisión. Le recomendamos que revise esta política periódicamente para mantenerse informado sobre cómo protegemos su información.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                14. Contacto y Ejercicio de Derechos
              </h2>
              <p className="text-gray-600 mb-3">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad o el procesamiento de su información personal, puede contactarnos a través de:
              </p>
              <ul className="list-none pl-0 space-y-2 text-gray-600">
                <li>
                  <strong>Correo electrónico:</strong> <a href="mailto:soporte@maflipp.com" className="text-[#2F7E7A] hover:underline">soporte@maflipp.com</a>
                </li>
                <li>
                  <strong>Sitio web:</strong> <Link href="/" className="text-[#2F7E7A] hover:underline">www.maflipp.com</Link>
                </li>
              </ul>
              <p className="text-gray-600 mt-3">
                Nos comprometemos a responder a sus consultas y solicitudes dentro de los plazos establecidos por la ley aplicable, generalmente dentro de 30 días.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/#contacto"
              className="inline-flex items-center text-[#2F7E7A] hover:text-[#1F5D59] transition-colors text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
