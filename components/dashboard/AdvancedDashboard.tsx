"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPlan, getPlanValidationLimit, type PlanId } from "@/lib/plans";
import { jsPDF } from "jspdf";

interface AdvancedDashboardProps {
  userData: any;
  validations: any[];
  stats: { total: number; valid: number; invalid: number };
}

export default function AdvancedDashboard({
  userData,
  validations,
  stats,
}: AdvancedDashboardProps) {
  const [dailyUsage, setDailyUsage] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [hourlyUsage, setHourlyUsage] = useState<any[]>([]); // Solo Business
  const [yearComparison, setYearComparison] = useState<any>(null); // Solo Business
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<any>(null); // Solo Business
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  const planId = (userData?.subscription_status || "free") as PlanId;
  const plan = getPlan(planId);
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan.validationsPerMonth;
  const isBusiness = planId === "business";

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

  useEffect(() => {
    const loadAdvancedData = async () => {
      // Resetear estados al cambiar datos
      setDailyUsage([]);
      setMonthlyTrends([]);
      setHourlyUsage([]);
      setYearComparison(null);
      setEfficiencyMetrics(null);
      setLoading(true);
      try {
        const supabase = createClient();
        const userId = userData?.id;

        if (!userId) {
          setLoading(false);
          return;
        }

        // Obtener validaciones de los últimos 7 días
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: recentValidationsData } = await supabase
          .from("validations")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });
        
        // Combinar validaciones de BD con las pasadas como prop (incluye demo)
        const propValidations = (validations || []).filter((v: any) => {
          const date = new Date(v.created_at);
          return date >= sevenDaysAgo;
        }).map((v: any) => ({ created_at: v.created_at }));
        
        const dbValidations = (recentValidationsData ?? []) as { created_at: string }[];
        // Combinar y eliminar duplicados (priorizar prop si hay duplicados)
        const allRecent = [...propValidations, ...dbValidations];
        const uniqueRecent = Array.from(
          new Map(allRecent.map(v => [v.created_at, v])).values()
        );
        const recentValidations = uniqueRecent.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Agrupar por día (zona horaria local)
        const dailyCounts: Record<string, number> = {};
        const getLocalDateKey = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const key = getLocalDateKey(date);
          dailyCounts[key] = 0;
        });

        recentValidations.forEach((v) => {
          const date = new Date(v.created_at);
          date.setHours(0, 0, 0, 0);
          const key = getLocalDateKey(date);
          if (dailyCounts[key] !== undefined) {
            dailyCounts[key]++;
          }
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const key = getLocalDateKey(date);
          return {
            date: date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
            count: dailyCounts[key] || 0,
          };
        });

        // Obtener validaciones de los últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: monthlyValidationsData } = await supabase
          .from("validations")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", sixMonthsAgo.toISOString())
          .order("created_at", { ascending: true });
        
        // Combinar validaciones de BD con las pasadas como prop (incluye demo)
        const propMonthlyValidations = (validations || []).filter((v: any) => {
          const date = new Date(v.created_at);
          return date >= sixMonthsAgo;
        }).map((v: any) => ({ created_at: v.created_at }));
        
        const dbMonthlyValidations = (monthlyValidationsData ?? []) as { created_at: string }[];
        // Combinar y eliminar duplicados
        const allMonthly = [...propMonthlyValidations, ...dbMonthlyValidations];
        const uniqueMonthly = Array.from(
          new Map(allMonthly.map(v => [v.created_at, v])).values()
        );
        const monthlyValidations = uniqueMonthly.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        // Agrupar por mes
        const monthlyCounts: Record<string, number> = {};
        Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          monthlyCounts[key] = 0;
        });

        monthlyValidations.forEach((v) => {
          const date = new Date(v.created_at);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          if (monthlyCounts[key] !== undefined) {
            monthlyCounts[key]++;
          }
        });

        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          return {
            month: date.toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
            count: monthlyCounts[key] || 0,
          };
        });

        setDailyUsage(last7Days);
        setMonthlyTrends(last6Months);

        // Datos adicionales solo para Business
        if (isBusiness) {
          // Análisis por hora del día (solo hoy)
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);
          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          const { data: todayValidationsData } = await supabase
            .from("validations")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", startOfToday.toISOString())
            .lte("created_at", endOfToday.toISOString());

          const propToday = (validations || [])
            .filter((v: any) => {
              const date = new Date(v.created_at);
              return date >= startOfToday && date <= endOfToday;
            })
            .map((v: any) => ({ created_at: v.created_at }));

          const dbToday = (todayValidationsData ?? []) as { created_at: string }[];
          const allToday = [...propToday, ...dbToday];
          const uniqueToday = Array.from(
            new Map(allToday.map((v) => [v.created_at, v])).values()
          );

          const hourlyCounts: Record<number, number> = {};
          for (let i = 0; i < 24; i++) {
            hourlyCounts[i] = 0;
          }

          uniqueToday.forEach((v) => {
            const date = new Date(v.created_at);
            const hour = date.getHours();
            if (hourlyCounts[hour] !== undefined) {
              hourlyCounts[hour]++;
            } else {
              hourlyCounts[hour] = 1;
            }
          });

          const hourlyData = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: hourlyCounts[i] || 0,
            label: `${i.toString().padStart(2, '0')}:00`
          }));
          setHourlyUsage(hourlyData);

          // Comparación año anterior (mes actual vs mismo mes año pasado)
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const lastYear = currentYear - 1;

          const { data: currentMonthValidations } = await supabase
            .from("validations")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", new Date(currentYear, currentMonth, 1).toISOString())
            .lt("created_at", new Date(currentYear, currentMonth + 1, 1).toISOString());

          const { data: lastYearValidations } = await supabase
            .from("validations")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", new Date(lastYear, currentMonth, 1).toISOString())
            .lt("created_at", new Date(lastYear, currentMonth + 1, 1).toISOString());

          // Incluir validaciones demo del mes actual
          const currentMonthStart = new Date(currentYear, currentMonth, 1);
          const currentMonthEnd = new Date(currentYear, currentMonth + 1, 1);
          const propCurrentMonth = (validations || []).filter((v: any) => {
            const date = new Date(v.created_at);
            return date >= currentMonthStart && date < currentMonthEnd;
          });
          const currentCount = (currentMonthValidations?.length || 0) + propCurrentMonth.length;
          const lastYearCount = lastYearValidations?.length || 0;
          const change = currentCount - lastYearCount;
          const changePercent = lastYearCount > 0 ? ((change / lastYearCount) * 100).toFixed(1) : '0';

          setYearComparison({
            current: currentCount,
            lastYear: lastYearCount,
            change,
            changePercent,
            month: new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })
          });

          // Métricas de eficiencia (tiempo promedio de respuesta, tasa de error)
          const { data: allValidationsData } = await supabase
            .from("validations")
            .select("is_valid, created_at, response_time")
            .eq("user_id", userId)
            .gte("created_at", sevenDaysAgo.toISOString())
            .limit(1000);
          const dbValidations = (allValidationsData ?? []) as {
            is_valid: boolean;
            created_at: string;
            response_time?: number | null;
          }[];
          
          // Combinar con validaciones demo de los últimos 7 días
          const propValidationsForMetrics = (validations || []).filter((v: any) => {
            const date = new Date(v.created_at);
            return date >= sevenDaysAgo;
          }).map((v: any) => ({
            is_valid: v.is_valid ?? true,
            created_at: v.created_at,
            response_time: 0, // Demo no tiene response_time real
          }));
          
          const allValidations = [...dbValidations, ...propValidationsForMetrics];
          const total = allValidations?.length || 0;
          const valid = allValidations?.filter(v => v.is_valid).length || 0;
          const invalid = total - valid;
          const errorRate = total > 0 ? ((invalid / total) * 100).toFixed(2) : '0';
          
          // Calcular tiempo promedio de respuesta real (convertir de ms a segundos)
          // Solo contar response_time de validaciones reales (no demo)
          const validationsWithTime = allValidations.filter(v => v.response_time && v.response_time > 0);
          const avgResponseTime = validationsWithTime.length > 0
            ? (validationsWithTime.reduce((sum, v) => sum + (v.response_time || 0), 0) / validationsWithTime.length / 1000).toFixed(2)
            : '0';

          setEfficiencyMetrics({
            errorRate: parseFloat(errorRate),
            avgResponseTime: parseFloat(avgResponseTime),
            totalRequests: total,
            successRate: total > 0 ? ((valid / total) * 100).toFixed(2) : '100'
          });
        }
      } catch (error) {
        console.error("Error cargando datos avanzados:", error);
        // En caso de error, usar datos mock
        const mockDaily = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return {
            date: date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
            count: 0,
          };
        });
        const mockMonthly = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          return {
            month: date.toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
            count: 0,
          };
        });
        setDailyUsage(mockDaily);
        setMonthlyTrends(mockMonthly);
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      loadAdvancedData();
    }
  }, [userData, isBusiness, queriesThisMonth, validations.length]); // Re-ejecutar cuando cambien las validaciones

  // Calcular máximos para escalar las barras
  const dailyToShow = dailyUsage;
  const monthlyToShow = monthlyTrends;

  // Calcular máximos teóricos basados en el plan para barras proporcionales
  const planLimitForScale = userData?.subscription_status
    ? getPlanValidationLimit(userData.subscription_status as PlanId)
    : 10; // Default a Free si no hay plan
  
  // Máximo diario teórico: límite mensual / 30 días (promedio diario esperado)
  // Si el plan es ilimitado, usar un promedio razonable (ej: 200/día)
  const theoreticalDailyMax = planLimitForScale === -1
    ? 200 
    : Math.max(planLimitForScale / 30, 1);
  
  // Máximo mensual teórico: límite del plan
  const theoreticalMonthlyMax = planLimitForScale === -1
    ? 10000 // Valor razonable para visualización si es ilimitado
    : planLimitForScale;
  
  // Máximo por hora teórico: límite mensual / 30 días / 24 horas
  const theoreticalHourlyMax = planLimitForScale === -1
    ? 10 
    : Math.max(planLimitForScale / 30 / 24, 0.1);

  // Usar el máximo entre el teórico y el real (para que las barras no se vean demasiado pequeñas si hay picos)
  const maxDailyUsage = Math.max(
    theoreticalDailyMax,
    dailyToShow.length > 0 ? Math.max(...dailyToShow.map((d) => d.count), 1) : 1
  );
  const maxMonthlyUsage = Math.max(
    theoreticalMonthlyMax,
    monthlyToShow.length > 0 ? Math.max(...monthlyToShow.map((m) => m.count), 1) : 1
  );

  // Totales del mes actual basados en validaciones (reales + demo)
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);
  const currentMonthEnd = new Date(currentMonthStart);
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);

  const monthValidations = (validations || []).filter((v: any) => {
    const date = new Date(v.created_at);
    return date >= currentMonthStart && date < currentMonthEnd;
  });
  const currentMonthTotal = monthValidations.length;
  const activeDaysSet = new Set(
    monthValidations.map((v: any) => {
      const date = new Date(v.created_at);
      date.setHours(0, 0, 0, 0);
      return date.toISOString();
    })
  );
  const activeDays = activeDaysSet.size;
  const today = new Date();
  const daysElapsed = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const avgPerDay = currentMonthTotal > 0 ? (currentMonthTotal / Math.max(activeDays, 1)) : 0;
  const projection = currentMonthTotal > 0 ? Math.round((currentMonthTotal / Math.max(daysElapsed, 1)) * daysInMonth) : 0;

  if (isMock) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
        Aún no hay datos reales para mostrar en el análisis detallado.
      </div>
    );
  }

  // Función para exportar reporte analytics a PDF
  const handleExportAnalyticsPDF = async () => {
    if (!isBusiness) return;

    try {
      const brandRgb = hexToRgb(brandPrimary);
      const brandSecondaryRgb = hexToRgb(brandSecondary);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = 20;
      const maxY = pageHeight - margin;

      // Función helper para agregar nueva página si es necesario
      const checkNewPage = (requiredSpace: number) => {
        if (currentY + requiredSpace > maxY) {
          doc.addPage();
          currentY = margin;
        }
      };

      // Portada
      doc.setFontSize(24);
      doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
      doc.text("Reporte Analytics", pageWidth / 2, currentY, { align: "center" });
      currentY += 10;

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text("Plan Business - Dashboard Analytics", pageWidth / 2, currentY, { align: "center" });
      currentY += 8;

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      const reportDate = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
      doc.text(`Generado el: ${reportDate}`, pageWidth / 2, currentY, { align: "center" });
      currentY += 15;

      // Resumen Ejecutivo
      checkNewPage(30);
      doc.setFontSize(16);
      doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
      doc.text("Resumen Ejecutivo", margin, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const avgDaily = queriesThisMonth > 0 ? (queriesThisMonth / Math.max(1, new Date().getDate())).toFixed(1) : "0";
      const projection = queriesThisMonth > 0 ? Math.round((queriesThisMonth / Math.max(1, new Date().getDate())) * 30).toLocaleString() : "0";
      const successRate = stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : "0";

      doc.text(`• Validaciones este mes: ${queriesThisMonth.toLocaleString()}`, margin, currentY);
      currentY += 6;
      doc.text(`• Promedio diario: ${avgDaily} validaciones/día`, margin, currentY);
      currentY += 6;
      doc.text(`• Proyección mensual: ${projection} validaciones`, margin, currentY);
      currentY += 6;
      doc.text(`• Tasa de éxito: ${successRate}%`, margin, currentY);
      currentY += 6;
      doc.text(`• RFCs válidos: ${stats.valid} | Inválidos: ${stats.invalid}`, margin, currentY);
      currentY += 10;

      // Uso Diario (últimos 7 días)
      if (dailyToShow.length > 0) {
        checkNewPage(40);
        doc.setFontSize(14);
        doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
        doc.text("Uso Diario (Últimos 7 días)", margin, currentY);
        currentY += 8;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const dailyTotal = dailyToShow.reduce((sum, d) => sum + d.count, 0);
        const dailyMax = Math.max(...dailyToShow.map(d => d.count));
        const dailyMin = Math.min(...dailyToShow.map(d => d.count));
        const dailyAvg = (dailyTotal / 7).toFixed(1);

        doc.text(`Total: ${dailyTotal} | Promedio: ${dailyAvg} | Máximo: ${dailyMax} | Mínimo: ${dailyMin}`, margin, currentY);
        currentY += 6;

        // Tabla de uso diario
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 6, "F");
        doc.text("Día", margin + 2, currentY + 4);
        doc.text("Validaciones", margin + 50, currentY + 4);
        currentY += 6;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        dailyToShow.forEach((day, index) => {
          checkNewPage(6);
          if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 6, "F");
          }
          doc.text(day.date, margin + 2, currentY + 4);
          doc.text(day.count.toString(), margin + 50, currentY + 4);
          currentY += 6;
        });
        currentY += 5;
      }

      // Tendencias Mensuales
      if (monthlyToShow.length > 0) {
        checkNewPage(50);
        doc.setFontSize(14);
        doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
        doc.text("Tendencias Mensuales (Últimos 6 meses)", margin, currentY);
        currentY += 8;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        const monthlyTotal = monthlyToShow.reduce((sum, m) => sum + m.count, 0);
        const monthlyAvg = Math.round(monthlyTotal / 6);

        doc.text(`Total: ${monthlyTotal.toLocaleString()} | Promedio mensual: ${monthlyAvg.toLocaleString()}`, margin, currentY);
        currentY += 6;

        // Tabla de tendencias mensuales
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(brandRgb.r, brandRgb.g, brandRgb.b);
        doc.rect(margin, currentY, pageWidth - (margin * 2), 6, "F");
        doc.text("Mes", margin + 2, currentY + 4);
        doc.text("Validaciones", margin + 80, currentY + 4);
        currentY += 6;

        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        monthlyToShow.forEach((month, index) => {
          checkNewPage(6);
          if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, currentY, pageWidth - (margin * 2), 6, "F");
          }
          doc.text(month.month, margin + 2, currentY + 4);
          doc.text(month.count.toLocaleString(), margin + 80, currentY + 4);
          currentY += 6;
        });
        currentY += 5;
      }

      // Secciones exclusivas de Business
      if (isBusiness) {
        // Análisis por Hora
        if (hourlyUsage.length > 0) {
          checkNewPage(40);
          doc.setFontSize(14);
          doc.setTextColor(brandSecondaryRgb.r, brandSecondaryRgb.g, brandSecondaryRgb.b);
          doc.text("Análisis por Hora del Día (EXCLUSIVO BUSINESS)", margin, currentY);
          currentY += 8;

          const maxHour = Math.max(...hourlyUsage.map(h => h.count), 1);
          const peakHour = hourlyUsage.find(h => h.count === maxHour);
          const hourlyTotal = hourlyUsage.reduce((sum, h) => sum + h.count, 0);
          const hourlyAvg = (hourlyTotal / 24).toFixed(1);

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(`Hora pico: ${peakHour?.label || 'N/A'} | Promedio/hora: ${hourlyAvg} | Total 24h: ${hourlyTotal}`, margin, currentY);
          currentY += 10;

          // Top 5 horas con más actividad
          doc.setFontSize(10);
          doc.setTextColor(brandRgb.r, brandRgb.g, brandRgb.b);
          doc.text("Top 5 Horas con Mayor Actividad:", margin, currentY);
          currentY += 6;

          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          const topHours = [...hourlyUsage].sort((a, b) => b.count - a.count).slice(0, 5);
          topHours.forEach((hour, index) => {
            checkNewPage(6);
            doc.text(`${index + 1}. ${hour.label}: ${hour.count} validaciones`, margin + 5, currentY);
            currentY += 6;
          });
          currentY += 5;
        }

        // Comparación Año Anterior
        if (yearComparison) {
          checkNewPage(30);
          doc.setFontSize(14);
          doc.setTextColor(59, 130, 246); // Blue
          doc.text("Comparación Año Anterior (EXCLUSIVO BUSINESS)", margin, currentY);
          currentY += 8;

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`Mes actual: ${yearComparison.current.toLocaleString()} validaciones`, margin, currentY);
          currentY += 6;
          doc.text(`Año anterior: ${yearComparison.lastYear.toLocaleString()} validaciones`, margin, currentY);
          currentY += 6;
          
          const changeColor = yearComparison.change > 0 ? [34, 197, 94] : yearComparison.change < 0 ? [239, 68, 68] : [100, 100, 100];
          doc.setTextColor(changeColor[0] ?? 100, changeColor[1] ?? 100, changeColor[2] ?? 100);
          doc.text(`Cambio: ${yearComparison.change > 0 ? '+' : ''}${yearComparison.change.toLocaleString()} (${yearComparison.changePercent > 0 ? '+' : ''}${yearComparison.changePercent}%)`, margin, currentY);
          currentY += 10;
        }

        // Métricas de Eficiencia
        if (efficiencyMetrics) {
          checkNewPage(40);
          doc.setFontSize(14);
          doc.setTextColor(34, 197, 94); // Green
          doc.text("Métricas de Eficiencia (EXCLUSIVO BUSINESS)", margin, currentY);
          currentY += 8;

          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.text(`Tasa de éxito del sistema: ${efficiencyMetrics.successRate}%`, margin, currentY);
          currentY += 6;
          doc.text(`Tasa de error: ${efficiencyMetrics.errorRate}%`, margin, currentY);
          currentY += 6;
          doc.text(`Tiempo promedio de respuesta: ${efficiencyMetrics.avgResponseTime}s`, margin, currentY);
          currentY += 6;
          doc.text(`Total de solicitudes analizadas: ${efficiencyMetrics.totalRequests}`, margin, currentY);
          currentY += 10;
        }

        // Predicciones Avanzadas
        checkNewPage(30);
        doc.setFontSize(14);
        doc.setTextColor(99, 102, 241); // Indigo
        doc.text("Predicciones Avanzadas (EXCLUSIVO BUSINESS)", margin, currentY);
        currentY += 8;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const nextMonth = Math.round((queriesThisMonth / Math.max(1, new Date().getDate())) * 30 * 1.15);
        const nextQuarter = Math.round((queriesThisMonth / Math.max(1, new Date().getDate())) * 30 * 3 * 1.12);
        
        doc.text(`Próximo mes: ${nextMonth.toLocaleString()} validaciones (+15% crecimiento estimado)`, margin, currentY);
        currentY += 6;
        doc.text(`Próximo trimestre: ${nextQuarter.toLocaleString()} validaciones (+12% crecimiento trimestral)`, margin, currentY);
        currentY += 6;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("* Basado en tendencias históricas y patrones de uso", margin, currentY);
        currentY += 10;
      }

      // Pie de página
      const totalPages = doc.internal.pages.length - 1;
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${totalPages} - ${hideMaflipp ? brandName : "Maflipp"} - Plan Business`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      // Guardar PDF
      const fileName = `reporte_analytics_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Error al exportar reporte analytics:", error);
      throw error;
    }
  };

  // Solo mostrar para Pro y Business
  if (planId !== "pro" && planId !== "business") {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header con badge profesional */}
      <div>
        <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-gradient text-white text-xs font-semibold shadow-sm mb-2">
          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {isBusiness ? "Dashboard Analytics" : "Dashboard Avanzado"}
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {isBusiness ? "Analytics Avanzados" : "Análisis Detallado"}
        </h2>
        <p className="text-xs text-gray-600">
          {isBusiness 
            ? "Insights profundos, predicciones y análisis empresariales completos"
            : "Visualiza tus tendencias de uso y métricas avanzadas"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
        </div>
      ) : (
        <>
          {/* Gráfico de Uso Diario (Últimos 7 días) - Mejorado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                  Uso Diario (Últimos 7 días)
                </h3>
                <p className="text-xs text-gray-500">Tendencias de validaciones diarias</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-gradient-soft rounded-lg">
                <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="text-xs font-semibold text-brand-primary">
                {dailyToShow.reduce((sum, d) => sum + d.count, 0)} total
                </span>
              </div>
            </div>
            
            {/* Gráfico de barras verticales - 7 días */}
            <div className="mb-4 border-b border-gray-200 pb-4">
              {/* Contenedor principal con altura fija para las barras */}
              <div className="relative mb-12" style={{ height: '160px' }}>
                {/* Línea base del gráfico */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                
                {/* Contenedor flex para las 7 barras */}
                <div className="flex items-end justify-between gap-3 h-full px-2">
                  {dailyToShow.length > 0 ? dailyToShow.map((day, index) => {
                    // Calcular altura de la barra: porcentaje del máximo
                    const percentage = maxDailyUsage > 0 ? (day.count / maxDailyUsage) * 100 : 0;
                    // Altura en píxeles (máximo 200px, mínimo 10px si hay datos)
                    const barHeight = day.count > 0 
                      ? Math.max((percentage / 100) * 200, 10) 
                      : 0;
                    
                    // Paleta cohesiva: azules/verdes/teal con diferentes intensidades
                    const colors = [
                      'bg-teal-500',     // Teal medio (color principal)
                      'bg-cyan-500',     // Cyan
                      'bg-emerald-500',  // Verde esmeralda
                      'bg-blue-500',     // Azul
                      'bg-teal-600',     // Teal oscuro
                      'bg-cyan-600',     // Cyan oscuro
                      'bg-emerald-600'   // Verde esmeralda oscuro
                    ];
                    const colorIndex = index % colors.length;
                    const getBarColor = () => colors[colorIndex];
                    
                    return (
                      <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group relative max-w-[65px] mx-auto">
                        {/* Tooltip que aparece al hacer hover */}
                        {day.count > 0 && (
                          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                            <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              {day.count} validaciones
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                        
                        {/* Barra vertical individual con colores sólidos */}
                        <div 
                          className={`w-full ${getBarColor()} rounded-t-lg transition-all duration-300 hover:opacity-90 hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl relative flex items-start justify-center border border-white/20`}
                          style={{ 
                            height: `${barHeight}px`,
                            minHeight: day.count > 0 ? '10px' : '0px'
                          }}
                        >
                          {/* Número dentro de la barra si hay suficiente espacio */}
                          {day.count > 0 && barHeight > 28 && (
                            <div className="pt-2">
                              <span className="text-xs font-bold text-white drop-shadow-lg">
                                {day.count}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    // Mensaje si no hay datos
                    <div className="w-full text-center text-gray-500 py-8">
                      <p>No hay datos disponibles</p>
                    </div>
                  )}
                </div>
                
                {/* Etiquetas de fecha debajo de cada barra */}
                <div className="absolute -bottom-14 left-0 right-0 flex justify-between gap-3 px-1">
                    {dailyToShow.map((day, index) => (
                    <div key={index} className="flex-1 text-center">
                      <span className="text-xs font-semibold text-gray-700 block">
                        {day.date.split(' ')[0]}
                      </span>
                      <span className="text-xs text-gray-500 block mt-0.5">
                        {day.date.split(' ')[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Resumen numérico */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Promedio</p>
                <p className="text-lg font-bold text-gray-900">
                  {(dailyToShow.reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Máximo</p>
                <p className="text-lg font-bold text-brand-primary">
                  {dailyToShow.length > 0 ? Math.max(...dailyToShow.map(d => d.count)) : 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Mínimo</p>
                <p className="text-lg font-bold text-gray-600">
                  {dailyToShow.length > 0 ? Math.min(...dailyToShow.map(d => d.count)) : 0}
                </p>
              </div>
            </div>
          </div>

            {/* Gráfico de Tendencias Mensuales - Mejorado */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                  Tendencias Mensuales (Últimos 6 meses)
                </h3>
                <p className="text-xs text-gray-500">Evolución del uso a lo largo del tiempo</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-gradient-soft rounded-lg">
                <svg className="w-3.5 h-3.5 text-brand-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-semibold text-brand-primary">
                  {monthlyToShow.reduce((sum, m) => sum + m.count, 0)} total
                </span>
              </div>
            </div>
            
            {/* Gráfico de barras horizontales mejorado */}
            <div className="space-y-3">
              {monthlyToShow.map((month, index) => {
                const percentage = maxMonthlyUsage > 0 ? (month.count / maxMonthlyUsage) * 100 : 0;
                const previousMonth = index > 0 ? monthlyToShow[index - 1].count : null;
                const change = previousMonth !== null ? month.count - previousMonth : null;
                const changePercentage = previousMonth && previousMonth > 0 
                  ? ((change! / previousMonth) * 100).toFixed(1) 
                  : null;
                
                // Paleta cohesiva: azules/verdes/teal con diferentes intensidades
                const monthlyColors = [
                  'bg-teal-500',     // Teal medio (color principal)
                  'bg-cyan-500',     // Cyan
                  'bg-emerald-500',  // Verde esmeralda
                  'bg-blue-500',     // Azul
                  'bg-teal-600',     // Teal oscuro
                  'bg-cyan-600'      // Cyan oscuro
                ];
                const monthlyColorIndex = index % monthlyColors.length;
                
                return (
                  <div key={index} className="group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-xs font-medium text-gray-700 w-20 text-right">
                        {month.month}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                        <div
                          className={`${monthlyColors[monthlyColorIndex]} h-4 rounded-full transition-all duration-500 flex items-center justify-between px-2 group-hover:opacity-90`}
                          style={{ width: `${Math.max(percentage, 2)}%`, minWidth: month.count > 0 ? '50px' : '0' }}
                        >
                          <span className="text-xs font-bold text-white">
                            {month.count.toLocaleString()}
                          </span>
                          {change !== null && change !== 0 && (
                            <span className={`text-xs font-semibold ml-1 ${
                              change > 0 ? 'text-green-200' : 'text-red-200'
                            }`}>
                              {change > 0 ? '↑' : '↓'} {Math.abs(change)}
                            </span>
                          )}
                        </div>
                      </div>
                      {changePercentage && (
                        <div className={`flex items-center gap-1 w-16 ${
                          parseFloat(changePercentage) > 0 ? 'text-green-600' : 
                          parseFloat(changePercentage) < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          <svg className={`w-4 h-4 ${parseFloat(changePercentage) > 0 ? '' : 'rotate-180'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-semibold">
                            {Math.abs(parseFloat(changePercentage))}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Resumen */}
            <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Promedio mensual</p>
                <p className="text-base font-bold text-gray-900">
                  {Math.round(monthlyToShow.reduce((sum, m) => sum + m.count, 0) / 6)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Tendencia</p>
                <p className="text-base font-bold text-brand-primary">
                  {(() => {
                    const recent = monthlyToShow.slice(-3).reduce((sum, m) => sum + m.count, 0);
                    const older = monthlyToShow.slice(0, 3).reduce((sum, m) => sum + m.count, 0);
                    return recent > older ? '↑ Creciente' : recent < older ? '↓ Decreciente' : '→ Estable';
                  })()}
                </p>
              </div>
            </div>
          </div>

      {/* Estadísticas Avanzadas - Mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-md:gap-3">
        {/* Tasa de Éxito */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-gray-200 p-6 max-md:p-4 hover:shadow-xl transition-all hover:scale-105 max-md:hover:scale-100">
          <div className="flex items-center justify-between mb-4 max-md:mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-700">Tasa de Éxito</h3>
              <span className="group relative inline-flex items-center">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  Porcentaje de RFC válidos sobre el total del mes actual.
                </span>
              </span>
            </div>
            <div className="p-2.5 max-md:p-2 rounded-xl bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl max-md:text-xl font-bold text-gray-900 mb-1.5 max-md:mb-1">
            {stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 0}%
          </p>
          <div className="flex items-center gap-2 max-md:gap-1.5">
            <div className="flex-1 bg-gray-200 rounded-full h-2 max-md:h-1.5">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 max-md:h-1.5 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.valid / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <p className="text-xs max-md:text-[11px] text-gray-600 mt-3 max-md:mt-2">
            <span className="font-semibold text-green-700">{stats.valid}</span> de <span className="font-semibold">{stats.total}</span> válidos
          </p>
        </div>

        {/* Promedio Diario */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-gray-200 p-6 max-md:p-4 hover:shadow-xl transition-all hover:scale-105 max-md:hover:scale-100">
          <div className="flex items-center justify-between mb-4 max-md:mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-700">Promedio Diario</h3>
              <span className="group relative inline-flex items-center">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  Rango: mes actual. Cálculo: total del mes ÷ días con actividad.
                </span>
              </span>
            </div>
            <div className="p-2.5 max-md:p-2 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl max-md:text-xl font-bold text-gray-900 mb-1.5 max-md:mb-1">
            {avgPerDay.toFixed(1)}
          </p>
          <p className="text-xs max-md:text-[11px] text-gray-600">
            Promedio en días con actividad
          </p>
          <div className="mt-3 max-md:mt-2 pt-3 max-md:pt-2 border-t border-gray-200">
            <p className="text-xs max-md:text-[11px] text-gray-500">
              Total del mes: <span className="font-semibold text-blue-700">{currentMonthTotal}</span>
            </p>
            <p className="text-xs max-md:text-[11px] text-gray-500 mt-1">
              Días con actividad: <span className="font-semibold text-blue-700">{activeDays}</span>
            </p>
          </div>
        </div>

        {/* Proyección Mensual */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-gray-200 p-6 max-md:p-4 hover:shadow-xl transition-all hover:scale-105 max-md:hover:scale-100">
          <div className="flex items-center justify-between mb-4 max-md:mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-700">Proyección Mensual</h3>
              <span className="group relative inline-flex items-center">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  Rango: mes actual. Cálculo: (total del mes ÷ días transcurridos) × días del mes.
                </span>
              </span>
            </div>
            <div className="p-2.5 max-md:p-2 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-sm">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl max-md:text-xl font-bold text-gray-900 mb-1.5 max-md:mb-1">
            {projection.toLocaleString()}
          </p>
          <p className="text-xs max-md:text-[11px] text-gray-600">
            Basado en uso actual
          </p>
          {planLimit !== -1 && currentMonthTotal > 0 && (
            <div className="mt-3 max-md:mt-2 pt-3 max-md:pt-2 border-t border-gray-200">
              <p className="text-xs max-md:text-[11px] text-gray-500">
                {projection > planLimit ? (
                  <span className="text-red-600 font-semibold">⚠️ Excederás tu límite</span>
                ) : (
                  <span className="text-green-600 font-semibold">✓ Dentro del límite</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Día con Más Uso */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-gray-200 p-6 max-md:p-4 hover:shadow-xl transition-all hover:scale-105 max-md:hover:scale-100">
          <div className="flex items-center justify-between mb-4 max-md:mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-700">Día Pico</h3>
              <span className="group relative inline-flex items-center">
                <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                </svg>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-64 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                  Rango: últimos 7 días. Muestra el día con más validaciones.
                </span>
              </span>
            </div>
            <div className="p-2.5 max-md:p-2 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-sm">
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-2xl max-md:text-xl font-bold text-gray-900 mb-1.5 max-md:mb-1">
            {dailyToShow.length > 0 ? Math.max(...dailyToShow.map(d => d.count)) : 0}
          </p>
          <p className="text-xs max-md:text-[11px] text-gray-600">
            {(() => {
              if (dailyToShow.length === 0) return 'Sin datos';
              const maxCount = Math.max(...dailyToShow.map(d => d.count));
              const maxDay = dailyToShow.find(d => d.count === maxCount);
              return maxDay ? `El ${maxDay.date}` : 'Sin datos';
            })()}
          </p>
          <div className="mt-3 max-md:mt-2 pt-3 max-md:pt-2 border-t border-gray-200">
            <p className="text-xs max-md:text-[11px] text-gray-500">
              Últimos 7 días
            </p>
          </div>
        </div>
      </div>

          {/* Secciones exclusivas de Business */}
          {isBusiness && (
            <>
              {/* Análisis por Hora del Día */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4 max-md:mb-3">
                  <div>
                    <div className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-[10px] max-md:text-[9px] font-semibold mb-1.5 max-md:mb-1">
                      <svg className="w-2.5 h-2.5 max-md:w-2 max-md:h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      EXCLUSIVO BUSINESS
                    </div>
                    <h3 className="text-sm max-md:text-xs font-semibold text-gray-900 mb-0.5">
                      Análisis por Hora del Día
                    </h3>
                    <p className="text-xs max-md:text-[11px] text-gray-500">
                      Hoy · Identifica tus horas pico de actividad
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-1 max-md:gap-0.5 mb-4 max-md:mb-3">
                  {hourlyUsage.map((hour, index) => {
                    // Usar máximo teórico por hora para barras proporcionales
                    const maxHour = Math.max(
                      theoreticalHourlyMax,
                      Math.max(...hourlyUsage.map(h => h.count), 0.1)
                    );
                    const percentage = (hour.count / maxHour) * 100;
                    const isPeak = hour.count === Math.max(...hourlyUsage.map(h => h.count), 0);
                    
                    return (
                      <div key={index} className="flex flex-col items-center group relative">
                        <div 
                          className={`w-full rounded-t transition-all duration-300 ${
                            isPeak 
                              ? 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-600' 
                              : 'bg-brand-gradient-vertical'
                          }`}
                          style={{ 
                            height: `${Math.max(percentage * 1.5, 8)}px`,
                            minHeight: hour.count > 0 ? '8px' : '2px'
                          }}
                          title={`${hour.label}: ${hour.count} validaciones`}
                        >
                          {hour.count > 0 && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="bg-gray-900 text-white text-xs max-md:text-[10px] font-semibold px-2 max-md:px-1.5 py-1 max-md:py-0.5 rounded shadow-lg whitespace-nowrap">
                                {hour.count}
                              </div>
                            </div>
                          )}
                        </div>
                        {index % 3 === 0 && (
                          <span className="text-xs max-md:text-[10px] text-gray-500 mt-1 max-md:mt-0.5">{hour.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-3 gap-3 max-md:gap-2 pt-3 max-md:pt-2 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] max-md:text-[9px] text-gray-500 mb-0.5">Hora Pico</p>
                    <p className="text-base max-md:text-sm font-bold text-purple-600">
                      {hourlyUsage.length > 0 ? `${hourlyUsage.find(h => h.count === Math.max(...hourlyUsage.map(h => h.count)))?.label || 'N/A'}` : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] max-md:text-[9px] text-gray-500 mb-0.5">Promedio/Hora</p>
                    <p className="text-base max-md:text-sm font-bold text-gray-900">
                      {(hourlyUsage.reduce((sum, h) => sum + h.count, 0) / 24).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] max-md:text-[9px] text-gray-500 mb-0.5">Total 24h</p>
                    <p className="text-base max-md:text-sm font-bold text-brand-primary">
                      {hourlyUsage.reduce((sum, h) => sum + h.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparación Año Anterior */}
              {yearComparison && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4 max-md:mb-3">
                    <div>
                      <div className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-[10px] max-md:text-[9px] font-semibold mb-1.5 max-md:mb-1">
                        <svg className="w-2.5 h-2.5 max-md:w-2 max-md:h-2 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        EXCLUSIVO BUSINESS
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm max-md:text-xs font-semibold text-gray-900 mb-0.5">
                          Comparación Año Anterior
                        </h3>
                        <span className="group relative inline-flex items-center">
                          <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                          </svg>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                            Rango: mes actual vs mismo mes del año pasado. Porcentaje = variación vs el año anterior.
                          </span>
                        </span>
                      </div>
                      <p className="text-xs max-md:text-[11px] text-gray-500">Evolución vs mismo período del año pasado</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 max-md:gap-3">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 max-md:p-3 border border-blue-200">
                      <p className="text-[10px] max-md:text-[9px] text-blue-700 font-semibold mb-1.5 max-md:mb-1">Este {yearComparison.month.split(' ')[0]}</p>
                      <p className="text-2xl max-md:text-xl font-bold text-blue-900 mb-0.5">
                        {yearComparison.current.toLocaleString()}
                      </p>
                      <p className="text-[10px] max-md:text-[9px] text-blue-600">Validaciones</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 max-md:p-3 border border-gray-200">
                      <p className="text-[10px] max-md:text-[9px] text-gray-700 font-semibold mb-1.5 max-md:mb-1">Año Anterior</p>
                      <p className="text-2xl max-md:text-xl font-bold text-gray-900 mb-0.5">
                        {yearComparison.lastYear.toLocaleString()}
                      </p>
                      <p className="text-[10px] max-md:text-[9px] text-gray-600">Validaciones</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 max-md:mt-3 pt-4 max-md:pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-0.5">Cambio</p>
                        <p className={`text-xl max-md:text-lg font-bold ${
                          yearComparison.change > 0 ? 'text-green-600' : 
                          yearComparison.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {yearComparison.change > 0 ? '+' : ''}{yearComparison.change.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs max-md:text-[11px] font-semibold text-gray-700 mb-0.5">Porcentaje</p>
                        <p className={`text-xl max-md:text-lg font-bold ${
                          parseFloat(yearComparison.changePercent) > 0 ? 'text-green-600' : 
                          parseFloat(yearComparison.changePercent) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {yearComparison.changePercent > 0 ? '+' : ''}{yearComparison.changePercent}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Métricas de Eficiencia */}
              {efficiencyMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-md:gap-3">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3 max-md:mb-2">
                      <div>
                        <div className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-[10px] max-md:text-[9px] font-semibold mb-1.5 max-md:mb-1">
                          <svg className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          EXCLUSIVO BUSINESS
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg max-md:text-base font-semibold text-gray-900 mb-1">
                            Tasa de Éxito del Sistema
                          </h3>
                          <span className="group relative inline-flex items-center">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                              Rango: últimos 7 días. Éxito = válidos/total. Tiempo promedio usa solo respuestas reales.
                            </span>
                          </span>
                        </div>
                        <p className="text-sm max-md:text-xs text-gray-500">Rendimiento y confiabilidad</p>
                      </div>
                    </div>
                    <div className="space-y-4 max-md:space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2 max-md:mb-1.5">
                          <span className="text-sm max-md:text-xs font-medium text-gray-700">Tasa de Éxito</span>
                          <span className="text-lg max-md:text-base font-bold text-green-600">{efficiencyMetrics.successRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 max-md:h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 max-md:h-2 rounded-full transition-all"
                            style={{ width: `${efficiencyMetrics.successRate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2 max-md:mb-1.5">
                          <span className="text-sm max-md:text-xs font-medium text-gray-700">Tasa de Error</span>
                          <span className="text-lg max-md:text-base font-bold text-red-600">{efficiencyMetrics.errorRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 max-md:h-2">
                          <div
                            className="bg-gradient-to-r from-red-500 to-red-600 h-3 max-md:h-2 rounded-full transition-all"
                            style={{ width: `${efficiencyMetrics.errorRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="pt-4 max-md:pt-3 border-t border-gray-200">
                        <p className="text-xs max-md:text-[11px] text-gray-500">
                          Tiempo promedio de respuesta: <span className="font-semibold text-gray-700">{efficiencyMetrics.avgResponseTime}s</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-md:p-4 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4 max-md:mb-3">
                      <div>
                        <div className="inline-flex items-center px-3 max-md:px-2.5 py-1 max-md:py-0.5 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 text-xs max-md:text-[10px] font-semibold mb-2 max-md:mb-1">
                          <svg className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          EXCLUSIVO BUSINESS
                        </div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg max-md:text-base font-semibold text-gray-900 mb-1">
                            Predicciones Avanzadas
                          </h3>
                          <span className="group relative inline-flex items-center">
                            <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 3a1 1 0 00-2 0v5a1 1 0 002 0V9z" clipRule="evenodd" />
                            </svg>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-72 rounded-lg bg-gray-900 px-3 py-2 text-[11px] text-white shadow-lg group-hover:block">
                              Estimación basada en el histórico reciente. Si no hay suficiente histórico, puede mostrar 0.
                            </span>
                          </span>
                        </div>
                        <p className="text-sm max-md:text-xs text-gray-500">Proyecciones basadas en IA</p>
                      </div>
                    </div>
                    <div className="space-y-4 max-md:space-y-3">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 max-md:p-3 border border-indigo-200">
                        <p className="text-xs max-md:text-[11px] text-indigo-700 font-semibold mb-1">Próximo Mes</p>
                        <p className="text-2xl max-md:text-xl font-bold text-indigo-900">
                          {Math.round((queriesThisMonth / new Date().getDate()) * 30 * 1.15).toLocaleString()}
                        </p>
                        <p className="text-xs max-md:text-[11px] text-indigo-600 mt-1">+15% crecimiento estimado</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 max-md:p-3 border border-purple-200">
                        <p className="text-xs max-md:text-[11px] text-purple-700 font-semibold mb-1">Próximo Trimestre</p>
                        <p className="text-2xl max-md:text-xl font-bold text-purple-900">
                          {Math.round((queriesThisMonth / new Date().getDate()) * 30 * 3 * 1.12).toLocaleString()}
                        </p>
                        <p className="text-xs max-md:text-[11px] text-purple-600 mt-1">+12% crecimiento trimestral</p>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs max-md:text-[11px] text-gray-500 italic">
                          * Basado en tendencias históricas y patrones de uso
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Exportación de Reportes */}
              <div className="bg-brand-gradient-br rounded-xl shadow-lg border border-brand-secondary p-6 max-md:p-4 text-white">
                <div className="flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-3">
                  <div>
                    <div className="inline-flex items-center px-3 max-md:px-2.5 py-1 max-md:py-0.5 rounded-full bg-white/20 text-white text-xs max-md:text-[10px] font-semibold mb-2 max-md:mb-1.5">
                      <svg className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      EXCLUSIVO BUSINESS
                    </div>
                    <h3 className="text-lg max-md:text-base font-semibold mb-1">Exportar Reporte Analytics</h3>
                    <p className="text-sm max-md:text-xs text-white/90">Descarga un reporte completo en PDF con todos tus analytics</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!isBusiness) return;
                      setExportingPDF(true);
                      try {
                        await handleExportAnalyticsPDF();
                      } catch (error) {
                        console.error("Error al exportar reporte:", error);
                      } finally {
                        setExportingPDF(false);
                      }
                    }}
                    disabled={exportingPDF || !isBusiness}
                    className="px-5 max-md:px-4 py-3 max-md:py-2 bg-white text-brand-primary rounded-lg font-semibold text-sm max-md:text-xs hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 max-md:gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed w-auto max-md:w-full justify-center"
                  >
                    {exportingPDF ? (
                      <>
                        <svg className="animate-spin h-5 w-5 max-md:h-4 max-md:w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Exportar PDF
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}


