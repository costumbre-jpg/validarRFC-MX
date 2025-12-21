"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type HeroProps = {
  onValidateClick?: () => void;
};

type FeatureCard = {
  eyebrow: string;
  title: string;
  description: string;
  statLeft: { value: string; label: string };
  statRight: { value: string; label: string };
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduced(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function CardStackCarousel({
  cards,
  intervalMs = 2000,
}: {
  cards: FeatureCard[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Rotación simple solo en desktop: 0 -> 1 -> 2 -> ...
  useEffect(() => {
    if (cards.length <= 1 || isMobile || prefersReducedMotion) return;

    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [cards.length, intervalMs, prefersReducedMotion, isMobile]);

  // Scroll a la tarjeta activa en móvil
  useEffect(() => {
    if (!isMobile) return;
    
    const scrollToActive = () => {
      const cardWidth = 180;
      const gap = 12;
      const padding = 16;
      const scrollPosition = padding + active * (cardWidth + gap);
      
      const container = document.querySelector('[data-carousel-container]') as HTMLElement;
      if (container) {
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    };
    
    // Pequeño delay para asegurar que el DOM esté listo
    const timeoutId = setTimeout(scrollToActive, 100);
    return () => clearTimeout(timeoutId);
  }, [active, isMobile]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((prev) => {
      const newIndex = (prev - 1 + cards.length) % cards.length;
      return newIndex;
    });
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActive((prev) => {
      const newIndex = (prev + 1) % cards.length;
      return newIndex;
    });
  };

  const getPos = (index: number) => {
    // En escritorio: carrusel con left/center/right (solo 3 visibles)
    // En móvil: todas las tarjetas visibles en fila
    const leftIndex = (active - 1 + cards.length) % cards.length;
    const rightIndex = (active + 1) % cards.length;
    // En móvil, todas las tarjetas son "mobile-visible"
    // En escritorio, solo left, center, right
    if (index === active) return "center";
    if (index === leftIndex) return "left";
    if (index === rightIndex) return "right";
    // Las demás tarjetas solo visibles en móvil
    return "mobile-visible";
  };

  const styleFor = (pos: "left" | "center" | "right" | "hidden" | "mobile-visible", index: number) => {
    // En móvil, todas las tarjetas usan el mismo posicionamiento horizontal
    const cardWidth = 180; // Ancho más pequeño en móvil (debe coincidir con CSS)
    const gap = 12;
    const padding = 16; // Padding lateral
    const mobileOffset = padding + index * (cardWidth + gap);
    
    // Estilo para escritorio: carrusel 3D
    const X = 150;
    if (pos === "center") {
      return {
        transform: `translateX(${mobileOffset}px) translateY(0px) scale(1)`,
        opacity: 1,
        zIndex: 30,
        filter: "none",
        '--desktop-transform': 'translateX(0px) translateY(0px) scale(1)',
      } as any;
    }
    if (pos === "left") {
      return {
        transform: `translateX(${mobileOffset}px) translateY(0px) scale(1)`,
        opacity: 1,
        zIndex: 20,
        filter: "saturate(0.9)",
        '--desktop-transform': `translateX(-${X}px) translateY(10px) scale(0.88)`,
      } as any;
    }
    if (pos === "right") {
      return {
        transform: `translateX(${mobileOffset}px) translateY(0px) scale(1)`,
        opacity: 1,
        zIndex: 20,
        filter: "saturate(0.9)",
        '--desktop-transform': `translateX(${X}px) translateY(10px) scale(0.88)`,
      } as any;
    }
    if (pos === "mobile-visible") {
      return {
        transform: `translateX(${mobileOffset}px) translateY(0px) scale(1)`,
        opacity: 1,
        zIndex: 10,
        filter: "none",
      } as any;
    }
    return {
      transform: "translateX(0px) translateY(18px) scale(0.86)",
      opacity: 0,
      zIndex: 0,
      filter: "blur(2px)",
      pointerEvents: "none",
    } as any;
  };

  const hasThree = cards.length >= 3;
  const visibleCards = useMemo(() => {
    // En móvil, mostrar todas las tarjetas
    // En escritorio, solo mostrar 3 (left, center, right)
    if (!hasThree) return cards.map((_, i) => i);
    const leftIndex = (active - 1 + cards.length) % cards.length;
    const rightIndex = (active + 1) % cards.length;
    // Para móvil, retornar todas las tarjetas; la lógica de desktop se maneja con getPos
    return cards.map((_, i) => i);
  }, [active, cards, hasThree]);

  return (
    <div
      className="relative h-[280px] xs:h-[320px] sm:h-[360px] md:h-[390px] lg:h-[450px] w-full max-w-[90vw] xs:max-w-[380px] sm:max-w-[480px] md:max-w-[520px] lg:max-w-[560px] mx-auto lg:mx-0 max-md:z-0"
    >
      {/* Contenedor con scroll solo en móvil */}
      <div
        className="h-full w-full overflow-hidden lg:overflow-visible max-md:overflow-x-auto max-md:overflow-y-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative"
        data-carousel-container
      >
        <div className="max-md:inline-block max-md:w-[596px] max-md:h-full max-md:relative lg:block lg:w-full lg:relative">
      {cards.map((card, idx) => {
        const pos = getPos(idx);
        const s = styleFor(pos, idx);
        const isCenter = pos === "center";
        const isVisible = visibleCards.includes(idx);

        return (
          <div
            key={`${card.title}-${idx}`}
            data-pos={pos}
            className={`hero-card absolute top-0 rounded-2xl border border-gray-200 bg-white transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isCenter ? "shadow-md lg:shadow" : "shadow-sm"
            } ${
              pos === "mobile-visible" ? "lg:hidden max-md:left-0 max-md:scroll-snap-align-start" : pos === "hidden" ? "max-md:hidden left-1/2 -translate-x-1/2" : "max-md:left-0 max-md:scroll-snap-align-start lg:left-1/2 lg:-translate-x-1/2"
            }`}
            // eslint-disable-next-line react-perf/jsx-no-new-object-as-prop
            style={{
              ...(prefersReducedMotion ? {} : s),
              width: "240px",
              height: "370px",
            }}
            aria-hidden={!isCenter && pos !== "mobile-visible"}
          >
            <div className="p-3 sm:p-4 md:p-5 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-semibold text-[#2F7E7A] bg-[#2F7E7A]/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                  <span className="h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full bg-[#2F7E7A]" />
                  {card.eyebrow}
                </div>
                <h3 className="mt-2 sm:mt-3 md:mt-4 text-sm sm:text-base font-semibold text-gray-900 tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                  {card.description}
                </p>
                {/* Texto adicional solo para escritorio */}
                <p className="hidden lg:block mt-3 text-xs text-gray-500 leading-relaxed">
                  {idx === 0 && "Obtén información detallada del padrón oficial en tiempo real, incluyendo régimen fiscal y fecha de alta del contribuyente. Ideal para procesos de verificación y cumplimiento normativo."}
                  {idx === 1 && "Exporta tus validaciones en múltiples formatos y mantén un registro completo de todas tus consultas. Perfecto para auditorías, reportes gerenciales y análisis de cumplimiento fiscal."}
                  {idx === 2 && "Conecta fácilmente con tus sistemas existentes mediante endpoints REST. Incluye documentación completa, ejemplos de código y soporte técnico para una integración rápida y sin complicaciones."}
                </p>
              </div>

              <div className="mt-3 sm:mt-4 md:mt-5 flex flex-col gap-1.5 sm:gap-2">
                <div className="inline-flex items-baseline justify-between rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50/40 px-2 sm:px-3 py-1.5 sm:py-2 min-w-0">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">{card.statLeft.value}</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-600 text-right leading-tight ml-2 flex-shrink-0">
                    {card.statLeft.label}
                  </span>
                </div>
                <div className="inline-flex items-baseline justify-between rounded-lg sm:rounded-xl border border-gray-200 bg-gray-50/40 px-2 sm:px-3 py-1.5 sm:py-2 min-w-0">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 truncate">{card.statRight.value}</span>
                  <span className="text-[10px] sm:text-[11px] text-gray-600 text-right leading-tight ml-2 flex-shrink-0 whitespace-nowrap">
                    {card.statRight.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
        </div>
      </div>
      
      {/* Flechas de navegación solo en móvil - Fuera del contenedor con scroll para que estén fijas */}
      <button
        onClick={handlePrevious}
        className="hidden max-md:flex absolute left-2 top-1/2 -translate-y-1/2 z-[60] items-center justify-center bg-white/95 hover:bg-white shadow-xl rounded-full p-2.5 text-[#2F7E7A] transition-all active:scale-95 pointer-events-auto touch-manipulation"
        aria-label="Tarjeta anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="hidden max-md:flex absolute right-2 top-1/2 -translate-y-1/2 z-[60] items-center justify-center bg-white/95 hover:bg-white shadow-xl rounded-full p-2.5 text-[#2F7E7A] transition-all active:scale-95 pointer-events-auto touch-manipulation"
        aria-label="Tarjeta siguiente"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const Hero = ({ onValidateClick }: HeroProps) => {
  const router = useRouter();
  const [rfc, setRfc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    valid: boolean;
    message: string;
    rfc: string;
    responseTime?: number;
    cached?: boolean;
    name?: string;
    regime?: string;
    startDate?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoLimitReached, setDemoLimitReached] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar si el usuario está autenticado y si ya usó la demo
  useEffect(() => {
    const checkAuthAndDemo = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setIsAuthenticated(true);
          setDemoLimitReached(true); // Si está autenticado, no puede usar la demo
        } else {
          // Verificar localStorage para ver si ya usó la demo
          const demoUsed = localStorage.getItem("demo-validation-used");
          if (demoUsed === "true") {
            setDemoLimitReached(true);
          }
        }
      } catch (err) {
        console.error("Error checking auth:", err);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthAndDemo();
  }, []);

  const handleValidate = async () => {
    // Si está autenticado, redirigir al dashboard
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    // Si ya usó la demo, mostrar modal de registro
    if (demoLimitReached) {
      if (onValidateClick) return onValidateClick();
      return;
    }

    // Si no hay RFC ingresado, ir al dashboard directamente (modo diseño)
    if (!rfc || rfc.trim() === "") {
      router.push("/dashboard?plan=free");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/demo/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rfc: rfc.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.demoLimitReached) {
          setDemoLimitReached(true);
          setError("Has usado tu validación demo. Regístrate gratis para validar más RFCs.");
        } else {
          setError(data.message || "Error al validar el RFC");
        }
        setLoading(false);
        return;
      }

      if (!data.success) {
        setError(data.message || "Error al validar el RFC");
        setLoading(false);
        return;
      }

      setResult({
        valid: data.valid,
        message: data.message || "",
        rfc: data.rfc,
        responseTime: data.responseTime,
        cached: data.cached,
        name: data.name,
        regime: data.regime,
        startDate: data.startDate,
      });
      setDemoLimitReached(true); // Marcar que ya usó la demo
      // Guardar en localStorage para que persista al recargar
      localStorage.setItem("demo-validation-used", "true");
      setLoading(false);
    } catch (err) {
      setError("Ocurrió un error al validar el RFC. Por favor intenta de nuevo.");
      console.error(err);
      setLoading(false);
    }
  };

  const cards: FeatureCard[] = [
    {
      eyebrow: "Validación SAT",
      title: "Verificación fiscal confiable",
      description:
        "Consulta el padrón del SAT para validar RFCs y confirmar su estatus. Útil para compras, contabilidad y onboarding.",
      statLeft: { value: "SAT", label: "Fuente oficial" },
      statRight: { value: "RFC", label: "Validación fiscal" },
    },
    {
      eyebrow: "Historial & Exportación",
      title: "Control y trazabilidad",
      description:
        "Centraliza validaciones, consulta historial y genera reportes para auditorías internas y control operativo.",
      statLeft: { value: "CSV/Excel", label: "Exportación" },
      statRight: { value: "Historial", label: "Registro de validaciones" },
    },
    {
      eyebrow: "API para Integraciones",
      title: "Integración lista para producción",
      description:
        "API REST para integrar validación en tus flujos (ERP/CRM/fintech). Diseñada para uso continuo y escalable.",
      statLeft: { value: "REST", label: "API" },
      statRight: { value: "60/min", label: "Rate limit" },
    },
  ];

  return (
    <section id="inicio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 max-md:py-8 sm:py-20 lg:py-36 max-md:relative max-md:z-0">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <h1 className="text-3xl max-md:text-2xl max-md:mb-4 sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 tracking-tight leading-tight">
            Valida RFCs contra el SAT en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F7E7A] to-[#1F5D59]">
              segundos
            </span>
          </h1>
          <p className="text-lg max-md:text-sm max-md:mb-3 sm:text-xl text-gray-700 mb-5 max-w-4xl mx-auto lg:mx-0 font-medium leading-relaxed">
            Plataforma B2B para validar y auditar documentos fiscales y legales
          </p>
          <p className="text-sm max-md:text-xs max-md:mb-2 sm:text-base text-gray-600 mb-3 max-w-3xl mx-auto lg:mx-0 font-normal">
            Comenzando con validación de RFC contra el padrón del SAT
          </p>
          <p className="text-sm max-md:text-xs max-md:mb-6 max-md:leading-relaxed text-gray-500 mb-10 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
            Verifica que tus proveedores, clientes y socios comerciales existan realmente en el Sistema de Administración Tributaria
          </p>

          {/* Mensaje para usuarios autenticados */}
          {isAuthenticated && !checkingAuth && (
            <div className="max-w-3xl mx-auto lg:mx-0 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium text-center">
                Ya tienes una cuenta. <a href="/dashboard" className="underline hover:text-blue-900 font-semibold">Ir al Dashboard</a> para validar RFCs.
              </p>
            </div>
          )}

          {/* RFC Input */}
          <div className="max-w-3xl mx-auto lg:mx-0 mb-6 max-md:mb-4">
            <div className="flex flex-col sm:flex-row gap-2.5 max-md:gap-2 sm:gap-3 shadow-sm rounded-2xl p-1 bg-white border border-gray-200 transition-all">
              <input
                type="text"
                placeholder="Ej: XAXX010101000"
                value={rfc}
                onChange={(e) => {
                  setRfc(e.target.value);
                  setError(null);
                  setResult(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !loading) {
                    handleValidate();
                  }
                }}
                disabled={loading || demoLimitReached || isAuthenticated || checkingAuth}
                className="flex-1 px-4 py-2 sm:py-2.5 text-sm sm:text-base border-0 rounded-xl focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400 font-normal disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={loading || checkingAuth}
                className="bg-[#2F7E7A] text-white px-5 py-2 sm:py-2.5 rounded-xl hover:bg-[#1F5D59] transition-colors font-semibold text-sm sm:text-base whitespace-nowrap shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validando...
                  </>
                ) : isAuthenticated ? (
                  "Ir al Dashboard"
                ) : demoLimitReached ? (
                  "Crear Cuenta Gratis"
                ) : (
                  "Validar Gratis"
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                {demoLimitReached && (
                  <button
                    type="button"
                    onClick={onValidateClick}
                    className="mt-3 w-full bg-[#2F7E7A] text-white px-4 py-2 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm"
                  >
                    Crear Cuenta Gratis
                  </button>
                )}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className={`mt-3 p-4 rounded-xl border-2 shadow-md transition-all ${
                result.valid 
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
                  : "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  {result.valid ? (
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-11 h-11 rounded-full bg-red-500 flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <span className={`font-bold text-base tracking-tight ${result.valid ? "text-green-900" : "text-red-900"}`}>
                        RFC {result.rfc}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                        result.valid 
                          ? "bg-green-600 text-white shadow-sm" 
                          : "bg-red-600 text-white shadow-sm"
                      }`}>
                        {result.valid ? "Válido" : "Inválido"}
                      </span>
                    </div>
                    <p className={`text-sm font-medium mb-3 ${result.valid ? "text-green-800" : "text-red-800"}`}>
                      {result.message}
                    </p>
                    
                    {(result.name || result.regime || result.startDate) && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mb-3 space-y-2 border border-white/50">
                        {result.name && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">Nombre:</span>
                            <span className="text-xs text-gray-900 font-medium flex-1">{result.name}</span>
                          </div>
                        )}
                        {result.regime && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">Régimen:</span>
                            <span className="text-xs text-gray-900 font-medium flex-1">{result.regime}</span>
                          </div>
                        )}
                        {result.startDate && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">Fecha inicio:</span>
                            <span className="text-xs text-gray-900 font-medium flex-1">{result.startDate}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {result.responseTime && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-300/50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">
                          {result.responseTime}ms {result.cached && "• Caché"}
                        </span>
                      </div>
                    )}
                    
                    {demoLimitReached && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-300/50">
                        <p className="text-xs text-gray-700 font-medium mb-1">
                          ✅ Has probado la validación demo (1 validación)
                        </p>
                        <p className="text-xs text-gray-600 mb-3">
                          Crea tu cuenta gratis y obtén <span className="font-bold text-[#2F7E7A]">10 validaciones/mes</span> sin costo
                        </p>
                        <button
                          type="button"
                          onClick={onValidateClick}
                          className="w-full bg-[#2F7E7A] hover:bg-[#1F5D59] text-white px-4 py-2.5 rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg"
                        >
                          Crear Cuenta Gratis - 10 validaciones/mes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trust Badges - Integrados */}
          <div className="max-w-3xl mx-auto lg:mx-0 mb-6 max-md:mb-4">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 max-md:gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#2F7E7A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">Conectado con el SAT</span>
              </div>
              <span className="text-gray-300" aria-hidden="true">•</span>
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#2F7E7A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium">Tiempo real</span>
              </div>
              <span className="text-gray-300" aria-hidden="true">•</span>
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#2F7E7A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Cumplimiento fiscal</span>
              </div>
              <span className="text-gray-300" aria-hidden="true">•</span>
              <div className="inline-flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#2F7E7A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">99.9% Uptime</span>
              </div>
            </div>
          </div>

          <p className="text-sm max-md:text-xs sm:text-base lg:text-lg text-gray-600 font-medium text-center lg:text-left">
            <span className="inline-flex items-center gap-2 max-md:gap-1.5 sm:gap-2 justify-center lg:justify-start">
              <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 sm:w-5 sm:h-5 text-[#2F7E7A] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="whitespace-nowrap">10 validaciones gratis/mes</span>
            </span>
          </p>
        </div>

        {/* RIGHT */}
        <div className="relative mt-8 lg:mt-0 lg:-mt-20 lg:-ml-20">
          <CardStackCarousel cards={cards} intervalMs={4000} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
