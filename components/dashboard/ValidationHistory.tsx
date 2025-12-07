"use client";

import { useState } from "react";
import { formatDate, formatRFCForDisplay } from "@/lib/utils";
import Link from "next/link";

interface Validation {
  id: string;
  rfc: string;
  is_valid: boolean;
  created_at: string;
}

interface ValidationHistoryProps {
  validations: Validation[];
  userData: any;
  showFullTable?: boolean;
}

export default function ValidationHistory({
  validations,
  userData,
  showFullTable = true,
}: ValidationHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const isPro = userData?.subscription_status === "pro" || userData?.subscription_status === "enterprise";

  const displayedValidations = showFullTable
    ? validations.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      )
    : validations.slice(0, 5);

  const totalPages = Math.ceil(validations.length / itemsPerPage);

  const handleExportCSV = async () => {
    if (!isPro) {
      alert("Esta función está disponible solo para planes Pro y Empresa");
      return;
    }

    const csvContent = [
      ["RFC", "Resultado", "Fecha"],
      ...validations.map((v) => [
        v.rfc,
        v.is_valid ? "Válido" : "Inválido",
        formatDate(v.created_at),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `validaciones_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No hay validaciones aún</p>
          <p className="text-sm text-gray-400 mt-2">
            Comienza validando tu primer RFC arriba
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {showFullTable ? "Historial de Validaciones" : "Validaciones Recientes"}
        </h2>
        {isPro && showFullTable && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 text-sm font-medium text-[#10B981] border border-[#10B981] rounded-lg hover:bg-[#10B981] hover:text-white transition-colors"
          >
            Exportar a CSV
          </button>
        )}
        {!showFullTable && (
          <Link
            href="/dashboard/historial"
            className="text-sm font-medium text-[#10B981] hover:text-[#059669]"
          >
            Ver todo →
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedValidations.map((validation) => (
              <tr key={validation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatRFCForDisplay(validation.rfc)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      validation.is_valid
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {validation.is_valid ? "✅ Válido" : "❌ Inválido"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(validation.created_at, { includeTime: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFullTable && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

