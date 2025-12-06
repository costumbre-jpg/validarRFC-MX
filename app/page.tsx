import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#10B981]">
                ValidaRFC.mx
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="#inicio" className="text-gray-700 hover:text-[#10B981] transition-colors">
                Inicio
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#10B981] transition-colors">
                Precios
              </Link>
              <Link href="#api" className="text-gray-700 hover:text-[#10B981] transition-colors">
                API
              </Link>
              <Link href="#contacto" className="text-gray-700 hover:text-[#10B981] transition-colors">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-[#10B981] transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#10B981] text-white px-4 py-2 rounded-lg hover:bg-[#059669] transition-colors font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Valida RFCs contra el SAT en{" "}
            <span className="text-[#10B981]">2 segundos</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Verifica que tus proveedores existan realmente en el padrón del SAT
          </p>

          {/* RFC Input */}
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Ej: ABC123456XYZ"
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#10B981] transition-colors"
              />
              <button className="bg-[#10B981] text-white px-8 py-4 rounded-lg hover:bg-[#059669] transition-colors font-semibold text-lg whitespace-nowrap">
                Validar Gratis
              </button>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            5 validaciones gratis/mes • Más rápido que el SAT oficial
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Cómo Funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Paso 1 */}
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                1. Ingresa el RFC
              </h3>
              <p className="text-gray-600">
                Escribe o pega el RFC que deseas validar en nuestro sistema
              </p>
            </div>

            {/* Paso 2 */}
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                2. Consultamos el SAT en tiempo real
              </h3>
              <p className="text-gray-600">
                Nuestro sistema consulta directamente el padrón del SAT
              </p>
            </div>

            {/* Paso 3 */}
            <div className="text-center">
              <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                3. Recibe resultado instantáneo
              </h3>
              <p className="text-gray-600">
                Obtén la respuesta en menos de 2 segundos con todos los detalles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES DE PRECIOS */}
      <section id="precios" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Planes de Precios
          </h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
            {/* Plan FREE */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">FREE</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">5 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Resultados básicos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Sin historial</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                Comenzar Gratis
              </button>
            </div>

            {/* Plan PRO - DESTACADO */}
            <div className="bg-white border-2 border-[#10B981] rounded-2xl p-8 shadow-xl relative transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#10B981] text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MÁS POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$99</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">100 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Historial completo</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Exportar a CSV</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API básica</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Soporte prioritario</span>
                </li>
              </ul>
              <button className="w-full bg-[#10B981] text-white py-3 rounded-lg font-semibold hover:bg-[#059669] transition-colors">
                Comenzar Ahora
              </button>
            </div>

            {/* Plan EMPRESA */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">EMPRESA</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">$499</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">1,000 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API completa</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dashboard avanzado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">White-label</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Soporte 24/7</span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-lg mb-6 italic">
                &quot;Como contador, valido 50+ RFCs al mes. ValidaRFC me ahorra horas.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  C
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Carlos</p>
                  <p className="text-gray-600 text-sm">Contador</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-lg mb-6 italic">
                &quot;Implementamos en nuestra fintech para validar clientes automáticamente.&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  S
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sofía</p>
                  <p className="text-gray-600 text-sm">Fintech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Es legal consultar el SAT?
              </h3>
              <p className="text-gray-600">
                Sí, es completamente legal. Consultamos el padrón de contribuyentes del SAT que es información pública. 
                Nuestro servicio está diseñado para ayudar a empresas y contadores a verificar la validez de RFCs de manera eficiente.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Stripe. 
                También ofrecemos facturación para planes empresariales.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Puedo cancelar cuando quiera?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. 
                No hay contratos de permanencia ni penalizaciones por cancelación.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Cómo funcionan las validaciones gratis?
              </h3>
              <p className="text-gray-600">
                El plan gratuito incluye 5 validaciones por mes sin necesidad de tarjeta de crédito. 
                Las validaciones se renuevan cada mes. Si necesitas más, puedes actualizar a un plan de pago en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-[#10B981] mb-4">
                ValidaRFC.mx
              </h3>
              <p className="text-gray-400">
                Valida RFCs contra el SAT en tiempo real
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#precios" className="hover:text-[#10B981] transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="hover:text-[#10B981] transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#10B981] transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terminos" className="hover:text-[#10B981] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-[#10B981] transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <p className="text-gray-400">
                <a
                  href="mailto:hola@validarfcmx.mx"
                  className="hover:text-[#10B981] transition-colors"
                >
                  hola@validarfcmx.mx
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 ValidaRFC.mx. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
