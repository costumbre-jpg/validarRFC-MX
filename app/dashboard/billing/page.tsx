"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSubscriptionPlanName } from "@/lib/utils";

export default function BillingPage() {
  const [userData, setUserData] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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

      // Obtener datos del usuario
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", currentUser.id)
        .single();

      setUserData(userData);

      // Obtener suscripción activa
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", currentUser.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setSubscription(subscriptionData);
      setLoading(false);
    }

    loadData();

    // Verificar parámetros de URL para mensajes
    const success = searchParams.get("success");

    if (success) {
      // Recargar datos después de éxito
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [router, searchParams]);

  const handleCheckout = async (plan: "pro" | "enterprise") => {
    setProcessing(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al crear sesión de checkout");
        setProcessing(false);
        return;
      }

      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
      setProcessing(false);
    }
  };

  const handleCustomerPortal = async () => {
    setProcessing(true);
    try {
      const response = await fetch("/api/stripe/customer-portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al crear sesión del portal");
        setProcessing(false);
        return;
      }

      // Redirigir a Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error. Por favor intenta de nuevo.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const currentPlan = userData?.subscription_status || "free";
  const isPro = currentPlan === "pro" || currentPlan === "enterprise";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-[#10B981]"
        >
          ← Volver al Dashboard
        </Link>
      </div>

      {/* Mensajes de éxito/cancelación */}
      {searchParams.get("success") && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <p className="text-sm text-green-800">
            ¡Pago exitoso! Tu suscripción se ha activado.
          </p>
        </div>
      )}

      {searchParams.get("canceled") && (
        <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            El pago fue cancelado. Puedes intentar de nuevo cuando quieras.
          </p>
        </div>
      )}

      {/* Plan Actual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Plan Actual
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {getSubscriptionPlanName(currentPlan)}
            </p>
            {subscription && (
              <p className="text-sm text-gray-600 mt-1">
                Renovación:{" "}
                {new Date(subscription.current_period_end).toLocaleDateString(
                  "es-MX"
                )}
              </p>
            )}
          </div>
          {isPro && (
            <button
              onClick={handleCustomerPortal}
              disabled={processing}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {processing ? "Cargando..." : "Gestionar Suscripción"}
            </button>
          )}
        </div>
      </div>

      {/* Mejorar Plan */}
      {currentPlan !== "enterprise" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mejorar Plan
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {currentPlan !== "pro" && (
              <div className="border-2 border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">PRO</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  $99 <span className="text-lg text-gray-600">MXN/mes</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li>✓ 100 validaciones/mes</li>
                  <li>✓ Historial completo</li>
                  <li>✓ Exportar a CSV</li>
                  <li>✓ API básica</li>
                  <li>✓ Soporte prioritario</li>
                </ul>
                <button
                  onClick={() => handleCheckout("pro")}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {processing ? "Procesando..." : "Mejorar a Pro"}
                </button>
              </div>
            )}

            {currentPlan !== "enterprise" && (
              <div className="border-2 border-[#10B981] rounded-lg p-6 relative">
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#10B981] text-white px-3 py-1 rounded-full text-xs font-semibold">
                  RECOMENDADO
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  EMPRESA
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  $499 <span className="text-lg text-gray-600">MXN/mes</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-600">
                  <li>✓ 1,000 validaciones/mes</li>
                  <li>✓ API completa</li>
                  <li>✓ Dashboard avanzado</li>
                  <li>✓ White-label</li>
                  <li>✓ Soporte 24/7</li>
                </ul>
                <button
                  onClick={() => handleCheckout("enterprise")}
                  disabled={processing}
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {processing ? "Procesando..." : "Mejorar a Empresa"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historial de Pagos */}
      {isPro && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Historial de Pagos
          </h2>
          <p className="text-sm text-gray-600">
            Para ver tu historial completo de pagos, usa el botón &quot;Gestionar
            Suscripción&quot; arriba para acceder al portal de Stripe.
          </p>
        </div>
      )}
    </div>
  );
}

