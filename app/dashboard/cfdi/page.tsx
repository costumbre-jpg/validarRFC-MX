"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function CFDIPage() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";

  // Get brand colors
  const brandPrimary = "var(--brand-primary, #2F7E7A)";

  // Modo diseño: permitir ver si ?plan=business
  if (designPlan !== "business") {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Validación CFDI Disponible</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Esta funcionalidad está disponible solo para el plan Business. Valida CFDI con un proveedor autorizado.
          </p>
          <Link
            href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
            style={{ backgroundColor: brandPrimary }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Mejorar a Business
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-600 mb-2">Validación CFDI</h1>
        <p className="text-sm text-gray-500">
          Valida CFDI con un proveedor autorizado del SAT.
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 shadow-md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Próximamente</h3>
            <p className="text-blue-800 mb-4">
              Estaremos habilitando la validación real de CFDI con un proveedor autorizado del SAT. Esta funcionalidad permitirá validar la autenticidad y vigencia de los comprobantes fiscales digitales.
            </p>
            <p className="text-sm text-blue-700">
              Mientras tanto, puedes validar RFCs y usar las demás funcionalidades del plan Business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

