"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPlan, type PlanId } from "@/lib/plans";

interface EmailAlertsProps {
  userData: any;
}

export default function EmailAlerts({ userData }: EmailAlertsProps) {
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(80);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const planId = (userData?.subscription_status || "free") as PlanId;
  const plan = getPlan(planId);
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan.validationsPerMonth;
  const usagePercentage = planLimit === -1 ? 0 : (queriesThisMonth / planLimit) * 100;

  // Obtener access token
  useEffect(() => {
    const getToken = async () => {
      if (userData?.id === "mock-user") {
        return;
      }
      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        setAccessToken(sessionData.session?.access_token ?? null);
      } catch (error) {
        console.error("Error obteniendo token:", error);
      }
    };
    getToken();
  }, [userData]);

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
        const response = await fetch("/api/alerts/preferences", {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          credentials: "include",
        });
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

    if (userData && (userData.id === "mock-user" || accessToken !== null)) {
      loadPreferences();
    }
  }, [userData, accessToken]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    // Modo diseño: simular guardado
    if (userData?.id === "mock-user") {
      setTimeout(() => {
        setSuccessMessage("Cambios guardados");
        setSaving(false);
        setTimeout(() => setSuccessMessage(null), 5000);
      }, 500);
      return;
    }

    try {
      const response = await fetch("/api/alerts/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          alerts_enabled: alertsEnabled,
          alert_threshold: alertThreshold,
        }),
      });

      if (response.ok) {
        await response.json().catch(() => null);
        setSuccessMessage("Cambios guardados");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const error = await response.json();
        setErrorMessage(error.error || "No se pudieron guardar las preferencias");
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      console.error("Error guardando preferencias:", error);
      setErrorMessage("Error al guardar las preferencias. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: brandPrimaryColor }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
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
              className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-3 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all"
              style={{ 
                '--tw-ring-color': `${brandPrimaryColor}20`,
                backgroundColor: alertsEnabled ? brandPrimaryColor : undefined
              } as React.CSSProperties}
            ></div>
          </label>
        </div>
        <p className="text-xs text-gray-600">
          Recibe notificaciones cuando te acerques a tu límite mensual
        </p>
      </div>

      {alertsEnabled && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-red-900">
                    ⚠️ {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Notificar cuando el uso alcance:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{ accentColor: brandPrimaryColor }}
              />
              <span className="text-base font-bold text-gray-900 w-14 text-right" style={{ color: brandPrimaryColor }}>
                {alertThreshold}%
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-[10px] font-medium text-gray-600">
                Uso actual: <span className="font-bold" style={{ color: brandPrimaryColor }}>{usagePercentage.toFixed(1)}%</span> ({queriesThisMonth.toLocaleString()}/{planLimit === -1 ? "∞" : planLimit.toLocaleString()})
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-lg bg-blue-200">
                <svg className="w-4 h-4 text-blue-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-blue-900 mb-1.5">
                  Recibirás alertas cuando:
                </p>
                <ul className="text-xs text-blue-800 space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Tu uso alcance el <strong>{alertThreshold}%</strong> del límite mensual</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Alcances el <strong>100%</strong> del límite mensual</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <svg className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Resumen mensual de uso al final de cada mes</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md hover:scale-[1.01] font-semibold text-sm"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            {successMessage && (
              <div className="flex items-center justify-center gap-1.5 py-1.5">
                <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-xs font-medium text-green-700">
                  Cambios guardados
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


