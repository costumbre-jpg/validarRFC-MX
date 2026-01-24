import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { getPlan, getPlanValidationLimit, type PlanId } from "@/lib/plans";

interface DashboardHeaderProps {
  user: User;
  userData: any;
  demoValidationCount?: number;
}

export default function DashboardHeader({
  user,
  userData,
  demoValidationCount = 0,
}: DashboardHeaderProps) {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const urlSuffix = planParam && ["pro", "business"].includes(planParam) ? `?plan=${planParam}` : "";
  
  // Priorizar el parámetro 'plan' de la URL sobre subscription_status de la BD
  // Esto permite el modo diseño con ?plan=pro o ?plan=business
  const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
  
  // SIEMPRE priorizar el parámetro de la URL si existe
  // Esto es crítico para el modo diseño
  const planId = planFromUrl 
    ? (planFromUrl as PlanId) 
    : ((userData?.subscription_status || "free") as PlanId);
  
  // Incluir validaciones demo desde localStorage SOLO si no hay validaciones reales
  // Esto evita duplicar contadores cuando hay validaciones reales en la BD
  let demoCount = 0;
  const hasRealValidations = (userData?.rfc_queries_this_month || 0) > 0;
  
  // Solo contar demo si NO hay validaciones reales (para modo demo puro)
  if (!hasRealValidations) {
    try {
      if (typeof window !== "undefined") {
        const storedDemo = localStorage.getItem("maflipp_demo_validations");
        if (storedDemo) {
          const parsed = JSON.parse(storedDemo);
          demoCount = Array.isArray(parsed) ? parsed.length : 0;
        } else {
          demoCount = parseInt(
            localStorage.getItem("maflipp_demo_validations_count") || "0",
            10
          );
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  
  // Usar el mayor entre estado y localStorage para evitar desfasajes
  const finalDemoCount = Math.max(demoValidationCount || 0, demoCount);
  
  const queriesThisMonth =
    (userData?.rfc_queries_this_month || 0) + finalDemoCount;
  const planLimit = getPlanValidationLimit(planId);
  const plan = getPlan(planId);
  const isPro = planId === "pro" || planId === "business";
  const brandPrimary = "var(--brand-primary, #2F7E7A)";
  const brandSecondary = "var(--brand-secondary, #1F5D59)";

  const displayName =
    userData?.company_name ||
    userData?.full_name ||
    user?.email?.split("@")[0] ||
    "Bienvenido";

  const getInitials = (text: string) => {
    if (!text) return "M";
    const parts = text.trim().split(/\s+/).filter(Boolean);
    const [first, second] = parts;
    if (!first) return "M";
    if (!second) return first.slice(0, 2).toUpperCase();
    return `${first[0] ?? ""}${second[0] ?? ""}`.toUpperCase();
  };

  const remaining = planLimit === -1 ? Infinity : planLimit - queriesThisMonth;
  const usagePercentage = planLimit === -1 ? 0 : Math.min(100, (queriesThisMonth / planLimit) * 100);
  const isNearLimit = planLimit !== -1 && remaining <= 3 && remaining > 0;
  const isAtLimit = planLimit !== -1 && remaining === 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-md:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-md:gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 max-md:gap-2">
            <div className="h-12 w-12 max-md:h-10 max-md:w-10 rounded-full overflow-hidden bg-brand-primary-10 text-brand-primary font-semibold flex items-center justify-center uppercase text-sm max-md:text-xs ring-2 ring-gray-100">
              {userData?.avatar_url ? (
                <img
                  src={userData.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div>
              <p className="text-xs max-md:text-[10px] uppercase tracking-wide text-gray-500">Panel</p>
              <div className="flex items-center gap-2 flex-wrap mt-1 max-md:mt-0.5 text-2xl max-md:text-lg font-bold text-gray-900">
                <span
                  className="inline-flex items-center px-4 max-md:px-3 py-1.5 max-md:py-1 rounded-full text-lg max-md:text-sm font-bold"
                  style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
                >
                  Hola, {displayName}
                </span>
              </div>
              <div className="flex items-center gap-2 max-md:gap-1.5 mt-1 max-md:mt-0.5 flex-wrap">
                <span className="inline-flex items-center px-3 max-md:px-2 py-1 max-md:py-0.5 rounded-full text-sm max-md:text-xs font-bold"
                  style={{ backgroundColor: `${brandPrimary}20`, color: brandSecondary }}>
                  {plan.displayName}
                </span>
                <span className="text-xs max-md:text-[11px] text-gray-500">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 max-md:mt-3 space-y-3 max-md:space-y-2">
            <div className="flex flex-wrap items-center gap-4 max-md:gap-2 text-sm max-md:text-xs text-gray-600">
              <span className="flex items-center gap-2">
                <span>
                  Validaciones este mes:{" "}
                  <span className="font-semibold text-gray-900">
                    {queriesThisMonth.toLocaleString()}/{planLimit === -1 ? "∞" : planLimit.toLocaleString()}
                  </span>
                </span>
              </span>
            </div>
            
            {/* Barra de progreso visual */}
            {planLimit !== -1 && (
              <div className="space-y-2 max-md:space-y-1.5">
                <div className="flex items-center justify-between text-xs max-md:text-[11px]">
                  <span className="text-gray-600">Uso mensual</span>
                  <span className={`font-semibold ${isNearLimit ? "text-orange-600" : isAtLimit ? "text-red-600" : "text-gray-700"}`}>
                    {remaining} restantes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 max-md:h-2 overflow-hidden">
                  <div
                    className="h-2.5 max-md:h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(usagePercentage, 100)}%`,
                      backgroundColor: isAtLimit
                        ? "#ef4444"
                        : isNearLimit
                        ? "#f97316"
                        : brandPrimary,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Alerta cuando está cerca del límite */}
            {isNearLimit && !isPro && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-md:p-2.5 flex items-start gap-3 max-md:gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-orange-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm max-md:text-xs font-medium text-orange-900">
                    Te quedan {remaining} validaciones este mes
                  </p>
                  <p className="text-xs max-md:text-[11px] text-orange-700 mt-1 max-md:mt-0.5">
                    Mejora a Pro para obtener 1,000 validaciones/mes
                  </p>
                </div>
              </div>
            )}

            {/* Alerta cuando alcanzó el límite */}
            {isAtLimit && !isPro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-md:p-2.5 flex items-start gap-3 max-md:gap-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm max-md:text-xs font-medium text-red-900">
                    Has alcanzado el límite de {planLimit} validaciones este mes
                  </p>
                  <p className="text-xs max-md:text-[11px] text-red-700 mt-1 max-md:mt-0.5">
                    Mejora tu plan para continuar validando
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {!isPro && (
          <Link
            href={`/dashboard/billing${urlSuffix}`}
            className="inline-flex items-center justify-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 border border-transparent text-base max-md:text-sm font-semibold rounded-lg text-white transition-all shadow-sm hover:shadow-md whitespace-nowrap"
            style={{
              backgroundColor: brandPrimary,
              color: "white",
            }}
          >
            <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Mejorar Plan
          </Link>
        )}
      </div>
    </div>
  );
}


