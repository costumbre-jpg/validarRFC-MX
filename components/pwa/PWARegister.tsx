"use client";
 
 import { useEffect, useState } from "react";
 
 interface BeforeInstallPromptEvent extends Event {
   prompt: () => Promise<void>;
   userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
 }
 
 export default function PWARegister() {
   const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
   const [showBanner, setShowBanner] = useState(false);
 
   useEffect(() => {
     if (!("serviceWorker" in navigator)) return;
 
     const handleBeforeInstall = (event: Event) => {
       event.preventDefault();
       setInstallEvent(event as BeforeInstallPromptEvent);
       setShowBanner(true);
     };
 
     window.addEventListener("beforeinstallprompt", handleBeforeInstall);
 
     navigator.serviceWorker
       .register("/sw.js")
       .catch(() => {
         // ignore service worker registration errors
       });
 
     return () => {
       window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
     };
   }, []);
 
   if (!showBanner || !installEvent) return null;
 
   const handleInstall = async () => {
     await installEvent.prompt();
     const choice = await installEvent.userChoice;
     if (choice.outcome === "accepted") {
       setShowBanner(false);
       setInstallEvent(null);
     }
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
           onClick={() => setShowBanner(false)}
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
