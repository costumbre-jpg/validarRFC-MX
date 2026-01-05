"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPlan, ACTIVE_PLANS, type PlanId } from "@/lib/plans";

function BillingPage() {
  const [userData, setUserData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactMessage, setContactMessage] = useState<string>("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const autoCheckoutFiredRef = useRef(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTrialBannerDismissed(localStorage.getItem("maflipp_trialEnded_dismissed") === "1");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();
      setAccessToken(sessionData.session?.access_token ?? null);

      // Modo diseño: permitir uso sin sesión
      if (!currentUser) {
        // Leer parámetro 'plan' de la URL para modo diseño
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setUserData({
          id: "mock-user",
          email: "diseño@maflipp.com",
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
        });
        setSubscription(null);
        setLoading(false);
        return;
      }

      // Obtener datos del usuario real
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      // Si hay un parámetro 'plan' en la URL, sobrescribir subscription_status temporalmente
      const planParam = searchParams.get("plan");
      const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
      
      if (planFromUrl && userData) {
        setUserData({ ...(userData as any), subscription_status: planFromUrl });
      } else if (userData) {
        setUserData(userData);
      }

      // Obtener suscripción activa real
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setSubscription(subscriptionData);
      setLoading(false);
    }

    loadData();
  }, [router, searchParams]);

  const handleCheckout = async (planId: PlanId) => {
    // Modo diseño: redirigir al Dashboard con el plan seleccionado
    if (!userData || userData.id === "mock-user") {
      router.push(`/dashboard?plan=${planId}`);
      return;
    }

    // Modo test siempre activo para desarrollo (sin necesidad de parámetro)
    const testMode = true; // Siempre usar modo test por ahora

    setProcessing(true);
    try {
      // Modo test: activar plan sin pasar por Stripe
      if (testMode) {
        const resp = await fetch("/api/subscription/test-upgrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ planId }),
        });

        const data = await resp.json();

        if (!resp.ok) {
          alert(data.error || "No se pudo activar el plan en modo test");
          setProcessing(false);
          return;
        }

        // Refrescar la página para reflejar el plan
        setProcessing(false);
        alert(`Plan ${planId.toUpperCase()} activado correctamente.`);
        window.location.reload(); // Recargar para ver los cambios
        return;
      }

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ planId, billingCycle }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al crear sesión de checkout");
        setProcessing(false);
        return;
      }

      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
      setProcessing(false);
    }
  };

  // Auto-checkout: cuando viene desde "Probar Pro 7 Días"
  useEffect(() => {
    const auto = searchParams.get("autocheckout") === "1";
    const planParam = searchParams.get("plan");
    const cycleParam = searchParams.get("billingCycle");

    if (cycleParam === "annual" || cycleParam === "monthly") {
      setBillingCycle(cycleParam);
    }

    if (!auto || !planParam) return undefined;
    if (!["pro", "business", "basic", "enterprise", "api_premium"].includes(planParam)) return undefined;
    if (autoCheckoutFiredRef.current) return undefined;

    // Evitar re-intentos
    autoCheckoutFiredRef.current = true;

    // Modo diseño: redirigir inmediatamente al dashboard con el plan seleccionado
    if (!userData || userData?.id === "mock-user") {
      setTimeout(() => {
        window.location.href = `/dashboard?plan=${planParam}`;
      }, 100);
      return undefined;
    }

    // Si está cargando, esperar un poco y reintentar
    if (loading) {
      const timeout = setTimeout(() => {
        autoCheckoutFiredRef.current = false;
      }, 1500);
      return () => clearTimeout(timeout);
    }

    // Si ya está en ese plan, redirigir al dashboard
    if (userData.subscription_status === planParam) {
      window.location.href = `/dashboard?plan=${planParam}`;
      return undefined;
    }

    // Iniciar checkout para usuarios reales
    handleCheckout(planParam as PlanId);
    router.replace("/dashboard/billing");
    return undefined;
  }, [loading, searchParams, userData, router, handleCheckout]);

  const handleCustomerPortal = async () => {
    if (!userData || userData.id === "mock-user") {
      alert("Modo diseño: el portal de cliente está deshabilitado hasta conectar una cuenta real.");
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al crear sesión del portal");
        setProcessing(false);
        return;
      }

      // Redirigir a Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7E7A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentPlan = userData?.subscription_status || "free";
  const paidPlans = ["pro", "business", "basic", "enterprise", "api_premium"];
  const isPro = paidPlans.includes(currentPlan);
  const isMock = userData?.id === "mock-user";

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimaryColor = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondaryColor = getBrandColor('--brand-secondary', '#1F5D59');

  return (
    <div className="space-y-4 max-md:space-y-3">
      <div>
        <div className="flex items-center justify-between mb-3 max-md:mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-full text-lg max-md:text-base font-bold"
              style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
            >
              Facturación
            </span>
          </div>
          <Link
            href={`/dashboard${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
            className="inline-flex items-center gap-2 max-md:gap-1.5 text-sm max-md:text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            style={{ '--hover-color': brandPrimaryColor } as React.CSSProperties}
          >
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="max-md:hidden">Volver al Dashboard</span>
            <span className="hidden max-md:inline">Volver</span>
          </Link>
        </div>
        <p className="text-sm max-md:text-xs text-gray-600">Gestiona tu plan y suscripción</p>
      </div>

      {/* Mensajes de éxito/cancelación */}
      {searchParams.get("success") && (
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100 p-4 max-md:p-3 border-2 border-green-200 shadow-md">
          <div className="flex items-center gap-3 max-md:gap-2">
            <div className="p-2 max-md:p-1.5 rounded-full bg-green-200">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm max-md:text-xs font-semibold text-green-900">
                ¡Pago exitoso! Tu suscripción se ha activado.
              </p>
            </div>
          </div>
        </div>
      )}

      {searchParams.get("canceled") && (
        <div className="rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 max-md:p-3 border-2 border-yellow-200 shadow-md">
          <div className="flex items-center gap-3 max-md:gap-2">
            <div className="p-2 max-md:p-1.5 rounded-full bg-yellow-200">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm max-md:text-xs font-semibold text-yellow-900">
                El pago fue cancelado. Puedes intentar de nuevo cuando quieras.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo (diseño): Banner de fin de prueba */}
      {searchParams.get("trialEnded") === "1" && !trialBannerDismissed && (
        <div className="rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 p-4 border border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <svg className="w-5 h-5 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-7.1 12.3A2 2 0 005 19h14a2 2 0 001.81-2.84l-7.1-12.3a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                  <p className="text-sm font-semibold text-gray-900">
                   Tu prueba Pro de 7 días gratis finalizó
                  </p>
                <p className="text-sm text-gray-700">
                  Ahora estás en el plan Gratis (10 validaciones/mes).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/billing?plan=free&upgrade=pro"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold text-white"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                Activar Pro
              </Link>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem("maflipp_trialEnded_dismissed", "1");
                  } catch {
                    // ignore
                  }
                  setTrialBannerDismissed(true);
                  router.replace("/dashboard/billing?plan=free");
                }}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              >
                Seguir en Gratis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Actual */}
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-xl shadow-md border-2 p-4" style={{ borderColor: brandPrimaryColor }}>
        <div className="mb-3">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold"
            style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
          >
            Plan actual
          </span>
        </div>
        {(() => {
          const currentPlanData = getPlan(currentPlan as PlanId);
          const isPro = currentPlan === "pro" || currentPlan === "business";
          return (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 shadow-md">
              {/* Header del Plan */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-3 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-xl font-bold text-gray-900">{currentPlanData.name}</h3>
                    {currentPlanData.popular && (
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: brandPrimaryColor }}
                      >
                        ⭐ RECOMENDADO
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold" style={{ color: brandPrimaryColor }}>
                      ${currentPlanData.monthlyPrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {currentPlanData.monthlyPrice === 0 ? "Gratis" : "MXN/mes"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Estado: {subscription ? "Activo" : isMock ? "Modo diseño" : "—"}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Ciclo: {billingCycle === "annual" ? "Anual" : "Mensual"}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      Límite: {currentPlanData.validationsPerMonth === -1 ? "Ilimitado" : `${currentPlanData.validationsPerMonth.toLocaleString()}/mes`}
                    </span>
                  </div>
                </div>
                {!isMock && subscription && (
                  <div className="bg-gray-100 rounded-lg p-2.5 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-0.5">Próxima renovación</p>
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(subscription.current_period_end).toLocaleDateString(
                        "es-MX",
                        { year: "numeric", month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabla de Características */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="bg-white rounded-lg p-3 border-2 border-l-4 shadow-sm" style={{ borderLeftColor: brandPrimaryColor }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                      <svg className="w-3.5 h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Validaciones</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {currentPlanData.validationsPerMonth === -1 
                      ? "∞" 
                      : currentPlanData.validationsPerMonth.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">por mes</p>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-l-4 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Usuarios</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {currentPlanData.features.users === -1 
                      ? "∞" 
                      : currentPlanData.features.users}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentPlanData.features.users === -1 ? "ilimitados" : currentPlanData.features.users === 1 ? "usuario" : "usuarios"}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-l-4 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Historial</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {currentPlanData.features.history 
                      ? currentPlanData.features.historyDays 
                        ? currentPlanData.features.historyDays 
                        : "∞"
                      : "—"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {currentPlanData.features.history 
                      ? currentPlanData.features.historyDays 
                        ? "días" 
                        : "ilimitado"
                      : "no disponible"}
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-l-4 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="p-1 rounded bg-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Soporte</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{currentPlanData.features.support}</p>
                  <p className="text-xs text-gray-500 mt-0.5">disponible</p>
                </div>
              </div>

              {/* Características adicionales para Pro y Business */}
              {isPro && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Características Adicionales</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
                    {currentPlanData.features.export && (
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">
                          Exportar a {currentPlanData.features.exportFormats?.join(", ") || "datos"}
                        </span>
                      </div>
                    )}
                    {currentPlanData.features.api && (
                      <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">
                          API {typeof currentPlanData.features.api === "string" ? currentPlanData.features.api : "incluida"}
                          {currentPlanData.features.apiCallsPerMonth && (
                            <span className="text-gray-500 ml-1">
                              ({currentPlanData.features.apiCallsPerMonth === -1 
                                ? "Ilimitadas" 
                                : `${currentPlanData.features.apiCallsPerMonth.toLocaleString()}/mes`})
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                    {currentPlanData.features.whiteLabel && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">White-label</span>
                      </div>
                    )}
                    {currentPlanData.features.sso && (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <svg className="w-4 h-4" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium text-gray-700">SSO (Single Sign-On)</span>
                      </div>
                    )}
                    {currentPlanData.features.other && currentPlanData.features.other.map((feature, idx) => {
                      const isSoon = feature.toLowerCase().includes("próximamente");
                      return (
                        <div key={idx} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="w-4 h-4" style={{ color: isSoon ? '#9ca3af' : brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className={`text-xs font-medium ${isSoon ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {feature.replace('(Próximamente)', '').trim()}
                            {isSoon && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                Próximamente
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Todos los Planes */}
      <div>
        <div className="mb-3 max-md:mb-2">
          <div className="flex items-center justify-between gap-3 max-md:gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
              style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
            >
              Planes Disponibles
            </span>

            <div className="inline-flex items-center gap-1.5 max-md:gap-1 bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-md text-xs max-md:text-[11px] font-semibold transition-colors ${
                  billingCycle === "monthly" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-md text-xs max-md:text-[11px] font-semibold transition-colors ${
                  billingCycle === "annual" ? "bg-gray-900 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Anual
              </button>
              <span className="hidden sm:inline-flex items-center px-1.5 max-md:px-1 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-green-100 text-green-800">
                20% OFF
              </span>
            </div>
          </div>
        </div>
        <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
          {ACTIVE_PLANS.map((planId) => {
            const plan = getPlan(planId);
            const isCurrentPlan = currentPlan === planId;
            const upgradeTarget = searchParams.get("upgrade");
            const isUpgradeTarget = upgradeTarget === planId;
            const displayPrice =
              billingCycle === "annual" && plan.monthlyPrice > 0 ? plan.annualPrice : plan.monthlyPrice;
            const displaySuffix =
              plan.monthlyPrice === 0 ? "Gratis" : billingCycle === "annual" ? "MXN/año" : "MXN/mes";

            const renderFeatureText = (text: string) => {
              const isSoon = text.toLowerCase().includes("próximamente");
              return (
                <span className="flex items-center flex-wrap gap-1.5">
                  <span className={isSoon ? "text-gray-500 line-through" : undefined}>{text}</span>
                  {isSoon && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      Próximamente
                    </span>
                  )}
                </span>
              );
            };
            
            return (
              <div
                key={planId}
                className={`border-2 rounded-lg p-3 max-md:p-2.5 pb-2.5 max-md:pb-2 relative transition-all ${
                  isCurrentPlan
                    ? "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-75 cursor-not-allowed"
                    : plan.popular
                      ? "bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md hover:scale-[1.01]"
                      : "bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md hover:scale-[1.01]"
                }`}
                style={{
                  borderColor: isCurrentPlan ? '#9ca3af' : plan.popular ? brandPrimaryColor : '#e5e7eb',
                }}
              >
                {isUpgradeTarget && !isCurrentPlan && (
                  <span className="absolute -top-2.5 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-900 text-white shadow-sm">
                    Seleccionado
                  </span>
                )}
                {isCurrentPlan && (
                  <span 
                    className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm"
                  >
                    ✓ PLAN SELECCIONADO
                  </span>
                )}
                {plan.popular && !isCurrentPlan && (
                  <span 
                    className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    ⭐ RECOMENDADO
                  </span>
                )}
                
                <div className="mb-2.5 max-md:mb-2">
                  <h3 className="text-base max-md:text-sm font-bold text-gray-900 mb-1 max-md:mb-0.5">
                    {plan.name}
                  </h3>
                  <div className="mb-1.5 max-md:mb-1">
                    <div className="flex items-baseline gap-1.5 max-md:gap-1">
                      <span className="text-2xl max-md:text-xl font-bold text-gray-900">
                        ${displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs max-md:text-[11px] text-gray-600">
                        {displaySuffix}
                      </span>
                    </div>
                    {plan.monthlyPrice > 0 && (
                      <p className="text-[10px] max-md:text-[9px] text-gray-500 mt-0.5">
                        {billingCycle === "annual"
                          ? `Precio mensual: ${plan.monthlyPrice.toLocaleString()} MXN/mes`
                          : `Anual: ${plan.annualPrice.toLocaleString()} MXN/año (20% OFF)`}
                      </p>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 max-md:space-y-1 mb-2.5 max-md:mb-2 text-xs max-md:text-[11px]">
                    {/* Features con acceso (verdes) - primero */}
                    <li className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                    <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                      <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-xs">
                      {plan.validationsPerMonth === -1
                        ? "Validaciones ilimitadas"
                        : `${plan.validationsPerMonth.toLocaleString()} validaciones/mes`}
                    </span>
                    </li>
                  <li className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                    <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                      <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-xs">
                      {plan.features.users === -1
                        ? "Usuarios ilimitados"
                        : `${plan.features.users} usuario${plan.features.users > 1 ? "s" : ""}`}
                    </span>
                  </li>
                  {plan.features.other && plan.features.other.length > 0 && plan.features.other.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-xs">{renderFeatureText(feature)}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 p-1.5 rounded-md bg-gray-50">
                    <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                      <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium text-xs">{renderFeatureText(`Soporte: ${plan.features.support}`)}</span>
                  </li>
                  {/* Features sin acceso (grises) - al final */}
                  {plan.features.history ? (
                    <li className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-xs">
                        Historial {plan.features.historyDays
                          ? `${plan.features.historyDays} días`
                          : "ilimitado"}
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 p-1.5 rounded-md bg-gray-50 opacity-60">
                      <div className="p-0.5 rounded bg-gray-200">
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-500 font-medium text-xs">Sin historial</span>
                    </li>
                  )}
                  {plan.features.export ? (
                    <li className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-xs">
                        Exportar a {plan.features.exportFormats
                          ? plan.features.exportFormats.join(", ")
                          : "datos"}
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 p-1.5 rounded-md bg-gray-50 opacity-60">
                      <div className="p-0.5 rounded bg-gray-200">
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-500 font-medium text-xs">Sin exportación</span>
                    </li>
                  )}
                  {plan.features.api ? (
                    <li className="flex items-start gap-1.5 p-1 rounded-md bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium text-xs">
                        API {typeof plan.features.api === "string"
                          ? plan.features.api
                          : "incluida"}
                        {plan.features.apiCallsPerMonth && (
                          <span className="text-gray-500 ml-1">
                            ({plan.features.apiCallsPerMonth === -1 
                              ? "Ilimitadas" 
                              : `${plan.features.apiCallsPerMonth.toLocaleString()}/mes`})
                          </span>
                        )}
                      </span>
                    </li>
                  ) : (
                    <li className="flex items-start gap-2 p-1.5 rounded-md bg-gray-50 opacity-60">
                      <div className="p-0.5 rounded bg-gray-200">
                        <svg className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-500 font-medium text-xs">Sin API</span>
                    </li>
                  )}
                  {plan.features.whiteLabel && (
                    <li className="flex items-start gap-2 p-1.5 rounded-lg bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">White-label</span>
                    </li>
                  )}
                  {plan.features.sso && (
                    <li className="flex items-start gap-2 p-1.5 rounded-lg bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">SSO (Single Sign-On)</span>
                    </li>
                  )}
                  {plan.features.sla && (
                    <li className="flex items-start gap-2 p-1.5 rounded-lg bg-gray-50">
                      <div className="p-0.5 rounded" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: brandPrimaryColor }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{renderFeatureText(`SLA ${plan.features.sla}`)}</span>
                    </li>
                  )}
                </ul>

                {/* Botón para ver contenido del plan - funciona para todos los planes */}
                <div className="mt-1.5">
                <button
                  onClick={() => {
                    const planParam = searchParams.get("plan");
                    const urlSuffix = planParam && ["pro", "business"].includes(planParam) ? `?plan=${planParam}` : "";
                    
                    if (isMock) {
                      // En modo diseño: redirigir directamente al dashboard con el plan seleccionado
                      router.push(`/dashboard?plan=${planId}`);
                    } else {
                      // Si no es modo diseño, hacer checkout o redirigir según el plan
                      if (currentPlan === planId) {
                        // Si es el plan actual, solo redirigir al dashboard preservando el plan
                        router.push(`/dashboard${urlSuffix}`);
                      } else {
                        // Si no es el plan actual, hacer checkout
                        handleCheckout(planId);
                      }
                    }
                  }}
                  disabled={(processing && !isMock) || (isCurrentPlan && planId === "free")}
                  className={`w-full px-2.5 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:scale-[1.01] font-semibold text-xs ${
                    plan.popular
                      ? "text-white"
                      : "bg-gray-900 text-white"
                  }`}
                  style={plan.popular ? { backgroundColor: brandPrimaryColor } : undefined}
                >
                  {processing && !isMock ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-1.5">
                      {plan.monthlyPrice === 0
                        ? "Comenzar Gratis"
                        : planId === "pro" && currentPlan === "free"
                          ? "Probar Pro 7 Días"
                          : "Mejorar Plan"}
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estado del Trial - Solo si está en trial activo */}
      {((!isMock && subscription && subscription.status === "trialing") || searchParams.get("showTrial") === "1") && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                {searchParams.get("showTrial") === "1" ? (
                  "Trial activo: 5 días restantes"
                ) : (
                  `Trial activo: ${Math.ceil((new Date(subscription.trial_end * 1000).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} días restantes`
                )}
              </p>
              <p className="text-xs text-gray-600">
                {searchParams.get("showTrial") === "1" ? (
                  "Tu trial finaliza el 25 dic, 2024. Después de esa fecha, se aplicará el cargo automáticamente."
                ) : (
                  `Tu trial finaliza el ${new Date(subscription.trial_end * 1000).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" })}. Después de esa fecha, se aplicará el cargo automáticamente.`
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
      {isPro && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="mb-4">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-base font-bold"
              style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
            >
              Historial de Pagos
            </span>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                <svg className="w-5 h-5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  Gestiona tu suscripción y pagos
                </p>
                <p className="text-sm text-gray-600">
                  Para ver tu historial completo de pagos, facturas y gestionar tu suscripción, accede al portal de Stripe.
                </p>
                {!isMock && (
                  <button
                    onClick={handleCustomerPortal}
                    disabled={processing}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50"
                    style={{ backgroundColor: brandPrimaryColor }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {processing ? "Cargando..." : "Gestionar Suscripción"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bloque de Ayuda/Contacto */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
            <svg className="w-5 h-5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              ¿Necesitas ayuda o información adicional?
            </p>
            <p className="text-sm text-gray-600 mb-3">
              Contáctanos para consultas sobre tu suscripción, cambios de plan o cualquier otra necesidad.
            </p>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {showContactForm ? "Ocultar formulario" : "Contactar Ventas"}
            </button>
          </div>
        </div>

        {/* Formulario de Contacto */}
        {showContactForm && (
          <div className="mt-4 pt-4 border-t border-gray-200">
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
              className="space-y-4"
            >
              <div>
                <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  required
                  placeholder="Tu nombre completo"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm transition-all"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  required
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm transition-all"
                />
              </div>
              <div>
                <label htmlFor="contact-company" className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  id="contact-company"
                  name="company"
                  placeholder="Nombre de tu empresa"
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm transition-all"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-transparent text-sm resize-none transition-all"
                />
              </div>
              {contactStatus !== "idle" && contactMessage && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                    contactStatus === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {contactMessage}
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#2F7E7A] text-white px-4 py-2.5 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm shadow-md hover:shadow-lg"
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
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BillingPageWrapper() {
  return (
    <Suspense fallback={null}>
      <BillingPage />
    </Suspense>
  );
}

