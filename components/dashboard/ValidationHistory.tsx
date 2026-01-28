"use client";

import { useState } from "react";
import { formatDate, formatRFCForDisplay } from "@/lib/utils";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { getPlan, type PlanId } from "@/lib/plans";

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
  totalCount?: number; // Total de validaciones (para paginación del servidor)
  currentPage?: number; // Página actual (para paginación del servidor)
  itemsPerPage?: number; // Items por página (para paginación del servidor)
  onPageChange?: (page: number) => void; // Callback para cambiar página (para paginación del servidor)
}

export default function ValidationHistory({
  validations,
  userData,
  showFullTable = true,
  totalCount, // Si viene de paginación del servidor
  currentPage: externalCurrentPage, // Si viene de paginación del servidor
  itemsPerPage: externalItemsPerPage, // Si viene de paginación del servidor
  onPageChange, // Si viene de paginación del servidor
}: ValidationHistoryProps) {
  // Si viene paginación del servidor, usar esos valores; si no, usar estado local
  const isServerPagination = totalCount !== undefined && onPageChange !== undefined;
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const currentPage = externalCurrentPage ?? localCurrentPage;
  const itemsPerPage = externalItemsPerPage ?? 10;
  
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };
  const planId = (userData?.subscription_status || "free") as PlanId;
  const isPro = planId === "pro" || planId === "business";
  const plan = getPlan(planId);
  const hasPDFExport = plan.features.exportFormats?.includes("PDF") || false;

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === "undefined") return defaultValue;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || defaultValue;
  };

  const getBrandMeta = () => {
    if (typeof window === "undefined") return { name: "Maflipp", hide: false };
    const styles = getComputedStyle(document.documentElement);
    const name = styles.getPropertyValue("--brand-name").trim() || "Maflipp";
    const hide = styles.getPropertyValue("--hide-maflipp-brand").trim() === "1";
    return { name, hide };
  };

  const hexToRgb = (hex: string) => {
    const normalized = hex.trim();
    const match = normalized.match(/^#?([0-9a-fA-F]{6})$/);
    const fallback = { r: 47, g: 126, b: 122 };
    const value = match?.[1];
    if (!value) return fallback;
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16),
    };
  };

  const brandPrimary = getBrandColor("--brand-primary", "#2F7E7A");
  const brandSecondary = getBrandColor("--brand-secondary", "#1F5D59");
  const { name: brandName, hide: hideMaflipp } = getBrandMeta();
  
  const displayedValidations = showFullTable
    ? (isServerPagination 
        ? validations
        : validations.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          ))
    : validations.slice(0, 5);

  // Calcular total de páginas
  const totalPages = isServerPagination && totalCount !== undefined
    ? Math.ceil(totalCount / itemsPerPage)
    : Math.ceil(validations.length / itemsPerPage);

  // Función para cargar todas las validaciones para exportar (cuando hay paginación del servidor)
  const loadAllValidationsForExport = async (): Promise<Validation[]> => {
    if (!isServerPagination) {
      // Si no hay paginación del servidor, usar las validaciones que ya tenemos
      return validations;
    }

    // Si hay paginación del servidor, cargar todas las validaciones desde Supabase
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];

    const { data: allValidations } = await supabase
      .from("validations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    return allValidations || [];
  };

  const handleExportCSV = async () => {
    if (!isPro) {
      setErrorMessage("Esta función está disponible solo para planes Pro y Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    // Cargar todas las validaciones para exportar
    const allValidations = await loadAllValidationsForExport();

    if (allValidations.length === 0) {
      setErrorMessage("No hay validaciones para exportar");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Función para escapar valores CSV (maneja comas y comillas)
    const escapeCSV = (value: string): string => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      ["RFC", "Resultado", "Fecha"],
      ...allValidations.map((v) => [
        escapeCSV(v.rfc),
        escapeCSV(v.is_valid ? "Válido" : "Inválido"),
        escapeCSV(formatDate(v.created_at)),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    // Agregar BOM para UTF-8 (ayuda con Excel y caracteres especiales)
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `validaciones_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSuccessMessage("✅ Archivo CSV exportado correctamente");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleExportExcel = async () => {
    if (!isPro) {
      setErrorMessage("Esta función está disponible solo para planes Pro y Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    // Cargar todas las validaciones para exportar
    const allValidations = await loadAllValidationsForExport();

    if (allValidations.length === 0) {
      setErrorMessage("No hay validaciones para exportar");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      // Función para escapar HTML (previene XSS y errores de formato)
      const escapeHTML = (str: string): string => {
        const map: Record<string, string> = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        };
        return str.replace(/[&<>"']/g, (m) => map[m] ?? m);
      };

      // Crear contenido HTML para Excel (formato simple que Excel puede abrir)
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: ${brandPrimary}; color: white; font-weight: bold; }
              tr:nth-child(even) { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <tr>
                  <th>RFC</th>
                  <th>Resultado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${allValidations.map((v) => `
                  <tr>
                    <td>${escapeHTML(v.rfc)}</td>
                    <td>${escapeHTML(v.is_valid ? "Válido" : "Inválido")}</td>
                    <td>${escapeHTML(formatDate(v.created_at))}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Crear blob con formato Excel (application/vnd.ms-excel)
      const blob = new Blob([htmlContent], { 
        type: "application/vnd.ms-excel" 
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `validaciones_${new Date().toISOString().split("T")[0]}.xls`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      setErrorMessage("Error al exportar a Excel. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleExportPDF = async () => {
    if (!hasPDFExport) {
      setErrorMessage("Esta función está disponible solo para el plan Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    // Cargar todas las validaciones para exportar
    const allValidations = await loadAllValidationsForExport();

    if (allValidations.length === 0) {
      setErrorMessage("No hay validaciones para exportar");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    try {
      const brandRgb = hexToRgb(brandPrimary);
      // Crear nuevo documento PDF
      const doc = new jsPDF();
      
      // Configuración
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const startY = 20;
      let currentY = startY;
      const rowHeight = 8;
      const maxY = pageHeight - margin;

      // Título
      doc.setFontSize(18);
      doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
      doc.text("Historial de Validaciones", margin, currentY);
      currentY += 10;

      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Fecha de generación: ${formatDate(new Date().toISOString())}`, margin, currentY);
      currentY += 5;
      doc.text(`Total de validaciones: ${allValidations.length}`, margin, currentY);
      currentY += 10;

      // Encabezados de tabla
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
      doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, "F");
      
      doc.text("RFC", margin + 2, currentY + 5);
      doc.text("Resultado", margin + 60, currentY + 5);
      doc.text("Fecha", margin + 110, currentY + 5);
      currentY += rowHeight;

      // Datos de la tabla
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      
      allValidations.forEach((validation, index) => {
        // Verificar si necesitamos una nueva página
        if (currentY + rowHeight > maxY) {
          doc.addPage();
          currentY = margin;
          
          // Reimprimir encabezados en nueva página
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
          doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, "F");
          doc.text("RFC", margin + 2, currentY + 5);
          doc.text("Resultado", margin + 60, currentY + 5);
          doc.text("Fecha", margin + 110, currentY + 5);
          currentY += rowHeight;
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
        }

        // Color de fondo alternado para filas
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(margin, currentY, pageWidth - (margin * 2), rowHeight, "F");
        }

        // Datos de la fila
        doc.setTextColor(0, 0, 0);
        doc.text(formatRFCForDisplay(validation.rfc), margin + 2, currentY + 5);
        
        // Resultado con color
        const resultText = validation.is_valid ? "Válido" : "Inválido";
        const resultColor: [number, number, number] = validation.is_valid ? [34, 197, 94] : [239, 68, 68]; // Verde o rojo    
        doc.setTextColor(resultColor[0], resultColor[1], resultColor[2]);
        doc.text(resultText, margin + 60, currentY + 5);
        
        doc.setTextColor(0, 0, 0);
        doc.text(formatDate(validation.created_at), margin + 110, currentY + 5);
        
        currentY += rowHeight;
      });

      // Pie de página
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} - ${hideMaflipp ? brandName : "Maflipp"}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Guardar PDF
      const fileName = `validaciones_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error al exportar a PDF:", error);
      setErrorMessage("Error al exportar a PDF. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setSuccessMessage("✅ Archivo PDF exportado correctamente");
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (validations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2">No hay validaciones aún</h3>
          <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
            {showFullTable 
              ? "Tu historial de validaciones aparecerá aquí una vez que comiences a validar RFCs. Todas tus validaciones se guardarán automáticamente para que puedas consultarlas y exportarlas cuando lo necesites."
              : "Comienza validando tu primer RFC arriba para ver tu historial aquí."
            }
          </p>
          {showFullTable && (
            <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 max-w-lg mx-auto">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-semibold text-gray-900 mb-0.5">¿Sabías que?</h4>
                  <p className="text-xs text-gray-600">
                    Con el plan {planId === "pro" ? "Pro" : "Business"}, puedes exportar tu historial completo en formato CSV, Excel{planId === "business" ? " y PDF" : ""} para análisis y reportes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-red-800">{errorMessage}</p>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div 
            className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-sm mb-2"
            style={{ 
              background: `linear-gradient(to right, ${brandPrimary}, ${brandSecondary})`
            }}
          >
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Historial
          </div>
          <h2 className="text-sm font-medium text-gray-600">
            {showFullTable ? "Historial de Validaciones" : "Validaciones Recientes"}
          </h2>
          {showFullTable && validations.length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              Total: {isServerPagination && totalCount !== undefined ? totalCount : validations.length} {(isServerPagination && totalCount !== undefined ? totalCount : validations.length) === 1 ? "validación" : "validaciones"}
            </p>
          )}
        </div>
        {isPro && validations.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
              style={{
                color: brandPrimary,
                border: `1px solid ${brandPrimary}`,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${brandPrimary}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
              style={{
                color: brandPrimary,
                border: `1px solid ${brandPrimary}`,
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${brandPrimary}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
            {hasPDFExport && (
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all hover:shadow-sm"
                style={{
                  color: brandPrimary,
                  border: `1px solid ${brandPrimary}`,
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${brandPrimary}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            )}
          </div>
        )}
        {!showFullTable && (
          <Link
            href="/dashboard/historial"
            className="text-xs font-medium text-brand-primary hover-text-brand-secondary"
          >
            Ver todo →
          </Link>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                RFC
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedValidations.map((validation) => (
              <tr key={validation.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                  {formatRFCForDisplay(validation.rfc)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          validation.is_valid
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {validation.is_valid ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Válido
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            Inválido
                          </>
                        )}
                      </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                  {formatDate(validation.created_at, { includeTime: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFullTable && totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


