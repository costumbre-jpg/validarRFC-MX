import Link from "next/link";

export default function PrivacidadPage() {
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
            Política de Privacidad
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              Última actualización: {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Información que Recopilamos
              </h2>
              <p>
                ValidaRFC.mx recopila la siguiente información cuando utilizas nuestro servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Información de cuenta:</strong> Dirección de correo electrónico, nombre (si se proporciona)
                </li>
                <li>
                  <strong>Información de uso:</strong> RFCs validados, fecha y hora de validaciones, historial de consultas
                </li>
                <li>
                  <strong>Información de pago:</strong> Información de facturación procesada de forma segura a través de Stripe
                </li>
                <li>
                  <strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema operativo
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Cómo Utilizamos tu Información
              </h2>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Proporcionar y mejorar nuestros servicios de validación de RFC</li>
                <li>Procesar pagos y gestionar suscripciones</li>
                <li>Enviar notificaciones relacionadas con tu cuenta</li>
                <li>Analizar el uso del servicio para mejoras</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Compartir Información
              </h2>
              <p>
                No vendemos ni compartimos tu información personal con terceros, excepto:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>
                  <strong>Proveedores de servicios:</strong> Utilizamos Stripe para procesamiento de pagos y Supabase para almacenamiento de datos
                </li>
                <li>
                  <strong>Requisitos legales:</strong> Cuando sea requerido por ley o para proteger nuestros derechos
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Seguridad de los Datos
              </h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Tus Derechos
              </h2>
              <p>Tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Acceder a tu información personal</li>
                <li>Corregir información incorrecta</li>
                <li>Solicitar la eliminación de tu cuenta y datos</li>
                <li>Oponerte al procesamiento de tus datos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Cookies y Tecnologías Similares
              </h2>
              <p>
                Utilizamos cookies y tecnologías similares para mantener tu sesión, recordar tus preferencias y mejorar la experiencia del usuario.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cambios a esta Política
              </h2>
              <p>
                Nos reservamos el derecho de actualizar esta política de privacidad. Te notificaremos de cambios significativos mediante correo electrónico o mediante un aviso en nuestro sitio web.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Contacto
              </h2>
              <p>
                Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a través de:
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

