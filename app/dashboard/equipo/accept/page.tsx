"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already-accepted">("loading");
  const [message, setMessage] = useState("");
  const [teamOwnerEmail, setTeamOwnerEmail] = useState("");

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

        if (!user) {
          // Si no está autenticado, redirigir a login con el token
          router.push(`/auth/login?redirect=/dashboard/equipo/accept?token=${token}`);
          return;
        }

        // Buscar la invitación por token
        const { data: invitation, error: inviteError } = await supabase
          .from("team_members")
          .select("*, team_owner_id, users!team_members_team_owner_id_fkey(email)")
          .eq("invitation_token", token)
          .single();

        if (inviteError || !invitation) {
          setStatus("error");
          setMessage("Invitación no encontrada o token inválido");
          return;
        }

        const inv = invitation as any;

        // Verificar que el email coincida
        const invitationEmail = inv.email;
        const userEmail = user.email;
        if (!userEmail || !invitationEmail || invitationEmail.toLowerCase() !== userEmail.toLowerCase()) {
          setStatus("error");
          setMessage(`Esta invitación fue enviada a ${invitationEmail || "email desconocido"}, pero estás logueado como ${userEmail || "usuario sin email"}`);
          return;
        }

        // Verificar si ya fue aceptada
        if (inv.status === "active" && inv.user_id) {
          setStatus("already-accepted");
          setMessage("Esta invitación ya fue aceptada anteriormente");
          return;
        }

        // Actualizar la invitación para marcarla como aceptada
        const { error: updateError } = await (supabase
          .from("team_members") as any)
          .update({
            user_id: user.id,
            status: "active",
            accepted_at: new Date().toISOString(),
          })
          .eq("id", inv.id);

        if (updateError) {
          console.error("Error aceptando invitación:", updateError);
          setStatus("error");
          setMessage("Error al aceptar la invitación. Por favor intenta de nuevo.");
          return;
        }

        // Obtener email del dueño del equipo
        if (inv.team_owner_id) {
          const { data: ownerData } = await supabase
            .from("users")
            .select("email")
            .eq("id", inv.team_owner_id)
            .single();
          
          if (ownerData) {
            setTeamOwnerEmail((ownerData as any).email);
          }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: brandPrimary }}></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Procesando invitación...</h2>
            <p className="text-sm text-gray-600">Por favor espera un momento</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">¡Invitación Aceptada!</h2>
            <p className="text-sm text-gray-600 mb-6">
              {teamOwnerEmail 
                ? `Ahora eres miembro del equipo de ${teamOwnerEmail}`
                : "Ahora eres miembro del equipo"}
            </p>
            <Link
              href="/dashboard/equipo"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: brandPrimary }}
            >
              Ir al Equipo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {status === "already-accepted" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitación ya aceptada</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <Link
              href="/dashboard/equipo"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: brandPrimary }}
            >
              Ir al Equipo
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al aceptar invitación</h2>
            <p className="text-sm text-gray-600 mb-6">{message}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl transition-all font-medium hover:bg-gray-200"
              >
                Ir al Dashboard
              </Link>
              <Link
                href="/dashboard/equipo"
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all font-medium shadow-md hover:shadow-lg"
                style={{ backgroundColor: brandPrimary }}
              >
                Ver Equipo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

