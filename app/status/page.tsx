"use client";

import { useEffect, useState } from "react";

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: string;
    database: string;
    stripe: string;
  };
  version: string;
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch("/api/health");
        if (!response.ok) {
          throw new Error("Failed to fetch health status");
        }
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-50";
      case "degraded":
        return "text-yellow-600 bg-yellow-50";
      case "unhealthy":
      case "misconfigured":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return "✓";
      case "degraded":
        return "⚠";
      case "unhealthy":
      case "misconfigured":
        return "✗";
      default:
        return "?";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7E7A] mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando estado del sistema...</p>
        </div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar estado</h1>
          <p className="text-gray-600">{error || "No se pudo obtener el estado del sistema"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Estado del Sistema</h1>
                <p className="mt-2 text-sm text-gray-500">
                  Última actualización: {new Date(health.timestamp).toLocaleString("es-MX")}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg font-semibold ${getStatusColor(health.status)}`}
              >
                <span className="mr-2">{getStatusIcon(health.status)}</span>
                {health.status === "healthy"
                  ? "Operacional"
                  : health.status === "degraded"
                  ? "Degradado"
                  : "No Operacional"}
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado de Servicios</h2>
            <div className="space-y-4">
              {Object.entries(health.services).map(([service, status]) => (
                <div
                  key={service}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <span
                      className={`mr-3 text-xl font-bold ${getStatusColor(status).split(" ")[0]}`}
                    >
                      {getStatusIcon(status)}
                    </span>
                    <span className="font-medium text-gray-900 capitalize">
                      {service === "api"
                        ? "API"
                        : service === "database"
                        ? "Base de Datos"
                        : "Stripe"}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(status)}`}
                  >
                    {status === "healthy"
                      ? "Operacional"
                      : status === "degraded"
                      ? "Degradado"
                      : status === "misconfigured"
                      ? "No Configurado"
                      : "No Operacional"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Versión de la aplicación</span>
                <span className="font-mono font-semibold">{health.version}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Esta página se actualiza automáticamente cada 30 segundos.{" "}
            <a href="/" className="text-[#2F7E7A] hover:underline">
              Volver al inicio
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
