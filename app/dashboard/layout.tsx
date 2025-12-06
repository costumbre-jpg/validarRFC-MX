"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔵 Layout: Verificando auth...");
      const supabase = createClient() as any;
      
      // Verificar sesión
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("🔵 Layout: Sesión:", session ? session.user.email : "NO HAY", error?.message || "");
      
      if (!session) {
        console.log("🔴 Layout: No hay sesión, redirigiendo a login");
        router.replace("/auth/login");
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

      if (existingUser) {
        setUserData(existingUser);
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
          .select()
          .single();
        
        setUserData(newUser || { email: session.user.email, subscription_status: "free" });
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirigir a login si no hay usuario
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar user={user} userData={userData} />
      <MobileSidebar user={user} userData={userData} />
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

