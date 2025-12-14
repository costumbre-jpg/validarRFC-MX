"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
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
        setUser({ email: "diseño@maflipp.com", id: "mock-user" } as any);
        setUserData({ 
          email: "diseño@maflipp.com", 
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
          rfc_queries_this_month: 0
        });
        // Solo aplicar white label en modo diseño para Business; Free/Pro mantienen Maflipp
        if (designPlan === "business") {
          setBranding({
            brand_name: "Tu Marca",
            custom_logo_url: null,
            hide_maflipp_brand: true,
          });
        } else {
          setBranding(null);
        }
        setLoading(false);
        return;
      }

      console.log("🟢 Layout: Usuario autenticado:", session.user.email);
      setUser(session.user);

      // Obtener datos del usuario
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      // Si hay un parámetro 'plan' en la URL, sobrescribir subscription_status temporalmente
      // Esto permite el modo diseño incluso con usuarios autenticados
      const planParam = searchParams.get("plan");
      const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
      
      if (existingUser) {
        setUserData(planFromUrl 
          ? { ...existingUser, subscription_status: planFromUrl }
          : existingUser
        );
      } else {
        // Crear usuario si no existe
        const { data: newUser } = await supabase
          .from("users")
          .insert({
            id: session.user.id,
            email: session.user.email || "",
            subscription_status: planFromUrl || "free",
            rfc_queries_this_month: 0,
          })
          .select()
          .single();
        
        setUserData(newUser || { 
          email: session.user.email, 
          subscription_status: planFromUrl || "free" 
        });
      }

      // Branding (solo si autenticado)
      try {
        const res = await fetch("/api/branding");
        if (res.ok) {
          const data = await res.json();
          setBranding(data);
        }
      } catch (e) {
        console.error("Branding fetch error", e);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7E7A] mx-auto"></div>
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

  const primary = branding?.primary_color || "#2F7E7A";
  const secondary = branding?.secondary_color || "#1F5D59";

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
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

