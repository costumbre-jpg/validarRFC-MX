"use client";
import { useState } from "react";

const Hero = () => {
  const [rfc, setRfc] = useState("");

  const handleValidate = () => {
    // Temporalmente redirige al Dashboard para diseño
    window.location.href = "/dashboard";
  };

  return (
    <section id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
          Valida RFCs contra el SAT en{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59]">2 segundos</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-5 max-w-4xl mx-auto font-medium leading-relaxed">
          Plataforma B2B para validar y auditar documentos fiscales y legales
        </p>
        <p className="text-sm sm:text-base text-gray-600 mb-3 max-w-3xl mx-auto font-normal">
          Comenzando con validación de RFC contra el padrón del SAT
        </p>
        <p className="text-sm text-gray-500 mb-12 max-w-3xl mx-auto leading-relaxed">
          Verifica que tus proveedores, clientes y socios comerciales existan realmente en el Sistema de Administración Tributaria
        </p>

        {/* RFC Input */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row gap-4 shadow-2xl rounded-2xl p-2 bg-white border-2 border-gray-200 hover:border-[#2F7E7A] transition-all">
            <input
              type="text"
              placeholder="Ej: ABC123456XYZ"
              value={rfc}
              onChange={(e) => setRfc(e.target.value)}
              className="flex-1 px-6 py-5 text-lg sm:text-xl border-0 rounded-xl focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400 font-medium"
            />
            <button
              onClick={handleValidate}
              className="bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] text-white px-10 py-5 rounded-xl hover:from-[#1F5D59] hover:to-[#2F7E7A] transition-all font-bold text-lg sm:text-xl whitespace-nowrap shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center gap-2 group"
            >
              Validar Gratis
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-base sm:text-lg text-gray-600 font-medium">
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5 text-[#2F7E7A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            10 validaciones gratis/mes
          </span>
          {" • "}
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5 text-[#2F7E7A]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Más rápido que el SAT oficial
          </span>
        </p>
      </div>
    </section>
  );
};

export default Hero;
