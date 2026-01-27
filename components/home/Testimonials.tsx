"use client";

// Componente de testimonios - NO USAR hasta tener testimonios reales
// Para vender MVP sin traccion, mejor no mostrar esta seccion
export default function Testimonials() {
  // Comentado: no mostrar testimonios hasta tener clientes reales
  // Si quieres mostrar esta seccion, descomenta y agrega testimonios reales
  const testimonials: any[] = [];
  
  // Si no hay testimonios, no renderizar nada
  if (testimonials.length === 0) {
    return null;
  }
  
  // Codigo original comentado para referencia:
  /*
  const testimonials = [
    {
      id: 1,
      quote: "Testimonio real pendiente...",
      author: "Nombre del cliente",
      role: "Cargo / Empresa",
      rating: 5,
    },
  ];
  */

  return (
    <section className="px-4 md:px-0 bg-gray-50 py-20">
      <div className="container lg:max-w-screen-xl md:max-w-screen-md px-8 mx-auto py-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">
          Lo que dicen nuestros clientes
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg"
              data-aos="fade-up"
            >
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700 text-lg mb-6 italic">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#2F7E7A] rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.author[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

