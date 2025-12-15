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
  const searchParams = useSearchParams();

  useEffect(() => {
    const load = async () => {
      const planParam = searchParams.get("plan");
      const designPlan = (planParam && ["pro", "business"].includes(planParam)
        ? planParam
        : "free") as PlanId;

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
      alert("Disponible solo para plan Business");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo guardar");
      } else {
        alert("✅ Preferencias de onboarding guardadas");
      }
    } catch (e) {
      console.error(e);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F7E7A]"></div>
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
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 20a5.5 5.5 0 1111 0" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Onboarding Personalizado Disponible</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta funcionalidad está disponible solo para el plan Business. Configura tu cuenta a medida con nuestro equipo.
          </p>
          <a
            href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandPrimary }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Mejorar a Business
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-600 mb-2">Onboarding Personalizado</h1>
        <p className="text-sm text-gray-500">
          Cuéntanos sobre tu empresa, flujos y necesidades para configurar tu cuenta a medida.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la empresa
            </label>
            <input
              type="text"
              value={form.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="Ej. Fintech XYZ"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industria
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => handleChange("industry", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="Finanzas, SaaS, Servicios, etc."
              maxLength={120}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tamaño del equipo
            </label>
            <input
              type="text"
              value={form.team_size}
              onChange={(e) => handleChange("team_size", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="Ej. 5-10 usuarios"
              maxLength={80}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de contacto
            </label>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="contacto@empresa.com"
              maxLength={200}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de contacto
            </label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => handleChange("contact_name", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="Nombre y rol (ej. Operaciones)"
              maxLength={120}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objetivo del onboarding / casos de uso
            </label>
            <textarea
              value={form.use_cases}
              onChange={(e) => handleChange("use_cases", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              rows={4}
              placeholder="Ej. Alta masiva de clientes, screening recurrente, monitoreo de RFCs..."
              maxLength={800}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuentes de datos / integraciones
            </label>
            <textarea
              value={form.data_sources}
              onChange={(e) => handleChange("data_sources", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              rows={4}
              placeholder="CRMs, core bancario, ERP, csv, API interna..."
              maxLength={800}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferencias de integración
            </label>
            <textarea
              value={form.integration_preferences}
              onChange={(e) => handleChange("integration_preferences", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              rows={4}
              placeholder="API, Webhooks, carga masiva, validaciones batch, roles de acceso..."
              maxLength={800}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook de notificaciones (opcional)
            </label>
            <input
              type="url"
              value={form.webhook_url}
              onChange={(e) => handleChange("webhook_url", e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="https://tuapp.com/webhooks/rfc"
              maxLength={240}
            />
          </div>
          <div className="flex items-center gap-3 mt-6">
            <input
              id="sandbox"
              type="checkbox"
              checked={form.sandbox}
              onChange={(e) => handleChange("sandbox", e.target.checked)}
              className="h-4 w-4 text-[#2F7E7A] border-gray-300 rounded"
            />
            <label htmlFor="sandbox" className="text-sm text-gray-700">
              Necesito ambiente sandbox para pruebas
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
            rows={3}
            placeholder="Tiempos deseados, restricciones de seguridad, compliance, SLA interno..."
            maxLength={1000}
          />
        </div>

        <div className="flex items-center justify-between bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <div>
            <p className="text-sm font-semibold text-gray-700">
              Alcance incluido en Business
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Configuración de cuenta, roles, webhooks, guías de integración y walkthrough inicial.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandPrimary }}
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar solicitud
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

