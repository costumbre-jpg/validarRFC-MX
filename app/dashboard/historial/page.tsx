"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ValidationHistory from "@/components/dashboard/ValidationHistory";

function HistorialPage() {
  const [userData, setUserData] = useState<any>(null);
  const [validations, setValidations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 20;
  const router = useRouter();

  const loadValidations = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        router.replace("/auth/login");
        return;
      }

      // Paginación del servidor: cargar 20 registros de la página actual
      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Obtener las validaciones de la página actual
      const { data: dbValidations, error } = await supabase
        .from("validations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error loading validations:", error);
        setLoading(false);
        return;
      }

      // Obtener el total de validaciones
      const { count } = await supabase
        .from("validations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Limpiar datos antiguos de localStorage siempre
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("maflipp_demo_validations");
          localStorage.removeItem("maflipp_demo_validations_count");
          localStorage.removeItem("maflipp_local_validations");
        } catch (e) {
          // Ignore
        }
      }

      // Establecer validaciones y total
      setValidations(dbValidations || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error("Error loading validations:", error);
      setValidations([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage, router]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      try {
        // Get user data real
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        setUserData(dbUser);
      } catch (error) {
        console.error("Error loading user data:", error);
        setLoading(false);
      }
    };

    setLoading(true);
    loadData();
  }, [router]);

  useEffect(() => {
    if (!userData) return;
    setLoading(true);
    loadValidations(currentPage);
  }, [currentPage, userData, loadValidations]);

  // Recargar cuando cambia la página: ahora lo maneja handlePageChange

  // planId removed as it was unused

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondary = getBrandColor('--brand-secondary', '#1F5D59');

  // Check removed to allow history access for all users

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


