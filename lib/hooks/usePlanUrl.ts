import { useSearchParams } from "next/navigation";

/**
 * Hook para preservar el parámetro 'plan' en los links del dashboard
 * Útil cuando estás en modo diseño (plan=pro o plan=business)
 */
export function usePlanUrl() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const urlSuffix = planParam && ["pro", "business"].includes(planParam) 
    ? `?plan=${planParam}` 
    : "";
  
  return { planParam, urlSuffix };
}

