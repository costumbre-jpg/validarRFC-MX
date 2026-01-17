"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type PlanId } from "@/lib/plans";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branding, setBranding] = useState<any>(null);

  // Guardar el plan actual en localStorage para que otras páginas (developers) puedan leerlo
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (userData?.subscription_status) {
      window.localStorage.setItem("maflipp_plan", userData.subscription_status);
    }
  }, [userData]);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔵 Layout: Verificando auth...");
      const supabase = createClient() as any;
      
      // TEMPORAL: Deshabilitar autenticación para diseño
      // Verificar sesión
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("🔵 Layout: Sesión:", session ? session.user.email : "NO HAY", error?.message || "");
      
      // TEMPORAL: Permitir acceso sin autenticación para diseño
      if (!session) {
        console.log("🟡 Layout: No hay sesión, pero permitiendo acceso para diseño");
        
        // Leer parámetro 'plan' de la URL para modo diseño
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        // Crear datos de usuario mock para diseño
        setUserData({ 
          email: "diseño@maflipp.com", 
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
          rfc_queries_this_month: 0
        });
        // Solo aplicar white label en modo diseño para Business; Free/Pro mantienen Maflipp
        if (designPlan === "business") {
          try {
            const stored = typeof window !== "undefined" ? window.localStorage.getItem("branding_preview") : null;
            if (stored) {
              setBranding(JSON.parse(stored));
            } else {
              setBranding({
                brand_name: "Tu Marca",
                custom_logo_url: null,
                primary_color: "#2F7E7A",
                secondary_color: "#1F5D59",
                hide_maflipp_brand: true,
              });
            }
          } catch (e) {
            console.error("🎨 Layout: Error leyendo branding_preview local", e);
            setBranding({
              brand_name: "Tu Marca",
              custom_logo_url: null,
              primary_color: "#2F7E7A",
              secondary_color: "#1F5D59",
              hide_maflipp_brand: true,
            });
          }
        } else {
          setBranding(null);
        }
        setLoading(false);
        return;
      }

      console.log("🟢 Layout: Usuario autenticado:", session.user.email);

      // Obtener datos del usuario
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email, subscription_status, rfc_queries_this_month")
        .eq("id", session.user.id)
        .single();

      // Si hay un parámetro 'plan' en la URL, sobrescribir subscription_status temporalmente
      // Esto permite el modo diseño incluso con usuarios autenticados
      const planParam = searchParams.get("plan");
      // Si la URL tiene ?plan=free o no tiene plan, usar "free"
      // Si tiene ?plan=pro o ?plan=business, usar ese plan
      const planFromUrl: PlanId | null = planParam 
        ? (["free", "pro", "business"].includes(planParam) ? (planParam as PlanId) : null)
        : null;
      
      // Si hay plan en la URL, usarlo. Si no, usar el de la BD
      const finalPlanIdForUserData = planFromUrl || existingUser?.subscription_status || "free";
      
      if (existingUser) {
        setUserData({ 
          ...existingUser, 
          subscription_status: finalPlanIdForUserData 
        });
      } else {
        // Crear usuario si no existe
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            id: session.user.id,
            email: session.user.email || "",
            subscription_status: finalPlanIdForUserData,
            rfc_queries_this_month: 0,
          })
          .select("id, email, subscription_status, rfc_queries_this_month")
          .single();
        
        setUserData(newUser || { 
          email: session.user.email, 
          subscription_status: finalPlanIdForUserData
        });
      }

      setLoading(false);

      // Branding (solo si autenticado Y tiene plan Business)
      // Usar el plan de la URL si existe, si no el de la BD, si no "free"
      const finalPlanId = planFromUrl || existingUser?.subscription_status || "free";
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
            console.log("🎨 Layout: Fetching branding, status:", res.status);
            if (res.ok) {
              const data = await res.json();
              console.log("🎨 Layout: Branding data:", data);
              setBranding(data);
            } else if (res.status === 401) {
              console.log("🎨 Layout: No autenticado, no branding");
              setBranding(null);
            }
          } catch (e) {
            console.error("🎨 Layout: Branding fetch error", e);
            setBranding(null);
          }
        })();
      } else {
        // Si no es Business, no cargar branding
        setBranding(null);
      }
    };

    checkAuth();
  }, [router, searchParams]);

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // TEMPORAL: Permitir acceso sin usuario para diseño
  // if (!user) {
  //   // Redirigir a login si no hay usuario
  //   if (typeof window !== "undefined") {
  //     window.location.href = "/auth/login";
  //   }
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-100">
  //       <p className="text-gray-500">Redirigiendo...</p>
  //     </div>
  //   );
  // }

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


