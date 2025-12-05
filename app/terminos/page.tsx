import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#10B981]">
                ValidaRFC.mx
              </span>
            </Link>
            <Link
              href="/"
              className="text-gray-700 hover:text-[#10B981] transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Términos de Servicio
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Aceptación de los Términos
              </h2>
              <p>
                Al acceder y utilizar ValidaRFC.mx, aceptas estar sujeto a estos Términos de Servicio y a todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestro servicio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Descripción del Servicio
              </h2>
              <p>
                ValidaRFC.mx es una plataforma SaaS que proporciona servicios de validación de RFC (Registro Federal de Contribuyentes) para empresas y profesionales en México. Ofrecemos validaciones individuales y acceso mediante API.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Registro y Cuenta de Usuario
              </h2>
              <p>Para utilizar nuestros servicios, debes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Crear una cuenta proporcionando información precisa y completa</li>
                <li>Mantener la seguridad de tu cuenta y contraseña</li>
                <li>Ser responsable de todas las actividades bajo tu cuenta</li>
                <li>Notificarnos inmediatamente de cualquier uso no autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Planes y Pagos
              </h2>
              <p>
                Ofrecemos diferentes planes de suscripción con precios y límites específicos:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Los pagos se procesan de forma segura a través de Stripe</li>
                <li>Las suscripciones se renuevan automáticamente según el plan seleccionado</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde el panel de facturación</li>
                <li>No ofrecemos reembolsos por períodos no utilizados, excepto según lo requerido por ley</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Uso Aceptable
              </h2>
              <p>Está prohibido:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Utilizar el servicio para actividades ilegales o no autorizadas</li>
                <li>Intentar acceder a áreas restringidas del servicio</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
                <li>Utilizar el servicio para spam o actividades maliciosas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Límites de Uso
              </h2>
              <p>
                Cada plan tiene límites específicos de validaciones por mes. El exceso de estos límites puede resultar en cargos adicionales o suspensión del servicio hasta la renovación del período.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Propiedad Intelectual
              </h2>
              <p>
                Todo el contenido, diseño, código y funcionalidades de ValidaRFC.mx son propiedad de ValidaRFC.mx y están protegidos por leyes de propiedad intelectual. No puedes copiar, modificar o distribuir nuestro contenido sin autorización.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Limitación de Responsabilidad
              </h2>
              <p>
                ValidaRFC.mx proporciona el servicio "tal cual" sin garantías expresas o implícitas. No garantizamos que el servicio sea ininterrumpido, seguro o libre de errores. No seremos responsables por daños indirectos, incidentales o consecuentes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Modificaciones del Servicio
              </h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento, con o sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Cancelación y Terminación
              </h2>
              <p>
                Puedes cancelar tu cuenta en cualquier momento desde el panel de facturación. Nos reservamos el derecho de suspender o terminar tu cuenta si violas estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Ley Aplicable
              </h2>
              <p>
                Estos términos se rigen por las leyes de México. Cualquier disputa será resuelta en los tribunales competentes de México.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre estos términos, puedes contactarnos a través de:
              </p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li>
                  <strong>Email:</strong> soporte@validarfcmx.com
                </li>
                <li>
                  <strong>Sitio web:</strong> <Link href="/" className="text-[#10B981] hover:underline">ValidaRFC.mx</Link>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-[#10B981] hover:text-[#059669] transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

