"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const itemsPerPage = 20;
  const router = useRouter();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (!userData) return;
    setLoading(true);
    loadValidations(page);
  };

  const loadValidations = async (page: number) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.replace("/auth/login");
      return;
    }

    // Paginación del servidor: solo cargar 10 registros de la página actual
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data: dbValidations, error } = await supabase
      .from("validations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, to);

    const { count } = await supabase
      .from("validations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (error) {
      console.error("Error loading validations:", error);
      setLoading(false);
      return;
    }

    const hasDbValidations = (count || 0) > 0;
    const monthlyCount = userData?.rfc_queries_this_month || 0;

    // Fallback: validaciones locales si no hay datos en BD
    let localValidations: any[] = [];
    if (!hasDbValidations && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("maflipp_local_validations");
        if (stored) {
          localValidations = JSON.parse(stored);
        }
      } catch (e) {
        // Ignore
      }
    }

    const hasLocalValidations = localValidations.length > 0;
    const hasRealValidations = hasDbValidations || hasLocalValidations || monthlyCount > 0;

    // Incluir validaciones demo SOLO si no hay reales ni locales
    let demoValidations: any[] = [];
    if (!hasRealValidations) {
      try {
        const stored = localStorage.getItem("maflipp_demo_validations");
        if (stored) {
          demoValidations = JSON.parse(stored);
        }
      } catch (e) {
        // Ignore
      }
    } else if (typeof window !== "undefined") {
      try {
        // Limpiar demo cuando ya hay validaciones reales
        localStorage.removeItem("maflipp_demo_validations");
        localStorage.removeItem("maflipp_demo_validations_count");
      } catch (e) {
        // Ignore
      }
    }

    if (hasDbValidations) {
      // Asegurar tamaño correcto por página aunque el backend devuelva más registros
      const total = count || (dbValidations?.length || 0);
      const remaining = Math.max(0, total - (page - 1) * itemsPerPage);
      const expectedCount = Math.min(itemsPerPage, remaining);
      const pageRows =
        expectedCount > 0
          ? (dbValidations || []).slice(0, expectedCount)
          : [];
      setValidations(pageRows);
      setTotalCount(total);
    } else if (hasLocalValidations) {
      const allLocal = [...localValidations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const paginated = allLocal.slice(from, from + itemsPerPage);
      setValidations(paginated);
      setTotalCount(allLocal.length);
    } else {
      // Solo demo: ordenar y paginar en cliente
      const allDemo = [...demoValidations].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      const paginated = allDemo.slice(from, from + itemsPerPage);
      setValidations(paginated);
      setTotalCount(allDemo.length);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.replace("/auth/login");
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
  }, [router, loadValidations]);

  // Recargar cuando cambia la página: ahora lo maneja handlePageChange

  const planId = (userData?.subscription_status || "free") as PlanId;
  
  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondary = getBrandColor('--brand-secondary', '#1F5D59');

  // Solo mostrar el mensaje de plan Free si ya terminó de cargar Y realmente es plan Free
  if (!loading && userData && !planHasFeature(planId, "history")) {
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
              href="/dashboard/billing"
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
        onPageChange={handlePageChange}
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


