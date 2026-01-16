"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-accepted">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const acceptInvitation = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de invitación no válido");
        return;
      }

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data: sessionResp } = await supabase.auth.getSession();
        const tokenAuth = sessionResp?.session?.access_token || null;

        if (!user) {
          // Si no está autenticado, redirigir a login con el token
          router.push(`/auth/login?redirect=/dashboard/equipo/accept?token=${token}`);
          return;
        }

        // Llamar al endpoint server-side que usa service role para aceptar
        const acceptResp = await fetch("/api/team/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(tokenAuth ? { Authorization: `Bearer ${tokenAuth}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ token }),
        });

        if (!acceptResp.ok) {
          const err = await acceptResp.json().catch(() => ({}));
          setStatus("error");
          // Mostrar el error completo con todos los detalles
          const errorMsg = err.error || "Error al aceptar la invitación";
          const detailMsg = err.detail ? `\n\nDetalle: ${err.detail}` : "";
          const debugMsg = err.debug ? `\n\nDebug: ${JSON.stringify(err.debug, null, 2)}` : "";
          const statusMsg = `\n\nStatus: ${acceptResp.status}`;
          setMessage(
            errorMsg + detailMsg + debugMsg + statusMsg ||
            "Error al aceptar la invitación. Por favor intenta de nuevo."
          );
          console.error("[ACCEPT] Error completo:", {
            status: acceptResp.status,
            error: err
          });
          return;
        }

        setStatus("success");
        setMessage("¡Invitación aceptada exitosamente!");
      } catch (error: any) {
        console.error("Error en acceptInvitation:", error);
        setStatus("error");
        setMessage(error?.message || "Error al procesar la invitación");
      }
    };

    acceptInvitation();
  }, [token, router]);

  // Get brand colors
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 max-md:p-3">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 max-md:p-4 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 max-md:w-14 h-16 max-md:h-14 bg-gray-100 rounded-full mb-4 max-md:mb-3">
              <div className="animate-spin rounded-full h-8 max-md:h-7 w-8 max-md:w-7 border-b-2" style={{ borderColor: brandPrimary }}></div>
            </div>
            <h2 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-2 max-md:mb-1.5">Procesando invitación...</h2>
            <p className="text-sm max-md:text-xs text-gray-600">Por favor espera un momento</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 max-md:w-14 h-16 max-md:h-14 bg-green-100 rounded-full mb-4 max-md:mb-3">
              <svg className="w-8 h-8 max-md:w-7 max-md:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-2 max-md:mb-1.5">¡Invitación Aceptada!</h2>
            <p className="text-sm max-md:text-xs text-gray-600 mb-6 max-md:mb-4">
              Ahora eres miembro del equipo
            </p>
            <Link
              href="/dashboard/equipo"
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 text-sm max-md:text-xs text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105 max-md:hover:scale-100"
              style={{ backgroundColor: brandPrimary }}
            >
              Ir al Equipo
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {status === "already-accepted" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 max-md:w-14 h-16 max-md:h-14 bg-blue-100 rounded-full mb-4 max-md:mb-3">
              <svg className="w-8 h-8 max-md:w-7 max-md:h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-2 max-md:mb-1.5">Invitación ya aceptada</h2>
            <p className="text-sm max-md:text-xs text-gray-600 mb-6 max-md:mb-4">{message}</p>
            <Link
              href="/dashboard/equipo"
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 text-sm max-md:text-xs text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105 max-md:hover:scale-100"
              style={{ backgroundColor: brandPrimary }}
            >
              Ir al Equipo
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 max-md:w-14 h-16 max-md:h-14 bg-red-100 rounded-full mb-4 max-md:mb-3">
              <svg className="w-8 h-8 max-md:w-7 max-md:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-2 max-md:mb-1.5">Error al aceptar invitación</h2>
            <div className="text-sm max-md:text-xs text-gray-600 mb-4 max-md:mb-3 whitespace-pre-wrap break-words bg-gray-50 p-3 rounded border border-gray-200">
              {message}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-md:mb-4 text-left">
              <p className="text-xs max-md:text-[11px] text-blue-800 font-medium mb-1">💡 ¿Qué hacer?</p>
              <p className="text-xs max-md:text-[11px] text-blue-700">
                Si recibiste esta invitación en tu correo, debes cerrar sesión y crear una cuenta o iniciar sesión con el correo al que se envió la invitación.
              </p>
            </div>
            <div className="flex gap-3 max-md:gap-2 justify-center max-md:flex-col">
              <button
                onClick={async () => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = `/auth/login?redirect=/dashboard/equipo/accept?token=${token}`;
                }}
                className="inline-flex items-center justify-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 text-sm max-md:text-xs text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
                style={{ backgroundColor: brandPrimary }}
              >
                Cerrar Sesión y Continuar
              </button>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-3 max-md:py-2 text-sm max-md:text-xs text-gray-700 bg-gray-100 rounded-xl transition-all font-medium hover:bg-gray-200"
              >
                Ir al Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPageWrapper() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitationPage />
    </Suspense>
  );
}


