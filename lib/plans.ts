/**
 * Configuración centralizada de planes de suscripción
 * 
 * Para agregar nuevos planes en el futuro:
 * 1. Agrega el plan aquí
 * 2. Actualiza los tipos en types/index.ts si es necesario
 * 3. Agrega el Price ID en variables de entorno
 * 4. El código se adaptará automáticamente
 */

export type PlanId = "free" | "pro" | "business" | "basic" | "enterprise" | "api_premium";

export interface PlanConfig {
  id: PlanId;
  name: string;
  displayName: string;
  monthlyPrice: number;
  annualPrice: number; // Con 20% descuento
  validationsPerMonth: number;
  features: {
    history: boolean;
    historyDays?: number; // undefined = ilimitado
    export: boolean;
    exportFormats?: string[]; // ["CSV", "Excel", "PDF"]
    api: boolean | string; // false, "Básica", "Completa", "Ilimitada"
    apiCallsPerMonth?: number;
    apiKeys?: number; // -1 = ilimitado
    users: number; // -1 = ilimitado
    support: string;
    whiteLabel: boolean;
    sso?: boolean;
    sla?: string;
    other?: string[]; // Features adicionales
  };
  popular?: boolean;
  target?: string;
  margin?: number;
}

/**
 * Configuración de planes - MVP (3 planes activos)
 * Planes comentados están preparados para activar después
 */
export const PLANS: Record<PlanId, PlanConfig> = {
  // Plan FREE - MVP Activo
  free: {
    id: "free",
    name: "FREE",
    displayName: "Gratis",
    monthlyPrice: 0,
    annualPrice: 0,
    validationsPerMonth: 10, // Aumentado de 5 a 10 para mejor conversión
    features: {
      history: false,
      export: false,
      api: false,
      apiKeys: 0,
      users: 1,
      support: "FAQs",
      whiteLabel: false,
      other: [
        "Resultados básicos (válido/inválido)",
        "Estadísticas básicas de uso",
        "Límite: 10 validaciones/mes",
      ],
    },
    target: "Usuarios individuales, prueba del servicio",
  },

  // Plan PRO - MVP Activo ⭐
  pro: {
    id: "pro",
    name: "PRO",
    displayName: "Pro",
    monthlyPrice: 299,
    annualPrice: 2870, // 299 * 12 * 0.8 = 2870.4
    validationsPerMonth: 1000,
    features: {
      history: true,
      historyDays: undefined, // Ilimitado
      export: true,
      exportFormats: ["CSV", "Excel"],
      api: "Básica",
      apiCallsPerMonth: 2000,
      apiKeys: 5,
      users: 3,
      support: "Email (24h)",
      whiteLabel: false,
      other: [
        "Dashboard avanzado con gráficos de uso diario y tendencias mensuales",
        "Estadísticas detalladas (tasa de éxito, proyecciones, día pico)",
        "Alertas por email"
      ],
    },
    popular: true,
    target: "Contadores, PYMES",
    margin: 90,
  },

  // Plan BUSINESS - MVP Activo (antes "enterprise")
  business: {
    id: "business",
    name: "BUSINESS",
    displayName: "Business",
    monthlyPrice: 999,
    annualPrice: 9590, // 999 * 12 * 0.8 = 9590.4
    validationsPerMonth: 5000,
    features: {
      history: true,
      historyDays: undefined, // Ilimitado
      export: true,
      exportFormats: ["CSV", "Excel", "PDF"],
      api: "Completa",
      apiCallsPerMonth: 10000,
      apiKeys: 20,
      users: -1, // Ilimitado
      support: "Soporte prioritario (Próximamente)",
      whiteLabel: true,
      sso: true,
      sla: "99.9% (Próximamente)",
      other: [
        "Dashboard Analytics completo con análisis por hora del día",
        "Comparación año anterior y métricas de eficiencia",
        "Predicciones avanzadas y exportación de reportes PDF",
        "Alertas por email",
        "Validación CFDI (add-on personalizado)",
        "Onboarding personalizado",
      ],
    },
    target: "Empresas, Fintechs, Despachos contables",
    margin: 92,
  },

  // Plan BASIC - Preparado para Fase 2 (descomentar para activar)
  basic: {
    id: "basic",
    name: "BASIC",
    displayName: "Basic",
    monthlyPrice: 149,
    annualPrice: 1430, // 149 * 12 * 0.8 = 1430.4
    validationsPerMonth: 100,
    features: {
      history: true,
      historyDays: 60,
      export: true,
      exportFormats: ["CSV"],
      api: "Básica",
      apiCallsPerMonth: 100,
      apiKeys: 1,
      users: 1,
      support: "Email (48h)",
      whiteLabel: false,
      other: [],
    },
    target: "Freelancers, microempresas",
    margin: 85,
  },

  // Plan ENTERPRISE - Preparado para Fase 2 (descomentar para activar)
  enterprise: {
    id: "enterprise",
    name: "ENTERPRISE",
    displayName: "Enterprise",
    monthlyPrice: 1999,
    annualPrice: 19190, // 1999 * 12 * 0.8 = 19190.4
    validationsPerMonth: -1, // Ilimitado
    features: {
      history: true,
      historyDays: undefined,
      export: true,
      exportFormats: ["CSV", "Excel", "PDF"],
      api: "Ilimitada",
      apiCallsPerMonth: -1, // Ilimitado
      apiKeys: -1,
      users: -1,
      support: "24/7",
      whiteLabel: true,
      sso: true,
      sla: "99.9%",
      other: [
        "Onboarding personalizado",
        "Auditoría contratos",
        "Consultoría incluida (4h/mes)",
        "Soporte telefónico",
      ],
    },
    target: "Corporativos, Fintechs, Gobierno",
    margin: 92,
  },

  // Plan API PREMIUM - Preparado para Fase 2 (descomentar para activar)
  api_premium: {
    id: "api_premium",
    name: "API PREMIUM",
    displayName: "API Premium",
    monthlyPrice: 999,
    annualPrice: 9590,
    validationsPerMonth: -1, // Pay-per-use
    features: {
      history: true,
      export: true,
      api: "Ilimitada",
      apiCallsPerMonth: -1,
      apiKeys: -1,
      users: -1,
      support: "Técnico dedicado",
      whiteLabel: false,
      other: [
        "Pay-per-use: $0.08 por validación",
        "Rate limit: 100 req/segundo",
        "Webhooks",
        "Dashboard avanzado",
        "Sandbox testing",
      ],
    },
    target: "Software houses, integradores, SaaS platforms",
    margin: 94,
  },
};

/**
 * Planes activos en MVP (solo estos se muestran)
 */
export const ACTIVE_PLANS: PlanId[] = ["free", "pro", "business"];

/**
 * Planes de pago (excluye FREE)
 */
export const PAID_PLANS: PlanId[] = ["pro", "business"];

/**
 * Obtiene la configuración de un plan
 */
export function getPlan(planId: PlanId): PlanConfig {
  return PLANS[planId];
}

/**
 * Obtiene todos los planes activos
 */
export function getActivePlans(): PlanConfig[] {
  return ACTIVE_PLANS.map((id) => PLANS[id]);
}

/**
 * Obtiene el límite de validaciones para un plan
 */
export function getPlanValidationLimit(planId: PlanId): number {
  const plan = PLANS[planId];
  return plan.validationsPerMonth;
}

/**
 * Obtiene el límite de llamadas API para un plan
 */
export function getPlanApiLimit(planId: PlanId): number {
  const plan = PLANS[planId];
  return plan.features.apiCallsPerMonth || 0;
}

/**
 * Verifica si un plan tiene acceso a una feature
 */
export function planHasFeature(planId: PlanId, feature: keyof PlanConfig["features"]): boolean {
  const plan = PLANS[planId];
  const featureValue = plan.features[feature];
  
  if (typeof featureValue === "boolean") {
    return featureValue;
  }

  if (featureValue === undefined || featureValue === null) {
    return false;
  }

  if (typeof featureValue === "number") {
    return featureValue > 0;
  }

  if (typeof featureValue === "string") {
    return featureValue.trim().length > 0;
  }

  if (Array.isArray(featureValue)) {
    return featureValue.length > 0;
  }

  return Boolean(featureValue);
}

/**
 * Obtiene el nombre del plan en español
 */
export function getPlanDisplayName(planId: PlanId): string {
  return PLANS[planId]?.displayName || planId;
}

