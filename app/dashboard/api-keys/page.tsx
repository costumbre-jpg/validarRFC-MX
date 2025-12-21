"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getPlan, type PlanId } from "@/lib/plans";

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  total_used: number;
  api_calls_this_month?: number;
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

function APIKeysPage() {
  const [userData, setUserData] = useState<any>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [showNewKey, setShowNewKey] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [deletingKey, setDeletingKey] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Modo diseño: permitir acceso sin login
      if (!user) {
        const planParam = searchParams.get("plan");
        // En modo diseño, usar el plan de la URL o Free por defecto
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setUserData({
          id: "mock-user",
          email: "diseño@maflipp.com",
          subscription_status: designPlan,
        });
        
        // Datos mock para API Keys
        if (designPlan === "pro" || designPlan === "business") {
          setApiKeys([
            {
              id: "1",
              name: "Producción",
              key_prefix: "sk_live_abc123...",
              total_used: 1250,
              last_used_at: new Date().toISOString(),
              is_active: true,
              created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: "2",
              name: "Desarrollo",
              key_prefix: "sk_live_xyz789...",
              total_used: 45,
              last_used_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              is_active: true,
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ]);
        }
        
        setLoading(false);
        return;
      }

      // Get user data real
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      // Si hay un parámetro 'plan' en la URL, sobrescribir subscription_status temporalmente
      // Esto permite el modo diseño incluso con usuarios autenticados
      const planParam = searchParams.get("plan");
      const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
      
      if (dbUser && planFromUrl) {
        setUserData({
          ...(dbUser as any),
          subscription_status: planFromUrl, // Sobrescribir con el plan de la URL
        });
      } else if (dbUser) {
        setUserData(dbUser);
      }

      // Get API keys reales
      const { data: keys } = await supabase
        .from("api_keys")
        .select("id, name, key_prefix, total_used, api_calls_this_month, last_used_at, is_active, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setApiKeys(keys || []);
      setLoading(false);
    };

    loadData();
  }, [searchParams]);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setErrorMessage("Por favor ingresa un nombre para la API Key");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/api-keys/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Error al crear API Key");
        setTimeout(() => setErrorMessage(null), 5000);
        setCreating(false);
        return;
      }

      // Mostrar la nueva API Key (solo se muestra una vez)
      setNewApiKey(data.apiKey);
      setShowNewKey(true);
      setNewKeyName("");
      
      // Recargar lista de API Keys
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: keys } = await supabase
          .from("api_keys")
          .select("id, name, key_prefix, total_used, api_calls_this_month, last_used_at, is_active, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setApiKeys(keys || []);
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      setErrorMessage("Error al crear API Key. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccessMessage("✅ API Key copiada al portapapeles");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDeleteKey = (keyId: string) => {
    setKeyToDelete(keyId);
  };

  const confirmDeleteKey = async () => {
    if (!keyToDelete) return;

    setDeletingKey(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", keyToDelete);

      if (error) {
        setErrorMessage("Error al eliminar API Key");
        setTimeout(() => setErrorMessage(null), 5000);
        setDeletingKey(false);
        return;
      }

      // Recargar lista
      setApiKeys(apiKeys.filter((k) => k.id !== keyToDelete));
      setKeyToDelete(null);
      setDeletingKey(false);
      setSuccessMessage("✅ API Key eliminada correctamente");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error deleting API key:", error);
      setErrorMessage("Error al eliminar API Key");
      setTimeout(() => setErrorMessage(null), 5000);
      setDeletingKey(false);
    }
  };

  const cancelDeleteKey = () => {
    setKeyToDelete(null);
    setDeletingKey(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F7E7A]"></div>
      </div>
    );
  }

  // Priorizar el parámetro 'plan' de la URL sobre subscription_status de la BD
  // Esto permite el modo diseño con ?plan=pro o ?plan=business
  const planParam = searchParams.get("plan");
  const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
  
  // SIEMPRE priorizar el parámetro de la URL si existe
  // Esto es crítico para el modo diseño
  const planId = planFromUrl 
    ? (planFromUrl as PlanId) 
    : ((userData?.subscription_status || "free") as PlanId);
  const plan = getPlan(planId);
  const isPro = planId === "pro" || planId === "business";
  const apiLimit = plan.features.apiCallsPerMonth || 0;

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondary = getBrandColor('--brand-secondary', '#1F5D59');

  if (!isPro) {
    return (
      <div className="space-y-4 max-md:space-y-3">
        <div className="flex items-center gap-2 flex-wrap mb-2 max-md:mb-1.5">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-sm max-md:text-xs font-semibold"
            style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
          >
            API Keys
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
          <div className="text-center space-y-3 max-md:space-y-2">
            <div className="inline-flex items-center justify-center w-14 max-md:w-12 h-14 max-md:h-12 bg-gray-100 rounded-full">
              <svg className="w-7 h-7 max-md:w-6 max-md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-lg max-md:text-base font-semibold text-gray-900">API Keys</h3>
            <p className="text-xs max-md:text-[11px] text-gray-600 max-w-md mx-auto">
              Disponible en Pro y Business para integrar la API de RFC.
            </p>
            <a
              href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-5 max-md:px-4 py-2 max-md:py-1.5 text-sm max-md:text-xs text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Mejorar Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-md:space-y-3">
      <div>
        <div className="flex items-center justify-between mb-2 max-md:mb-1.5 max-md:flex-col max-md:items-start max-md:gap-2">
          <h1 className="text-lg max-md:text-base font-semibold text-gray-600">API Keys</h1>
          <Link
            href="/developers"
            className="inline-flex items-center gap-1.5 max-md:gap-1 px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium rounded-lg transition-all border"
            style={{
              color: "var(--brand-primary, #2F7E7A)",
              borderColor: "var(--brand-primary, #2F7E7A)",
            }}
          >
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Documentación
          </Link>
        </div>
        <div className="flex items-center gap-2 max-md:gap-1.5 max-md:flex-wrap">
          <div className="flex items-center gap-1.5 max-md:gap-1 text-xs max-md:text-[11px] text-gray-500">
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>
              Límite: {apiLimit === -1 ? "ilimitadas" : `${apiLimit.toLocaleString()}`} llamadas/mes
            </span>
          </div>
          {apiKeys.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 max-md:px-1.5 py-0.5 rounded-full text-xs max-md:text-[11px] font-medium bg-gray-100 text-gray-700">
              {apiKeys.length} {apiKeys.length === 1 ? "API Key" : "API Keys"}
            </span>
          )}
        </div>
      </div>

      {/* Crear Nueva API Key */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandPrimary}15` }}>
            <svg className="w-4 h-4" style={{ color: brandPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Crear Nueva API Key</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Asigna un nombre descriptivo (ej: &quot;Producción&quot;, &quot;Desarrollo&quot;, &quot;Sistema ERP&quot;)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Ej: Producción, Desarrollo, Sistema ERP..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg transition-all focus:outline-none focus:ring-0 focus:border-gray-300"
              onKeyPress={(e) => e.key === "Enter" && handleCreateKey()}
            />
          </div>
          <button
            onClick={handleCreateKey}
            disabled={creating || !newKeyName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            {creating ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Mostrar Nueva API Key (solo una vez) */}
      {showNewKey && newApiKey && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">
                ⚠️ Guarda esta API Key ahora
              </h3>
              <p className="text-xs text-amber-800 mb-3">
                Esta es la única vez que podrás ver la API Key completa. Guárdala en un lugar seguro.
              </p>
              <div className="bg-white rounded-lg p-3 border-2 border-amber-200 mb-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-gray-900 break-all flex-1">{newApiKey}</code>
                  <button
                    onClick={() => handleCopyKey(newApiKey)}
                    className="flex-shrink-0 p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyKey(newApiKey)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all font-medium text-xs shadow-sm hover:shadow-md"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copiar
                </button>
                <button
                  onClick={() => {
                    setShowNewKey(false);
                    setNewApiKey(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium text-xs border border-gray-300 shadow-sm hover:shadow-md"
                >
                  Ya la guardé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de API Keys */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Tus API Keys</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {apiKeys.length === 0 
                ? "Aún no has creado ninguna API Key"
                : `${apiKeys.length} ${apiKeys.length === 1 ? "API Key creada" : "API Keys creadas"}`
              }
            </p>
          </div>
        </div>
        
        {apiKeys.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No hay API Keys aún</h3>
            <p className="text-xs text-gray-500">
              Crea tu primera API Key usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Llamadas
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Último uso
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((key) => {
                  const callsThisMonth = key.api_calls_this_month !== undefined 
                    ? key.api_calls_this_month 
                    : key.total_used;
                  const usagePercent = apiLimit === -1 ? 0 : (callsThisMonth / apiLimit) * 100;
                  
                  return (
                    <tr key={key.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                            style={{ backgroundColor: brandPrimary }}
                          >
                            {key.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-900">{key.name}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(key.created_at).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">{key.key_prefix}</code>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-gray-900">
                            {callsThisMonth.toLocaleString()} / {apiLimit === -1 ? "∞" : apiLimit.toLocaleString()}
                          </div>
                          {apiLimit !== -1 && (
                            <div className="w-20 bg-gray-200 rounded-full h-1">
                              <div 
                                className="h-1 rounded-full transition-all"
                                style={{ 
                                  width: `${Math.min(usagePercent, 100)}%`,
                                  backgroundColor: usagePercent >= 90 ? '#ef4444' : usagePercent >= 70 ? '#f59e0b' : brandPrimary
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleDateString("es-MX", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : <span className="text-gray-400">Nunca</span>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            key.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {key.is_active ? (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Activa
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Inactiva
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación para Eliminar API Key */}
      {keyToDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-gray-900/60"
            onClick={() => {
              if (!deletingKey) {
                cancelDeleteKey();
              }
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-2xl max-w-sm w-full p-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center mb-1.5">
                ¿Eliminar API Key?
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4">
                Esta acción no se puede deshacer. La API Key será eliminada permanentemente.
              </p>
              
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={cancelDeleteKey}
                  disabled={deletingKey}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-3 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  onClick={confirmDeleteKey}
                  disabled={deletingKey}
                >
                  {deletingKey ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Información y Documentación */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Información sobre API Keys</h3>
            <ul className="text-xs text-blue-800 space-y-1.5 mb-3">
              <li className="flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Tu plan incluye {apiLimit === -1 ? "llamadas ilimitadas" : `${apiLimit.toLocaleString()} llamadas`} por mes</span>
              </li>
              <li className="flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Las API Keys son personales y no deben compartirse</span>
              </li>
              <li className="flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Puedes crear múltiples API Keys para diferentes entornos</span>
              </li>
              <li className="flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>El contador se reinicia automáticamente el primer día de cada mes</span>
              </li>
            </ul>
            <Link
              href="/developers"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 transition-colors"
            >
              Ver documentación completa de la API
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function APIKeysPageWrapper() {
  return (
    <Suspense fallback={null}>
      <APIKeysPage />
    </Suspense>
  );
}

