"use client";

import { useState, useEffect } from "react";
import { getPlan, type PlanId } from "@/lib/plans";

interface EmailAlertsProps {
  userData: any;
}

export default function EmailAlerts({ userData }: EmailAlertsProps) {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const planId = (userData?.subscription_status || "free") as PlanId;
  const plan = getPlan(planId);
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan.validationsPerMonth;
  const usagePercentage = planLimit === -1 ? 0 : (queriesThisMonth / planLimit) * 100;

  // Cargar preferencias al montar el componente
  useEffect(() => {
    const loadPreferences = async () => {
      // Modo diseño: usar valores por defecto
      if (userData?.id === "mock-user") {
        setAlertsEnabled(true);
        setAlertThreshold(80);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/alerts/preferences");
        if (response.ok) {
          const data = await response.json();
          setAlertsEnabled(data.alerts_enabled ?? true);
          setAlertThreshold(data.alert_threshold ?? 80);
        }
      } catch (error) {
        console.error("Error cargando preferencias:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      loadPreferences();
    }
  }, [userData]);

  const handleSave = async () => {
    setSaving(true);
    
    // Modo diseño: simular guardado
    if (userData?.id === "mock-user") {
      setTimeout(() => {
        alert("✅ Preferencias de alertas guardadas correctamente (modo diseño)");
        setSaving(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch("/api/alerts/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alerts_enabled: alertsEnabled,
          alert_threshold: alertThreshold,
        }),
      });

      if (response.ok) {
        await response.json().catch(() => null);
        alert("✅ Preferencias de alertas guardadas correctamente");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "No se pudieron guardar las preferencias"}`);
      }
    } catch (error) {
      console.error("Error guardando preferencias:", error);
      alert("Error al guardar las preferencias. Por favor intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (planId !== "pro" && planId !== "business") {
    return null;
  }

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimaryColor = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondaryColor = getBrandColor('--brand-secondary', '#1F5D59');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandPrimaryColor }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-base font-bold"
              style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
            >
              Alertas por Email
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(e) => setAlertsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div 
              className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
              style={{ 
                '--tw-ring-color': `${brandPrimaryColor}20`,
                backgroundColor: alertsEnabled ? brandPrimaryColor : undefined
              } as React.CSSProperties}
            ></div>
          </label>
        </div>
        <p className="text-sm text-gray-600">
          Recibe notificaciones cuando te acerques a tu límite mensual
        </p>
      </div>

      {alertsEnabled && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Notificar cuando el uso alcance:
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: brandPrimaryColor }}
              />
              <span className="text-lg font-bold text-gray-900 w-16 text-right" style={{ color: brandPrimaryColor }}>
                {alertThreshold}%
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-600">
                Uso actual: <span className="font-bold" style={{ color: brandPrimaryColor }}>{usagePercentage.toFixed(1)}%</span> ({queriesThisMonth.toLocaleString()}/{planLimit === -1 ? "∞" : planLimit.toLocaleString()})
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-200">
                <svg className="w-5 h-5 text-blue-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-blue-900 mb-2">
                  Recibirás alertas cuando:
                </p>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Tu uso alcance el <strong>{alertThreshold}%</strong> del límite mensual</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Alcances el <strong>100%</strong> del límite mensual</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Resumen mensual de uso al final de cada mes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-5 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:scale-[1.02] font-semibold"
            style={{ backgroundColor: brandPrimaryColor }}
          >
            {saving ? "Guardando..." : "Guardar Preferencias"}
          </button>
        </div>
      )}
    </div>
  );
}

