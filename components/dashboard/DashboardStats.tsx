"use client";

interface DashboardStatsProps {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  userData: any;
  validations?: any[]; // Agregar validaciones para calcular uso semanal
  showDemo?: boolean;
}

export default function DashboardStats({
  totalValidations,
  validCount,
  invalidCount,
  userData,
  validations = [],
  showDemo = false,
}: DashboardStatsProps) {
  const showDemoCharts = totalValidations === 0 && showDemo;

  const validPercentage =
    totalValidations > 0 ? (validCount / totalValidations) * 100 : 0;
  const invalidPercentage =
    totalValidations > 0 ? (invalidCount / totalValidations) * 100 : 0;

  // Demo view for empty state
  if (showDemoCharts) {
    const demoValid = 42;
    const demoInvalid = 8;
    const demoTotal = demoValid + demoInvalid;
    const demoValidPct = (demoValid / demoTotal) * 100;
    const demoInvalidPct = (demoInvalid / demoTotal) * 100;
    const demoWeekly = [
      { week: 1, count: 5 },
      { week: 2, count: 12 },
      { week: 3, count: 18 },
      { week: 4, count: 15 },
    ];
    const demoMax = Math.max(...demoWeekly.map((w) => w.count), 1);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Validaciones</h3>
          <p className="text-3xl font-bold text-gray-900">{demoTotal}</p>
          <p className="text-xs text-gray-500 mt-1">Vista previa de cómo se verá con datos reales</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">RFCs Válidos vs Inválidos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700">Válidos</span>
                <span className="text-sm font-semibold text-gray-900">
                  {demoValid} ({demoValidPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#2F7E7A] h-2 rounded-full transition-all"
                  style={{ width: `${demoValidPct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-700">Inválidos</span>
                <span className="text-sm font-semibold text-gray-900">
                  {demoInvalid} ({demoInvalidPct.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${demoInvalidPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Uso Mensual</h3>
          <div className="space-y-2">
            {demoWeekly.map(({ week, count }) => {
              const percentage = demoMax > 0 ? (count / demoMax) * 100 : 0;
              return (
                <div key={week} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-12">Sem {week}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#2F7E7A] h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8">{count}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-3">Vista previa de gráficos.</p>
        </div>
      </div>
    );
  }

  // Estado vacío mejorado
  if (totalValidations === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Estado vacío - Total Validaciones */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#2F7E7A]/10 to-[#2F7E7A]/5 rounded-full mb-4">
              <svg className="w-8 h-8 text-[#2F7E7A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-2">
              Total Validaciones
            </h3>
            <p className="text-4xl font-bold text-gray-900 mb-3">0</p>
            <p className="text-sm text-gray-600">
              Comienza validando tu primer RFC arriba
            </p>
          </div>
        </div>

        {/* Estado vacío - RFCs Válidos vs Inválidos */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h3 className="text-base font-semibold text-gray-700 mb-6">
            RFCs Válidos vs Inválidos
          </h3>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Los resultados aparecerán aquí después de tu primera validación
            </p>
          </div>
        </div>

        {/* Estado vacío - Uso Mensual */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <h3 className="text-base font-semibold text-gray-700 mb-6">
            Uso Mensual
          </h3>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-full mb-4">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              El gráfico se actualizará conforme uses el servicio
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Validaciones */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Total Validaciones
        </h3>
        <p className="text-3xl font-bold text-gray-900">{totalValidations}</p>
      </div>

      {/* RFCs Válidos vs Inválidos */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          RFCs Válidos vs Inválidos
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700">
                Válidos
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {validCount} ({validPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#2F7E7A] h-2 rounded-full transition-all"
                style={{ width: `${validPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-700">
                Inválidos
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {invalidCount} ({invalidPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${invalidPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Simple de Uso Mensual */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          Uso Mensual
        </h3>
        <div className="space-y-2">
          {(() => {
            // Calcular uso por semana del mes actual
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const weeks = [1, 2, 3, 4];
            const weeklyUsage = weeks.map((week) => {
              const weekStart = new Date(startOfMonth);
              weekStart.setDate(1 + (week - 1) * 7);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 6);
            
              // Contar validaciones en esta semana
              const count = validations.filter((v) => {
                const validationDate = new Date(v.created_at);
                return validationDate >= weekStart && validationDate <= weekEnd;
              }).length;
            
              return { week, count };
            });
            
            const maxUsage = Math.max(...weeklyUsage.map(w => w.count), 1);
            
            return weeklyUsage.map(({ week, count }) => {
              const percentage = maxUsage > 0 ? (count / maxUsage) * 100 : 0;
              return (
                <div key={week} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-12">
                    Sem {week}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-[#2F7E7A] h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-8">
                    {count}
                  </span>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}

