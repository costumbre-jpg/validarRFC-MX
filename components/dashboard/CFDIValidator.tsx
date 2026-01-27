"use client";

import { useState } from "react";

interface CFDIResult {
  valid: boolean;
  status: string;
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  total: string;
  validated_at: string;
  source: string;
}

export default function CFDIValidator() {
  const [uuid, setUuid] = useState("");
  const [rfcEmisor, setRfcEmisor] = useState("");
  const [rfcReceptor, setRfcReceptor] = useState("");
  const [total, setTotal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CFDIResult | null>(null);

  const brandPrimary = "var(--brand-primary, #2F7E7A)";

  const handleValidate = async () => {
    setError(null);
    setResult(null);

    if (!uuid || !rfcEmisor || !rfcReceptor || !total) {
      setError("Completa todos los campos (UUID, RFC Emisor, RFC Receptor, Total)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/validate-cfdi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, rfcEmisor, rfcReceptor, total }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo validar el CFDI");
        setLoading(false);
        return;
      }
      setResult(data);
    } catch (e) {
      console.error(e);
      setError("Error al validar CFDI. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Validación CFDI (Business)</h2>
          <p className="text-sm text-gray-600">Ingresa los datos del CFDI para validarlo.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-gray-700">UUID</label>
            <input
              type="text"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">Total</label>
            <input
              type="text"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-gray-700">RFC Emisor</label>
            <input
              type="text"
              value={rfcEmisor}
              onChange={(e) => setRfcEmisor(e.target.value.toUpperCase())}
              placeholder="RFC Emisor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors uppercase"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-700">RFC Receptor</label>
            <input
              type="text"
              value={rfcReceptor}
              onChange={(e) => setRfcReceptor(e.target.value.toUpperCase())}
              placeholder="RFC Receptor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors uppercase"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-lg border-2 shadow-sm p-4 bg-green-50 border-green-200">
            <p className="text-sm font-semibold text-green-800 mb-2">
              CFDI {result.valid ? "Vigente" : "No válido"}
            </p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>UUID:</strong> {result.uuid}</p>
              <p><strong>RFC Emisor:</strong> {result.rfcEmisor}</p>
              <p><strong>RFC Receptor:</strong> {result.rfcReceptor}</p>
              <p><strong>Total:</strong> {result.total}</p>
              <p><strong>Validado:</strong> {new Date(result.validated_at).toLocaleString("es-MX")}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleValidate}
            disabled={loading}
            className="px-5 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            {loading ? "Validando..." : "Validar CFDI"}
          </button>
        </div>
      </div>
    </div>
  );
}


