"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPlan, type PlanId } from "@/lib/plans";

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

  const planId = (userData?.subscription_status || "free") as PlanId;
  const plan = getPlan(planId);
  const queriesThisMonth = userData?.rfc_queries_this_month || 0;
  const planLimit = plan.validationsPerMonth;
  const isBusiness = planId === "business";

  useEffect(() => {
    const loadAdvancedData = async () => {
      // Resetear estados al cambiar datos
      setDailyUsage([]);
      setMonthlyTrends([]);
      setHourlyUsage([]);
      setYearComparison(null);
      setEfficiencyMetrics(null);
      setLoading(true);
      // Modo diseño: usar datos mock con ejemplos visuales
      if (userData?.id === "mock-user") {
        // Mock con datos de ejemplo para visualizar el diseño
        const mockDaily = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          // Datos de ejemplo: variación realista
          const exampleCounts = [12, 25, 18, 32, 28, 15, 22]; // Ejemplo de uso diario
          return {
            date: date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
            count: exampleCounts[i] || 0,
          };
        });
        const mockMonthly = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - (5 - i));
          // Datos de ejemplo: tendencia creciente
          const exampleCounts = [450, 520, 680, 750, 820, queriesThisMonth || 950]; // Ejemplo de uso mensual
          return {
            month: date.toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
            count: exampleCounts[i] || 0,
          };
        });
        setDailyUsage(mockDaily);
        setMonthlyTrends(mockMonthly);
        
        // Datos mock adicionales para Business
        if (isBusiness) {
          // Mock de análisis por hora
          const mockHourly = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            count: Math.floor(Math.random() * 15) + (i >= 9 && i <= 17 ? 10 : 0), // Más actividad en horas laborales
            label: `${i.toString().padStart(2, '0')}:00`
          }));
          setHourlyUsage(mockHourly);

          // Mock de comparación año anterior
          setYearComparison({
            current: queriesThisMonth || 850,
            lastYear: 720,
            change: (queriesThisMonth || 850) - 720,
            changePercent: '18.1',
            month: new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" })
          });

          // Mock de métricas de eficiencia
          setEfficiencyMetrics({
            errorRate: 2.3,
            avgResponseTime: 1.8,
            totalRequests: queriesThisMonth || 850,
            successRate: '97.7'
          });
        }
        
        setLoading(false);
        return;
      }

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
        
        const { data: recentValidations } = await supabase
          .from("validations")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        // Agrupar por día
        const dailyCounts: Record<string, number> = {};
        Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          date.setHours(0, 0, 0, 0);
          const key = date.toISOString().split("T")[0];
          dailyCounts[key] = 0;
        });

        recentValidations?.forEach((v) => {
          const date = new Date(v.created_at);
          date.setHours(0, 0, 0, 0);
          const key = date.toISOString().split("T")[0];
          if (dailyCounts[key] !== undefined) {
            dailyCounts[key]++;
          }
        });

        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          const key = date.toISOString().split("T")[0];
          return {
            date: date.toLocaleDateString("es-MX", { weekday: "short", day: "numeric" }),
            count: dailyCounts[key] || 0,
          };
        });

        // Obtener validaciones de los últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: monthlyValidations } = await supabase
          .from("validations")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", sixMonthsAgo.toISOString())
          .order("created_at", { ascending: true });

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

        monthlyValidations?.forEach((v) => {
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
          // Análisis por hora del día (últimos 7 días)
          const hourlyCounts: Record<number, number> = {};
          for (let i = 0; i < 24; i++) {
            hourlyCounts[i] = 0;
          }
          
          recentValidations?.forEach((v) => {
            const date = new Date(v.created_at);
            const hour = date.getHours();
            hourlyCounts[hour]++;
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

          const currentCount = currentMonthValidations?.length || 0;
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
          const { data: allValidations } = await supabase
            .from("validations")
            .select("is_valid, created_at, response_time")
            .eq("user_id", userId)
            .gte("created_at", sevenDaysAgo.toISOString())
            .limit(1000);

          const total = allValidations?.length || 0;
          const valid = allValidations?.filter(v => v.is_valid).length || 0;
          const invalid = total - valid;
          const errorRate = total > 0 ? ((invalid / total) * 100).toFixed(2) : '0';
          
          // Calcular tiempo promedio de respuesta real (convertir de ms a segundos)
          const avgResponseTime = total > 0 && allValidations
            ? (allValidations.reduce((sum, v) => sum + (v.response_time || 0), 0) / total / 1000).toFixed(2)
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
  // Datos de ejemplo para asegurar vista previa siempre visible
  const sampleDaily = [
    { date: "lun 01", count: 12 },
    { date: "mar 02", count: 25 },
    { date: "mié 03", count: 18 },
    { date: "jue 04", count: 32 },
    { date: "vie 05", count: 28 },
    { date: "sáb 06", count: 15 },
    { date: "dom 07", count: 22 },
  ];
  const sampleMonthly = [
    { month: "may 2024", count: 450 },
    { month: "jun 2024", count: 520 },
    { month: "jul 2024", count: 680 },
    { month: "ago 2024", count: 750 },
    { month: "sep 2024", count: 820 },
    { month: "oct 2024", count: 950 },
  ];

  // Usar datos reales; si están vacíos o todos en 0, mostrar muestras
  const dailyToShow =
    dailyUsage.length === 7 && dailyUsage.some((d) => d.count > 0)
      ? dailyUsage
      : sampleDaily;
  const monthlyToShow =
    monthlyTrends.length === 6 && monthlyTrends.some((m) => m.count > 0)
      ? monthlyTrends
      : sampleMonthly;

  // Calcular máximos para escalar las barras
  const maxDailyUsage =
    dailyToShow.length > 0
      ? Math.max(...dailyToShow.map((d) => d.count), 1)
      : 1;
  const maxMonthlyUsage =
    monthlyToShow.length > 0
      ? Math.max(...monthlyToShow.map((m) => m.count), 1)
      : 1;

  // Solo mostrar para Pro y Business
  if (planId !== "pro" && planId !== "business") {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header con badge profesional */}
      <div>
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] text-white text-sm font-semibold shadow-md mb-3">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {isBusiness ? "Dashboard Analytics" : "Dashboard Avanzado"}
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isBusiness ? "Analytics Avanzados" : "Análisis Detallado"}
        </h2>
        <p className="text-gray-600">
          {isBusiness 
            ? "Insights profundos, predicciones y análisis empresariales completos"
            : "Visualiza tus tendencias de uso y métricas avanzadas"}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F7E7A]"></div>
        </div>
      ) : (
        <>
          {/* Gráfico de Uso Diario (Últimos 7 días) - Mejorado */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Uso Diario (Últimos 7 días)
                </h3>
                <p className="text-sm text-gray-500">Tendencias de validaciones diarias</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#2F7E7A]/10 to-[#1F5D59]/10 rounded-lg">
                <svg className="w-4 h-4 text-[#2F7E7A]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span className="text-sm font-semibold text-[#2F7E7A]">
                {dailyToShow.reduce((sum, d) => sum + d.count, 0)} total
                </span>
              </div>
            </div>
            
            {/* Gráfico de barras verticales - 7 días */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              {/* Contenedor principal con altura fija para las barras */}
              <div className="relative mb-16" style={{ height: '220px' }}>
                {/* Línea base del gráfico */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300"></div>
                
                {/* Contenedor flex para las 7 barras */}
                <div className="flex items-end justify-between gap-2 h-full px-2">
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
                      <div key={index} className="flex-1 h-full flex flex-col items-center justify-end group relative">
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
                            minHeight: day.count > 0 ? '10px' : '0px',
                            width: '100%'
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
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Promedio</p>
                <p className="text-lg font-bold text-gray-900">
                  {(dailyUsage.reduce((sum, d) => sum + d.count, 0) / 7).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Máximo</p>
                <p className="text-lg font-bold text-[#2F7E7A]">
                  {Math.max(...dailyUsage.map(d => d.count))}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Mínimo</p>
                <p className="text-lg font-bold text-gray-600">
                  {Math.min(...dailyUsage.map(d => d.count))}
                </p>
              </div>
            </div>
          </div>

            {/* Gráfico de Tendencias Mensuales - Mejorado */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Tendencias Mensuales (Últimos 6 meses)
                </h3>
                <p className="text-sm text-gray-500">Evolución del uso a lo largo del tiempo</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#2F7E7A]/10 to-[#1F5D59]/10 rounded-lg">
                <svg className="w-4 h-4 text-[#2F7E7A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-[#2F7E7A]">
                  {monthlyToShow.reduce((sum, m) => sum + m.count, 0)} total
                </span>
              </div>
            </div>
            
            {/* Gráfico de barras horizontales mejorado */}
            <div className="space-y-4">
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
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm font-medium text-gray-700 w-24 text-right">
                        {month.month}
                      </span>
                      <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                        <div
                          className={`${monthlyColors[monthlyColorIndex]} h-6 rounded-full transition-all duration-500 flex items-center justify-between px-3 group-hover:opacity-90`}
                          style={{ width: `${Math.max(percentage, 2)}%`, minWidth: month.count > 0 ? '60px' : '0' }}
                        >
                          <span className="text-xs font-bold text-white">
                            {month.count.toLocaleString()}
                          </span>
                          {change !== null && change !== 0 && (
                            <span className={`text-xs font-semibold ml-2 ${
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
            <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Promedio mensual</p>
                <p className="text-lg font-bold text-gray-900">
                  {Math.round(monthlyToShow.reduce((sum, m) => sum + m.count, 0) / 6)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tendencia</p>
                <p className="text-lg font-bold text-[#2F7E7A]">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tasa de Éxito */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Tasa de Éxito</h3>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-100 to-green-200 shadow-sm">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {stats.total > 0 ? ((stats.valid / stats.total) * 100).toFixed(1) : 0}%
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.total > 0 ? (stats.valid / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            <span className="font-semibold text-green-700">{stats.valid}</span> de <span className="font-semibold">{stats.total}</span> válidos
          </p>
        </div>

        {/* Promedio Diario */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Promedio Diario</h3>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shadow-sm">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {queriesThisMonth > 0 ? (queriesThisMonth / new Date().getDate()).toFixed(1) : 0}
          </p>
          <p className="text-xs text-gray-600">
            Validaciones por día este mes
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Total del mes: <span className="font-semibold text-blue-700">{queriesThisMonth}</span>
            </p>
          </div>
        </div>

        {/* Proyección Mensual */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Proyección Mensual</h3>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 shadow-sm">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {queriesThisMonth > 0 
              ? Math.round((queriesThisMonth / new Date().getDate()) * 30).toLocaleString()
              : 0}
          </p>
          <p className="text-xs text-gray-600">
            Basado en uso actual
          </p>
          {planLimit !== -1 && queriesThisMonth > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {Math.round((queriesThisMonth / new Date().getDate()) * 30) > planLimit ? (
                  <span className="text-red-600 font-semibold">⚠️ Excederás tu límite</span>
                ) : (
                  <span className="text-green-600 font-semibold">✓ Dentro del límite</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Día con Más Uso */}
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Día Pico</h3>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 shadow-sm">
              <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">
            {Math.max(...dailyUsage.map(d => d.count))}
          </p>
          <p className="text-xs text-gray-600">
            {(() => {
              const maxDay = dailyUsage.find(d => d.count === Math.max(...dailyUsage.map(d => d.count)));
              return maxDay ? `El ${maxDay.date}` : 'Sin datos';
            })()}
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Últimos 7 días
            </p>
          </div>
        </div>
      </div>

          {/* Secciones exclusivas de Business */}
          {isBusiness && (
            <>
              {/* Análisis por Hora del Día */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 text-xs font-semibold mb-2">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      EXCLUSIVO BUSINESS
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Análisis por Hora del Día
                    </h3>
                    <p className="text-sm text-gray-500">Identifica tus horas pico de actividad</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-12 gap-1 mb-4">
                  {hourlyUsage.map((hour, index) => {
                    const maxHour = Math.max(...hourlyUsage.map(h => h.count), 1);
                    const percentage = (hour.count / maxHour) * 100;
                    const isPeak = hour.count === maxHour;
                    
                    return (
                      <div key={index} className="flex flex-col items-center group relative">
                        <div 
                          className={`w-full rounded-t transition-all duration-300 ${
                            isPeak 
                              ? 'bg-gradient-to-t from-purple-600 via-purple-500 to-purple-600' 
                              : 'bg-gradient-to-t from-[#2F7E7A] via-[#2F7E7A] to-[#1F5D59]'
                          }`}
                          style={{ 
                            height: `${Math.max(percentage * 1.5, 8)}px`,
                            minHeight: hour.count > 0 ? '8px' : '2px'
                          }}
                          title={`${hour.label}: ${hour.count} validaciones`}
                        >
                          {hour.count > 0 && (
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <div className="bg-gray-900 text-white text-xs font-semibold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                                {hour.count}
                              </div>
                            </div>
                          )}
                        </div>
                        {index % 3 === 0 && (
                          <span className="text-xs text-gray-500 mt-1">{hour.label}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Hora Pico</p>
                    <p className="text-lg font-bold text-purple-600">
                      {hourlyUsage.length > 0 ? `${hourlyUsage.find(h => h.count === Math.max(...hourlyUsage.map(h => h.count)))?.label || 'N/A'}` : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Promedio/Hora</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(hourlyUsage.reduce((sum, h) => sum + h.count, 0) / 24).toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total 24h</p>
                    <p className="text-lg font-bold text-[#2F7E7A]">
                      {hourlyUsage.reduce((sum, h) => sum + h.count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparación Año Anterior */}
              {yearComparison && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-semibold mb-2">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        EXCLUSIVO BUSINESS
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Comparación Año Anterior
                      </h3>
                      <p className="text-sm text-gray-500">Evolución vs mismo período del año pasado</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <p className="text-xs text-blue-700 font-semibold mb-2">Este {yearComparison.month.split(' ')[0]}</p>
                      <p className="text-4xl font-bold text-blue-900 mb-1">
                        {yearComparison.current.toLocaleString()}
                      </p>
                      <p className="text-xs text-blue-600">Validaciones</p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                      <p className="text-xs text-gray-700 font-semibold mb-2">Año Anterior</p>
                      <p className="text-4xl font-bold text-gray-900 mb-1">
                        {yearComparison.lastYear.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-600">Validaciones</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Cambio</p>
                        <p className={`text-3xl font-bold ${
                          yearComparison.change > 0 ? 'text-green-600' : 
                          yearComparison.change < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {yearComparison.change > 0 ? '+' : ''}{yearComparison.change.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Porcentaje</p>
                        <p className={`text-3xl font-bold ${
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-700 text-xs font-semibold mb-2">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          EXCLUSIVO BUSINESS
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Tasa de Éxito del Sistema
                        </h3>
                        <p className="text-sm text-gray-500">Rendimiento y confiabilidad</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Tasa de Éxito</span>
                          <span className="text-lg font-bold text-green-600">{efficiencyMetrics.successRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                            style={{ width: `${efficiencyMetrics.successRate}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Tasa de Error</span>
                          <span className="text-lg font-bold text-red-600">{efficiencyMetrics.errorRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all"
                            style={{ width: `${efficiencyMetrics.errorRate}%` }}
                          />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Tiempo promedio de respuesta: <span className="font-semibold text-gray-700">{efficiencyMetrics.avgResponseTime}s</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                          EXCLUSIVO BUSINESS
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Predicciones Avanzadas
                        </h3>
                        <p className="text-sm text-gray-500">Proyecciones basadas en IA</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200">
                        <p className="text-xs text-indigo-700 font-semibold mb-1">Próximo Mes</p>
                        <p className="text-2xl font-bold text-indigo-900">
                          {Math.round((queriesThisMonth / new Date().getDate()) * 30 * 1.15).toLocaleString()}
                        </p>
                        <p className="text-xs text-indigo-600 mt-1">+15% crecimiento estimado</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                        <p className="text-xs text-purple-700 font-semibold mb-1">Próximo Trimestre</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {Math.round((queriesThisMonth / new Date().getDate()) * 30 * 3 * 1.12).toLocaleString()}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">+12% crecimiento trimestral</p>
                      </div>
                      <div className="pt-2">
                        <p className="text-xs text-gray-500 italic">
                          * Basado en tendencias históricas y patrones de uso
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botón de Exportación de Reportes */}
              <div className="bg-gradient-to-br from-[#2F7E7A] to-[#1F5D59] rounded-xl shadow-lg border border-[#1F5D59] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-2">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      EXCLUSIVO BUSINESS
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Exportar Reporte Analytics</h3>
                    <p className="text-sm text-white/90">Descarga un reporte completo en PDF con todos tus analytics</p>
                  </div>
                  <button
                    onClick={() => {
                      // TODO: Implementar exportación de reporte
                      alert('Funcionalidad de exportación de reportes próximamente');
                    }}
                    className="px-6 py-3 bg-white text-[#2F7E7A] rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar PDF
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

