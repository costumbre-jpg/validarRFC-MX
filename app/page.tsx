"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/home/Hero";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StatsSlider from "@/components/home/StatsSlider";
import AuthModal from "@/components/auth/AuthModal";
import InstallAppLink from "@/components/layout/InstallAppLink";
import { createClient } from "@/lib/supabase/client";
import { getPlan } from "@/lib/plans";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [authRedirectTo, setAuthRedirectTo] = useState<string>("/dashboard");
  const [contactStatus, setContactStatus] = useState<"idle" | "success" | "error">("idle");
  const [contactMessage, setContactMessage] = useState<string>("");
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isPWA, setIsPWA] = useState(false);
  const [showOnlyLogin, setShowOnlyLogin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Bloquear scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const freePlan = getPlan("free");
  const proPlan = getPlan("pro");
  const businessPlan = getPlan("business");

  const openRegisterModal = (redirectTo?: string) => {
    setAuthRedirectTo(redirectTo || "/dashboard");
    setAuthModalMode("register");
    setAuthModalOpen(true);
  };

  const handleHeroValidate = () => {
    // Modo diseño: el dashboard permite entrar sin sesión.
    // Usamos plan=free para que puedas ver la plataforma por dentro y seguir diseñando.
    window.location.href = "/dashboard?plan=free";
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const slowScrollToId = (id: string, durationMs = 1100) => {
    const el = document.getElementById(id);
    if (!el) return;

    const headerOffset = 96;
    const targetY = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    const startY = window.scrollY;
    const diff = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, startY + diff * eased);
      if (t < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

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

  // Detectar si es PWA y manejar autenticación
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Múltiples métodos de detección PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isMinimalUI = window.matchMedia("(display-mode: minimal-ui)").matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isFromAndroidApp = document.referrer?.startsWith?.("android-app://");
    const isPWAParam =
      window.location.pathname.startsWith("/pwa") && searchParams.get("pwa") === "1";

    // Detección estricta: solo modos reales de PWA o la ruta /pwa con el parámetro
    const isPWAInstalled =
      isStandalone ||
      isMinimalUI ||
      isInWebAppiOS ||
      isFromAndroidApp ||
      isPWAParam;

    setIsPWA(isPWAInstalled);

    if (isPWAInstalled) {
      // Si es PWA, verificar autenticación
      const checkAuthStatus = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Usuario autenticado → redirigir al dashboard
            router.push("/dashboard");
          } else {
            // Usuario NO autenticado → mostrar solo el login
            setShowOnlyLogin(true);
            setAuthModalOpen(true);
            setAuthModalMode("login");
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          // En caso de error, mostrar login
          setShowOnlyLogin(true);
          setAuthModalOpen(true);
          setAuthModalMode("login");
        } finally {
          setCheckingAuth(false);
        }
      };

      checkAuthStatus();
    } else {
      // No es PWA, mostrar landing normal
      setCheckingAuth(false);
    }
  }, [router, supabase, searchParams]);

  // Verificar periódicamente si el usuario se autenticó en PWA
  useEffect(() => {
    if (!authModalOpen && showOnlyLogin && isPWA) {
      const checkAuthPeriodically = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            // Usuario autenticado → redirigir al dashboard
            router.push("/dashboard");
          } else {
            // Usuario NO autenticado → mantener modal abierto
            setAuthModalOpen(true);
          }
        } catch (error) {
          console.error("Error checking auth:", error);
        }
      };

      const interval = setInterval(checkAuthPeriodically, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [authModalOpen, showOnlyLogin, isPWA, supabase, router]);

  // Detectar logout exitoso
  useEffect(() => {
    if (searchParams.get("loggedOut") === "1") {
      setShowLogoutMessage(true);
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("loggedOut");
      window.history.replaceState({}, "", url.toString());
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowLogoutMessage(false);
      }, 5000);
    }
  }, [searchParams]);

  // Si es PWA y está verificando autenticación, mostrar loading
  if (checkingAuth && isPWA) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F7E7A] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si es PWA y solo debe mostrar login, ocultar landing
  if (showOnlyLogin && isPWA) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            // Permitir cerrar temporalmente, pero verificar si se autenticó
            setAuthModalOpen(false);
          }}
          initialMode={authModalMode}
          redirectTo={authRedirectTo}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-md:overflow-x-hidden" style={{ position: "relative" }}>
      {/* Mensaje de confirmación de logout */}
      {showLogoutMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#2F7E7A] to-[#1F5D59] flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Sesión cerrada exitosamente
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Tu sesión ha sido cerrada de forma segura. ¡Hasta pronto!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogoutMessage(false)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar mensaje"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGO GRANDE - Sobre el header, independiente */}
      <div
        className={`hidden md:block absolute top-2 sm:top-4 md:top-6 left-8 sm:left-12 md:left-16 z-50 transition-transform duration-300 ${
          isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <Link href="/" className="block">
          <Image
            src="/Maflipp-recortada.png"
            alt="Maflipp Logo"
            width={280}
            height={280}
            className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 object-contain"
            quality={85}
            priority
          />
        </Link>
      </div>

      {/* HEADER - Arriba */}
      <header className={`sticky top-0 z-40 bg-white pt-2 transition-transform duration-300 ${isScrolled ? "-translate-y-full" : "translate-y-0"} max-md:overflow-visible`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 max-md:overflow-visible">
          <div className="flex items-center h-16 max-md:overflow-visible">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-[#2F7E7A] transition-colors"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo Mobile - Debajo del botón hamburguesa */}
            <Link href="/" className="md:hidden ml-2">
              <Image
                src="/Maflipp-recortada.png"
                alt="Maflipp Logo"
                width={100}
                height={32}
                className="h-8 w-auto object-contain"
                quality={85}
              />
            </Link>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center flex-1 justify-center">
              <Link href="#inicio" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm lg:text-base">
                Inicio
              </Link>
              <Link href="#caracteristicas" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm lg:text-base">
                Características
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm lg:text-base">
                Precios
              </Link>
              <Link href="#api" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm lg:text-base">
                API
              </Link>
              <Link href="#contacto" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium text-sm lg:text-base">
                Contacto
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0 ml-auto">
              <button
                onClick={() => {
                  setAuthRedirectTo("/dashboard");
                  setAuthModalMode("login");
                  setAuthModalOpen(true);
                }}
                className="text-xs sm:text-sm lg:text-base text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium whitespace-nowrap"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setAuthRedirectTo("/dashboard");
                  setAuthModalMode("register");
                  setAuthModalOpen(true);
                }}
                className="bg-[#2F7E7A] text-white px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Fuera del header para que funcione correctamente */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 z-[9999] transition-opacity duration-200 ${mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        style={{ isolation: "isolate" }}
      >
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${mobileMenuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileMenuOpen(false)}
        />
        {/* Panel lateral */}
        <div
          className={`absolute top-0 left-0 h-full w-1/2 max-w-xs bg-white shadow-2xl border-r border-gray-200 overflow-y-auto transition-transform duration-200 ease-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <nav className="flex flex-col space-y-2 p-4 pt-4">
            <div className="flex justify-between items-center mb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Image
                  src="/Maflipp-recortada.png"
                  alt="Maflipp Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain"
                  quality={85}
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Cerrar menú"
                className="p-2 text-gray-600 hover:text-[#2F7E7A]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Link href="#inicio" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Inicio
            </Link>
            <Link href="#caracteristicas" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Características
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Precios
            </Link>
            <Link href="#api" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              API
            </Link>
            <Link href="#contacto" className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
              Contacto
            </Link>
          </nav>
        </div>
      </div>

      {/* HERO SECTION */}
      <ScrollReveal direction="up" delay={0} duration={1.2}>
        <Hero
          onValidateClick={() => {
            handleHeroValidate();
          }}
        />
      </ScrollReveal>

      {/* ESTADÍSTICAS CON SCROLL INFINITO */}
      <StatsSlider />

      {/* PARA QUIÉN ES */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Para Quién Es Maflipp
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-base max-md:text-sm sm:text-lg text-gray-700 max-w-4xl mx-auto mb-4 max-md:mb-3 font-medium leading-relaxed">
              Plataforma diseñada para profesionales y empresas que necesitan validar documentos fiscales y legales de forma confiable
            </p>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Maflipp es la solución ideal para contadores, empresas, fintechs y desarrolladores que buscan automatizar y optimizar sus procesos de validación fiscal. Nuestra plataforma se integra perfectamente con tus flujos de trabajo existentes, ahorrando tiempo y reduciendo errores humanos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-md:gap-4 lg:gap-10">
            <ScrollReveal direction="left" delay={0.1}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl max-md:text-lg lg:text-2xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Contadores Públicos</h3>
                <p className="text-gray-700 mb-3 max-md:mb-2 text-sm max-md:text-xs leading-relaxed font-normal">
                  Valida RFCs de clientes y proveedores antes de emitir facturas. Ahorra horas de trabajo manual y reduce errores en tu contabilidad.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  Ideal para despachos contables que manejan múltiples clientes. Valida cientos de RFCs en minutos, genera reportes automáticos y mantén un historial completo de todas tus validaciones para auditorías.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 max-md:gap-1.5 text-[#2F7E7A] font-semibold text-sm max-md:text-xs sm:text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={0.2}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="text-xl max-md:text-lg lg:text-2xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Empresas</h3>
                <p className="text-gray-700 mb-3 max-md:mb-2 text-sm max-md:text-xs leading-relaxed font-normal">
                  Verifica que tus proveedores existan realmente antes de hacer negocios. Reduce riesgos fiscales y protege tu empresa de fraudes.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  Perfecto para departamentos de compras y finanzas. Valida proveedores antes de realizar pagos, cumple con requisitos de compliance y mantén registros detallados para auditorías internas y externas.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 max-md:gap-1.5 text-[#2F7E7A] font-semibold text-sm max-md:text-xs sm:text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.1}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl max-md:text-lg lg:text-2xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Fintechs</h3>
                <p className="text-gray-700 mb-3 max-md:mb-2 text-sm max-md:text-xs leading-relaxed font-normal">
                  Integra validación automática en tu onboarding. Cumple con KYC y reduce fraude en tus procesos de verificación de clientes.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  Solución perfecta para plataformas financieras que necesitan validar la identidad fiscal de sus usuarios. Integra nuestra API en tu flujo de onboarding para validaciones automáticas en tiempo real y cumplimiento regulatorio.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 max-md:gap-1.5 text-[#2F7E7A] font-semibold text-sm max-md:text-xs sm:text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
                <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <h3 className="text-xl max-md:text-lg lg:text-2xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Desarrolladores</h3>
                <p className="text-gray-700 mb-3 max-md:mb-2 text-sm max-md:text-xs leading-relaxed font-normal">
                  API RESTful para integrar validación de RFCs en tus aplicaciones. Documentación completa con ejemplos de código en múltiples lenguajes.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  API moderna y fácil de usar con endpoints bien documentados. Incluye SDKs, ejemplos de integración, webhooks para notificaciones y soporte técnico dedicado para ayudarte a implementar rápidamente.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 max-md:gap-1.5 text-[#2F7E7A] font-semibold text-sm max-md:text-xs sm:text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Comenzar Gratis
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* BENEFICIOS */}
      <ScrollReveal direction="up">
        <section id="caracteristicas" className="py-28 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white relative overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              ¿Por Qué Elegir Maflipp?
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-700 max-w-4xl mx-auto mb-4 max-md:mb-3 font-normal">
              La plataforma más confiable para validación y auditoría de documentos fiscales en México
            </p>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Con Maflipp obtienes acceso directo al padrón del SAT, resultados instantáneos y un sistema robusto diseñado para empresas que requieren precisión y confiabilidad en sus operaciones fiscales diarias.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-md:gap-4 lg:gap-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Validación Instantánea</h3>
              <p className="text-gray-600 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Consulta directa al padrón del SAT típicamente en menos de 2 segundos. Sin esperas, sin demoras.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                Nuestra infraestructura optimizada garantiza respuestas rápidas incluso durante horas pico. Procesa cientos de validaciones simultáneas sin comprometer la velocidad.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">100% Precisión</h3>
              <p className="text-gray-600 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Datos directamente del SAT. Elimina errores humanos y garantiza información confiable.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                Consultamos directamente el padrón oficial del SAT, asegurando que cada validación refleje el estado actual del contribuyente. Sin intermediarios, sin interpretaciones.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Ahorra Tiempo</h3>
              <p className="text-gray-700 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Reduce de horas a segundos. Valida cientos de RFCs en minutos, no en días.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                Automatiza tus procesos de validación y libera tiempo para tareas de mayor valor. Un contador puede validar 50 RFCs en menos de 2 minutos, lo que antes tomaba horas.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Seguro y Confiable</h3>
              <p className="text-gray-700 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Encriptación SSL, cumplimiento con normativas fiscales mexicanas y protección de datos.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                Cumplimos con los más altos estándares de seguridad. Todas las comunicaciones están encriptadas y seguimos las mejores prácticas de protección de datos personales.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">Historial Completo</h3>
              <p className="text-gray-700 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Guarda y exporta todas tus validaciones. Genera reportes para auditorías y compliance.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                Mantén un registro completo de todas tus validaciones con timestamps, resultados y detalles. Exporta a CSV o Excel para análisis y presentaciones profesionales.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 lg:p-7 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation group">
              <svg className="w-10 h-10 max-md:w-7 max-md:h-7 text-[#2F7E7A] mb-5 max-md:mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">API Completa</h3>
              <p className="text-gray-700 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                Integra validación de RFCs en tus sistemas. RESTful API con documentación completa.
              </p>
              <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                API RESTful moderna con autenticación por API keys, rate limiting configurable, webhooks para notificaciones y soporte para múltiples lenguajes de programación.
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CÓMO FUNCIONA */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Cómo Funciona
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-3xl mx-auto font-normal">
              Tres pasos simples para validar cualquier RFC en segundos
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-10 max-md:gap-4 lg:gap-12">
            {/* Paso 1 */}
            <ScrollReveal direction="left" delay={0.1}>
              <div className="text-center bg-white rounded-2xl p-6 max-md:p-4 lg:p-7 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">
                  Ingresa el RFC
                </h3>
                <p className="text-gray-600 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                  Escribe o pega el RFC que deseas validar en nuestro sistema. Acepta RFCs de personas físicas y morales en cualquier formato.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  Nuestro sistema valida automáticamente el formato del RFC y te indica si es válido antes de realizar la consulta al SAT.
                </p>
                <button
                  type="button"
                  onClick={() => openRegisterModal()}
                  className="inline-flex items-center gap-2 max-md:gap-1.5 text-[#2F7E7A] font-semibold text-sm max-md:text-xs sm:text-base hover:text-[#1F5D59] hover:gap-3 transition-all group/link"
                >
                  Probar Ahora
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </ScrollReveal>

            {/* Paso 2 */}
            <ScrollReveal direction="up" delay={0.2}>
              <div className="text-center bg-white rounded-2xl p-6 max-md:p-4 lg:p-7 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">
                  Consultamos el SAT en tiempo real
                </h3>
                <p className="text-gray-600 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                  Nuestro sistema consulta directamente el padrón del SAT para obtener la información más actualizada disponible.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 leading-relaxed">
                  Utilizamos conexiones optimizadas y caché inteligente para garantizar respuestas rápidas sin comprometer la precisión de los datos.
                </p>
              </div>
            </ScrollReveal>

            {/* Paso 3 */}
            <ScrollReveal direction="right" delay={0.3}>
              <div className="text-center bg-white rounded-2xl p-6 max-md:p-4 lg:p-7 border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <h3 className="text-lg max-md:text-base lg:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2 group-hover:text-[#2F7E7A] transition-colors">
                  Recibe resultado instantáneo
                </h3>
                <p className="text-gray-600 mb-2 max-md:mb-1.5 text-sm max-md:text-xs leading-relaxed font-normal">
                  Obtén la respuesta típicamente en menos de 2 segundos con el estado del RFC en el SAT (válido/inválido) y un mensaje de verificación.
                </p>
                <p className="text-xs max-md:text-[10px] text-gray-600 mb-5 max-md:mb-3 leading-relaxed">
                  En planes Pro y Business, tus validaciones se guardan en tu historial y puedes exportarlas para reportes y auditorías.
                </p>
                <div className="text-center mt-6 max-md:mt-4">
                  <button
                    type="button"
                    onClick={() => openRegisterModal()}
                    className="inline-flex items-center gap-2 max-md:gap-1.5 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] text-white px-6 max-md:px-4 py-3 max-md:py-2 sm:px-8 sm:py-4 rounded-xl hover:from-[#1F5D59] hover:to-[#2F7E7A] transition-all font-semibold text-base max-md:text-sm sm:text-lg shadow-xl hover:shadow-2xl hover:scale-105 group/cta"
                  >
                    Comenzar Gratis Ahora
                    <svg className="w-6 h-6 max-md:w-4 max-md:h-4 group-hover/cta:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* VISTA PREVIA DEL DASHBOARD */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 max-md:mb-10">
              <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
                Dashboard Intuitivo
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
              </h2>
              <p className="text-base max-md:text-sm sm:text-lg text-gray-700 max-w-4xl mx-auto mb-4 max-md:mb-3 font-normal">
                Gestiona todas tus validaciones desde un panel de control moderno, claro y fácil de usar.
              </p>
              <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto leading-relaxed">
                En el plan Free puedes validar RFCs y ver estadísticas básicas de uso; en Pro y Business obtienes historial y exportación, además de dashboards avanzados con gráficos y tendencias.
              </p>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
              <div className="relative w-full h-[380px] max-md:h-[320px] md:h-[460px] bg-gray-100 flex items-center justify-center">
                <Image
                  src="/dashboard actualizado.png"
                  alt="Dashboard plan Free de Maflipp"
                  fill
                  className="object-contain max-md:object-contain"
                  sizes="(max-width: 768px) 100vw, 1200px"
                  quality={100}
                  priority
                  style={{
                    imageRendering: 'auto'
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* PLANES DE PRECIOS */}
      <ScrollReveal direction="up">
        <section id="precios" className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Planes de Precios
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-3xl mx-auto font-normal">
              Elige el plan perfecto para tu negocio
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-md:gap-4 lg:gap-6">
            {/* Plan FREE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation">
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-1">FREE</h3>
              <div className="mb-4 max-md:mb-3">
                <span className="text-3xl max-md:text-2xl font-semibold text-gray-900">${freePlan.monthlyPrice.toLocaleString()}</span>
                <span className="text-gray-600 max-md:text-sm"> MXN/mes</span>
              </div>
              <ul className="space-y-2 max-md:space-y-1.5 mb-6 max-md:mb-4 text-sm max-md:text-xs">
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">{freePlan.validationsPerMonth.toLocaleString()} validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Resultados básicos (válido/inválido)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Estadísticas básicas de uso</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">1 usuario</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Soporte: FAQs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Límite: {freePlan.validationsPerMonth.toLocaleString()} validaciones/mes</span>
                </li>
                <li className="flex items-start pt-2 max-md:pt-1.5 border-t border-gray-200">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400 mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin historial de validaciones</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400 mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin exportación de datos</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400 mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-500">Sin acceso a API</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  openRegisterModal("/dashboard");
                }}
                className="w-full bg-gray-100 text-gray-900 py-2.5 max-md:py-2 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm max-md:text-xs"
              >
                Comenzar Gratis
              </button>
            </div>

            {/* Plan PRO - DESTACADO */}
            <div className="bg-white border-2 border-[#2F7E7A] rounded-2xl p-6 max-md:p-4 shadow-md relative transform scale-105 max-md:scale-100 hover:scale-105 max-md:hover:scale-100 hover:-translate-y-1 active:scale-100 transition-all duration-300 cursor-pointer touch-manipulation">
              <div className="absolute -top-4 max-md:-top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#2F7E7A] text-white px-4 max-md:px-3 py-1 max-md:py-0.5 rounded-full text-sm max-md:text-xs font-semibold shadow-lg">
                  MÁS POPULAR
                </span>
              </div>
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-1">PRO</h3>
              <div className="mb-4 max-md:mb-3">
                <span className="text-3xl max-md:text-2xl font-semibold text-gray-900">${proPlan.monthlyPrice.toLocaleString()}</span>
                <span className="text-gray-600 max-md:text-sm"> MXN/mes</span>
              </div>
              <ul className="space-y-2.5 max-md:space-y-1.5 mb-6 max-md:mb-4 text-sm max-md:text-xs">
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{proPlan.validationsPerMonth.toLocaleString()} validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Historial ilimitado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Exportar a {(proPlan.features.exportFormats || ["CSV", "Excel"]).join("/")}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API {typeof proPlan.features.api === "string" ? proPlan.features.api : "Básica"}: {(proPlan.features.apiCallsPerMonth || 0).toLocaleString()} llamadas/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{proPlan.features.users} usuarios en equipo</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dashboard avanzado con gráficos y estadísticas detalladas</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Alertas por email</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Soporte: {proPlan.features.support}</span>
                </li>
              </ul>
              <button
                onClick={() => {
                  // Inicia la prueba de 7 días: después de registrarse/login, abre facturación y dispara Stripe Checkout
                  openRegisterModal("/dashboard/billing?plan=pro&autocheckout=1");
                }}
                className="w-full bg-[#2F7E7A] text-white py-2.5 max-md:py-2 rounded-lg font-semibold hover:bg-[#1F5D59] transition-colors shadow-lg hover:shadow-xl text-sm max-md:text-xs"
              >
                Probar Pro 7 Días
              </button>
              <p className="mt-3 max-md:mt-2 text-[11px] max-md:text-[10px] text-gray-500 text-center leading-relaxed">
                7 días gratis. Se solicita método de pago (Stripe) pero no se cobra durante la prueba.
                Puedes cancelar desde tu dashboard.
              </p>
            </div>

            {/* Plan BUSINESS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 max-md:p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-98 transition-all duration-300 cursor-pointer touch-manipulation">
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-1">BUSINESS</h3>
              <div className="mb-4 max-md:mb-3">
                <span className="text-3xl max-md:text-2xl font-semibold text-gray-900">${businessPlan.monthlyPrice.toLocaleString()}</span>
                <span className="text-gray-600 max-md:text-sm"> MXN/mes</span>
              </div>
              <ul className="space-y-2.5 max-md:space-y-1.5 mb-6 max-md:mb-4 text-sm max-md:text-xs">
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">{businessPlan.validationsPerMonth.toLocaleString()} validaciones/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Historial ilimitado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Exportar a {(businessPlan.features.exportFormats || ["CSV", "Excel", "PDF"]).join("/")}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">API {typeof businessPlan.features.api === "string" ? businessPlan.features.api : "Completa"}: {(businessPlan.features.apiCallsPerMonth || 0).toLocaleString()} llamadas/mes</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Usuarios {businessPlan.features.users === -1 ? "ilimitados" : businessPlan.features.users}</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">White-label</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">SSO (Single Sign-On)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Dashboard Analytics completo: análisis por hora, comparación año anterior, predicciones y reportes PDF</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Onboarding personalizado</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
              <button
                onClick={() => slowScrollToId("contacto", 1200)}
                className="w-full bg-gray-900 text-white py-2.5 max-md:py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm max-md:text-xs"
              >
                Contactar Ventas
              </button>
            </div>
          </div>
          <div className="mt-6 max-md:mt-4 text-center">
            <Link
              href="/pricing#comparativa"
              className="text-xs max-md:text-[10px] sm:text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors underline underline-offset-4 decoration-blue-200 hover:decoration-blue-400"
            >
              Comparar planes (tabla completa)
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CASOS DE USO DETALLADOS */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Casos de Uso Reales
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto font-normal">
              Descubre cómo empresas y profesionales pueden optimizar sus procesos con Maflipp
            </p>
          </div>
          <div className="space-y-8 max-md:space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 max-md:p-4 md:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8 max-md:gap-6 items-center">
                <div>
                  <div className="inline-block bg-[#2F7E7A] text-white px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-[11px] max-md:text-[10px] sm:text-xs font-semibold mb-4 max-md:mb-3">
                    CASO DE USO #1
                  </div>
                  <h3 className="text-lg max-md:text-base sm:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2">
                    Contador Valida 50+ RFCs Mensuales
                  </h3>
                  <p className="text-sm max-md:text-xs text-gray-600 mb-3 max-md:mb-2">
                    Un contador público valida RFCs de clientes y proveedores antes de emitir facturas. 
                    Antes usaba el portal del SAT manualmente, tardando 5 minutos por RFC.
                  </p>
                  <div className="space-y-2 max-md:space-y-1.5">
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Ahorra 4 horas/semana en validaciones</span>
                    </div>
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Reduce errores en facturación significativamente</span>
                    </div>
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>ROI positivo en los primeros meses</span>
                    </div>
                  </div>
                  <div className="mt-6 max-md:mt-4">
                    <button
                      type="button"
                      onClick={() => openRegisterModal()}
                      className="inline-block bg-[#2F7E7A] text-white px-5 max-md:px-4 py-2.5 max-md:py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs"
                    >
                      Comenzar Gratis
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-5 max-md:p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-center">
                    <div className="text-3xl max-md:text-2xl sm:text-4xl font-semibold text-[#2F7E7A] mb-1">4h</div>
                    <div className="text-xs max-md:text-[10px] sm:text-sm text-gray-600 mb-3 max-md:mb-2">Ahorradas por semana</div>
                    <div className="text-xl max-md:text-lg sm:text-2xl font-semibold text-gray-900 mb-1">$2,000</div>
                    <div className="text-xs max-md:text-[10px] sm:text-sm text-gray-600">Valor del tiempo ahorrado/mes</div>
                  </div>
                </div>
              </div>
            </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 max-md:p-4 md:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
              <div className="grid md:grid-cols-2 gap-8 max-md:gap-6 items-center">
                <div className="order-2 md:order-1">
                  <div className="bg-white rounded-xl p-5 max-md:p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="text-center">
                      <div className="text-3xl max-md:text-2xl sm:text-4xl font-semibold text-[#2F7E7A] mb-1">100%</div>
                      <div className="text-xs max-md:text-[10px] sm:text-sm text-gray-600 mb-3 max-md:mb-2">Precisión en validaciones</div>
                      <div className="text-xl max-md:text-lg sm:text-2xl font-semibold text-gray-900 mb-1">0</div>
                      <div className="text-xs max-md:text-[10px] sm:text-sm text-gray-600">Errores desde implementación</div>
                    </div>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="inline-block bg-[#2F7E7A] text-white px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-[11px] max-md:text-[10px] sm:text-xs font-semibold mb-4 max-md:mb-3">
                    CASO DE USO #2
                  </div>
                  <h3 className="text-lg max-md:text-base sm:text-xl font-semibold text-gray-900 mb-3 max-md:mb-2">
                    Fintech Valida Clientes en Onboarding
                  </h3>
                  <p className="text-sm max-md:text-xs text-gray-600 mb-3 max-md:mb-2">
                    Una fintech integra nuestra API para validar RFCs automáticamente durante el proceso 
                    de onboarding de nuevos clientes empresariales.
                  </p>
                  <div className="space-y-2 max-md:space-y-1.5">
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Validación automática en segundos</span>
                    </div>
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Apoya tus procesos de KYC/compliance</span>
                    </div>
                    <div className="flex items-center text-sm max-md:text-xs text-gray-600">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-[#2F7E7A] mr-2 max-md:mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Reduce fraude y mejora conversión</span>
                    </div>
                  </div>
                  <div className="mt-6 max-md:mt-4">
                    <button
                      type="button"
                      onClick={() => openRegisterModal()}
                      className="inline-block bg-[#2F7E7A] text-white px-5 max-md:px-4 py-2.5 max-md:py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs"
                    >
                      Comenzar Gratis
                    </button>
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
        <section id="api" className="py-24 max-md:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              API e Integraciones
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto font-normal">
              Integra validación de RFCs en tus sistemas con nuestra API RESTful completa
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-md:gap-6 items-center">
            <div>
              <div className="bg-white rounded-xl p-8 max-md:p-5 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="flex items-center mb-5 max-md:mb-4">
                  <svg className="w-8 h-8 max-md:w-6 max-md:h-6 text-[#2F7E7A] mr-4 max-md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h3 className="text-xl max-md:text-lg font-semibold text-gray-900">API RESTful</h3>
                </div>
                <ul className="space-y-3 max-md:space-y-2 mb-6 max-md:mb-4 text-sm max-md:text-xs">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Respuesta típicamente en menos de 2 segundos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Autenticación con API Keys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Documentación completa con ejemplos</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Soporte para webhooks</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-[#2F7E7A] mr-2 max-md:mr-1.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Rate limiting configurable</span>
                  </li>
                </ul>
                <Link
                  href="/developers?from=landing"
                  className="inline-flex items-center text-[#2F7E7A] font-semibold max-md:text-sm hover:text-[#1F5D59] transition-colors"
                >
                  Ver Documentación Completa
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 ml-2 max-md:ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div>
              <div className="bg-gray-900 rounded-xl p-6 max-md:p-4 overflow-hidden">
                <div className="flex items-center mb-4 max-md:mb-3">
                  <div className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 bg-red-500 rounded-full mr-2 max-md:mr-1.5"></div>
                  <div className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 bg-yellow-500 rounded-full mr-2 max-md:mr-1.5"></div>
                  <div className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 bg-green-500 rounded-full"></div>
                </div>
                <pre className="text-green-400 text-sm max-md:text-xs font-mono">
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
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Seguridad y Compliance
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto font-normal">
              Cumplimos con los más altos estándares de seguridad y normativas fiscales mexicanas
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-md:gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-8 max-md:p-5 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-3 max-md:mb-2">Encriptación SSL/TLS</h3>
              <p className="text-sm max-md:text-xs text-gray-600">
                Todas las comunicaciones están encriptadas. Tus datos están protegidos en tránsito y en reposo.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 max-md:p-5 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-3 max-md:mb-2">Cumplimiento Legal</h3>
              <p className="text-sm max-md:text-xs text-gray-600">
                Consultamos únicamente información pública del SAT. Totalmente legal y conforme a normativas mexicanas.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-8 max-md:p-5 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-3 max-md:mb-2">Privacidad de Datos</h3>
              <p className="text-sm max-md:text-xs text-gray-600">
                No almacenamos información sensible. Solo procesamos RFCs para validación y generamos reportes anónimos.
              </p>
            </div>
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* COMPARACIÓN */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 max-md:mb-10">
            <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 mb-5 max-md:mb-3 relative inline-block tracking-tight">
              Maflipp vs Métodos Tradicionales
              <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
            </h2>
            <p className="text-sm max-md:text-xs sm:text-base text-gray-600 max-w-4xl mx-auto font-normal">
              Compara cómo Maflipp supera a los métodos manuales de validación
            </p>
          </div>
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-left text-xs max-md:text-[11px] sm:text-sm font-semibold text-gray-900">Característica</th>
                    <th className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-center text-xs max-md:text-[11px] sm:text-sm font-semibold text-gray-900">Método Manual</th>
                    <th className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-center text-xs max-md:text-[11px] sm:text-sm font-semibold text-[#2F7E7A] bg-blue-50">Maflipp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Tiempo por validación</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">3-5 minutos</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">Menos de 2 segundos (típicamente)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Precisión</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">Riesgo de error humano</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">100% preciso</td>
                  </tr>
                  <tr>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Historial</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">Manual, propenso a pérdidas</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">Automático e ilimitado</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Exportación</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">Copiar/pegar manual</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">CSV/Excel con un click</td>
                  </tr>
                  <tr>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Integración</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">No disponible</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">API RESTful completa</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-900 font-medium">Costo por 100 validaciones</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-gray-600 text-center">$2,000 - $5,000 MXN (tiempo)</td>
                    <td className="px-4 max-md:px-2 sm:px-6 py-3 max-md:py-2 sm:py-4 text-xs max-md:text-[11px] sm:text-sm text-[#2F7E7A] font-semibold text-center">Desde $299 MXN/mes</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-6 max-md:mt-4 text-xs max-md:text-[10px] text-gray-500 text-center italic px-4 max-md:px-3">
              * Estimaciones aproximadas según uso típico. Los tiempos y costos pueden variar según el volumen y el proceso de cada empresa.
            </p>
          </div>
        </div>
      </section>
      </ScrollReveal>


      {/* FAQ */}
      <ScrollReveal direction="up">
        <section className="py-24 max-md:py-12 bg-gradient-to-br from-white via-gray-50/30 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl max-md:text-xl sm:text-3xl lg:text-4xl font-semibold text-center text-gray-900 mb-16 max-md:mb-10 tracking-tight relative inline-block w-full">
            Preguntas Frecuentes
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59] rounded-full"></span>
          </h2>
          <div className="space-y-6 max-md:space-y-3">
            {[
              {
                question: "¿Es legal consultar el SAT?",
                answer: "Sí, es completamente legal. Consultamos el padrón de contribuyentes del SAT que es información pública. Nuestro servicio está diseñado para ayudar a empresas y contadores a verificar la validez de RFCs de manera eficiente."
              },
              {
                question: "¿Qué métodos de pago aceptan?",
                answer: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, American Express) a través de Stripe. También ofrecemos facturación para planes empresariales."
              },
              {
                question: "¿Puedo cancelar cuando quiera?",
                answer: "Sí, puedes cancelar tu suscripción en cualquier momento desde tu panel de control. No hay contratos de permanencia ni penalizaciones por cancelación."
              },
              {
                question: "¿Cómo funcionan las validaciones gratis?",
                answer: "El plan gratuito incluye 10 validaciones por mes sin necesidad de tarjeta de crédito. Las validaciones se renuevan cada mes. Si necesitas más, puedes actualizar a un plan de pago en cualquier momento."
              }
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Header - Clickable en móvil */}
                <div 
                  className="p-6 max-md:p-4 max-md:cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg max-md:text-base font-semibold text-gray-900 md:mb-2 flex-1">
                      {faq.question}
                    </h3>
                    {/* Flecha solo visible en móvil */}
                    <button
                      type="button"
                      className="md:hidden flex-shrink-0 text-gray-400 hover:text-gray-600 transition-transform duration-200"
                      style={{
                        transform: openFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFaq(index);
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {/* Respuesta - Siempre visible en desktop */}
                  <div className="mt-2 md:block hidden">
                    <p className="text-sm text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                {/* Respuesta colapsable - Solo móvil */}
                <div 
                  className={`px-6 max-md:px-4 pb-6 max-md:pb-4 md:hidden transition-all duration-300 overflow-hidden ${
                    openFaqIndex === index ? 'block' : 'hidden'
                  }`}
                >
                  <p className="text-sm max-md:text-xs text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* CTA FINAL */}
      <ScrollReveal direction="up">
        <section className="py-28 bg-gradient-to-r from-[#2F7E7A] via-[#1F5D59] to-[#2F7E7A] relative overflow-hidden">
          {/* Imagen de fondo */}
          <div className="absolute inset-0 z-0 opacity-25">
            <Image
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&h=1080&fit=crop&q=80"
              alt="Background - Documentos y oficina"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50 z-0"></div>
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-6 tracking-tight drop-shadow-2xl">
              ¿Listo para validar RFCs en segundos?
            </h2>
            <p className="text-sm sm:text-base text-blue-100 mb-8 max-w-3xl mx-auto font-normal drop-shadow-lg">
              Empieza a ahorrar horas de trabajo manual con Maflipp
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <button
                type="button"
                onClick={() => openRegisterModal()}
                className="bg-white text-[#2F7E7A] px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                Comenzar Gratis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <Link
                href="/#precios"
                className="bg-transparent border-2 border-white text-white px-7 py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-white/15 transition-colors shadow-md hover:shadow-lg inline-flex items-center gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  slowScrollToId("precios", 1200);
                }}
              >
                Ver Planes y Precios
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <p className="text-blue-100 text-sm sm:text-base mt-8 font-medium flex flex-wrap justify-center gap-8 sm:gap-16">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span>Sin tarjeta de crédito</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span>10 validaciones gratis</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                <span>Cancela cuando quieras</span>
              </span>
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
                  quality={85}
                />
              </Link>
              <p className="text-gray-400 text-sm">
                Plataforma profesional de validación de RFCs contra el SAT
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 text-sm mb-4">Producto</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#precios" className="text-gray-400 text-sm hover:text-[#2F7E7A] transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#api" className="text-gray-400 text-sm hover:text-[#2F7E7A] transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-gray-400 text-sm hover:text-[#2F7E7A] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <InstallAppLink />
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 text-sm mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/terminos" className="text-gray-400 text-sm hover:text-[#2F7E7A] transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="text-gray-400 text-sm hover:text-[#2F7E7A] transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200 text-sm mb-4">Contacto</h4>
              <p className="text-gray-400 text-sm mb-2">
                ¿Tienes preguntas? Escríbenos y te responderemos pronto.
              </p>
              <p className="text-gray-400 text-sm mb-4">
                O escríbenos a{" "}
                <a
                  href="mailto:soporte@maflipp.com"
                  className="text-[#2F7E7A] hover:underline"
                >
                  soporte@maflipp.com
                </a>
                .
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
                      window.setTimeout(() => {
                        setContactStatus("idle");
                        setContactMessage("");
                      }, 5000);
                    } else {
                      setContactStatus("error");
                      setContactMessage(result.error || "Error al enviar el mensaje. Por favor intenta de nuevo.");
                      window.setTimeout(() => {
                        setContactStatus("idle");
                        setContactMessage("");
                      }, 5000);
                    }
                  } catch (error) {
                    setContactStatus("error");
                    setContactMessage("Error al enviar el mensaje. Por favor intenta de nuevo.");
                    window.setTimeout(() => {
                      setContactStatus("idle");
                      setContactMessage("");
                    }, 5000);
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
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-gray-700 text-sm resize-none"
                />
                {contactStatus !== "idle" && contactMessage && (
                  <div
                    className={`mt-3 rounded-lg px-4 py-3 text-sm leading-relaxed ${
                      contactStatus === "success"
                        ? "bg-green-900/25 text-green-200 border border-green-600/60"
                        : "bg-red-900/25 text-red-200 border border-red-600/60"
                    }`}
                  >
                    {contactMessage}
                  </div>
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
            <p className="text-xs sm:text-sm">© {new Date().getFullYear()} Maflipp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
        redirectTo={authRedirectTo}
      />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </>
  );
}
