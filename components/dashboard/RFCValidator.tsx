"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { formatRFC, isValidRFCFormat } from "@/lib/utils";

interface RFCValidatorProps {
  user: User;
  userData: any;
}

export default function RFCValidator({ user, userData }: RFCValidatorProps) {
  const [rfc, setRfc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    isValid: boolean | null;
    message: string;
    rfc: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const plan = userData?.subscription_status || "free";
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan === "free" ? 5 : plan === "pro" ? 100 : 1000;

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

    if (queriesThisMonth >= planLimit) {
      setError(
        `Has alcanzado el límite de ${planLimit} validaciones este mes. Mejora tu plan para obtener más.`
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

      // Recargar la página después de 1 segundo para actualizar estadísticas
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError("Ocurrió un error al validar el RFC. Por favor intenta de nuevo.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Validador de RFC
      </h2>

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
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
            />
            <button
              onClick={handleValidate}
              disabled={loading || !rfc.trim()}
              className="px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Validando..." : "Validar RFC"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {result && (
          <div
            className={`rounded-lg p-4 border-2 ${
              result.isValid
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {result.isValid ? "✅" : "❌"}
              </span>
              <div>
                <p
                  className={`font-semibold ${
                    result.isValid ? "text-green-900" : "text-red-900"
                  }`}
                >
                  {result.message}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  RFC: {result.rfc}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          <p>
            Validaciones restantes este mes:{" "}
            <span className="font-semibold text-gray-700">
              {Math.max(0, planLimit - queriesThisMonth)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

