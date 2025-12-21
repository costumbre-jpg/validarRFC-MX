"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import AuthModal from "@/components/auth/AuthModal";
import { getActivePlans, getPlan } from "@/lib/plans";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [calculatorHours, setCalculatorHours] = useState(2); // horas por cada 100 RFCs (manual)
  const [calculatorRate, setCalculatorRate] = useState(500);
  const [calculatorRfcPerMonth, setCalculatorRfcPerMonth] = useState(100);
  const [calculatorPlanId, setCalculatorPlanId] = useState<"pro" | "business">("pro");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [authRedirectTo, setAuthRedirectTo] = useState<string>("/dashboard");

  // Obtener solo los planes activos para MVP
  const activePlans = getActivePlans();
  const comparisonOtherFeatures = Array.from(
    new Set(activePlans.flatMap((p) => p.features.other || []))
  ).filter(Boolean);
  
  // Plan seleccionado para el calculador de ahorros
  const selectedPlan = getPlan(calculatorPlanId);

  const calculateSavings = () => {
    const safeRate = Number.isFinite(calculatorRate) ? Math.max(0, calculatorRate) : 0;
    const safeHoursPer100 = Number.isFinite(calculatorHours) ? Math.max(0, calculatorHours) : 0;
    const safeRfcPerMonth = Number.isFinite(calculatorRfcPerMonth) ? Math.max(0, calculatorRfcPerMonth) : 0;

    const manualHours = (safeRfcPerMonth / 100) * safeHoursPer100;
    const manualCost = manualHours * safeRate;

    const planCostMonthly = selectedPlan.monthlyPrice;
    const planCostAnnual = selectedPlan.annualPrice;
    const planCostMonthlyEquivalent = billingCycle === "annual" ? planCostAnnual / 12 : planCostMonthly;

    // Comparamos contra costo mensual (o equivalente mensual si paga anual)
    const savings = manualCost - planCostMonthlyEquivalent;
    return {
      manualHours: Math.round(manualHours * 10) / 10,
      manualCost: Math.round(manualCost),
      planCostMonthly: Math.round(planCostMonthly),
      planCostAnnual: Math.round(planCostAnnual),
      planCostMonthlyEquivalent: Math.round(planCostMonthlyEquivalent),
      savings: Math.round(savings),
    };
  };

  const savings = calculateSavings();

  // Función helper para generar features list
  const getPlanFeatures = (plan: typeof activePlans[0]) => {
    const features: string[] = [];

    // FREE: mantener exactamente el mismo contenido/orden que en el landing
    if (plan.id === "free") {
      const validations =
        plan.validationsPerMonth === -1
          ? "Validaciones ilimitadas"
          : `${plan.validationsPerMonth.toLocaleString()} validaciones/mes`;

      const limitText = `Límite: ${plan.validationsPerMonth.toLocaleString()} validaciones/mes`;
      const other = plan.features.other || [];
      const extras = other.filter((x) => x !== limitText && !x.startsWith("Límite:"));

      return [
        validations,
        ...(extras.length > 0 ? extras : ["Resultados básicos (válido/inválido)", "Estadísticas básicas de uso"]),
        `${plan.features.users} usuario${plan.features.users === 1 ? "" : "s"}`,
        `Soporte: ${plan.features.support}`,
        limitText,
        "Sin historial de validaciones",
        "Sin exportación de datos",
        "Sin acceso a API",
      ];
    }
    
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
      features.push("Sin historial de validaciones");
    }
    
    // Exportación
    if (plan.features.export) {
      if (plan.features.exportFormats) {
        features.push(`Exportar a ${plan.features.exportFormats.join(", ")}`);
      } else {
        features.push("Exportar datos");
      }
    } else {
      features.push("Sin exportación de datos");
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
      features.push("Sin acceso a API");
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

  const renderAvailability = (value: boolean | "dash") => {
    if (value === "dash") {
      return <span className="text-gray-400">—</span>;
    }

    if (value) {
    return (
      <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700">
        Sí
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-gray-50 text-gray-500">
      No
    </span>
  );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="transform scale-110 origin-left">
              <Logo size="md" showText={false} />
            </div>
            <Link
              href="/#precios"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-[#2F7E7A] transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mb-3 tracking-tight">
            Planes y Precios
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mb-1.5">
            Elige el plan perfecto para tu negocio
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-6">
            Todos los precios están en <strong>Pesos Mexicanos (MXN)</strong>
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span
              className={`text-xs font-medium ${
                billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Mensual
            </span>
            <button
              onClick={() =>
                setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")
              }
              className="relative inline-flex h-5 w-9 items-center rounded-full bg-[#2F7E7A] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:ring-offset-2"
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annual" ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span
              className={`text-xs font-medium ${
                billingCycle === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Anual
            </span>
            {billingCycle === "annual" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                20% OFF
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className={`grid gap-4 mb-8 ${activePlans.length === 3 ? "md:grid-cols-3" : activePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
          {activePlans.map((plan) => {
            const isPopular = plan.popular;
            const isFree = plan.monthlyPrice === 0;
            const displayPrice =
              billingCycle === "annual" && plan.annualPrice > 0
                ? plan.annualPrice
                : plan.monthlyPrice;
            const displaySuffix =
              isFree ? "Gratis" : billingCycle === "annual" ? "MXN/año" : "MXN/mes";
            const features = getPlanFeatures(plan);

            return (
              <div
                key={plan.id}
                className={`bg-white ${isPopular ? "border-2" : "border"} rounded-lg p-4 shadow-sm relative ${
                  isPopular
                    ? "border-[#2F7E7A] shadow-sm transform scale-[1.01]"
                    : "border-gray-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#2F7E7A] text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold shadow-sm">
                    MÁS POPULAR
                  </span>
                  </div>
                )}
                
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">{plan.name}</h3>
                
                <div className="mb-4">
                  <span className="text-2xl font-semibold text-gray-900">
                    ${displayPrice.toLocaleString()}
                  </span>
                  <span className="text-gray-600 text-sm"> {displaySuffix}</span>
                  {plan.annualPrice > 0 && !isFree ? (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {billingCycle === "annual"
                        ? `Equivalente: $${Math.round(plan.annualPrice / 12).toLocaleString()} MXN/mes`
                        : `Anual: $${plan.annualPrice.toLocaleString()} MXN/año (20% OFF)`}
                    </div>
                  ) : null}
                </div>
                
                <ul className="space-y-1.5 mb-6">
                  {(() => {
                    const isExcluded = (f: string) => f.trim().toLowerCase().startsWith("sin ");
                    const included = features.filter((f) => !isExcluded(f));
                    const excluded = features.filter((f) => isExcluded(f));

                    return (
                      <>
                        {included.map((feature, idx) => {
                          const isSoon = feature.toLowerCase().includes("próximamente");
                          return (
                            <li key={`inc-${idx}`} className="flex items-start">
                              <svg
                                className="w-3.5 h-3.5 text-[#2F7E7A] mr-1.5 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="text-gray-700 text-xs">
                                <span className={isSoon ? "text-gray-500 line-through" : undefined}>{feature}</span>
                                {isSoon && (
                                  <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                                    Próximamente
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}

                        {excluded.map((feature, idx) => (
                          <li
                            key={`exc-${idx}`}
                            className={`flex items-start ${idx === 0 ? "pt-1.5 border-t border-gray-200" : ""}`}
                          >
                            <svg
                              className="w-3.5 h-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-500 text-xs">{feature}</span>
                          </li>
                        ))}
                      </>
                    );
                  })()}
                </ul>
                
                {isFree ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthRedirectTo("/dashboard");
                      setAuthModalMode("register");
                      setAuthModalOpen(true);
                    }}
                    className="block w-full text-center bg-gray-100 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-xs shadow-sm"
                  >
                    Comenzar Gratis
                  </button>
                ) : plan.id === "business" ? (
                  <button
                    type="button"
                    onClick={() => {
                      // En pricing, Business es lead-gen: manda al formulario de contacto del landing.
                      window.location.href = "/#contacto";
                    }}
                    className="block w-full text-center py-2 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md bg-gray-900 text-white hover:bg-gray-800 text-xs"
                  >
                    Contactar Ventas
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const billingCycleParam = billingCycle === "annual" ? "annual" : "monthly";
                      setAuthRedirectTo(
                        `/dashboard/billing?plan=${plan.id}&autocheckout=1&billingCycle=${billingCycleParam}`
                      );
                      setAuthModalMode("register");
                      setAuthModalOpen(true);
                    }}
                    className={`block w-full text-center py-2 rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md text-xs ${
                      isPopular
                        ? "bg-[#2F7E7A] text-white hover:bg-[#1F5D59]"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    Probar {plan.name} 7 Días
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div id="comparativa" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3 mb-8 overflow-x-auto scroll-mt-24">
          <h2 className="text-base max-md:text-sm sm:text-lg font-semibold text-gray-700 mb-3 max-md:mb-2 tracking-tight">
            Comparativa Detallada
          </h2>

          {/* Tarjetas grandes (mismo diseño de esta página) */}
          <div className={`grid gap-4 max-md:gap-3 mb-6 max-md:mb-4 ${activePlans.length === 3 ? "md:grid-cols-3" : activePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
            {activePlans.map((plan) => {
              const isPopular = plan.popular;
              const isFree = plan.monthlyPrice === 0;
              const displayPrice =
                billingCycle === "annual" && plan.annualPrice > 0
                  ? plan.annualPrice
                  : plan.monthlyPrice;
              const displaySuffix =
                isFree ? "Gratis" : billingCycle === "annual" ? "MXN/año" : "MXN/mes";
              const features = getPlanFeatures(plan);

              return (
                <div
                  key={`comparativa-card-${plan.id}`}
                  className={`bg-white ${isPopular ? "border-2" : "border"} rounded-lg p-4 max-md:p-3 shadow-sm relative ${
                    isPopular ? "border-[#2F7E7A] shadow-sm" : "border-gray-200"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-2.5 max-md:-top-2 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#2F7E7A] text-white px-2.5 max-md:px-2 py-0.5 max-md:py-[2px] rounded-full text-[10px] max-md:text-[9px] font-semibold shadow-sm">
                        MÁS POPULAR
                      </span>
                    </div>
                  )}

                  <h3 className="text-base max-md:text-sm font-semibold text-gray-900 mb-1.5 max-md:mb-1">{plan.name}</h3>
                  <div className="mb-4 max-md:mb-3">
                    <span className="text-2xl max-md:text-xl font-semibold text-gray-900">
                      ${displayPrice.toLocaleString()}
                    </span>
                    <span className="text-gray-600 text-sm max-md:text-xs"> {displaySuffix}</span>
                    {plan.annualPrice > 0 && !isFree ? (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        {billingCycle === "annual"
                          ? `Equivalente: $${Math.round(plan.annualPrice / 12).toLocaleString()} MXN/mes`
                          : `Anual: $${plan.annualPrice.toLocaleString()} MXN/año (20% OFF)`}
                      </div>
                    ) : null}
                  </div>

                  <ul className="space-y-1.5 max-md:space-y-1 mb-5 max-md:mb-4 text-xs max-md:text-[11px] text-gray-600">
                    {(() => {
                      const isExcluded = (f: string) => f.trim().toLowerCase().startsWith("sin ");
                      const shown = features.slice(0, 12);
                      const included = shown.filter((f) => !isExcluded(f));
                      const excluded = shown.filter((f) => isExcluded(f));

                      return (
                        <>
                          {included.map((feature) => (
                            <li key={`${plan.id}-big-inc-${feature}`} className="flex items-start">
                              <svg
                                className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-[#2F7E7A] mr-1.5 max-md:mr-1 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414L8.5 11.086l6.543-6.543a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>{feature}</span>
                            </li>
                          ))}

                          {excluded.map((feature, idx) => (
                            <li
                              key={`${plan.id}-big-exc-${feature}`}
                              className={`flex items-start ${idx === 0 ? "pt-1.5 max-md:pt-1 border-t border-gray-200" : ""}`}
                            >
                              <svg
                                className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-400 mr-1.5 max-md:mr-1 mt-0.5 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-gray-500">{feature}</span>
                            </li>
                          ))}
                        </>
                      );
                    })()}
                  </ul>

                  {isFree ? (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthRedirectTo("/dashboard");
                        setAuthModalMode("register");
                        setAuthModalOpen(true);
                      }}
                      className="block w-full text-center bg-gray-100 text-gray-900 py-2 max-md:py-1.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-xs max-md:text-[11px] shadow-sm"
                    >
                      Comenzar Gratis
                    </button>
                  ) : plan.id === "business" ? (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = "/#contacto";
                      }}
                      className="block w-full text-center bg-gray-900 text-white py-2 max-md:py-1.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-xs max-md:text-[11px] shadow-sm"
                    >
                      Contactar Ventas
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const billingCycleParam = billingCycle === "annual" ? "annual" : "monthly";
                        // En modo diseño, redirigir directamente al dashboard con el plan
                        // En producción, ir a billing con autocheckout
                        setAuthRedirectTo(
                          `/dashboard/billing?plan=${plan.id}&autocheckout=1&billingCycle=${billingCycleParam}`
                        );
                        setAuthModalMode("register");
                        setAuthModalOpen(true);
                      }}
                      className="block w-full text-center bg-[#2F7E7A] text-white py-2 max-md:py-1.5 rounded-lg font-semibold hover:bg-[#1F5D59] transition-colors text-xs max-md:text-[11px] shadow-sm"
                    >
                      Probar {plan.name} 7 Días
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 max-md:px-2 py-2 max-md:py-1.5 text-left text-[10px] max-md:text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Característica
                </th>
                {activePlans.map((plan) => (
                  <th
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2 max-md:py-1.5 text-center text-[10px] max-md:text-[9px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider ${
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
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Precio
                </td>
                {activePlans.map((plan) => {
                  const isAnnual = billingCycle === "annual" && plan.annualPrice > 0;
                  const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                  const suffix = plan.monthlyPrice === 0 ? "" : isAnnual ? "MXN/año" : "MXN/mes";
                  return (
                    <td
                      key={plan.id}
                      className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-500 text-center ${
                        plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                      }`}
                    >
                      {plan.monthlyPrice === 0 ? (
                        "Gratis"
                      ) : (
                        <>
                          ${displayPrice.toLocaleString()} {suffix}
                        </>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Validaciones por mes
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.validationsPerMonth === -1
                      ? "Ilimitadas"
                      : plan.validationsPerMonth.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Historial
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.history ? (
                      plan.features.historyDays ? (
                        `${plan.features.historyDays} días`
                      ) : (
                        "Ilimitado"
                      )
                    ) : (
                      renderAvailability(false)
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Exportación
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.export ? (
                      plan.features.exportFormats?.join(", ") || renderAvailability(true)
                    ) : (
                      renderAvailability(false)
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  API (tipo)
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.api ? (
                      typeof plan.features.api === "string" ? (
                        plan.features.api
                      ) : (
                        renderAvailability(true)
                      )
                    ) : (
                      renderAvailability(false)
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  API (llamadas/mes)
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.api && plan.features.apiCallsPerMonth !== undefined
                      ? plan.features.apiCallsPerMonth === -1
                        ? "Ilimitadas"
                        : plan.features.apiCallsPerMonth.toLocaleString()
                      : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Usuarios
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.users === -1 ? "Ilimitados" : plan.features.users}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  Soporte
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.support}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  White-label
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {renderAvailability(!!plan.features.whiteLabel)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  SSO
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {renderAvailability(!!plan.features.sso)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] font-medium text-gray-900">
                  SLA
                </td>
                {activePlans.map((plan) => (
                  <td
                    key={plan.id}
                    className={`px-3 max-md:px-2 py-2.5 max-md:py-2 whitespace-nowrap text-xs max-md:text-[11px] text-gray-600 text-center ${
                      plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                    }`}
                  >
                    {plan.features.sla ? plan.features.sla : renderAvailability("dash")}
                  </td>
                ))}
              </tr>

              {comparisonOtherFeatures.length > 0 && (
                <tr className="bg-gray-50">
                  <td
                    colSpan={1 + activePlans.length}
                    className="px-3 py-2 text-[10px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Funcionalidades adicionales
                  </td>
                </tr>
              )}

              {comparisonOtherFeatures.map((feature) => (
                <tr key={`other-${feature}`}>
                  <td className="px-3 py-2.5 text-xs font-medium text-gray-900 whitespace-normal">
                    {feature}
                  </td>
                  {activePlans.map((plan) => {
                    const has = (plan.features.other || []).includes(feature);
                    return (
                      <td
                        key={`${plan.id}-${feature}`}
                        className={`px-3 py-2.5 text-xs text-gray-600 text-center ${
                          plan.popular ? "bg-[#2F7E7A] bg-opacity-5" : ""
                        }`}
                      >
                        {renderAvailability(has)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings Calculator */}
        <div className="bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-lg p-4 sm:p-5 text-white mb-10">
          <h2 className="text-base sm:text-lg font-semibold mb-1.5 tracking-tight">¿Cuánto ahorrarías?</h2>
          <p className="text-xs sm:text-sm mb-4 text-white/90">
            Estimación basada en tu volumen mensual y el tiempo manual promedio.
          </p>

          <div className="bg-white/15 rounded-lg p-4 backdrop-blur-sm border border-white/10">
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-medium mb-1">
                  RFCs a validar por mes
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={calculatorRfcPerMonth}
                  onChange={(e) => setCalculatorRfcPerMonth(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-xs"
                />
                <p className="mt-0.5 text-[10px] text-white/75">Ejemplo: 100, 500, 1000</p>
              </div>

              <div>
                <label className="block text-[10px] font-medium mb-1">
                  Tarifa de tu contador (MXN/hora)
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={calculatorRate}
                  onChange={(e) => setCalculatorRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium mb-1">
                  Horas manuales por cada 100 RFCs
                </label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={calculatorHours}
                  onChange={(e) => setCalculatorHours(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-xs"
                />
                <p className="mt-0.5 text-[10px] text-white/75">Incluye búsqueda, captura y verificación</p>
              </div>

              <div>
                <label className="block text-[10px] font-medium mb-1">
                  Comparar contra plan
                </label>
                <select
                  value={calculatorPlanId}
                  onChange={(e) => setCalculatorPlanId(e.target.value as "pro" | "business")}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/90 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-xs"
                >
                  <option value="pro">PRO</option>
                  <option value="business">BUSINESS</option>
                </select>
              </div>
            </div>

            <div className="bg-white/20 rounded-lg p-4">
              <div className="grid md:grid-cols-4 gap-3 text-center">
                <div>
                  <p className="text-[10px] text-white/85 mb-0.5">Horas manuales</p>
                  <p className="text-base sm:text-lg font-semibold">{savings.manualHours.toLocaleString()} h</p>
                  <p className="text-[10px] text-white/70">por mes</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/85 mb-0.5">Costo manual</p>
                  <p className="text-base sm:text-lg font-semibold">
                    ${savings.manualCost.toLocaleString()} MXN
                  </p>
                  <p className="text-[10px] text-white/70">por mes</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/85 mb-0.5">Con Maflipp {calculatorPlanId.toUpperCase()}</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {billingCycle === "annual" && savings.planCostAnnual > 0
                      ? `$${savings.planCostAnnual.toLocaleString()} MXN/año`
                      : `$${savings.planCostMonthly.toLocaleString()} MXN/mes`}
                  </p>
                  <p className="text-[10px] text-white/70">
                    {billingCycle === "annual" && savings.planCostAnnual > 0 ? (
                      <>
                        <span className="text-white/60">
                          Equivalente: ${savings.planCostMonthlyEquivalent.toLocaleString()} MXN/mes
                        </span>
                      </>
                    ) : (
                      <span className="text-white/60">Facturación mensual</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/85 mb-0.5">Ahorro mensual</p>
                  <p className="text-lg sm:text-xl font-semibold">
                    ${Math.max(0, savings.savings).toLocaleString()} MXN
                  </p>
                  <p className="text-[10px] text-white/70">
                    ${Math.max(0, savings.savings * 12).toLocaleString()} MXN al año
                  </p>
                </div>
              </div>

              <p className="mt-2 text-[10px] text-white/70 text-center">
                Estimación informativa. Los resultados pueden variar según tu proceso y volumen.
              </p>

              {savings.savings < 0 && (
                <p className="mt-2 text-[10px] text-white/75 text-center">
                  Nota: si tu costo manual es muy bajo, el ahorro puede ser menor. El valor mostrado se limita a 0.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div id="faq" className="mb-10 scroll-mt-20">
          <h2 className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-6 tracking-tight">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1.5">
                ¿Puedo cambiar de plan?
              </h3>
              <p className="text-xs text-gray-600">
                Sí, puedes cambiar de plan en cualquier momento desde tu
                dashboard. Si cambias a un plan superior, se aplicará
                inmediatamente. Si cambias a un plan inferior, los cambios se
                aplicarán al final de tu período de facturación actual.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1.5">
                ¿Hay descuento anual?
              </h3>
              <p className="text-xs text-gray-600">
                Sí, ofrecemos un 20% de descuento en planes anuales. Esto
                significa que pagas menos por mes y ahorras significativamente
                a lo largo del año. Puedes cambiar entre facturación mensual y
                anual en cualquier momento.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1.5">
                ¿Facturan con CFDI?
              </h3>
              <p className="text-xs text-gray-600">
                Sí, para planes Pro y Business emitimos facturas CFDI
                electrónicas válidas ante el SAT. Recibirás tu factura por
                email después de cada pago.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-1.5">
                ¿Tienen prueba gratis?
              </h3>
              <p className="text-xs text-gray-600">
                Sí, el plan Pro incluye 7 días de prueba. Durante la prueba se
                solicita un método de pago en Stripe, pero <strong>no se cobra</strong>{" "}
                hasta que termine el período de prueba. Puedes cancelar en
                cualquier momento durante los 7 días y no se te cobrará nada.
                El plan Free siempre está disponible sin límite de tiempo.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gray-900 rounded-lg p-5 sm:p-6 text-center text-white">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 tracking-tight">
            ¿Listo para comenzar?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mb-4">
            Únete a cientos de empresas que confían en Maflipp
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              onClick={() => {
                setAuthRedirectTo("/dashboard");
                setAuthModalMode("register");
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              Comenzar Gratis
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthRedirectTo("/dashboard/billing?plan=pro");
                setAuthModalMode("register");
                setAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md"
            >
              Probar Pro 7 Días
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-4 font-medium flex flex-wrap justify-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
              <span>Plan Free disponible</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
              <span>Prueba Pro 7 días (sin cobro durante la prueba)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 inline-block" />
              <span>Cancela cuando quieras</span>
            </span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col items-start">
              <Logo size="lg" className="mb-2" />
              <p className="text-gray-400 text-xs">
                © 2025 Maflipp. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <Link href="/terminos" className="hover:text-[#2F7E7A] transition-colors">
                Términos
              </Link>
              <Link href="/privacidad" className="hover:text-[#2F7E7A] transition-colors">
                Privacidad
              </Link>
              <Link href="/#contacto" className="hover:text-[#2F7E7A] transition-colors">
                Contacto
              </Link>
            </div>
            <div className="text-xs text-gray-400">
              <span className="hidden sm:inline">Email: </span>
              <a href="mailto:soporte@maflipp.com" className="hover:text-[#2F7E7A] transition-colors">
                soporte@maflipp.com
              </a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        redirectTo={authRedirectTo}
      />
    </div>
  );
}
