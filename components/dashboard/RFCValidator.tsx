"use client";

import { useState } from "react";
import { normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";
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
    responseTime?: number;
    cached?: boolean;
    name?: string;
    regime?: string;
    startDate?: string;
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

    const formattedRFC = normalizeRFC(rfc);

    if (!formattedRFC) {
      setError("Por favor ingresa un RFC");
      return;
    }

    if (!isValidRFCFormatStrict(formattedRFC)) {
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
        responseTime: data.responseTime,
        cached: data.cached,
        name: data.name,
        regime: data.regime,
        startDate: data.startDate,
      });

      // Actualizar datos sin recargar la página
      if (onValidationComplete) {
        setTimeout(() => {
          onValidationComplete();
        }, 500);
      }
    } catch (err) {
      setError("Ocurrió un error al validar el RFC. Por favor intenta de nuevo.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 max-md:p-4">
      <div className="flex items-center justify-between mb-4 max-md:mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-full text-lg max-md:text-base font-bold"
            style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
          >
            Validar RFC
          </span>
        </div>
        <div className="text-right text-sm max-md:text-xs text-gray-600">
          <div className="font-semibold text-gray-900">
            {planLimit === -1 ? "Ilimitado" : `${planLimit.toLocaleString()} / mes`}
          </div>
          {planLimit !== -1 && (
            <div className="text-xs max-md:text-[11px] text-gray-500">
              Restantes: {Math.max(planLimit - queriesThisMonth, 0).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 max-md:space-y-3">
        <div>
          <label htmlFor="rfc-input" className="sr-only">
            RFC
          </label>
          <div className="flex gap-2 max-md:gap-1.5">
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
              placeholder="Ej: XAXX010101000"
              className="flex-1 px-4 max-md:px-3 py-3 max-md:py-2.5 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm max-md:text-sm"
            />
            <button
              onClick={handleValidate}
              disabled={loading || !rfc.trim()}
              className="px-6 max-md:px-4 py-3 max-md:py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm max-md:text-xs shadow-sm hover:shadow-md whitespace-nowrap"
              style={{ backgroundColor: brandPrimary }}
            >
              {loading ? "Validando..." : "Validar RFC"}
            </button>
          </div>
          
          {/* Ejemplos rápidos de RFCs */}
          <div className="mt-3 max-md:mt-2">
            <p className="text-xs max-md:text-[11px] text-gray-500 mb-2 max-md:mb-1.5">Prueba con ejemplos:</p>
            <div className="flex flex-wrap gap-2 max-md:gap-1.5">
              {["XAXX010101000", "COSC8001137NA", "GODE561231GR8"].map((example) => (
                <button
                  key={example}
                  onClick={() => setRfc(example)}
                  className="text-xs max-md:text-[10px] px-3 max-md:px-2 py-1.5 max-md:py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-mono"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 max-md:p-3">
            <p className="text-sm max-md:text-xs text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div
            className={`rounded-lg p-6 max-md:p-4 border-2 shadow-sm ${
              result.isValid
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <div className="flex items-start gap-4 max-md:gap-3">
              <div className={`flex-shrink-0 w-12 h-12 max-md:w-10 max-md:h-10 rounded-full flex items-center justify-center ${
                result.isValid ? "bg-green-100" : "bg-red-100"
              }`}>
                {result.isValid ? (
                  <svg className="w-6 h-6 max-md:w-5 max-md:h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 max-md:w-5 max-md:h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-lg max-md:text-base font-bold mb-1 ${
                    result.isValid ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.message}
                </p>
                <div className="mt-3 max-md:mt-2 space-y-2 max-md:space-y-1.5">
                  <div className="flex items-center gap-2 max-md:gap-1.5 text-sm max-md:text-xs text-gray-700">
                    <span className="font-medium">RFC:</span>
                    <span className="font-mono bg-white px-2 max-md:px-1.5 py-1 max-md:py-0.5 rounded border border-gray-200">
                      {result.rfc}
                    </span>
                  </div>
                  {result.name && (
                    <div className="text-sm max-md:text-xs text-gray-700">
                      <span className="font-medium">Nombre/Razón Social:</span>{" "}
                      <span className="text-gray-900">{result.name}</span>
                    </div>
                  )}
                  {result.regime && (
                    <div className="text-sm max-md:text-xs text-gray-700">
                      <span className="font-medium">Régimen Fiscal:</span>{" "}
                      <span className="text-gray-900">{result.regime}</span>
                    </div>
                  )}
                  {result.startDate && (
                    <div className="text-sm max-md:text-xs text-gray-700">
                      <span className="font-medium">Fecha de Inicio:</span>{" "}
                      <span className="text-gray-900">{result.startDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 max-md:gap-1.5 text-xs max-md:text-[11px] text-gray-600 pt-2 max-md:pt-1.5 border-t border-gray-200">
                    <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {result.cached ? "Respuesta desde caché" : "Consulta al SAT"} · {result.responseTime ?? 0} ms
                    </span>
                  </div>
                  {result.isValid && (
                    <div className="flex items-center gap-2 max-md:gap-1.5 text-xs max-md:text-[11px] text-green-700 bg-green-100 px-2 max-md:px-1.5 py-1 max-md:py-0.5 rounded">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="currentColor" viewBox="0 0 20 20">
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
        <div className="bg-gray-50 rounded-lg p-4 max-md:p-3 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm max-md:text-xs font-medium text-gray-900">
                Validaciones restantes este mes
              </p>
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                Plan {userData?.subscription_status === "free" ? "Gratis" : userData?.subscription_status === "pro" ? "Pro" : "Business"}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-2xl max-md:text-xl font-bold ${
                planLimit === -1 
                  ? "text-brand-primary"
                  : planLimit - queriesThisMonth <= 3
                  ? "text-orange-600"
                  : "text-brand-primary"
              }`}>
                {planLimit === -1 
                  ? "∞" 
                  : Math.max(0, planLimit - queriesThisMonth).toLocaleString()}
              </p>
              {planLimit !== -1 && (
                <p className="text-xs max-md:text-[11px] text-gray-500">
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


