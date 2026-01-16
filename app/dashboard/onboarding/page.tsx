"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type PlanId } from "@/lib/plans";

interface OnboardingRequest {
  company_name: string;
  industry: string;
  team_size: string;
  use_cases: string;
  data_sources: string;
  integration_preferences: string;
  webhook_url: string;
  sandbox: boolean;
  contact_name: string;
  contact_email: string;
  notes: string;
  status?: string;
}

const defaults: OnboardingRequest = {
  company_name: "",
  industry: "",
  team_size: "",
  use_cases: "",
  data_sources: "",
  integration_preferences: "",
  webhook_url: "",
  sandbox: false,
  contact_name: "",
  contact_email: "",
  notes: "",
  status: "pendiente",
};

function OnboardingPage() {
  const [form, setForm] = useState<OnboardingRequest>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<PlanId>("free");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const load = async () => {
      const planParam = searchParams.get("plan");
      const designPlan = (planParam && ["pro", "business"].includes(planParam)
        ? planParam
        : "business") as PlanId;

      try {
        const res = await fetch("/api/onboarding");
        if (res.status === 401) {
          setPlanId(designPlan);
          setForm(defaults);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setPlanId((data.planId || designPlan) as PlanId);
          if (data.onboarding) {
            setForm({ ...defaults, ...data.onboarding });
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const isBusiness = planId === "business";

  const handleChange = (field: keyof OnboardingRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!isBusiness) {
      setErrorMessage("Disponible solo para plan Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "No se pudo guardar");
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        setSuccessMessage("✅ Preferencias de onboarding guardadas correctamente");
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Error al guardar. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');

  if (!isBusiness) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-md:p-4">
        <div className="text-center space-y-4 max-md:space-y-3">
          <div className="inline-flex items-center justify-center w-14 max-md:w-12 h-14 max-md:h-12 bg-gray-100 rounded-full">
            <svg className="w-7 h-7 max-md:w-6 max-md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 20a5.5 5.5 0 1111 0" />
            </svg>
          </div>
          <h3 className="text-lg max-md:text-base font-semibold text-gray-900">Onboarding Personalizado</h3>
          <p className="text-xs max-md:text-[11px] text-gray-600 max-w-md mx-auto">
            Disponible solo en plan Business. Configura tu cuenta a medida con nuestro equipo.
          </p>
          <a
            href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
            className="inline-flex items-center gap-2 max-md:gap-1.5 px-5 max-md:px-4 py-2.5 max-md:py-2 text-sm max-md:text-xs text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Mejorar a Business
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-md:space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-md:p-3">
        <h1 className="text-lg max-md:text-base font-semibold text-gray-900">Onboarding Personalizado</h1>
        <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
          Cuéntanos sobre tu empresa y casos de uso para configurar tu cuenta.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3 space-y-3 max-md:space-y-2.5">
        <div className="grid md:grid-cols-2 gap-3 max-md:gap-2.5">
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Nombre de la empresa
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              placeholder="Ej. Fintech XYZ"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Industria
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              placeholder="Finanzas, SaaS, Servicios, etc."
              maxLength={120}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-md:gap-2.5">
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Tamaño del equipo
            </label>
            <input
              type="text"
              value={form.team_size}
              onChange={(e) => handleChange("team_size", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              placeholder="Ej. 5-10 usuarios"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Email de contacto
            </label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              placeholder="contacto@empresa.com"
              maxLength={200}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-md:gap-2.5">
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Nombre de contacto
            </label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => handleChange("contact_name", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              placeholder="Nombre y rol (ej. Operaciones)"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Objetivo del onboarding / casos de uso
            </label>
            <textarea
              value={form.use_cases}
              onChange={(e) => handleChange("use_cases", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              rows={3}
              placeholder="Ej. Alta masiva de clientes, screening recurrente, monitoreo de RFCs..."
              maxLength={800}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-md:gap-2.5">
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Fuentes de datos / integraciones
            </label>
            <textarea
              value={form.data_sources}
              onChange={(e) => handleChange("data_sources", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              rows={3}
              placeholder="CRMs, core bancario, ERP, csv, API interna..."
              maxLength={800}
            />
          </div>
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Preferencias de integración
            </label>
            <textarea
              value={form.integration_preferences}
              onChange={(e) => handleChange("integration_preferences", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all"
              rows={3}
              placeholder="API, Webhooks, carga masiva, validaciones batch, roles de acceso..."
              maxLength={800}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 max-md:gap-2.5">
          <div>
            <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
              Webhook de notificaciones (opcional)
            </label>
            <input
              type="url"
              value={form.webhook_url}
              onChange={(e) => handleChange("webhook_url", e.target.value)}
              className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-gray-900"
              placeholder="https://tuapp.com/webhooks/rfc"
              maxLength={240}
            />
          </div>
          <div className="flex items-center gap-2 max-md:gap-1.5 mt-6 max-md:mt-4">
            <input
              id="sandbox"
              type="checkbox"
              checked={form.sandbox}
              onChange={(e) => handleChange("sandbox", e.target.checked)}
              className="h-4 max-md:h-3.5 w-4 max-md:w-3.5 text-brand-primary border-gray-300 rounded"
            />
            <label htmlFor="sandbox" className="text-sm max-md:text-xs text-gray-700">
              Necesito ambiente sandbox para pruebas
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
            Notas adicionales
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 transition-all text-gray-900"
            rows={3}
            placeholder="Tiempos deseados, restricciones de seguridad, compliance, SLA interno..."
            maxLength={1000}
          />
        </div>

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-md:p-2.5 flex items-center gap-2 max-md:gap-1.5">
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs max-md:text-[11px] font-semibold text-green-800">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-md:p-2.5 flex items-center gap-2 max-md:gap-1.5">
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-xs max-md:text-[11px] font-semibold text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="flex items-center justify-between max-md:flex-col max-md:items-stretch max-md:gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4 max-md:p-3">
          <div>
            <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">
              Alcance incluido en Business
            </p>
            <p className="text-[11px] max-md:text-[10px] text-gray-500 mt-1 max-md:mt-0.5">
              Configuración de cuenta, roles, webhooks, guías de integración y walkthrough inicial.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-1.5 max-md:gap-1 px-5 max-md:px-4 py-2 max-md:py-1.5 text-xs max-md:text-[11px] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold shadow-sm hover:shadow"
            style={{ backgroundColor: brandPrimary }}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-3.5 max-md:h-3 w-3.5 max-md:w-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando
              </>
            ) : (
              <>
                <svg className="w-3.5 max-md:w-3 h-3.5 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPageWrapper() {
  return (
    <Suspense fallback={null}>
      <OnboardingPage />
    </Suspense>
  );
}


