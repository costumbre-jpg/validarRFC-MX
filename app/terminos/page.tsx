 "use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/layout/Logo";

export default function TerminosPage() {
  const [fromOauth, setFromOauth] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined" && document.referrer?.includes("accounts.google.com")) {
      setFromOauth(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="transform scale-125 origin-left">
              <Logo size="md" showText={false} />
            </div>
            <Link
              href={fromOauth ? "#" : "/#contacto"}
              onClick={(e) => {
                if (fromOauth) {
                  e.preventDefault();
                  window.history.back();
                }
              }}
              className="inline-flex items-center gap-1 text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Términos y Condiciones de Servicio
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8 text-xs sm:text-sm leading-relaxed">
            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                1. Aceptación de los Términos
              </h2>
              <p className="text-gray-600">
                Al acceder, navegar o utilizar el sitio web <strong>maflipp.com</strong> (en adelante, el &quot;Sitio&quot;) y los servicios ofrecidos por Maflipp (en adelante, &quot;nosotros&quot;, &quot;nuestro&quot; o &quot;la Empresa&quot;), usted (en adelante, el &quot;Usuario&quot; o &quot;usted&quot;) acepta quedar vinculado por estos Términos y Condiciones de Servicio (en adelante, los &quot;Términos&quot;). Si no está de acuerdo con alguno de estos términos, no debe acceder ni utilizar nuestros servicios.
              </p>
              <p className="text-gray-600 mt-3">
                Estos Términos constituyen un acuerdo legalmente vinculante entre usted y Maflipp. Al crear una cuenta, realizar una suscripción o utilizar cualquiera de nuestros servicios, usted confirma que ha leído, entendido y acepta estar sujeto a estos Términos en su totalidad.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                2. Definiciones y Descripción del Servicio
              </h2>
              <p className="text-gray-600 mb-3">
                <strong>Maflipp</strong> es una plataforma de software como servicio (SaaS) que proporciona servicios de validación y consulta de Registros Federales de Contribuyentes (RFC) mediante integración directa con el Sistema de Administración Tributaria (SAT) de México.
              </p>
              <p className="text-gray-600 mb-3">
                Nuestros servicios incluyen, pero no se limitan a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Validación de RFCs en tiempo real contra el padrón oficial del SAT</li>
                <li>Consulta de información fiscal de contribuyentes</li>
                <li>Acceso mediante interfaz web (Dashboard)</li>
                <li>Acceso mediante API RESTful para integración con sistemas de terceros</li>
                <li>Historial y reportes de validaciones realizadas</li>
                <li>Exportación de datos en formatos CSV, Excel y PDF (según el plan contratado)</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                3. Registro de Cuenta y Elegibilidad
              </h2>
              <p className="text-gray-600 mb-3">
                Para utilizar nuestros servicios, usted debe:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Ser mayor de edad y tener capacidad legal para contratar</li>
                <li>Proporcionar información precisa, actual y completa durante el proceso de registro</li>
                <li>Mantener y actualizar de manera inmediata cualquier cambio en su información de registro</li>
                <li>Mantener la confidencialidad y seguridad de sus credenciales de acceso (usuario y contraseña)</li>
                <li>Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
                <li>Notificarnos inmediatamente de cualquier uso no autorizado de su cuenta o cualquier otra violación de seguridad</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Nos reservamos el derecho de rechazar el registro, suspender o cancelar cuentas que, a nuestro exclusivo criterio, violen estos Términos o sean utilizadas para fines fraudulentos o ilegales.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                4. Planes de Suscripción y Condiciones de Pago
              </h2>
              <p className="text-gray-600 mb-3">
                Maflipp ofrece diferentes planes de suscripción con características, límites y precios específicos. Los detalles completos de cada plan están disponibles en nuestra página de precios.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>4.1. Facturación y Renovación:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Las suscripciones se facturan por adelantado en base mensual o anual, según el plan seleccionado</li>
                <li>Las suscripciones se renuevan automáticamente al final de cada período de facturación, a menos que sean canceladas antes de la fecha de renovación</li>
                <li>Los pagos se procesan de forma segura a través de Stripe, nuestro procesador de pagos certificado PCI-DSS</li>
                <li>Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) y otros métodos de pago según disponibilidad</li>
              </ul>
              <p className="text-gray-600 mt-3 mb-3">
                <strong>4.2. Precios y Cambios:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Nos reservamos el derecho de modificar los precios de nuestros planes en cualquier momento</li>
                <li>Los cambios de precio no afectarán las suscripciones activas hasta el siguiente período de facturación</li>
                <li>Se le notificará con al menos 30 días de anticipación sobre cualquier cambio en los precios de su plan actual</li>
              </ul>
              <p className="text-gray-600 mt-3 mb-3">
                <strong>4.3. Reembolsos:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>No ofrecemos reembolsos por períodos parciales no utilizados, excepto cuando sea requerido por ley aplicable</li>
                <li>En caso de cancelación, su acceso al servicio continuará hasta el final del período de facturación ya pagado</li>
                <li>Los reembolsos, si aplican, se procesarán dentro de 10 días hábiles a la cuenta o método de pago original</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                5. Límites de Uso y Cuotas
              </h2>
              <p className="text-gray-600 mb-3">
                Cada plan de suscripción incluye límites específicos de validaciones por mes calendario. Estos límites se restablecen automáticamente al inicio de cada nuevo mes.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>El exceso de los límites mensuales puede resultar en la suspensión temporal del servicio hasta la renovación del período</li>
                <li>Para planes Business, se pueden aplicar cargos adicionales por uso excedente según los términos específicos del contrato</li>
                <li>Nos reservamos el derecho de implementar límites de tasa (rate limiting) para proteger la integridad del servicio</li>
                <li>El uso de la API está sujeto a límites de 60 solicitudes por minuto por API Key</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                6. Uso Aceptable y Restricciones
              </h2>
              <p className="text-gray-600 mb-3">
                Usted se compromete a utilizar nuestros servicios únicamente para fines legales y de conformidad con estos Términos y todas las leyes y regulaciones aplicables. Está expresamente prohibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Utilizar el servicio para actividades ilegales, fraudulentas o que violen derechos de terceros</li>
                <li>Intentar acceder no autorizadamente a áreas restringidas del servicio, sistemas o redes</li>
                <li>Interferir, interrumpir o comprometer la seguridad, integridad o disponibilidad del servicio</li>
                <li>Realizar ingeniería inversa, descompilar, desensamblar o intentar extraer el código fuente del servicio</li>
                <li>Utilizar el servicio para enviar spam, correos no solicitados o realizar actividades de marketing no autorizado</li>
                <li>Compartir, vender, sublicenciar o transferir sus credenciales de acceso o API Keys a terceros</li>
                <li>Utilizar el servicio de manera que pueda dañar, deshabilitar, sobrecargar o comprometer nuestros servidores o redes</li>
                <li>Utilizar robots, scripts automatizados o métodos similares para acceder al servicio sin autorización expresa</li>
              </ul>
              <p className="text-gray-600 mt-3">
                La violación de estas restricciones puede resultar en la terminación inmediata de su cuenta sin derecho a reembolso.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                7. Propiedad Intelectual e Industrial
              </h2>
              <p className="text-gray-600 mb-3">
                Todos los derechos de propiedad intelectual e industrial sobre el Sitio, el servicio, su contenido, diseño, código fuente, funcionalidades, marcas, logotipos y cualquier otro material relacionado (en adelante, el &quot;Contenido&quot;) son propiedad exclusiva de Maflipp o de sus licenciantes.
              </p>
              <p className="text-gray-600 mb-3">
                Se le otorga una licencia limitada, no exclusiva, no transferible y revocable para acceder y utilizar el servicio únicamente para sus fines comerciales legítimos, de conformidad con estos Términos. Esta licencia no incluye:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>El derecho de copiar, modificar, adaptar, traducir o crear obras derivadas del Contenido</li>
                <li>El derecho de distribuir, licenciar, sublicenciar, vender o transferir el Contenido</li>
                <li>El derecho de utilizar el Contenido para fines competitivos o para desarrollar productos o servicios similares</li>
              </ul>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                8. Limitación de Responsabilidad y Garantías
              </h2>
              <p className="text-gray-600 mb-3">
                <strong>8.1. Prestación del Servicio:</strong> El servicio se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;. No garantizamos que el servicio sea ininterrumpido, oportuno, seguro, libre de errores o que cumpla con sus requisitos específicos.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>8.2. Información del SAT:</strong> La información proporcionada por nuestro servicio se obtiene directamente del padrón del SAT. No garantizamos la exactitud, completitud o actualidad de dicha información, ya que depende de los datos proporcionados por el SAT.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>8.3. Limitación de Daños:</strong> En la máxima medida permitida por la ley aplicable, Maflipp no será responsable de daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pero no limitándose a pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes del uso o la imposibilidad de usar el servicio.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>8.4. Límite de Responsabilidad:</strong> Nuestra responsabilidad total hacia usted por cualquier reclamo relacionado con el servicio no excederá el monto total pagado por usted a Maflipp en los doce (12) meses anteriores al evento que dio lugar al reclamo.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                9. Modificaciones del Servicio y Términos
              </h2>
              <p className="text-gray-600 mb-3">
                Nos reservamos el derecho, a nuestra exclusiva discreción, de:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Modificar, actualizar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso</li>
                <li>Modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el Sitio</li>
                <li>Notificarle sobre cambios materiales mediante correo electrónico a la dirección asociada con su cuenta o mediante un aviso prominente en el Sitio</li>
              </ul>
              <p className="text-gray-600 mt-3">
                Su uso continuado del servicio después de la publicación de cambios constituye su aceptación de dichos cambios. Si no está de acuerdo con los cambios, debe cancelar su suscripción y dejar de utilizar el servicio.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                10. Cancelación y Terminación
              </h2>
              <p className="text-gray-600 mb-3">
                <strong>10.1. Cancelación por el Usuario:</strong> Usted puede cancelar su suscripción en cualquier momento desde el panel de facturación de su cuenta. La cancelación será efectiva al final del período de facturación actual, y su acceso al servicio continuará hasta esa fecha.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>10.2. Terminación por Maflipp:</strong> Nos reservamos el derecho de suspender o terminar su cuenta y acceso al servicio inmediatamente, sin previo aviso ni responsabilidad, si:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Usted viola estos Términos o cualquier política aplicable</li>
                <li>Su uso del servicio representa un riesgo para la seguridad o integridad del servicio o de otros usuarios</li>
                <li>Se detecta actividad fraudulenta o uso no autorizado</li>
                <li>No realiza el pago de su suscripción en la fecha de vencimiento</li>
              </ul>
              <p className="text-gray-600 mt-3">
                <strong>10.3. Efectos de la Terminación:</strong> Al terminar su cuenta, perderá inmediatamente el acceso a todos los datos, historial y funcionalidades del servicio. No seremos responsables de la pérdida de datos resultante de la terminación.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                11. Protección de Datos y Privacidad
              </h2>
              <p className="text-gray-600">
                El tratamiento de sus datos personales se rige por nuestra Política de Privacidad, que forma parte integral de estos Términos. Al utilizar el servicio, usted acepta el procesamiento de sus datos personales de acuerdo con dicha política.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                12. Ley Aplicable y Jurisdicción
              </h2>
              <p className="text-gray-600 mb-3">
                Estos Términos se rigen e interpretan de acuerdo con las leyes de los Estados Unidos Mexicanos, sin dar efecto a cualquier principio de conflictos de leyes.
              </p>
              <p className="text-gray-600">
                Cualquier disputa, controversia o reclamo que surja de o esté relacionado con estos Términos o el servicio será sometido a la jurisdicción exclusiva de los tribunales competentes de la Ciudad de México, México, y las partes renuncian expresamente a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                13. Disposiciones Generales
              </h2>
              <p className="text-gray-600 mb-3">
                <strong>13.1. Acuerdo Completo:</strong> Estos Términos, junto con nuestra Política de Privacidad, constituyen el acuerdo completo entre usted y Maflipp respecto del uso del servicio y reemplazan todos los acuerdos, comunicaciones y entendimientos previos.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>13.2. Divisibilidad:</strong> Si alguna disposición de estos Términos se considera inválida o inaplicable, las disposiciones restantes permanecerán en pleno vigor y efecto.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>13.3. Renuncia:</strong> El hecho de que no ejerzamos o hagamos valer cualquier derecho o disposición de estos Términos no constituirá una renuncia a tal derecho o disposición.
              </p>
              <p className="text-gray-600 mb-3">
                <strong>13.4. Cesión:</strong> Usted no puede ceder o transferir estos Términos o sus derechos u obligaciones aquí establecidos sin nuestro consentimiento previo por escrito. Maflipp puede ceder estos Términos sin restricción.
              </p>
            </section>

            <section className="border-l-2 border-gray-200 pl-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
                14. Contacto y Notificaciones
              </h2>
              <p className="text-gray-600 mb-3">
                Para cualquier consulta, reclamo o notificación relacionada con estos Términos, puede contactarnos a través de:
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
                Las notificaciones que le enviemos se considerarán efectivas cuando se envíen a la dirección de correo electrónico asociada con su cuenta o cuando se publiquen en el Sitio.
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
