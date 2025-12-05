"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DevelopersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateKey, setShowCreateKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState(100);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);

      // Cargar API keys
      const { data: keys } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      setApiKeys(keys || []);
      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      alert("Por favor ingresa un nombre para la API Key");
      return;
    }

    setCreating(true);
    try {
      const supabase = createClient();
      const response = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al crear API Key");
        setCreating(false);
        return;
      }

      setNewApiKey(data.apiKey);
      setNewKeyName("");
      setShowCreateKey(false);
      
      // Recargar lista
      const { data: keys } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setApiKeys(keys || []);
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const handleRecharge = async (keyId: string) => {
    try {
      const response = await fetch("/api/api-keys/recharge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKeyId: keyId,
          amount: rechargeAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al recargar saldo");
        return;
      }

      alert(`Saldo recargado exitosamente. Nuevo saldo: $${data.newBalance} MXN`);
      
      // Recargar lista
      const supabase = createClient();
      const { data: keys } = await supabase
        .from("api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setApiKeys(keys || []);
      setSelectedKey(null);
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-[#10B981]">
              ValidaRFC.mx
            </Link>
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-[#10B981] transition-colors"
            >
              ← Volver al Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Documentación API
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Integra ValidaRFC.mx en tus aplicaciones
        </p>

        {/* API Keys Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Mis API Keys
            </h2>
            <button
              onClick={() => setShowCreateKey(!showCreateKey)}
              className="px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
            >
              + Crear API Key
            </button>
          </div>

          {showCreateKey && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ej: Producción, Desarrollo, etc."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <button
                  onClick={handleCreateKey}
                  disabled={creating}
                  className="px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 transition-colors font-medium"
                >
                  {creating ? "Creando..." : "Crear"}
                </button>
              </div>
            </div>
          )}

          {newApiKey && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-2">
                ⚠️ ¡Importante! Guarda esta API Key. No podrás verla de nuevo.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-white border border-green-300 rounded font-mono text-sm">
                  {newApiKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newApiKey);
                    alert("API Key copiada al portapapeles");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Copiar
                </button>
              </div>
            </div>
          )}

          {apiKeys.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No tienes API Keys. Crea una para comenzar.
            </p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {key.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            key.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {key.is_active ? "Activa" : "Inactiva"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Key: <code className="font-mono">{key.key_prefix}</code>
                        </p>
                        <p>Saldo: ${parseFloat(key.balance).toFixed(2)} MXN</p>
                        <p>Consultas realizadas: {key.total_used}</p>
                        {key.last_used_at && (
                          <p>
                            Último uso:{" "}
                            {new Date(key.last_used_at).toLocaleDateString(
                              "es-MX"
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedKey(key)}
                        className="px-4 py-2 border border-[#10B981] text-[#10B981] rounded-lg hover:bg-[#10B981] hover:text-white transition-colors font-medium"
                      >
                        Recargar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedKey && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">
                Recargar saldo: {selectedKey.name}
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  min="10"
                  step="10"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="Monto en MXN"
                />
                <button
                  onClick={() => handleRecharge(selectedKey.id)}
                  className="px-6 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
                >
                  Recargar
                </button>
                <button
                  onClick={() => setSelectedKey(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Precio por consulta: $0.10 MXN
              </p>
            </div>
          )}
        </div>

        {/* API Documentation */}
        <div className="space-y-8">
          {/* Endpoint */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Endpoint
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-green-400">
                POST https://validarfcmx.com/api/public/validate
              </code>
            </div>
            <p className="text-gray-600">
              Valida un RFC contra el padrón del SAT en tiempo real.
            </p>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Autenticación
            </h2>
            <p className="text-gray-600 mb-4">
              Incluye tu API Key en el header de la solicitud:
            </p>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400">
                X-API-Key: sk_live_tu_api_key_aqui
              </code>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Precios
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-lg font-semibold text-blue-900 mb-2">
                $0.10 MXN por consulta
              </p>
              <p className="text-blue-700">
                Sistema de prepago. Recarga saldo en tu dashboard y se descontará
                automáticamente por cada consulta realizada.
              </p>
            </div>
          </div>

          {/* Rate Limiting */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Rate Limiting
            </h2>
            <p className="text-gray-600 mb-2">
              Límite: <strong>60 requests por minuto</strong> por API Key
            </p>
            <p className="text-sm text-gray-500">
              Los headers de respuesta incluyen información sobre el rate limit:
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mt-2">
              <code className="text-green-400 text-sm">
                X-RateLimit-Limit: 60<br />
                X-RateLimit-Remaining: 45
              </code>
            </div>
          </div>

          {/* Request */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Request
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Headers</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    Content-Type: application/json<br />
                    X-API-Key: sk_live_tu_api_key_aqui
                  </code>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Body</h3>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    {`{
  "rfc": "ABC123456XYZ"
}`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Response */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Response
            </h2>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-green-400 text-sm">
                {`{
  "success": true,
  "valid": true,
  "rfc": "ABC123456XYZ",
  "remaining": 95,
  "message": "RFC válido",
  "source": "sat",
  "responseTime": 523,
  "balance": 9.50
}`}
              </code>
            </div>
          </div>

          {/* Examples */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Ejemplos
            </h2>

            <div className="space-y-6">
              {/* cURL */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">cURL</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm">
                    {`curl -X POST https://validarfcmx.com/api/public/validate \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: sk_live_tu_api_key_aqui" \\
  -d '{"rfc": "ABC123456XYZ"}'`}
                  </code>
                </div>
              </div>

              {/* JavaScript */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">JavaScript</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm">
                    {`const response = await fetch('https://validarfcmx.com/api/public/validate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'sk_live_tu_api_key_aqui'
  },
  body: JSON.stringify({
    rfc: 'ABC123456XYZ'
  })
});

const data = await response.json();
console.log(data);`}
                  </code>
                </div>
              </div>

              {/* Python */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Python</h3>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400 text-sm">
                    {`import requests

url = 'https://validarfcmx.com/api/public/validate'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'sk_live_tu_api_key_aqui'
}
data = {
    'rfc': 'ABC123456XYZ'
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Error Codes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Códigos de Error
            </h2>
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">400</span>
                <span>Bad Request - RFC inválido o faltante</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">401</span>
                <span>Unauthorized - API Key inválida o faltante</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">402</span>
                <span>Payment Required - Saldo insuficiente</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">403</span>
                <span>Forbidden - API Key desactivada o expirada</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">429</span>
                <span>Too Many Requests - Rate limit excedido</span>
              </div>
              <div className="flex gap-4">
                <span className="font-mono text-red-600 w-20">500</span>
                <span>Internal Server Error</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

