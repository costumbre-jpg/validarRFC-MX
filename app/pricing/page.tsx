"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { getActivePlans, getPlan, type PlanId } from "@/lib/plans";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [calculatorHours, setCalculatorHours] = useState(2);
  const [calculatorRate, setCalculatorRate] = useState(500);

  // Obtener solo los planes activos para MVP
  const activePlans = getActivePlans();
  
  // Plan PRO para el calculador de ahorros
  const proPlan = getPlan("pro");

  const calculateSavings = () => {
    const manualCost = calculatorHours * calculatorRate;
    const proCost = billingCycle === "monthly" ? proPlan.monthlyPrice : proPlan.annualPrice / 12;
    const savings = manualCost - proCost;
    return {
      manualCost,
      proCost: Math.round(proCost),
      savings: Math.round(savings),
    };
  };

  const savings = calculateSavings();

  // Función helper para generar features list
  const getPlanFeatures = (plan: typeof activePlans[0]) => {
    const features: string[] = [];
    
    // Validaciones
    if (plan.validationsPerMonth === -1) {
      features.push("Validaciones ilimitadas");
    } else {
      features.push(`${plan.validationsPerMonth.toLocaleString()} validaciones/mes`);
    }
    
    // Historial
    if (plan.features.history) {
      if (plan.features.historyDays) {
        features.push(`Historial ${plan.features.historyDays} días`);
      } else {
        features.push("Historial ilimitado");
      }
    } else {
      features.push("Sin historial");
    }
    
    // Exportación
    if (plan.features.export) {
      if (plan.features.exportFormats) {
        features.push(`Exportar a ${plan.features.exportFormats.join(", ")}`);
      } else {
        features.push("Exportar datos");
      }
    } else {
      features.push("Sin exportación");
    }
    
    // API
    if (plan.features.api) {
      if (typeof plan.features.api === "string") {
        const apiType = plan.features.api;
        if (plan.features.apiCallsPerMonth) {
          if (plan.features.apiCallsPerMonth === -1) {
            features.push(`API ${apiType}: Ilimitadas`);
          } else {
            features.push(`API ${apiType}: ${plan.features.apiCallsPerMonth.toLocaleString()} llamadas/mes`);
          }
        } else {
          features.push(`API ${apiType}`);
        }
      } else {
        features.push("Acceso API");
      }
    } else {
      features.push("Sin API");
    }
    
    // Usuarios
    if (plan.features.users === -1) {
      features.push("Usuarios ilimitados");
    } else {
      features.push(`${plan.features.users} usuario${plan.features.users > 1 ? "s" : ""}`);
    }
    
    // White-label
    if (plan.features.whiteLabel) {
      features.push("White-label");
    }
    
    // SSO
    if (plan.features.sso) {
      features.push("SSO (Single Sign-On)");
    }
    
    // SLA
    if (plan.features.sla) {
      features.push(`SLA ${plan.features.sla}`);
    }
    
    // Soporte
    features.push(`Soporte: ${plan.features.support}`);
    
    // Features adicionales
    if (plan.features.other && plan.features.other.length > 0) {
      features.push(...plan.features.other);
    }
    
    return features;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="md" />
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-[#2F7E7A] text-white px-4 py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-medium"
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
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#2F7E7A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:ring-offset-2"
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
        <div className={`grid gap-8 mb-16 ${activePlans.length === 3 ? "md:grid-cols-3" : activePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {activePlans.map((plan, index) => {
            const isPopular = plan.popular;
            const isFree = plan.monthlyPrice === 0;
            const monthlyPrice = billingCycle === "monthly" 
              ? plan.monthlyPrice 
              : Math.round(plan.annualPrice / 12);
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={`bg-white border-2 rounded-2xl p-8 shadow-sm relative ${
                  isPopular
                    ? "border-[#10B981] shadow-xl transform scale-105"
                    : "border-gray-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#2F7E7A] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    MÁS POPULAR
                  </span>
                  </div>
                )}
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600"> MXN/mes</span>
                  {billingCycle === "annual" && plan.annualPrice > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      ${plan.annualPrice.toLocaleString()} MXN facturado anualmente
                    </div>
                  )}
                </div>
                
                <ul className="space-y-3 mb-8">
                  {features.map((feature, idx) => {
                    const isSoon = feature.toLowerCase().includes("próximamente");
                    return (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-[#10B981] mr-2 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <div className="text-gray-700">
                          <span className={isSoon ? "text-gray-500 line-through" : undefined}>{feature}</span>
                          {isSoon && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                              Próximamente
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {isFree ? (
                  <Link
                    href="/auth/register"
                    className="block w-full text-center bg-gray-100 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Comenzar Gratis
                  </Link>
                ) : (
                  <Link
                    href={`/auth/register?plan=${plan.id}`}
                    className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl ${
                      isPopular
                        ? "bg-[#2F7E7A] text-white hover:bg-[#1F5D59]"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    {plan.id === "business" ? "Contactar Ventas" : `Comprar ${plan.name}`}
                  </Link>
                )}
              </div>
            );
          })}
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
                {activePlans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-10" : ""
                    }`}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Precio
                </td>
                {activePlans.map((plan) => {
                  const monthlyPrice = billingCycle === "monthly" 
                    ? plan.monthlyPrice 
                    : Math.round(plan.annualPrice / 12);
                  return (
                    <td
                      key={plan.id}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                        plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                      }`}
                    >
                      ${monthlyPrice.toLocaleString()} MXN/mes
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Validaciones por mes
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.validationsPerMonth === -1
                      ? "Ilimitadas"
                      : plan.validationsPerMonth.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Historial
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.history
                      ? plan.features.historyDays
                        ? `${plan.features.historyDays} días`
                        : "✅ Ilimitado"
                      : "❌"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Exportar datos
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.export
                      ? plan.features.exportFormats
                        ? `✅ ${plan.features.exportFormats.join(", ")}`
                        : "✅"
                      : "❌"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Acceso API
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.api
                      ? typeof plan.features.api === "string"
                        ? `✅ ${plan.features.api}`
                        : "✅"
                      : "❌"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Usuarios
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.users === -1 ? "Ilimitados" : plan.features.users}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Soporte
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.support}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  White-label
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center ${
                      plan.popular ? "bg-[#10B981] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.whiteLabel ? "✅" : "❌"}
                  </td>
                ))}
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
                  <p className="text-sm opacity-90 mb-1">Con Maflipp Pro</p>
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
        <div id="faq" className="mb-16 scroll-mt-20">
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
                Sí, para planes Pro y Business emitimos facturas CFDI
                electrónicas válidas ante el SAT. Recibirás tu factura por
                email después de cada pago.
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
            Únete a cientos de empresas que confían en Maflipp
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/auth/register?plan=pro"
              className="px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
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
            <Logo size="lg" className="mb-4 justify-center" />
            <p className="text-gray-400 mb-4">
              © 2024 Maflipp. Todos los derechos reservados.
            </p>
            <div className="flex justify-center gap-6">
              <Link
                href="/terminos"
                className="hover:text-[#2F7E7A] transition-colors"
              >
                Términos
              </Link>
              <Link
                href="/privacidad"
                className="hover:text-[#2F7E7A] transition-colors"
              >
                Privacidad
              </Link>
              <a
                href="mailto:hola@maflipp.com"
                className="hover:text-[#2F7E7A] transition-colors"
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
