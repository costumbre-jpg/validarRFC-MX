"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StatsSlider from "@/components/home/StatsSlider";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactMessage, setContactMessage] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Si está en la parte superior, siempre mostrar
      if (currentScrollY < 50) {
        setIsScrolled(false);
      } else {
        // Si hace scroll hacia abajo, ocultar
        if (currentScrollY > lastScrollY) {
          setIsScrolled(true);
        } else {
          // Si hace scroll hacia arriba, mostrar
          setIsScrolled(false);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-white">
      {/* LOGO GRANDE - Sobre el header, independiente */}
      <div className={`absolute top-2 sm:top-4 md:top-6 left-8 sm:left-12 md:left-16 z-50 transition-transform duration-300 ${isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>
        <Link href="/" className="block">
          <Image
            src="/Maflipp-recortada.png"
            alt="Maflipp Logo"
            width={280}
            height={280}
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
            quality={100}
            priority
            unoptimized
          />
        </Link>
      </div>

      {/* HEADER - Arriba */}
      <header className={`sticky top-0 z-40 bg-white pt-2 transition-transform duration-300 ${isScrolled ? "-translate-y-full" : "translate-y-0"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-[#2F7E7A] transition-colors"
              onClick={() => {
                const mobileMenu = document.getElementById("mobile-menu");
                if (mobileMenu) {
                  mobileMenu.classList.toggle("hidden");
                }
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex space-x-8 items-center flex-1 justify-center ml-56">
              <Link href="#inicio" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium">
                Inicio
              </Link>
              <Link href="#caracteristicas" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium">
                Características
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium">
                Precios
              </Link>
              <Link href="#api" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium">
                API
              </Link>
              <Link href="#contacto" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <button
                onClick={() => {
                  setAuthModalMode("login");
                  setAuthModalOpen(true);
                }}
                className="text-sm sm:text-base text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium px-2 sm:px-0"
              >
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Entrar</span>
              </button>
              <button
                onClick={() => {
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }}
                className="bg-[#2F7E7A] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-medium text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Registro</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div id="mobile-menu" className="hidden md:hidden pb-4 border-t border-gray-200 mt-2">
            <nav className="flex flex-col space-y-2 pt-4">
              <Link href="#inicio" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2">
                Inicio
              </Link>
              <Link href="#caracteristicas" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2">
                Características
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2">
                Precios
              </Link>
              <Link href="#api" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2">
                API
              </Link>
              <Link href="#contacto" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <ScrollReveal direction="up" delay={0} duration={1.2}>
        <Hero />
      </ScrollReveal>

      {/* ESTADÍSTICAS CON SCROLL INFINITO */}
      <StatsSlider />

      {/* TRUST BADGES */}
      <ScrollReveal direction="up">
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white border-y border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-10">
              <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center gap-3 text-gray-800 hover:shadow-xl hover:-translate-y-2 hover:border-[#2F7E7A] transition-all duration-300 cursor-pointer group">
                <svg className="w-6 h-6 text-[#2F7E7A] flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">Conectado directamente con el SAT</span>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center gap-3 text-gray-800 hover:shadow-xl hover:-translate-y-2 hover:border-[#2F7E7A] transition-all duration-300 cursor-pointer group">
                <svg className="w-6 h-6 text-[#2F7E7A] flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">Datos en tiempo real</span>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center gap-3 text-gray-800 hover:shadow-xl hover:-translate-y-2 hover:border-[#2F7E7A] transition-all duration-300 cursor-pointer group">
                <svg className="w-6 h-6 text-[#2F7E7A] flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">Cumplimiento fiscal mexicano</span>
              </div>
              <div className="bg-white border-2 border-gray-200 rounded-xl px-6 py-4 flex items-center gap-3 text-gray-800 hover:shadow-xl hover:-translate-y-2 hover:border-[#2F7E7A] transition-all duration-300 cursor-pointer group">
                <svg className="w-6 h-6 text-[#2F7E7A] flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-sm sm:text-base whitespace-nowrap">99.9% Uptime garantizado</span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* PARA QUIÉN ES */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Para Quién Es Maflipp
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto mb-4 font-medium leading-relaxed">
              Plataforma diseñada para profesionales y empresas que necesitan validar documentos fiscales y legales de forma confiable
            </p>
            <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Maflipp es la solución ideal para contadores, empresas, fintechs y desarrolladores que buscan automatizar y optimizar sus procesos de validación fiscal. Nuestra plataforma se integra perfectamente con tus flujos de trabajo existentes, ahorrando tiempo y reduciendo errores humanos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <ScrollReveal direction="left" delay={0.1}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Contadores Públicos</h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed font-normal">
                  Valida RFCs de clientes y proveedores antes de emitir facturas. Ahorra horas de trabajo manual y reduce errores en tu contabilidad.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Ideal para despachos contables que manejan múltiples clientes. Valida cientos de RFCs en minutos, genera reportes automáticos y mantén un historial completo de todas tus validaciones para auditorías.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-[#2F7E7A] font-bold text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Empresas</h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed font-normal">
                  Verifica que tus proveedores existan realmente antes de hacer negocios. Reduce riesgos fiscales y protege tu empresa de fraudes.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Perfecto para departamentos de compras y finanzas. Valida proveedores antes de realizar pagos, cumple con requisitos de compliance y mantén registros detallados para auditorías internas y externas.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-[#2F7E7A] font-bold text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Fintechs</h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed font-normal">
                  Integra validación automática en tu onboarding. Cumple con KYC y reduce fraude en tus procesos de verificación de clientes.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Solución perfecta para plataformas financieras que necesitan validar la identidad fiscal de sus usuarios. Integra nuestra API en tu flujo de onboarding para validaciones automáticas en tiempo real y cumplimiento regulatorio.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-[#2F7E7A] font-bold text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Desarrolladores</h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed font-normal">
                  API RESTful para integrar validación de RFCs en tus aplicaciones. Documentación completa con ejemplos de código en múltiples lenguajes.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  API moderna y fácil de usar con endpoints bien documentados. Incluye SDKs, ejemplos de integración, webhooks para notificaciones y soporte técnico dedicado para ayudarte a implementar rápidamente.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-[#2F7E7A] font-bold text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* BENEFICIOS */}
      <ScrollReveal direction="up">
        <section id="caracteristicas" className="py-28 bg-gradient-to-br from-white via-gray-50/30 to-white relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              ¿Por Qué Elegir Maflipp?
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto mb-4 font-medium">
              La plataforma más confiable para validación y auditoría de documentos fiscales en México
            </p>
            <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Con Maflipp obtienes acceso directo al padrón del SAT, resultados instantáneos y un sistema robusto diseñado para empresas que requieren precisión y confiabilidad en sus operaciones fiscales diarias.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Validación Instantánea</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Consulta directa al padrón del SAT en menos de 2 segundos. Sin esperas, sin demoras.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Nuestra infraestructura optimizada garantiza respuestas rápidas incluso durante horas pico. Procesa cientos de validaciones simultáneas sin comprometer la velocidad.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">100% Precisión</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Datos directamente del SAT. Elimina errores humanos y garantiza información confiable.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Consultamos directamente el padrón oficial del SAT, asegurando que cada validación refleje el estado actual del contribuyente. Sin intermediarios, sin interpretaciones.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Ahorra Tiempo</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Reduce de horas a segundos. Valida cientos de RFCs en minutos, no en días.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Automatiza tus procesos de validación y libera tiempo para tareas de mayor valor. Un contador puede validar 50 RFCs en menos de 2 minutos, lo que antes tomaba horas.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Seguro y Confiable</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Encriptación SSL, cumplimiento con normativas fiscales mexicanas y protección de datos.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Cumplimos con los más altos estándares de seguridad. Todas las comunicaciones están encriptadas y seguimos las mejores prácticas de protección de datos personales.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">Historial Completo</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Guarda y exporta todas tus validaciones. Genera reportes para auditorías y compliance.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Mantén un registro completo de todas tus validaciones con timestamps, resultados y detalles. Exporta a CSV o Excel para análisis y presentaciones profesionales.
              </p>
            </div>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 lg:p-7 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-[#2F7E7A] active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 text-[#2F7E7A] mb-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">API Completa</h3>
              <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                Integra validación de RFCs en tus sistemas. RESTful API con documentación completa.
              </p>
              <p className="text-xs text-gray-600 leading-relaxed">
                API RESTful moderna con autenticación por API keys, rate limiting configurable, webhooks para notificaciones y soporte para múltiples lenguajes de programación.
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CÓMO FUNCIONA */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Cómo Funciona
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-normal">
              Tres pasos simples para validar cualquier RFC en segundos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 lg:gap-12">
            {/* Paso 1 */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="text-center bg-white rounded-2xl p-6 lg:p-7 border-2 border-gray-200 hover:border-[#2F7E7A] hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">
                  Ingresa el RFC
                </h3>
                <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                  Escribe o pega el RFC que deseas validar en nuestro sistema. Acepta RFCs de personas físicas y morales en cualquier formato.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Nuestro sistema valida automáticamente el formato del RFC y te indica si es válido antes de realizar la consulta al SAT.
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 text-[#2F7E7A] font-bold text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Probar Ahora
                  <svg className="w-5 h-5 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </ScrollReveal>

            {/* Paso 2 */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="text-center bg-white rounded-2xl p-6 lg:p-7 border-2 border-gray-200 hover:border-[#2F7E7A] hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">
                  Consultamos el SAT en tiempo real
                </h3>
                <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                  Nuestro sistema consulta directamente el padrón del SAT para obtener la información más actualizada disponible.
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Utilizamos conexiones optimizadas y caché inteligente para garantizar respuestas rápidas sin comprometer la precisión de los datos.
                </p>
              </div>
            </ScrollReveal>

            {/* Paso 3 */}
            <ScrollReveal direction="right" delay={0.3}>
              <div className="text-center bg-white rounded-2xl p-6 lg:p-7 border-2 border-gray-200 hover:border-[#2F7E7A] hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 group">
                <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#2F7E7A] transition-colors">
                  Recibe resultado instantáneo
                </h3>
                <p className="text-gray-700 mb-2 text-sm leading-relaxed font-normal">
                  Obtén la respuesta en menos de 2 segundos con todos los detalles del contribuyente: nombre, régimen fiscal, estado y fecha de alta.
                </p>
                <p className="text-xs text-gray-600 mb-5 leading-relaxed">
                  Cada resultado incluye información completa y verificada que puedes guardar, exportar o usar directamente en tus procesos de negocio.
                </p>
                <div className="text-center mt-6">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] text-white px-8 py-4 rounded-xl hover:from-[#1F5D59] hover:to-[#2F7E7A] transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 group/cta"
                  >
                    Comenzar Gratis Ahora
                    <svg className="w-6 h-6 group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* VISTA PREVIA DEL DASHBOARD */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
                Dashboard Intuitivo
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 max-w-4xl mx-auto mb-4 font-normal">
                Gestiona todas tus validaciones desde un panel de control moderno, claro y fácil de usar.
              </p>
              <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
                En el plan Free ves tus validaciones recientes y estadísticas básicas; en Pro accedes a gráficos avanzados de uso diario y tendencias mensuales; y en Business obtienes Analytics completos con análisis por hora del día, comparación con el año anterior, métricas de eficiencia y predicciones avanzadas.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="relative w-full h-[450px] md:h-[520px] bg-gray-100 flex items-center justify-center">
                <Image
                  src="/dashboard-free.png.png"
                  alt="Dashboard plan Free de Maflipp"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  quality={100}
                  priority
                  unoptimized
                />
              </div>
            </div>
            <div className="text-center mt-10">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-3 text-[#2F7E7A] font-bold text-lg hover:text-[#1F5D59] hover:gap-4 transition-all group"
              >
                Prueba el dashboard gratis
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* PLANES DE PRECIOS */}
      <ScrollReveal direction="up">
        <section id="precios" className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Planes de Precios
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto font-normal">
              Elige el plan perfecto para tu negocio
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
            {/* Plan FREE */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">FREE</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">10 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Resultados básicos (válido/inválido)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Estadísticas básicas de uso</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">1 usuario</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Soporte: FAQs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Límite: 10 validaciones/mes</span>
                </li>
                <li className="flex items-start pt-2 border-t border-gray-200">
                  <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin historial de validaciones</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin exportación de datos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin acceso a API</span>
                </li>
              </ul>
              <button className="w-full bg-gray-100 text-gray-900 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm">
                Comenzar Gratis
              </button>
            </div>

            {/* Plan PRO - DESTACADO */}
            <div className="bg-white border-2 border-[#2F7E7A] rounded-2xl p-6 shadow-lg relative transform scale-105 hover:scale-105 hover:-translate-y-2 active:scale-100 transition-all duration-300 cursor-pointer touch-manipulation">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#2F7E7A] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  MÁS POPULAR
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">PRO</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$299</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">1,000 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Historial ilimitado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Exportar a CSV/Excel</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API Básica: 2,000 llamadas/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">3 usuarios en equipo</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dashboard avanzado con gráficos y estadísticas detalladas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Alertas por email</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Soporte email (24h)</span>
                </li>
              </ul>
              <button className="w-full bg-[#2F7E7A] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1F5D59] transition-colors shadow-lg hover:shadow-xl text-sm">
                Comenzar Ahora
              </button>
            </div>

            {/* Plan BUSINESS */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">BUSINESS</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">$999</span>
                <span className="text-gray-600"> MXN/mes</span>
              </div>
              <ul className="space-y-2.5 mb-6 text-sm">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">5,000 validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Historial ilimitado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Exportar a CSV/Excel/PDF</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API Completa: 10,000 llamadas/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Usuarios ilimitados</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">White-label</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">SSO (Single Sign-On)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="flex items-center flex-wrap gap-2">
                    <span className="text-gray-500 line-through">SLA 99.9%</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Próximamente
                    </span>
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dashboard Analytics completo: análisis por hora, comparación año anterior, predicciones y reportes PDF</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="flex items-center flex-wrap gap-2">
                    <span className="text-gray-500 line-through">Validación CFDI</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Próximamente
                    </span>
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Onboarding personalizado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="flex items-center flex-wrap gap-2">
                    <span className="text-gray-500 line-through">Soporte prioritario</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                      Próximamente
                    </span>
                  </span>
                </li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm">
                Contactar Ventas
              </button>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CASOS DE USO DETALLADOS */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Casos de Uso Reales
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto font-normal">
              Descubre cómo empresas y profesionales pueden optimizar sus procesos con Maflipp
            </p>
          </div>
          <div className="space-y-8">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-12 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-block bg-[#2F7E7A] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    CASO DE USO #1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Contador Valida 50+ RFCs Mensuales
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Un contador público valida RFCs de clientes y proveedores antes de emitir facturas. 
                    Antes usaba el portal del SAT manualmente, tardando 5 minutos por RFC.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Ahorra 4 horas/semana en validaciones</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Reduce errores en facturación a cero</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>ROI de 500% en el primer mes</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/auth/register"
                      className="inline-block bg-[#2F7E7A] text-white px-6 py-3 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold"
                    >
                      Comenzar Gratis
                    </Link>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-[#2F7E7A] mb-2">4h</div>
                    <div className="text-gray-600 mb-4">Ahorradas por semana</div>
                    <div className="text-3xl font-bold text-gray-900 mb-2">$2,000</div>
                    <div className="text-gray-600">Valor del tiempo ahorrado/mes</div>
                  </div>
                </div>
              </div>
            </div>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 md:p-12 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-green-600 mb-2">100%</div>
                      <div className="text-gray-600 mb-4">Precisión en validaciones</div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">0</div>
                      <div className="text-gray-600">Errores desde implementación</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-block bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    CASO DE USO #2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Fintech Valida Clientes en Onboarding
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Una fintech integra nuestra API para validar RFCs automáticamente durante el proceso 
                    de onboarding de nuevos clientes empresariales.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Validación automática en 2 segundos</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Cumple con requisitos KYC y compliance</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Reduce fraude y mejora conversión</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      href="/auth/register"
                      className="inline-block bg-[#2F7E7A] text-white px-6 py-3 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold"
                    >
                      Comenzar Gratis
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* API E INTEGRACIONES */}
      <ScrollReveal direction="up">
        <section id="api" className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              API e Integraciones
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto font-normal">
              Integra validación de RFCs en tus sistemas con nuestra API RESTful completa
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#2F7E7A] rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">API RESTful</h3>
                </div>
                <ul className="space-y-4 mb-6">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Respuesta en menos de 2 segundos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Autenticación con API Keys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Documentación completa con ejemplos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Soporte para webhooks</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#2F7E7A] mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Rate limiting configurable</span>
                  </li>
                </ul>
                <Link
                  href="/developers?from=landing"
                  className="inline-flex items-center text-[#2F7E7A] font-semibold hover:text-[#1F5D59] transition-colors"
                >
                  Ver Documentación Completa
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <div className="bg-gray-900 rounded-xl p-6 overflow-hidden">
                <div className="flex items-center mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <pre className="text-green-400 text-sm font-mono">
                  <code>{`// Ejemplo de uso de la API
POST /api/public/validate
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "rfc": "ABC123456XYZ"
}

// Respuesta
{
  "valid": true,
  "name": "EMPRESA S.A. DE C.V.",
  "status": "ACTIVO",
  "regime": "General de Ley",
  "start_date": "2020-01-15"
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* SEGURIDAD Y COMPLIANCE */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Seguridad y Compliance
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto font-normal">
              Cumplimos con los más altos estándares de seguridad y normativas fiscales mexicanas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Encriptación SSL/TLS</h3>
              <p className="text-gray-600">
                Todas las comunicaciones están encriptadas. Tus datos están protegidos en tránsito y en reposo.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Cumplimiento Legal</h3>
              <p className="text-gray-600">
                Consultamos únicamente información pública del SAT. Totalmente legal y conforme a normativas mexicanas.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacidad de Datos</h3>
              <p className="text-gray-600">
                No almacenamos información sensible. Solo procesamos RFCs para validación y generamos reportes anónimos.
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* COMPARACIÓN */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-5 relative inline-block tracking-tight">
              Maflipp vs Métodos Tradicionales
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto font-normal">
              Compara cómo Maflipp supera a los métodos manuales de validación
            </p>
          </div>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Característica</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Método Manual</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#2F7E7A] bg-blue-50">Maflipp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Tiempo por validación</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">3-5 minutos</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">2 segundos</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Precisión</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">Riesgo de error humano</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">100% preciso</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Historial</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">Manual, propenso a pérdidas</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">Automático e ilimitado</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Exportación</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">Copiar/pegar manual</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">CSV/Excel con un click</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Integración</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">No disponible</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">API RESTful completa</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">Costo por 100 validaciones</td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-center">$2,000 - $5,000 MXN (tiempo)</td>
                    <td className="px-6 py-4 text-sm text-[#2F7E7A] font-semibold text-center">Desde $299 MXN/mes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>


      {/* FAQ */}
      <ScrollReveal direction="up">
        <section className="py-24 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-16 tracking-tight relative inline-block w-full">
            Preguntas Frecuentes
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
          </h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Es legal consultar el SAT?
              </h3>
              <p className="text-gray-600">
                Sí, es completamente legal. Consultamos el padrón de contribuyentes del SAT que es información pública. 
                Nuestro servicio está diseñado para ayudar a empresas y contadores a verificar la validez de RFCs de manera eficiente.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Stripe. 
                También ofrecemos facturación para planes empresariales.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Puedo cancelar cuando quiera?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. 
                No hay contratos de permanencia ni penalizaciones por cancelación.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¿Cómo funcionan las validaciones gratis?
              </h3>
              <p className="text-gray-600">
                El plan gratuito incluye 10 validaciones por mes sin necesidad de tarjeta de crédito. 
                Las validaciones se renuevan cada mes. Si necesitas más, puedes actualizar a un plan de pago en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CTA FINAL */}
      <ScrollReveal direction="up">
        <section className="py-28 bg-gradient-to-r from-[#2F7E7A] via-[#1F5D59] to-[#2F7E7A] relative overflow-hidden">
          {/* Imagen de fondo muy sutil */}
          <div className="absolute inset-0 z-0 opacity-10">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop&q=80"
              alt="Background"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 z-0"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
              ¿Listo para validar RFCs en 2 segundos?
            </h2>
            <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-3xl mx-auto font-normal drop-shadow-lg">
              Empieza a ahorrar horas de trabajo manual con Maflipp
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <Link
                href="/auth/register"
                className="bg-white text-[#2F7E7A] px-10 py-5 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 inline-flex items-center gap-2 group/cta"
              >
                Comenzar Gratis
                <svg className="w-6 h-6 group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/pricing"
                className="bg-transparent border-3 border-white text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center gap-2 group/cta"
              >
                Ver Planes y Precios
                <svg className="w-6 h-6 group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-blue-100 text-base sm:text-lg mt-8 font-medium">
              ✅ Sin tarjeta de crédito • ✅ 10 validaciones gratis • ✅ Cancela cuando quieras
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* FOOTER */}
      <footer id="contacto" className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="inline-block mb-4">
                <Image
                  src="/Maflipp-recortada.png"
                  alt="Maflipp Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                  quality={100}
                />
              </Link>
              <p className="text-gray-400 text-sm">
                Plataforma profesional de validación de RFCs contra el SAT
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#precios" className="hover:text-[#2F7E7A] transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="hover:text-[#2F7E7A] transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#2F7E7A] transition-colors">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terminos" className="hover:text-[#2F7E7A] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-[#2F7E7A] transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <p className="text-gray-400 text-sm mb-4">
                ¿Tienes preguntas? Escríbenos y te responderemos pronto.
              </p>
              <form 
                id="contact-form"
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  const data = {
                    name: formData.get("name"),
                    email: formData.get("email"),
                    company: formData.get("company") || "",
                    message: formData.get("message"),
                  };

                  try {
                    setContactStatus("idle");
                    setContactMessage("");
                    const response = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });

                    const result = await response.json();

                    if (response.ok) {
                      form.reset();
                      setContactStatus("success");
                      setContactMessage(result.message || "¡Mensaje enviado! Te responderemos pronto.");
                    } else {
                      setContactStatus("error");
                      setContactMessage(result.error || "Error al enviar el mensaje. Por favor intenta de nuevo.");
                    }
                  } catch (error) {
                    setContactStatus("error");
                    setContactMessage("Error al enviar el mensaje. Por favor intenta de nuevo.");
                  }
                }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Tu nombre"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-700 text-sm"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Tu email"
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-700 text-sm"
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Empresa (opcional)"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-700 text-sm"
                />
                <textarea
                  name="message"
                  placeholder="Tu mensaje"
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-700 text-sm resize-none"
                />
                {contactStatus !== "idle" && contactMessage && (
                  <p
                    className={`text-xs mt-1 ${
                      contactStatus === "success" ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {contactMessage}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-[#2F7E7A] text-white px-4 py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-medium text-sm"
                >
                  Enviar Mensaje
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Maflipp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
