"use client";

const stats = [
  { value: "2s", label: "Tiempo promedio de validación" },
  { value: "99.9%", label: "Uptime garantizado" },
  { value: "100%", label: "Precisión en validaciones" },
  { value: "24/7", label: "Disponibilidad del servicio" },
];

export default function StatsSlider() {
  // Duplicar el array para el efecto infinito
  const duplicatedStats = [...stats, ...stats, ...stats];

  return (
    <div className="overflow-hidden bg-[#2F7E7A] py-10 md:py-12 relative">
      <div 
        className="flex gap-8 md:gap-16"
        style={{
          animation: "scroll-infinite 25s linear infinite",
          width: "fit-content",
        }}
      >
        {duplicatedStats.map((stat, index) => (
          <div
            key={index}
            className="flex-shrink-0 text-center min-w-[180px] md:min-w-[280px] px-4"
          >
            <div className="text-3xl md:text-4xl font-semibold text-white mb-1.5">
              {stat.value}
            </div>
            <div className="text-teal-100 text-xs md:text-sm whitespace-normal">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
