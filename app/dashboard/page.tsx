"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RFCValidator from "@/components/dashboard/RFCValidator";
import ValidationHistory from "@/components/dashboard/ValidationHistory";
import DashboardStats from "@/components/dashboard/DashboardStats";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log("🔵 Dashboard: Cargando datos...");
      const supabase = createClient() as any;
      
      // Obtener sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("🔵 Dashboard: Sesión:", session ? "SÍ" : "NO", sessionError?.message || "");
      
      if (!session) {
        console.log("🔴 Dashboard: No hay sesión, mostrando mensaje");
        setLoading(false);
        return;
      }

      console.log("🟢 Dashboard: Usuario:", session.user.email);
      setUser(session.user);

      // Obtener datos del usuario
      const { data: userDataResult } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userDataResult) {
        setUserData(userDataResult);
      } else {
        // Crear usuario si no existe
        const { data: newUser } = await supabase
          .from("users")
          .insert([
            {
              id: session.user.id,
              email: session.user.email || "",
              subscription_status: "free",
              rfc_queries_this_month: 0,
            },
          ])
          .select()
          .single();
        
        setUserData(newUser || { 
          email: session.user.email, 
          subscription_status: "free",
          rfc_queries_this_month: 0
        });
      }

      // Obtener validaciones recientes
      const { data: validationsData } = await supabase
        .from("validations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setValidations(validationsData || []);

      // Obtener estadísticas
      const { data: allValidations } = await supabase
        .from("validations")
        .select("is_valid")
        .eq("user_id", session.user.id);

      const total = allValidations?.length || 0;
      const valid =
        allValidations?.filter((v: { is_valid: boolean }) => v.is_valid)
          .length || 0;
      setStats({ total, valid, invalid: total - valid });

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar la sesión</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} userData={userData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validador Principal */}
        <div className="lg:col-span-2">
          <RFCValidator user={user} userData={userData} />
        </div>

        {/* Estadísticas */}
        <div>
          <DashboardStats
            totalValidations={stats.total}
            validCount={stats.valid}
            invalidCount={stats.invalid}
            userData={userData}
          />
        </div>
      </div>

      {/* Historial Reciente */}
      <ValidationHistory
        validations={validations}
        userData={userData}
        showFullTable={false}
      />
    </div>
  );
}

