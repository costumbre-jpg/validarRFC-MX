"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CFDIPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";

  // Get brand colors
  const brandPrimary = "var(--brand-primary, #2F7E7A)";

  // Modo diseño: permitir ver si ?plan=business
  if (designPlan !== "business") {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-md:p-4">
        <div className="text-center space-y-4 max-md:space-y-3">
          <div className="inline-flex items-center justify-center w-14 max-md:w-12 h-14 max-md:h-12 bg-gray-100 rounded-full">
            <svg className="w-7 h-7 max-md:w-6 max-md:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
            </svg>
          </div>
          <h3 className="text-lg max-md:text-base font-semibold text-gray-900">Validación CFDI</h3>
          <p className="text-xs max-md:text-[11px] text-gray-600 max-w-md mx-auto">
            Disponible solo para plan Business. Valida CFDI con un proveedor autorizado del SAT (próximamente).
          </p>
          <Link
            href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
            className="inline-flex items-center gap-2 max-md:gap-1.5 px-5 max-md:px-4 py-2.5 max-md:py-2 text-sm max-md:text-xs text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md"
            style={{ backgroundColor: brandPrimary }}
          >
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Mejorar a Business
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-md:space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-md:p-3">
        <h1 className="text-lg max-md:text-base font-semibold text-gray-900">Validación CFDI</h1>
        <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
          Próximamente: validación con PAC autorizado del SAT.
        </p>
      </div>

      <div className="bg-blue-50 rounded-lg border border-blue-200 shadow-sm p-4 max-md:p-3">
        <div className="flex items-start gap-3 max-md:gap-2">
          <div className="w-10 max-md:w-8 h-10 max-md:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm max-md:text-xs font-semibold text-blue-900 mb-1 max-md:mb-0.5">Próximamente</h3>
            <p className="text-xs max-md:text-[11px] text-blue-800 mb-2 max-md:mb-1.5">
              Habilitaremos validación de CFDI con un proveedor autorizado para verificar autenticidad y vigencia de comprobantes fiscales.
            </p>
            <p className="text-xs max-md:text-[11px] text-blue-700">
              Mientras tanto, puedes validar RFCs y usar el resto de funcionalidades del plan Business.
            </p>
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

