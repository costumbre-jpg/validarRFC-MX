"use client";

interface DashboardStatsProps {
  totalValidations: number;
  validCount: number;
  invalidCount: number;
  userData: any;
}

export default function DashboardStats({
  totalValidations,
  validCount,
  invalidCount,
}: DashboardStatsProps) {
  const validPercentage =
    totalValidations > 0 ? (validCount / totalValidations) * 100 : 0;
  const invalidPercentage =
    totalValidations > 0 ? (invalidCount / totalValidations) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Total Validaciones */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">
          Total Validaciones
        </h3>
        <p className="text-3xl font-bold text-gray-900">{totalValidations}</p>
      </div>

      {/* RFCs Válidos vs Inválidos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                className="bg-green-500 h-2 rounded-full transition-all"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">
          Uso Mensual
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((week) => {
            const weekUsage = Math.floor(Math.random() * 20) + 5; // Simulado
            const maxUsage = 25;
            const percentage = (weekUsage / maxUsage) * 100;
            return (
              <div key={week} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 w-12">
                  Sem {week}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-[#10B981] h-3 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8">
                  {weekUsage}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

