"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type PlanId } from "@/lib/plans";

interface WhiteLabelSettings {
  brand_name: string;
  custom_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  hide_maflipp_brand: boolean;
}

const defaults: WhiteLabelSettings = {
  brand_name: "Tu Marca",
  custom_logo_url: null,
  primary_color: "#2F7E7A",
  secondary_color: "#1F5D59",
  hide_maflipp_brand: true,
};

function WhiteLabelPage() {
  const [settings, setSettings] = useState<WhiteLabelSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<PlanId>("free");
  const searchParams = useSearchParams();

  useEffect(() => {
    const load = async () => {
      // Modo diseño: permitir plan por query
      const planParam = searchParams.get("plan");
      const designPlan = (planParam && ["pro", "business"].includes(planParam)
        ? planParam
        : "free") as PlanId;

      try {
        const res = await fetch("/api/branding");
        if (res.status === 401) {
          setPlanId(designPlan);
          setSettings(defaults);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSettings({
            ...defaults,
            ...data,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        // Obtener plan real si hay sesión
        try {
          const userRes = await fetch("/api/alerts/preferences"); // reuse authenticated endpoint to detect plan
          if (userRes.ok) {
            // This endpoint doesn't return plan; fall back to design plan for UI gating
            // In a full implementation, we'd have a /api/me that returns subscription_status
          }
        } catch (e) {}
        setPlanId(designPlan);
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const isBusiness = planId === "business";

  const handleSave = async () => {
    if (!isBusiness) {
      alert("White label está disponible solo para plan Business");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo guardar");
      } else {
        alert("✅ Configuración guardada");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">White Label Disponible</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta funcionalidad está disponible solo para el plan Business. Personaliza completamente tu marca en el dashboard.
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
        <h1 className="text-2xl font-semibold text-gray-600 mb-2">White Label</h1>
        <p className="text-sm text-gray-500">
          Personaliza tu marca en el dashboard para tus usuarios.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la marca
            </label>
            <input
              type="text"
              value={settings.brand_name}
              onChange={(e) =>
                setSettings({ ...settings, brand_name: e.target.value })
              }
              maxLength={80}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="Mi Empresa"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (URL)
            </label>
            <input
              type="url"
              value={settings.custom_logo_url || ""}
              onChange={(e) =>
                setSettings({ ...settings, custom_logo_url: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-0 focus:border-gray-200 transition-all"
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Usa un logo con fondo transparente (PNG/SVG).
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color primario
            </label>
            <input
              type="color"
              value={settings.primary_color}
              onChange={(e) =>
                setSettings({ ...settings, primary_color: e.target.value })
              }
              className="h-10 w-20 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color secundario
            </label>
            <input
              type="color"
              value={settings.secondary_color}
              onChange={(e) =>
                setSettings({ ...settings, secondary_color: e.target.value })
              }
              className="h-10 w-20 border rounded"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="hide-brand"
            type="checkbox"
            checked={settings.hide_maflipp_brand}
            onChange={(e) =>
              setSettings({ ...settings, hide_maflipp_brand: e.target.checked })
            }
            className="h-4 w-4 text-[#2F7E7A] border-gray-300 rounded"
          />
          <label htmlFor="hide-brand" className="text-sm text-gray-700">
            Ocultar marca Maflipp en el dashboard
          </label>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Vista previa (simplificada)
          </h3>
          <div className="flex items-center gap-3">
            {settings.custom_logo_url ? (
              <img
                src={settings.custom_logo_url}
                alt="Logo"
                className="h-10 w-auto object-contain"
              />
            ) : (
              <div className="h-10 px-4 flex items-center rounded bg-white border border-gray-200">
                <span className="text-sm font-semibold text-gray-800">
                  {settings.brand_name || "Tu Marca"}
                </span>
              </div>
            )}
            <span
              className="text-sm px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: settings.primary_color }}
            >
              Botón primario
            </span>
            <span
              className="text-sm px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: settings.secondary_color }}
            >
              Botón secundario
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
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
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WhiteLabelPageWrapper() {
  return (
    <Suspense fallback={null}>
      <WhiteLabelPage />
    </Suspense>
  );
}

