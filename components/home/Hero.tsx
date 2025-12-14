"use client";
import { useState } from "react";
import Link from "next/link";

const Hero = () => {
  const [rfc, setRfc] = useState("");

  const handleValidate = () => {
    // Temporalmente redirige al Dashboard para diseño
    window.location.href = "/dashboard";
  };

  return (
    <section id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Valida RFCs contra el SAT en{" "}
          <span className="text-[#2F7E7A]">2 segundos</span>
        </h1>
        <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Plataforma B2B para validar y auditar documentos fiscales y legales. 
          <span className="block mt-2 text-lg sm:text-xl">
            Comenzando con validación de RFC contra el padrón del SAT
          </span>
        </p>
        <p className="text-base text-gray-500 mb-12 max-w-2xl mx-auto">
          Verifica que tus proveedores, clientes y socios comerciales existan realmente en el Sistema de Administración Tributaria
        </p>

        {/* RFC Input */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Ej: ABC123456XYZ"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
              className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors"
            />
            <button
              onClick={handleValidate}
              className="bg-[#2F7E7A] text-white px-8 py-4 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-lg whitespace-nowrap shadow-lg hover:shadow-xl"
            >
              Validar Gratis
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          10 validaciones gratis/mes • Más rápido que el SAT oficial
        </p>
      </div>
    </section>
  );
};

export default Hero;
