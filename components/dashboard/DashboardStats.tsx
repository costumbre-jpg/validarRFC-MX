"use client";

interface DashboardStatsProps {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  validations?: any[]; // Agregar validaciones para calcular uso semanal
}

export default function DashboardStats({
  totalValidations,
  validCount,
  invalidCount,
  validations = [],
}: DashboardStatsProps) {
  const validPercentage =
    totalValidations > 0 ? (validCount / totalValidations) * 100 : 0;
  const invalidPercentage =
    totalValidations > 0 ? (invalidCount / totalValidations) * 100 : 0;

  // Estado vacío mejorado
  if (totalValidations === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estado vacío - Total Validaciones */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-3">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1.5">
              Total Validaciones
            </h3>
            <p className="text-2xl font-bold text-gray-900 mb-2">0</p>
            <p className="text-xs text-gray-600">
              Comienza validando tu primer RFC arriba
            </p>
          </div>
        </div>

        {/* Estado vacío - RFCs Válidos vs Inválidos */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            RFCs Válidos vs Inválidos
          </h3>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              Los resultados aparecerán aquí después de tu primera validación
            </p>
          </div>
        </div>

        {/* Estado vacío - Uso Mensual */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Uso Mensual
          </h3>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs text-gray-600 font-medium">
              El gráfico se actualizará conforme uses el servicio
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-md:gap-3">
      {/* Total Validaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <h3 className="text-xs max-md:text-[11px] font-medium text-gray-500 mb-1.5 max-md:mb-1">
          Total Validaciones
        </h3>
        <p className="text-xl max-md:text-lg font-bold text-gray-900">{totalValidations}</p>
      </div>

      {/* RFCs Válidos vs Inválidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <h3 className="text-xs max-md:text-[11px] font-medium text-gray-500 mb-3 max-md:mb-2">
          RFCs Válidos vs Inválidos
        </h3>
        <div className="space-y-3 max-md:space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1.5 max-md:mb-1">
              <span className="text-xs max-md:text-[11px] font-medium text-green-700">
                Válidos
              </span>
              <span className="text-xs max-md:text-[11px] font-semibold text-gray-900">
                {validCount} ({validPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 max-md:h-1">
              <div
                className="bg-[#2F7E7A] h-1.5 max-md:h-1 rounded-full transition-all"
                style={{ width: `${validPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5 max-md:mb-1">
              <span className="text-xs max-md:text-[11px] font-medium text-red-700">
                Inválidos
              </span>
              <span className="text-xs max-md:text-[11px] font-semibold text-gray-900">
                {invalidCount} ({invalidPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 max-md:h-1">
              <div
                className="bg-red-500 h-1.5 max-md:h-1 rounded-full transition-all"
                style={{ width: `${invalidPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Simple de Uso Mensual */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <h3 className="text-xs max-md:text-[11px] font-medium text-gray-500 mb-3 max-md:mb-2">
          Uso Mensual
        </h3>
        <div className="space-y-1.5 max-md:space-y-1">
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
                <div key={week} className="flex items-center gap-2 max-md:gap-1.5">
                  <span className="text-[10px] max-md:text-[9px] text-gray-600 w-10 max-md:w-8">
                    Sem {week}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-md:h-1.5">
                    <div
                      className="bg-[#2F7E7A] h-2 max-md:h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] max-md:text-[9px] font-medium text-gray-700 w-6 max-md:w-5">
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

