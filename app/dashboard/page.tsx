"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RFCValidator from "@/components/dashboard/RFCValidator";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AdvancedDashboard from "@/components/dashboard/AdvancedDashboard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [allValidationsForStats, setAllValidationsForStats] = useState<any[]>([]); // Para estadísticas y gráfico
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar actualización
  const router = useRouter();
  const searchParams = useSearchParams();
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setTrialBannerDismissed(localStorage.getItem("maflipp_trialEnded_dismissed") === "1");
      // Limpiar datos antiguos de localStorage para usar solo Supabase
      localStorage.removeItem("maflipp_demo_validations_count");
      localStorage.removeItem("maflipp_demo_validations");
      localStorage.removeItem("maflipp_local_validations");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadError(null);
        const supabase = createClient() as any;
        
        // Obtener sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!session || sessionError) {
          setLoading(false);
          router.replace("/auth/login");
          return;
        }

        setUser(session.user);

        // Obtener datos del usuario
        const { data: userDataResult } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userDataResult) {
          setUserData(userDataResult);
        } else {
          // Crear usuario si no existe
          const { data: newUser } = await supabase
            .from("users")
            .insert([
              {
                id: session.user.id,
                email: session.user.email || "",
                subscription_status: "free",
                rfc_queries_this_month: 0,
              },
            ])
            .select()
            .single();
          
          setUserData(newUser || { 
            email: session.user.email, 
            subscription_status: "free",
            rfc_queries_this_month: 0
          });
        }

        // Obtener todas las validaciones del mes actual (para estadísticas y gráfico)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const { data: allValidations } = await supabase
          .from("validations")
          .select("*")
          .eq("user_id", session.user.id)
          .gte("created_at", startOfMonth.toISOString());

        const dbValidations = allValidations || [];

        // Usar SOLO datos de Supabase (sin fallback a localStorage)
        setAllValidationsForStats(dbValidations);

        const total = dbValidations.length;
        const valid =
          dbValidations?.filter((v: { is_valid: boolean }) => v.is_valid)
            .length || 0;
        setStats({ total, valid, invalid: total - valid });

        // Limpiar datos antiguos de localStorage siempre
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("maflipp_demo_validations_count");
            localStorage.removeItem("maflipp_demo_validations");
            localStorage.removeItem("maflipp_local_validations");
          } catch (e) {
            // Ignore
          }
        }

        setLoading(false);
      } catch (error) {
        setLoadError("No se pudieron cargar tus datos. Intenta recargar.");
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    };

    loadData();
  }, [refreshKey, router]);

  // Función para refrescar datos después de una validación
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleResetValidations = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "Esto eliminará todas tus validaciones y reiniciará el contador mensual. ¿Deseas continuar?"
      );
      if (!confirmed) return;
    }

    setResetting(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      await fetch("/api/validate/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("maflipp_demo_validations_count");
          localStorage.removeItem("maflipp_demo_validations");
          localStorage.removeItem("maflipp_local_validations");
        } catch (e) {
          // Ignore
        }
      }

      setAllValidationsForStats([]);
      setStats({ total: 0, valid: 0, invalid: 0 });
      setUserData((prev: any) =>
        prev ? { ...prev, rfc_queries_this_month: 0 } : prev
      );
      refreshData();
    } finally {
      setResetting(false);
    }
  };

  const handleValidationComplete = (options?: {
    isDemo?: boolean;
    valid?: boolean;
    rfc?: string;
  }) => {
    if (options?.isDemo) {
      // Validaciones demo: solo en memoria (no guardar en localStorage)
      const demoValidation = {
        id: `demo-${Date.now()}`,
        is_valid: options.valid ?? true,
        created_at: new Date().toISOString(),
        rfc: options.rfc || "DEMO",
      };

      // NO guardar en localStorage - solo mostrar en esta sesión

      const isValid = options.valid ?? true;
      setStats((prev) => ({
        total: prev.total + 1,
        valid: prev.valid + (isValid ? 1 : 0),
        invalid: prev.invalid + (isValid ? 0 : 1),
      }));
      setAllValidationsForStats((prev) => [demoValidation, ...prev]);
      return;
    }

    // Para validaciones reales: limpiar demo validations y actualizar inmediatamente
    if (typeof window !== "undefined") {
      try {
        // Limpiar demo validations cuando se hace una validación real
        localStorage.removeItem("maflipp_demo_validations_count");
        localStorage.removeItem("maflipp_demo_validations");
      } catch (e) {
        // Ignore
      }
    }
    
    // Actualizar inmediatamente el contador y luego refrescar datos
    setUserData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        rfc_queries_this_month: (prev.rfc_queries_this_month || 0) + 1,
      };
    });
    
    // También actualizar stats inmediatamente
    const isValid = options?.valid ?? true;
    setStats((prev) => ({
      total: prev.total + 1,
      valid: prev.valid + (isValid ? 1 : 0),
      invalid: prev.invalid + (isValid ? 0 : 1),
    }));
    
    // Refrescar datos completos desde la BD para asegurar sincronización
    refreshData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <div className="space-y-4">
      <DashboardHeader
        user={user}
        userData={userData}
      />

      {/* Demo (diseño): Banner de fin de prueba */}
      {searchParams.get("trialEnded") === "1" && !trialBannerDismissed && (
        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-amber-100">
                <svg className="w-4 h-4 text-amber-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86l-7.1 12.3A2 2 0 005 19h14a2 2 0 001.81-2.84l-7.1-12.3a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  Tu prueba Pro de 7 días gratis finalizó
                </p>
                <p className="text-xs text-gray-700">
                  Ahora estás en el plan Gratis (10 validaciones/mes).
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/billing?upgrade=pro"
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold text-white bg-brand-primary hover-bg-brand-secondary"
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
                  router.replace("/dashboard");
                }}
                className="inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
              >
                Seguir en Gratis
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 max-md:space-y-3">
        {/* Validador Principal - Ancho completo */}
        <div>
          <RFCValidator 
            userData={userData} 
            onValidationComplete={handleValidationComplete}
          />
        </div>

        {userData && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleResetValidations}
              disabled={resetting}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resetting ? "Reiniciando..." : "Reiniciar validaciones"}
            </button>
          </div>
        )}


        {/* Estadísticas - Abajo del validador, en grid de 3 columnas */}
        <DashboardStats
          totalValidations={stats.total}
          validCount={stats.valid}
          invalidCount={stats.invalid}
          validations={allValidationsForStats}
        />

        {/* Dashboard Avanzado - Solo para Pro y Business */}
        {(userData?.subscription_status === "pro" || userData?.subscription_status === "business") && (
          <AdvancedDashboard
            key={refreshKey} // Forzar re-render cuando cambian los datos
            userData={userData}
            validations={allValidationsForStats}
            stats={stats}
          />
        )}

        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{loadError}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRefreshKey((prev) => prev + 1)}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold border border-red-200 text-red-700 bg-white hover:bg-red-100"
                >
                  Reintentar
                </button>
                <Link
                  href="/dashboard/help"
                  className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50"
                >
                  Soporte
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Notas de funcionalidades Próximamente para Business */}
        {userData?.subscription_status === "business" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.6c.75 1.334-.213 3.001-1.743 3.001H3.482c-1.53 0-2.493-1.667-1.743-3.001l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-semibold text-gray-900">Roadmap Business (no incluido aún)</h3>
            </div>
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex items-center gap-2">
                <span>SLA 99.9%</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  En roadmap
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Soporte prioritario</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  En roadmap
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Validación CFDI</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Add-on
                </span>
                <Link href="/dashboard/cfdi" className="text-brand-primary hover:underline text-xs font-medium">
                  Ver detalle
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips y Guías + Información del Plan FREE */}
      {userData?.subscription_status === "free" && (
        <div className="grid md:grid-cols-2 gap-6 max-md:gap-4">
          {/* Tips y Guías Rápidas */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-md:p-4">
            <div className="flex items-center gap-2 mb-4 max-md:mb-3">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg max-md:text-base font-semibold text-gray-900">
                Guía rápida
              </h3>
            </div>
            <div className="space-y-4 max-md:space-y-3">
              <div className="flex items-start gap-3 max-md:gap-2">
                <div className="flex-shrink-0 w-6 h-6 max-md:w-5 max-md:h-5 bg-brand-primary-10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-brand-primary text-xs max-md:text-[10px] font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm max-md:text-xs font-medium text-gray-900 mb-1 max-md:mb-0.5">
                    Formato del RFC
                  </p>
                  <p className="text-xs max-md:text-[11px] text-gray-600">
                    El RFC debe tener 12 o 13 caracteres. Ejemplo: ABC123456XYZ o ABC123456XY7
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 max-md:gap-2">
                <div className="flex-shrink-0 w-6 h-6 max-md:w-5 max-md:h-5 bg-brand-primary-10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-brand-primary text-xs max-md:text-[10px] font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm max-md:text-xs font-medium text-gray-900 mb-1 max-md:mb-0.5">
                    Validación en tiempo real
                  </p>
                  <p className="text-xs max-md:text-[11px] text-gray-600">
                    Nuestros resultados se obtienen mediante consulta en tiempo real y fuentes oficiales del SAT, con alta confiabilidad para uso operativo
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 max-md:gap-2">
                <div className="flex-shrink-0 w-6 h-6 max-md:w-5 max-md:h-5 bg-brand-primary-10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-brand-primary text-xs max-md:text-[10px] font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm max-md:text-xs font-medium text-gray-900 mb-1 max-md:mb-0.5">
                    Usa tus validaciones sabiamente
                  </p>
                  <p className="text-xs max-md:text-[11px] text-gray-600">
                    Tienes 10 validaciones gratis al mes. El conteo se renueva automáticamente el primer día de cada mes (hora CDMX)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Plan FREE */}
          <div className="bg-brand-gradient-soft-br rounded-lg border border-brand-primary-20 p-6 max-md:p-4">
            <h3 className="text-lg max-md:text-base font-semibold text-gray-900 mb-4 max-md:mb-3">
              Tu Plan Gratis Incluye
            </h3>
            <ul className="space-y-3 max-md:space-y-2 text-sm max-md:text-xs text-gray-700 mb-6 max-md:mb-4">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10 validaciones/mes</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Resultados básicos (válido/inválido)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Estadísticas básicas de uso</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>1 usuario</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-brand-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Soporte: FAQs</span>
              </li>
            </ul>
            <div className="text-xs max-md:text-[11px] text-gray-600 mb-6 max-md:mb-4">
              <span className="font-semibold text-gray-900">Límite:</span>{" "}
              10 validaciones/mes
            </div>
            <div className="pt-4 max-md:pt-3 border-t border-brand-primary-20">
              <p className="text-xs max-md:text-[11px] text-gray-600 mb-3 max-md:mb-2">
                ¿Necesitas más? Actualiza a Pro o Business para obtener:
              </p>
              <ul className="space-y-1 max-md:space-y-0.5 text-xs max-md:text-[11px] text-gray-500 mb-4 max-md:mb-3">
                <li>• Historial completo ilimitado</li>
                <li>• Exportación de datos (CSV, Excel, PDF)</li>
                <li>• Acceso a API</li>
                <li>• Más validaciones mensuales</li>
              </ul>
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center justify-center w-full px-4 max-md:px-3 py-2 max-md:py-1.5 bg-brand-primary text-white rounded-lg hover-bg-brand-secondary transition-colors font-medium text-sm max-md:text-xs"
              >
                Ver Planes y Precios
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 ml-2 max-md:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Link al Historial Completo - Solo para planes Pro y Business */}
      {userData?.subscription_status === "pro" || userData?.subscription_status === "business" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-md:p-4">
          <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
            <div>
              <h3 className="text-lg max-md:text-base font-semibold text-gray-900 mb-1 max-md:mb-0.5">
                Historial de Validaciones
              </h3>
              <p className="text-sm max-md:text-xs text-gray-600">
                Consulta y exporta todas tus validaciones anteriores
              </p>
            </div>
            <Link
              href="/dashboard/historial"
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-5 max-md:px-4 py-2.5 max-md:py-2 bg-brand-primary text-white rounded-lg hover-bg-brand-secondary transition-colors font-semibold text-sm max-md:text-xs shadow-sm hover:shadow-md w-full max-md:w-full justify-center max-md:justify-center"
            >
              Ver Historial Completo
              <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : userData?.subscription_status === "free" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 max-md:w-8 max-md:h-8 bg-gray-100 rounded-full mb-3 max-md:mb-2">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base max-md:text-sm font-bold text-gray-900 mb-1.5 max-md:mb-1">
              Historial de Validaciones
            </h3>
            <p className="text-xs max-md:text-[11px] text-gray-600 mb-1 max-md:mb-0.5 max-w-md mx-auto">
              Guarda y consulta todas tus validaciones anteriores con los planes Pro y Business.
            </p>
            <p className="text-[10px] max-md:text-[9px] text-gray-500 mb-4 max-md:mb-3">
              Incluye exportación a CSV, Excel y PDF
            </p>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-1.5 px-4 max-md:px-3 py-2 max-md:py-1.5 text-sm max-md:text-xs bg-brand-primary text-white rounded-lg hover-bg-brand-secondary transition-colors font-semibold shadow-sm hover:shadow-md"
            >
              Mejorar Plan
              <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : null}
      </div>
    </Suspense>
  );
}


