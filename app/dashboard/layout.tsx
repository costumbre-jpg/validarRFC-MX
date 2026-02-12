"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<any>(null);
  const [showTimeoutError, setShowTimeoutError] = useState(false);

  // Timeout de seguridad: Si carga por más de 5 segundos, mostrar error
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) setShowTimeoutError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  // Guardar el plan actual en localStorage para que otras páginas (developers) puedan leerlo
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userData?.subscription_status) {
      window.localStorage.setItem("maflipp_plan", userData.subscription_status);
    }
  }, [userData]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient() as any;
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        setLoading(false);
        router.replace("/auth/login");
        return;
      }

      // Obtener datos del usuario
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email, subscription_status, rfc_queries_this_month")
        .eq("id", session.user.id)
        .single();

      if (existingUser) {
        setUserData({ 
          ...existingUser
        });
      } else {
        // Crear usuario si no existe
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            id: session.user.id,
            email: session.user.email || "",
            subscription_status: "free",
            rfc_queries_this_month: 0,
          })
          .select("id, email, subscription_status, rfc_queries_this_month")
          .single();
        
        setUserData(newUser || { 
          email: session.user.email, 
          subscription_status: "free"
        });
      }

      setLoading(false);

      // Branding (solo si autenticado Y tiene plan Business)
      const finalPlanId = existingUser?.subscription_status || "free";
      if (finalPlanId === "business") {
        void (async () => {
          try {
            const accessToken = session?.access_token;
            const res = await fetch("/api/branding", {
              cache: "no-store",
              headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              setBranding(data);
            } else if (res.status === 401) {
              setBranding(null);
            }
          } catch (e) {
            setBranding(null);
          }
        })();
      } else {
        // Si no es Business, no cargar branding
        setBranding(null);
      }
    };

    checkAuth().catch((err) => {
      console.error("Error crítico de autenticación:", err);
      setShowTimeoutError(true); // Mostrar error inmediatamente si falla la red
    });
  }, [router]);

  const primary = branding?.primary_color || "#2F7E7A";
  const secondary = branding?.secondary_color || "#1F5D59";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--brand-primary", primary);
    root.style.setProperty("--brand-secondary", secondary);
    root.style.setProperty("--brand-name", branding?.brand_name || "Maflipp");
    root.style.setProperty(
      "--hide-maflipp-brand",
      branding?.hide_maflipp_brand ? "1" : "0"
    );
  }, [primary, secondary, branding?.brand_name, branding?.hide_maflipp_brand]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          {showTimeoutError ? (
            <div className="max-w-md mx-auto px-6">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Conexión lenta o interrumpida</h2>
              <p className="text-gray-600 mb-6">
                No pudimos conectar con la base de datos. Es posible que el servidor esté despertando de una pausa o en mantenimiento.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Reintentar conexión
              </button>
            </div>
          ) : (
            <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={
        branding
          ? {
              ["--brand-primary" as any]: primary,
              ["--brand-secondary" as any]: secondary,
            }
          : undefined
      }
    >
      <Sidebar userData={userData} branding={branding} />
      <MobileSidebar userData={userData} branding={branding} />
      <div className="lg:pl-64">
        <main className="py-6 max-md:py-4">
          <div className="mx-auto max-w-7xl px-4 max-md:px-3 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout(props: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardLayoutContent {...props} />
    </Suspense>
  );
}
