"use client";
 
 import { useEffect, useState } from "react";
 
 interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
 }
 
const DISMISS_KEY = "pwa_install_banner_dismissed_at";
const DISMISS_DAYS = 7;

const wasDismissedRecently = () => {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const last = Number(raw);
  if (!Number.isFinite(last)) return false;
  const now = Date.now();
  const maxAge = DISMISS_DAYS * 24 * 60 * 60 * 1000;
  return now - last < maxAge;
};

const markDismissed = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
};

export default function PWARegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
 
   useEffect(() => {
     if (!("serviceWorker" in navigator)) return;
 
    const handleBeforeInstall = (event: Event) => {
       event.preventDefault();
      if (wasDismissedRecently()) return;
       setInstallEvent(event as BeforeInstallPromptEvent);
       setShowBanner(true);
     };
 
     window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    const handleAppInstalled = () => {
      setShowBanner(false);
      setInstallEvent(null);
      markDismissed();
    };
    window.addEventListener("appinstalled", handleAppInstalled);
 
     navigator.serviceWorker
       .register("/sw.js")
       .catch(() => {
         // ignore service worker registration errors
       });
 
     return () => {
       window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
     };
   }, []);
 
   if (!showBanner || !installEvent) return null;
 
  const handleInstall = async () => {
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") {
      markDismissed();
      setShowBanner(false);
      setInstallEvent(null);
      return;
    }
    // Si el usuario rechaza, ocultar y no volver a mostrar por 7 días
    markDismissed();
    setShowBanner(false);
    setInstallEvent(null);
  };
 
   return (
     <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md rounded-xl border border-gray-200 bg-white shadow-lg p-4">
       <div className="flex items-start gap-3">
         <div className="flex-1">
           <p className="text-sm font-semibold text-gray-900">Instalar Maflipp</p>
           <p className="text-xs text-gray-600 mt-1">
             Agrega la app a tu pantalla de inicio para acceso rapido.
           </p>
         </div>
        <button
           className="text-xs text-gray-500 hover:text-gray-700"
          onClick={() => {
            markDismissed();
            setShowBanner(false);
          }}
           aria-label="Cerrar"
         >
           Cerrar
         </button>
       </div>
       <button
         onClick={handleInstall}
         className="mt-3 w-full rounded-lg bg-brand-primary text-white text-sm font-semibold py-2 hover:bg-brand-secondary transition-colors"
       >
         Instalar app
       </button>
     </div>
   );
 }
