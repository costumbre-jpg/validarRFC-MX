"use client";

import { useState } from "react";
import Link from "next/link";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [calculatorHours, setCalculatorHours] = useState(2);
  const [calculatorRate, setCalculatorRate] = useState(500);

  const plans = {
    free: {
      name: "FREE",
      monthlyPrice: 0,
      annualPrice: 0,
      validations: 5,
      history: false,
      export: false,
      api: false,
      support: "Comunidad",
      whiteLabel: false,
      features: [
        "5 validaciones/mes",
        "Resultados básicos",
        "Sin historial",
        "Sin exportación",
        "Sin API",
      ],
    },
    pro: {
      name: "PRO",
      monthlyPrice: 99,
      annualPrice: 950, // 20% off: 99 * 12 * 0.8 = 950.4
      validations: 100,
      history: true,
      export: true,
      api: "Básica",
      support: "Prioritario",
      whiteLabel: false,
      features: [
        "100 validaciones/mes",
        "Historial completo",
        "Exportar a CSV",
        "API básica",
        "Soporte prioritario",
        "Prueba gratis 7 días",
      ],
      popular: true,
    },
    enterprise: {
      name: "EMPRESA",
      monthlyPrice: 499,
      annualPrice: 4788, // 20% off: 499 * 12 * 0.8 = 4790.4
      validations: 1000,
      history: true,
      export: true,
      api: "Completa",
      support: "24/7",
      whiteLabel: true,
      features: [
        "1,000 validaciones/mes",
        "Historial completo",
        "Exportar a CSV/Excel",
        "API completa",
        "Dashboard avanzado",
        "White-label",
        "Soporte 24/7",
        "Facturación CFDI",
      ],
    },
  };

  const calculateSavings = () => {
    const manualCost = calculatorHours * calculatorRate;
    const proCost = billingCycle === "monthly" ? 99 : 950 / 12;
    const savings = manualCost - proCost;
    return {
      manualCost,
      proCost: Math.round(proCost),
      savings: Math.round(savings),
    };
  };

  const savings = calculateSavings();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[#10B981]">
                ValidaRFC.mx
              </span>
            </Link>
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

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Elige el plan perfecto para tu negocio
          </p>
          <p className="text-sm text-gray-500 mb-8">
            💰 Todos los precios están en <strong>Pesos Mexicanos (MXN)</strong>
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span
              className={`text-sm font-medium ${
                billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Mensual
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#10B981] transition-colors focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                billingCycle === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Anual
            </span>
            {billingCycle === "annual" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                20% OFF
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* FREE Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">FREE</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600"> MXN/mes</span>
            </div>
            <ul className="space-y-3 mb-8">
              {plans.free.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register"
              className="block w-full text-center bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* PRO Plan */}
          <div className="bg-white border-2 border-[#10B981] rounded-2xl p-8 shadow-xl relative transform scale-105">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#10B981] text-white px-4 py-1 rounded-full text-sm font-semibold">
                MÁS POPULAR
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">PRO</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">
                ${billingCycle === "monthly" ? plans.pro.monthlyPrice : Math.round(plans.pro.annualPrice / 12)}
              </span>
              <span className="text-gray-600"> MXN/mes</span>
              {billingCycle === "annual" && (
                <div className="text-sm text-gray-500 mt-1">
                  ${plans.pro.annualPrice.toLocaleString()} MXN facturado anualmente
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plans.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register?plan=pro"
              className="block w-full text-center bg-[#10B981] text-white py-3 rounded-lg font-semibold hover:bg-[#059669] transition-colors"
            >
              Comprar Pro
            </Link>
          </div>

          {/* ENTERPRISE Plan */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">EMPRESA</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">
                ${billingCycle === "monthly" ? plans.enterprise.monthlyPrice : Math.round(plans.enterprise.annualPrice / 12)}
              </span>
              <span className="text-gray-600"> MXN/mes</span>
              {billingCycle === "annual" && (
                <div className="text-sm text-gray-500 mt-1">
                  ${plans.enterprise.annualPrice.toLocaleString()} MXN facturado anualmente
                </div>
              )}
            </div>
            <ul className="space-y-3 mb-8">
              {plans.enterprise.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register?plan=enterprise"
              className="block w-full text-center bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Contactar Ventas
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-16 overflow-x-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comparativa Detallada
          </h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Característica
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  FREE
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-[#10B981] bg-opacity-10">
                  PRO
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EMPRESA
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Precio
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  $0 MXN/mes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  ${billingCycle === "monthly" ? "99" : "79"} MXN/mes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ${billingCycle === "monthly" ? "499" : "399"} MXN/mes
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Validaciones por mes
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {plans.free.validations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  {plans.pro.validations}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {plans.enterprise.validations}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Historial
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ❌
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  ✅
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ✅
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Exportar datos
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ❌
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  ✅ CSV
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ✅ CSV/Excel
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Acceso API
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ❌
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  ✅ Básica
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ✅ Completa
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Soporte
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  Comunidad
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  Prioritario
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  24/7
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  White-label
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ❌
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center bg-[#10B981] bg-opacity-5">
                  ❌
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  ✅
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Savings Calculator */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-2xl p-8 text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">¿Cuánto ahorrarías?</h2>
          <p className="text-lg mb-6 opacity-90">
            Calcula cuánto dinero puedes ahorrar automatizando tus validaciones
          </p>

          <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tarifa de tu contador (MXN/hora)
                </label>
                <input
                  type="number"
                  value={calculatorRate}
                  onChange={(e) => setCalculatorRate(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Horas para validar 100 RFCs manualmente
                </label>
                <input
                  type="number"
                  value={calculatorHours}
                  onChange={(e) => setCalculatorHours(Number(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>
            </div>

            <div className="bg-white bg-opacity-30 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm opacity-90 mb-1">Costo Manual</p>
                  <p className="text-2xl font-bold">
                    ${savings.manualCost.toLocaleString()} MXN
                  </p>
                  <p className="text-xs opacity-75">por mes</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Con ValidaRFC Pro</p>
                  <p className="text-2xl font-bold">
                    ${savings.proCost.toLocaleString()} MXN
                  </p>
                  <p className="text-xs opacity-75">por mes</p>
                </div>
                <div>
                  <p className="text-sm opacity-90 mb-1">Ahorro Mensual</p>
                  <p className="text-3xl font-bold">
                    ${savings.savings.toLocaleString()} MXN
                  </p>
                  <p className="text-xs opacity-75">
                    ${(savings.savings * 12).toLocaleString()} MXN al año
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Puedo cambiar de plan?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cambiar de plan en cualquier momento desde tu
                dashboard. Si cambias a un plan superior, se aplicará
                inmediatamente. Si cambias a un plan inferior, los cambios se
                aplicarán al final de tu período de facturación actual.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Hay descuento anual?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos un 20% de descuento en planes anuales. Esto
                significa que pagas menos por mes y ahorras significativamente
                a lo largo del año. Puedes cambiar entre facturación mensual y
                anual en cualquier momento.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Facturan con CFDI?
              </h3>
              <p className="text-gray-600">
                Sí, para planes Pro y Empresa emitimos facturas CFDI
                electrónicas válidas ante el SAT. Recibirás tu factura por
                email después de cada pago. Los planes Enterprise incluyen
                facturación CFDI automática.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Tienen prueba gratis?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos 7 días de prueba gratis para el plan Pro. No
                necesitas tarjeta de crédito para comenzar. Puedes cancelar en
                cualquier momento durante el período de prueba sin cargos. El
                plan Free siempre está disponible sin límite de tiempo.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gray-900 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Únete a cientos de empresas que confían en ValidaRFC.mx
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-semibold text-lg"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/auth/register?plan=pro"
              className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
            >
              Probar Pro 7 Días
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#10B981] mb-4">
              ValidaRFC.mx
            </p>
            <p className="text-gray-400 mb-4">
              © 2024 ValidaRFC.mx. Todos los derechos reservados.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                href="/terminos"
                className="hover:text-[#10B981] transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/privacidad"
                className="hover:text-[#10B981] transition-colors"
              >
                Privacidad
              </Link>
              <a
                href="mailto:hola@validarfcmx.mx"
                className="hover:text-[#10B981] transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

