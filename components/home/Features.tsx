"use client";

export default function Features() {
  const features = [
    {
      id: 1,
      title: "Validación Instantánea",
      description:
        "Consulta el padrón del SAT en tiempo real y obtén resultados en menos de 2 segundos.",
      icon: (
        <svg
          className="w-12 h-12 text-[#2F7E7A]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      id: 2,
      title: "Historial Completo",
      description:
        "Guarda todas tus validaciones y accede a tu historial completo desde cualquier dispositivo.",
      icon: (
        <svg
          className="w-12 h-12 text-[#2F7E7A]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 3,
      title: "API Completa",
      description:
        "Integra nuestras validaciones en tus sistemas con nuestra API REST fácil de usar.",
      icon: (
        <svg
          className="w-12 h-12 text-[#2F7E7A]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
          />
        </svg>
      ),
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="container px-4 lg:max-w-screen-xl md:max-w-screen-md mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex-1 mb-8 md:mb-0">
            <div className="relative" data-aos="fade-right">
              <div className="bg-gradient-to-br from-[#2F7E7A] to-[#1F5D59] rounded-2xl p-12 shadow-2xl">
                <div className="text-white text-center">
                  <div className="text-6xl font-bold mb-4">2s</div>
                  <p className="text-xl">Tiempo promedio de validación</p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-3xl font-bold">99.9%</div>
                      <div className="text-sm opacity-90">Uptime</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">1M+</div>
                      <div className="text-sm opacity-90">Validaciones</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold">5K+</div>
                      <div className="text-sm opacity-90">Clientes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="lg:pl-20 flex flex-col justify-center h-full">
              <p
                className="mb-8 md:mb-3.75 text-4xl font-bold text-gray-900"
                data-aos="fade-left"
              >
                ¿Por qué elegir Maflipp?
              </p>
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex mb-8 md:mb-3.75 items-center gap-8"
                  data-aos="fade-left"
                  data-aos-delay={feature.id * 100}
                >
                  <div className="bg-[#2F7E7A]/20 p-4 rounded-full flex justify-center items-start">
                    {feature.icon}
                  </div>
                  <div className="flex-col">
                    <p className="text-2xl mb-2 font-semibold text-gray-900">
                      {feature.title}
                    </p>
                    <p className="text-gray-600 text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

