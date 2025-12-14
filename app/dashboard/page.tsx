"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RFCValidator from "@/components/dashboard/RFCValidator";
import ValidationHistory from "@/components/dashboard/ValidationHistory";
import DashboardStats from "@/components/dashboard/DashboardStats";
import AdvancedDashboard from "@/components/dashboard/AdvancedDashboard";
import CFDIValidator from "@/components/dashboard/CFDIValidator";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [allValidationsForStats, setAllValidationsForStats] = useState<any[]>([]); // Para estadísticas y gráfico
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar actualización
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      console.log("🔵 Dashboard: Cargando datos...");
      const supabase = createClient() as any;
      
      // Obtener sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("🔵 Dashboard: Sesión:", session ? "SÍ" : "NO", sessionError?.message || "");
      
      // TEMPORAL: Permitir acceso sin sesión para diseño
      if (!session) {
        console.log("🟡 Dashboard: No hay sesión, usando datos mock para diseño");
        
        // Leer parámetro 'plan' de la URL para modo diseño
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setUser({ email: "diseño@maflipp.com", id: "mock-user" } as any);
        setUserData({ 
          id: "mock-user",
          email: "diseño@maflipp.com", 
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
          rfc_queries_this_month: 0,
        });
        // Datos mock para estadísticas - empezar en 0
        setStats({ total: 0, valid: 0, invalid: 0 });
        // Validaciones mock - vacío
        setValidations([]);
        setAllValidationsForStats([]);
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

      // Si hay un parámetro 'plan' en la URL, sobrescribir subscription_status temporalmente
      const planParam = searchParams.get("plan");
      const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
      
      if (userDataResult) {
        setUserData(planFromUrl 
          ? { ...userDataResult, subscription_status: planFromUrl }
          : userDataResult
        );
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

      // Obtener validaciones recientes (para historial)
      const { data: validationsData } = await supabase
        .from("validations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setValidations(validationsData || []);

      // Obtener todas las validaciones del mes actual (para estadísticas y gráfico)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: allValidations } = await supabase
        .from("validations")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", startOfMonth.toISOString());

      setAllValidationsForStats(allValidations || []);

      const total = allValidations?.length || 0;
      const valid =
        allValidations?.filter((v: { is_valid: boolean }) => v.is_valid)
          .length || 0;
      setStats({ total, valid, invalid: total - valid });

      setLoading(false);
    };

    loadData();
  }, [refreshKey, searchParams]);

  // Función para refrescar datos después de una validación
  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F7E7A]"></div>
      </div>
    );
  }

  // TEMPORAL: Permitir acceso sin usuario para diseño
  // if (!user) {
  //   return (
  //     <div className="text-center py-12">
  //       <p className="text-gray-500">No se pudo cargar la sesión</p>
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      <DashboardHeader user={user} userData={userData} />

      <div className="space-y-8">
        {/* Validador Principal - Ancho completo */}
        <div>
          <RFCValidator userData={userData} onValidationComplete={refreshData} />
        </div>


        {/* Estadísticas - Abajo del validador, en grid de 3 columnas */}
        <DashboardStats
          totalValidations={stats.total}
          validCount={stats.valid}
          invalidCount={stats.invalid}
          userData={userData}
          validations={allValidationsForStats}
          showDemo={searchParams.get("demoCharts") === "1"}
        />

        {/* Dashboard Avanzado - Solo para Pro y Business */}
        {(userData?.subscription_status === "pro" || userData?.subscription_status === "business") && (
          <AdvancedDashboard
            key={refreshKey} // Forzar re-render cuando cambian los datos
            userData={userData}
            validations={allValidationsForStats}
            stats={stats}
          />
        )}

        {/* Notas de funcionalidades Próximamente para Business */}
        {userData?.subscription_status === "business" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-[#F59E0B]" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.518 11.6c.75 1.334-.213 3.001-1.743 3.001H3.482c-1.53 0-2.493-1.667-1.743-3.001l6.518-11.6zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Próximamente en Business</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span>SLA 99.9%</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Próximamente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Soporte prioritario</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Próximamente
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Validación CFDI</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  Próximamente
                </span>
                <Link href={`/dashboard/cfdi${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`} className="text-[#2F7E7A] hover:underline text-xs font-medium">
                  Ver detalle
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tips y Guías + Información del Plan FREE */}
      {userData?.subscription_status === "free" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tips y Guías Rápidas */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">
                Tips y Guías
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#2F7E7A]/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[#2F7E7A] text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Formato del RFC
                  </p>
                  <p className="text-xs text-gray-600">
                    El RFC debe tener 12 o 13 caracteres. Ejemplo: ABC123456XYZ o ABC123456XY7
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#2F7E7A]/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[#2F7E7A] text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Validación en tiempo real
                  </p>
                  <p className="text-xs text-gray-600">
                    Nuestros resultados se obtienen directamente del padrón del SAT, garantizando 100% de precisión
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-[#2F7E7A]/10 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-[#2F7E7A] text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Usa tus validaciones sabiamente
                  </p>
                  <p className="text-xs text-gray-600">
                    Tienes 10 validaciones gratis al mes. Cada validación se renueva automáticamente el primer día del mes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Plan FREE */}
          <div className="bg-gradient-to-br from-[#2F7E7A]/5 to-[#2F7E7A]/10 rounded-lg border border-[#2F7E7A]/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tu Plan Gratis Incluye
            </h3>
            <ul className="space-y-3 text-sm text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#2F7E7A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10 validaciones por mes</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#2F7E7A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Resultados instantáneos (2 segundos)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#2F7E7A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Datos verificados directamente del SAT</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[#2F7E7A] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Estadísticas básicas de uso</span>
              </li>
            </ul>
            <div className="pt-4 border-t border-[#2F7E7A]/20">
              <p className="text-xs text-gray-600 mb-3">
                ¿Necesitas más? Actualiza a Pro o Business para obtener:
              </p>
              <ul className="space-y-1 text-xs text-gray-500 mb-4">
                <li>• Historial completo ilimitado</li>
                <li>• Exportación de datos (CSV, Excel, PDF)</li>
                <li>• Acceso a API</li>
                <li>• Más validaciones mensuales</li>
              </ul>
              <Link
                href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
                className="inline-flex items-center justify-center w-full px-4 py-2 bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-colors font-medium text-sm"
              >
                Ver Planes y Precios
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Historial Reciente - Solo para planes Pro y Business */}
      {userData?.subscription_status === "pro" || userData?.subscription_status === "business" ? (
        <ValidationHistory
          validations={validations}
          userData={userData}
          showFullTable={false}
        />
      ) : userData?.subscription_status === "free" ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Historial de Validaciones
            </h3>
            <p className="text-gray-600 mb-2 max-w-md mx-auto">
              Guarda y consulta todas tus validaciones anteriores con los planes Pro y Business.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Incluye exportación a CSV, Excel y PDF
            </p>
            <Link
              href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#2F7E7A] text-white rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold shadow-sm hover:shadow-md"
            >
              Mejorar Plan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

