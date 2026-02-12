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

  // Empty state logic removed to always show graphs as requested by user

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
                className="bg-brand-primary h-1.5 max-md:h-1 rounded-full transition-all"
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
                      className="bg-brand-primary h-2 max-md:h-1.5 rounded-full transition-all"
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


