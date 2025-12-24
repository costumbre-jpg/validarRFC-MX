"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppLink() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar si ya está instalada
    if (typeof window === "undefined") {
      return;
    }

    // Detectar si está en modo standalone (ya instalada)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    
    if (isStandalone || isInWebAppiOS) {
      setIsInstalled(true);
      return;
    }

    // Escuchar el evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Verificar si ya fue instalada (appinstalled event)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Si no hay prompt disponible (iOS, etc.), mostrar instrucciones
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);

      if (isIOS) {
        alert(
          "Para instalar Maflipp en iOS:\n\n" +
          "1. Toca el botón de compartir (cuadrado con flecha)\n" +
          "2. Selecciona 'Agregar a pantalla de inicio'\n" +
          "3. Toca 'Agregar'"
        );
      } else if (isAndroid) {
        alert(
          "Para instalar Maflipp en Android:\n\n" +
          "1. Toca el menú (tres puntos) en la esquina superior derecha\n" +
          "2. Selecciona 'Instalar app' o 'Agregar a pantalla de inicio'"
        );
      } else {
        alert(
          "Para instalar Maflipp:\n\n" +
          "Busca el ícono de instalación en la barra de direcciones de tu navegador o en el menú."
        );
      }
      return;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
  };

  // No mostrar si ya está instalada
  if (isInstalled) {
    return null;
  }

  return (
    <li>
      <button
        onClick={handleInstallClick}
        className="text-gray-400 hover:text-[#2F7E7A] transition-colors text-sm flex items-center gap-1.5 group w-full text-left"
        aria-label="Instalar aplicación Maflipp"
        type="button"
      >
        <svg
          className="w-3.5 h-3.5 transition-transform group-hover:scale-110 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 14v-4m0 0l-2 2m2-2l2 2"
          />
        </svg>
        <span className="max-md:text-xs">Instalar App</span>
      </button>
    </li>
  );
}

