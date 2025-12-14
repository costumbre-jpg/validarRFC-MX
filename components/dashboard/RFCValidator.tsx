"use client";

import { useState } from "react";
import { formatRFC, isValidRFCFormat } from "@/lib/utils";
import { getPlanValidationLimit, type PlanId } from "@/lib/plans";

interface RFCValidatorProps {
  userData: any;
  onValidationComplete?: () => void;
}

export default function RFCValidator({ userData, onValidationComplete }: RFCValidatorProps) {
  const [rfc, setRfc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean | null;
    message: string;
    rfc: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const planId = (userData?.subscription_status || "free") as PlanId;
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = getPlanValidationLimit(planId);
  const brandPrimary = "var(--brand-primary, #2F7E7A)";
  const brandSecondary = "var(--brand-secondary, #1F5D59)";

  const handleValidate = async () => {
    setError(null);
    setResult(null);

    const formattedRFC = formatRFC(rfc);

    if (!formattedRFC) {
      setError("Por favor ingresa un RFC");
      return;
    }

    if (!isValidRFCFormat(formattedRFC)) {
      setError("El formato del RFC no es válido");
      return;
    }

    // Verificar límite (solo si no es ilimitado)
    if (planLimit !== -1 && queriesThisMonth >= planLimit) {
      setError(
        `Has alcanzado el límite de ${planLimit.toLocaleString()} validaciones este mes. Mejora tu plan para obtener más.`
      );
      return;
    }

    setLoading(true);

    try {
      // Llamar a la API de validación
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfc: formattedRFC }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Error al validar el RFC");
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.message || "Error al validar el RFC");
        setLoading(false);
        return;
      }

      setResult({
        isValid: data.valid,
        message: data.message,
        rfc: data.rfc,
      });

      // Actualizar datos sin recargar la página
      if (onValidationComplete) {
        setTimeout(() => {
          onValidationComplete();
        }, 1000);
      } else {
        // Fallback: recargar si no hay callback
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError("Ocurrió un error al validar el RFC. Por favor intenta de nuevo.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center px-4 py-2 rounded-full text-lg font-bold"
            style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
          >
            Validar RFC
          </span>
        </div>
        <div className="text-right text-sm text-gray-600">
          <div className="font-semibold text-gray-900">
            {planLimit === -1 ? "Ilimitado" : `${planLimit.toLocaleString()} / mes`}
          </div>
          {planLimit !== -1 && (
            <div className="text-xs text-gray-500">
              Restantes: {Math.max(planLimit - queriesThisMonth, 0).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="rfc-input" className="sr-only">
            RFC
          </label>
          <div className="flex gap-2">
            <input
              id="rfc-input"
              type="text"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleValidate();
                }
              }}
              placeholder="Ej: ABC123456XYZ"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-gray-300"
            />
            <button
              onClick={handleValidate}
              disabled={loading || !rfc.trim()}
              className="px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              {loading ? "Validando..." : "Validar RFC"}
            </button>
          </div>
          
          {/* Ejemplos rápidos de RFCs */}
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Prueba con ejemplos:</p>
            <div className="flex flex-wrap gap-2">
              {["ABC123456XYZ", "DEF789012ABC", "GHI345678DEF"].map((example) => (
                <button
                  key={example}
                  onClick={() => setRfc(example)}
                  className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-mono"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div
            className={`rounded-lg p-6 border-2 shadow-sm ${
              result.isValid
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                result.isValid ? "bg-green-100" : "bg-red-100"
              }`}>
                {result.isValid ? (
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-lg font-bold mb-1 ${
                    result.isValid ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.message}
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="font-medium">RFC:</span>
                    <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">
                      {result.rfc}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Validado en menos de 2 segundos</span>
                  </div>
                  {result.isValid && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>RFC verificado y activo en el SAT</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Información del plan y validaciones restantes */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Validaciones restantes este mes
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Plan {userData?.subscription_status === "free" ? "Gratis" : userData?.subscription_status === "pro" ? "Pro" : "Business"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${
                planLimit === -1 
                  ? "text-[#2F7E7A]"
                  : planLimit - queriesThisMonth <= 3
                  ? "text-orange-600"
                  : "text-[#2F7E7A]"
              }`}>
                {planLimit === -1 
                  ? "∞" 
                  : Math.max(0, planLimit - queriesThisMonth).toLocaleString()}
              </p>
              {planLimit !== -1 && (
                <p className="text-xs text-gray-500">
                  de {planLimit.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

