"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ValidationHistory from "@/components/dashboard/ValidationHistory";
import { planHasFeature, type PlanId } from "@/lib/plans";

function HistorialPage() {
  const [userData, setUserData] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const searchParams = useSearchParams();

  const loadValidations = async (page: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Paginación del servidor: solo cargar 10 registros de la página actual
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data: dbValidations, count, error } = await supabase
      .from("validations")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error loading validations:", error);
      setLoading(false);
      return;
    }

    setValidations(dbValidations || []);
    setTotalCount(count || 0);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Modo diseño: permitir acceso sin login
      if (!user) {
        // Leer parámetro 'plan' de la URL para modo diseño
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setUserData({
          id: "mock-user",
          email: "diseño@maflipp.com",
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
          rfc_queries_this_month: 3,
        });
        
        // Datos de ejemplo para visualizar el diseño (solo en modo diseño y planes Pro/Business)
        if (designPlan === "pro" || designPlan === "business") {
          const allMockValidations = [
            {
              id: "1",
              rfc: "ABC123456789",
              is_valid: true,
              created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Hace 2 horas
            },
            {
              id: "2",
              rfc: "XYZ987654321",
              is_valid: false,
              created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // Hace 5 horas
            },
            {
              id: "3",
              rfc: "DEF456789012",
              is_valid: true,
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
            },
            {
              id: "4",
              rfc: "GHI789012345",
              is_valid: true,
              created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
            },
            {
              id: "5",
              rfc: "JKL012345678",
              is_valid: false,
              created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
            },
            {
              id: "6",
              rfc: "MNO345678901",
              is_valid: true,
              created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // Hace 4 días
            },
            {
              id: "7",
              rfc: "PQR678901234",
              is_valid: true,
              created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Hace 5 días
            },
            {
              id: "8",
              rfc: "STU901234567",
              is_valid: false,
              created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // Hace 6 días
            },
            {
              id: "9",
              rfc: "VWX234567890",
              is_valid: true,
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Hace 7 días
            },
            {
              id: "10",
              rfc: "YZA567890123",
              is_valid: true,
              created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // Hace 8 días
            },
            {
              id: "11",
              rfc: "BCD890123456",
              is_valid: true,
              created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), // Hace 9 días
            },
            {
              id: "12",
              rfc: "EFG123456789",
              is_valid: false,
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // Hace 10 días
            },
          ];
          
          // Paginar las validaciones mock (solo mostrar 10 por página)
          const from = (currentPage - 1) * itemsPerPage;
          const to = from + itemsPerPage;
          const paginatedValidations = allMockValidations.slice(from, to);
          
          setValidations(paginatedValidations);
          setTotalCount(allMockValidations.length);
        } else {
          setValidations([]);
          setTotalCount(0);
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
      
      setUserData(dbUser);

      // Cargar primera página con paginación del servidor
      await loadValidations(1);
    };

    loadData();
  }, [searchParams]);

  // Recargar cuando cambia la página
  useEffect(() => {
    if (userData && currentPage > 0) {
      setLoading(true);
      // Si es modo diseño, recargar validaciones mock paginadas
      if (userData.id === "mock-user") {
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        if (designPlan === "pro" || designPlan === "business") {
          const allMockValidations = [
            { id: "1", rfc: "ABC123456789", is_valid: true, created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { id: "2", rfc: "XYZ987654321", is_valid: false, created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
            { id: "3", rfc: "DEF456789012", is_valid: true, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
            { id: "4", rfc: "GHI789012345", is_valid: true, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "5", rfc: "JKL012345678", is_valid: false, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "6", rfc: "MNO345678901", is_valid: true, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "7", rfc: "PQR678901234", is_valid: true, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "8", rfc: "STU901234567", is_valid: false, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "9", rfc: "VWX234567890", is_valid: true, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "10", rfc: "YZA567890123", is_valid: true, created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "11", rfc: "BCD890123456", is_valid: true, created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
            { id: "12", rfc: "EFG123456789", is_valid: false, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
          ];
          
          const from = (currentPage - 1) * itemsPerPage;
          const to = from + itemsPerPage;
          const paginatedValidations = allMockValidations.slice(from, to);
          
          setTimeout(() => {
            setValidations(paginatedValidations);
            setTotalCount(allMockValidations.length);
            setLoading(false);
          }, 300); // Simular carga
        } else {
          setValidations([]);
          setTotalCount(0);
          setLoading(false);
        }
      } else {
        // Usuario real: cargar desde servidor
        loadValidations(currentPage);
      }
    }
  }, [currentPage, userData, searchParams]);

  const planId = (userData?.subscription_status || "free") as PlanId;
  
  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondary = getBrandColor('--brand-secondary', '#1F5D59');

  if (!planHasFeature(planId, "history")) {
    return (
      <div className="space-y-8 max-md:space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-4 max-md:mb-3">
            <span
              className="inline-flex items-center px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-full text-lg max-md:text-base font-bold"
              style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
            >
              Historial de Validaciones
            </span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 max-md:p-4">
          <div className="text-center py-12 max-md:py-8">
            <div className="inline-flex items-center justify-center w-20 max-md:w-16 h-20 max-md:h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6 max-md:mb-4">
              <svg className="w-10 h-10 max-md:w-8 max-md:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-3 max-md:mb-2">Historial Completo Disponible</h3>
            <p className="text-gray-600 max-md:text-sm mb-6 max-md:mb-4 max-w-md mx-auto">
              El historial completo de validaciones está disponible en los planes Pro y Business.
            </p>
            <Link
              href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 text-white rounded-xl max-md:rounded-lg transition-all font-medium text-base max-md:text-sm shadow-md hover:shadow-lg"
              style={{ backgroundColor: brandPrimary }}
            >
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Mejorar Plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8 max-md:space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-4 max-md:mb-3">
            <span
              className="inline-flex items-center px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-full text-lg max-md:text-base font-bold"
              style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
            >
              Historial de Validaciones
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-md:p-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandPrimary }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-md:space-y-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-4 max-md:mb-3">
          <span
            className="inline-flex items-center px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-full text-lg max-md:text-base font-bold"
            style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
          >
            Historial de Validaciones
          </span>
        </div>
      </div>
      <ValidationHistory
        validations={validations || []}
        userData={userData}
        showFullTable={true}
        totalCount={totalCount}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

export default function HistorialPageWrapper() {
  return (
    <Suspense fallback={null}>
      <HistorialPage />
    </Suspense>
  );
}


