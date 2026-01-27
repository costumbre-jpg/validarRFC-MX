"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type PlanId } from "@/lib/plans";

function CFDIPage() {
  const router = useRouter();
  const [planId, setPlanId] = useState<PlanId>("free");
  const [loading, setLoading] = useState(true);

  // Get brand colors
  const brandPrimary = "var(--brand-primary, #2F7E7A)";

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: userData } = await supabase
            .from("users")
            .select("subscription_status")
            .eq("id", user.id)
            .single();
          
          const subscriptionStatus = (userData as any)?.subscription_status;
          if (subscriptionStatus && ["free", "pro", "business"].includes(subscriptionStatus)) {
            setPlanId(subscriptionStatus as PlanId);
          } else {
            setPlanId("free");
          }
        } else {
          router.replace("/auth/login");
          return;
        }
      } catch (e) {
        setPlanId("free");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandPrimary }}></div>
      </div>
    );
  }

  const isBusiness = planId === "business";

  // Si NO es Business, mostrar mensaje para mejorar
  if (!isBusiness) {
    return (
      <div className="space-y-4 max-md:space-y-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-md:p-4">
          <div className="text-center space-y-4 max-md:space-y-3">
            <div className="inline-flex items-center justify-center w-16 max-md:w-14 h-16 max-md:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full">
              <svg className="w-8 h-8 max-md:w-7 max-md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg max-md:text-base font-semibold text-gray-900 mb-2 max-md:mb-1.5">Validación CFDI</h3>
              <p className="text-sm max-md:text-xs text-gray-600 max-w-md mx-auto mb-1 max-md:mb-0.5">
                Valida comprobantes fiscales digitales (CFDI) directamente contra el SAT.
              </p>
              <p className="text-xs max-md:text-[11px] text-gray-500 max-w-md mx-auto">
                Disponible exclusivamente en el plan Business.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-6 max-md:px-5 py-3 max-md:py-2.5 text-sm max-md:text-xs text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Mejorar a Business
            </Link>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 max-md:p-3">
          <div className="flex items-start gap-3 max-md:gap-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 max-md:w-7 max-md:h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm max-md:text-xs font-semibold text-blue-900 mb-1 max-md:mb-0.5">
                ¿Qué es la validación CFDI?
              </h4>
              <p className="text-xs max-md:text-[11px] text-blue-800">
                La validación CFDI te permite verificar que las facturas electrónicas sean válidas, estén activas y no estén canceladas. 
                Útil para auditorías, cumplimiento fiscal y verificación masiva de comprobantes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si ES Business, mostrar mensaje de roadmap
  return (
    <div className="space-y-4 max-md:space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-md:p-3">
        <div className="flex items-center gap-2.5 max-md:gap-2 mb-2 max-md:mb-1.5">
          <div className="w-10 h-10 max-md:w-9 max-md:h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${brandPrimary}15` }}>
            <svg className="w-5 h-5 max-md:w-4 max-md:h-4" style={{ color: brandPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg max-md:text-base font-semibold text-gray-900">Validación CFDI</h1>
            <p className="text-xs max-md:text-[11px] text-gray-500 mt-0.5">
              Valida comprobantes fiscales digitales contra el SAT
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg shadow-sm p-5 max-md:p-4">
        <div className="flex items-start gap-4 max-md:gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 max-md:w-10 max-md:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 max-md:w-5 max-md:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm max-md:text-xs font-semibold text-amber-900 mb-2 max-md:mb-1.5">
              En roadmap (no incluido aún)
            </h3>
            <p className="text-xs max-md:text-[11px] text-amber-800 mb-3 max-md:mb-2">
              Estamos trabajando en integrar la validación de CFDI con un proveedor autorizado del SAT (PAC). 
              Esta funcionalidad te permitirá:
            </p>
            <ul className="space-y-1.5 max-md:space-y-1 mb-3 max-md:mb-2">
              <li className="flex items-start gap-2 max-md:gap-1.5">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3 text-amber-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs max-md:text-[11px] text-amber-800">Verificar autenticidad de facturas electrónicas</span>
              </li>
              <li className="flex items-start gap-2 max-md:gap-1.5">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3 text-amber-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs max-md:text-[11px] text-amber-800">Validar que los CFDI no estén cancelados</span>
              </li>
              <li className="flex items-start gap-2 max-md:gap-1.5">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3 text-amber-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs max-md:text-[11px] text-amber-800">Consultar datos completos del comprobante</span>
              </li>
              <li className="flex items-start gap-2 max-md:gap-1.5">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3 text-amber-700 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-xs max-md:text-[11px] text-amber-800">Validación masiva mediante API</span>
              </li>
            </ul>
            <div className="bg-white/60 rounded-lg p-3 max-md:p-2.5 border border-amber-200">
              <p className="text-xs max-md:text-[11px] text-amber-900 font-medium mb-1 max-md:mb-0.5">
                Mientras tanto
              </p>
              <p className="text-xs max-md:text-[11px] text-amber-800">
                Puedes usar la validación de RFCs y todas las demás funcionalidades del plan Business, 
                incluyendo White Label, exportación a PDF, y dashboard Analytics avanzado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CFDIPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CFDIPage />
    </Suspense>
  );
}


