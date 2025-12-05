"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Procesando autenticación...");

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Obtener el cliente singleton
        const supabase = createClient();
        
        // Verificar si hay error en la URL
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const urlError = params.get("error") || hashParams.get("error");
        const urlErrorDesc = params.get("error_description") || hashParams.get("error_description");
        
        if (urlError) {
          setError(urlErrorDesc || urlError);
          return;
        }

        // Verificar si hay código en la URL
        const code = params.get("code");
        
        if (code) {
          setStatus("Intercambiando código...");
          
          // Intercambiar código por sesión
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            // Si falla el intercambio, verificar si ya hay sesión
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              setStatus("Sesión encontrada, redirigiendo...");
              await syncAndRedirect(session);
              return;
            }
            setError(exchangeError.message);
            return;
          }
          
          if (data?.session) {
            setStatus("Sesión creada, sincronizando...");
            await syncAndRedirect(data.session);
            return;
          }
        }

        // Si no hay código, verificar sesión existente
        setStatus("Verificando sesión...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setStatus("Sesión encontrada, redirigiendo...");
          await syncAndRedirect(session);
          return;
        }

        setError("No se pudo completar la autenticación. Por favor intenta de nuevo.");
      } catch (err: any) {
        console.error("Error en callback:", err);
        setError(err.message || "Error inesperado");
      }
    };

    // Función para sincronizar cookies y redirigir
    const syncAndRedirect = async (session: any) => {
      console.log("🔵 Sincronizando cookies...");
      try {
        const res = await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
          credentials: "include",
        });
        
        const data = await res.json();
        console.log("🔵 Respuesta set-cookie:", res.status, data);
        
        if (!res.ok) {
          console.error("❌ Error en set-cookie:", data.error);
        }
      } catch (e) {
        console.error("❌ Error sincronizando cookies:", e);
      }
      
      // Esperar más tiempo para que las cookies se establezcan
      console.log("🔵 Esperando antes de redirigir...");
      await new Promise(r => setTimeout(r, 1500));
      console.log("✅ Redirigiendo a /dashboard");
      window.location.href = "/dashboard";
    };

    handleAuth();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#10B981] hover:bg-[#059669]"
          >
            Volver a Iniciar Sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10B981] mx-auto"></div>
        <p className="mt-4 text-gray-600">{status}</p>
      </div>
    </div>
  );
}

