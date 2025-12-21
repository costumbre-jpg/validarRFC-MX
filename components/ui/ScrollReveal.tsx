"use client";
import { motion, type Variants, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
}: ScrollRevealProps) {
  const ref = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Detectar si es móvil y preferencias de movimiento
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    };
    checkMobile();
    checkReducedMotion();
    window.addEventListener("resize", checkMobile);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", checkReducedMotion);
    return () => {
      window.removeEventListener("resize", checkMobile);
      mediaQuery.removeEventListener("change", checkReducedMotion);
    };
  }, []);

  // Optimizar para móvil: margin más pequeño y animación más fluida
  const margin = isMobile ? "-30px" : "-100px";
  // En móvil, mantener duración similar pero con mejor fluidez
  const animationDuration = prefersReducedMotion ? 0.01 : (isMobile ? Math.min(duration * 0.7, 0.5) : duration);
  const animationDelay = prefersReducedMotion ? 0 : (isMobile ? delay * 0.5 : delay);
  const moveDistance = prefersReducedMotion ? 0 : (isMobile ? 10 : 50); // Muy poco movimiento en móvil para fluidez

  const isInView = useInView(ref, { once: true, margin });

  const variants: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      x: direction === "left" ? -moveDistance : direction === "right" ? moveDistance : 0,
      y: direction === "up" ? moveDistance : direction === "down" ? -moveDistance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: animationDuration,
        delay: animationDelay,
        // Easing más fluido para móvil: ease-out suave (curva de Bezier optimizada)
        ease: isMobile ? [0.16, 1, 0.3, 1] : [0.25, 0.25, 0, 1], // Curva más suave y fluida en móvil
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
      style={{ 
        willChange: isInView && !prefersReducedMotion ? "transform, opacity" : "auto",
        // Optimizaciones de renderizado para mayor fluidez
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      {children}
    </motion.div>
  );
}

