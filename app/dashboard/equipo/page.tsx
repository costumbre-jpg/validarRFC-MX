"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getPlan, type PlanId } from "@/lib/plans";

function EquipoPage() {
  const [userData, setUserData] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; email: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Modo diseño: permitir acceso sin login
      if (!user) {
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setUserData({
          id: "mock-user",
          email: "diseño@maflipp.com",
          subscription_status: designPlan,
        });
        
        // Datos mock para equipo
        if (designPlan === "pro") {
          setTeamMembers([
            { id: "1", email: "diseño@maflipp.com", role: "Owner", status: "active", created_at: new Date().toISOString() },
            { id: "2", email: "usuario2@example.com", role: "Member", status: "pending", created_at: new Date().toISOString() },
          ]);
        } else if (designPlan === "business") {
          setTeamMembers([
            { id: "1", email: "diseño@maflipp.com", role: "Owner", status: "active", created_at: new Date().toISOString() },
            { id: "2", email: "usuario2@example.com", role: "Admin", status: "active", created_at: new Date().toISOString() },
            { id: "3", email: "usuario3@example.com", role: "Member", status: "active", created_at: new Date().toISOString() },
            { id: "4", email: "usuario4@example.com", role: "Member", status: "pending", created_at: new Date().toISOString() },
          ]);
        }
        
        setLoading(false);
        return;
      }

      // Get user data real
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      setUserData(dbUser);

      // Obtener token de acceso
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setAccessToken(session.access_token);
      }

      // Get team members reales
      if (dbUser && ((dbUser as any).subscription_status === "pro" || (dbUser as any).subscription_status === "business")) {
        try {
          const token = session?.access_token;
          const response = await fetch("/api/team/members", {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
          });
          if (response.ok) {
            const data = await response.json();
            setTeamMembers(data.members || []);
          }
        } catch (error) {
          console.error("Error cargando miembros:", error);
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2F7E7A]"></div>
      </div>
    );
  }

  const planId = (userData?.subscription_status || "free") as PlanId;
  const plan = getPlan(planId);
  const maxUsers = plan.features.users === -1 ? Infinity : plan.features.users;
  const canAddMembers = teamMembers.length < maxUsers;

  const isOwner = useMemo(() => {
    if (!userData?.email) return false;
    return teamMembers.some(
      (m) => m.role?.toLowerCase() === "owner" && m.email?.toLowerCase() === userData.email.toLowerCase()
    );
  }, [teamMembers, userData]);

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondary = getBrandColor('--brand-secondary', '#1F5D59');

  // Solo mostrar para Pro y Business
  if (planId !== "pro" && planId !== "business") {
    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
            >
              Gestión de Equipo
            </span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Gestión de Equipo Disponible</h3>
            <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
              La gestión de equipo está disponible en los planes Pro y Business. Invita miembros, asigna roles y colabora en equipo.
            </p>
            <a
              href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Mejorar Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      setErrorMessage("Por favor ingresa un email válido");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setSuccessMessage(null);
    setErrorMessage(null);

    // Modo diseño: simular invitación
    if (userData?.id === "mock-user") {
      setInviting(true);
      setTimeout(() => {
        setTeamMembers([
          ...teamMembers,
          {
            id: String(teamMembers.length + 1),
            email: inviteEmail,
            role: "Member",
            status: "pending",
            created_at: new Date().toISOString(),
          },
        ]);
        setInviteEmail("");
        setInviting(false);
        setSuccessMessage(`✅ Invitación enviada a ${inviteEmail} (modo diseño)`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }, 500);
      return;
    }

    setInviting(true);
    try {
      // Obtener token fresco antes de llamar al API
      const supabase = createClient();
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession();
      const token = freshSession?.access_token || accessToken;

      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Error al enviar invitación");
        setTimeout(() => setErrorMessage(null), 5000);
        setInviting(false);
        return;
      }

      // Recargar lista de miembros
      const membersResponse = await fetch("/api/team/members", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setTeamMembers(membersData.members || []);
      }

      setInviteEmail("");
      setSuccessMessage(`✅ Invitación enviada a ${inviteEmail}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error enviando invitación:", error);
      setErrorMessage("Error al enviar invitación. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setInviting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberEmail: string) => {
    console.log("handleDeleteMember llamado:", { memberId, memberEmail });
    setMemberToDelete({ id: memberId, email: memberEmail });
    console.log("memberToDelete establecido");
  };

  const confirmDeleteMember = async () => {
    if (!memberToDelete) return;

    setDeleting(true);

    // Modo diseño: simular eliminación
    if (userData?.id === "mock-user") {
      setTimeout(() => {
        setTeamMembers(teamMembers.filter((m) => (m.member_id ?? m.id) !== memberToDelete.id));
        setMemberToDelete(null);
        setDeleting(false);
      }, 500);
      return;
    }

    try {
      // Obtener token fresco antes de eliminar
      const supabase = createClient();
      const {
        data: { session: freshSession },
      } = await supabase.auth.getSession();
      const token = freshSession?.access_token || accessToken;

      const response = await fetch("/api/team/members", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ memberId: memberToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Error al eliminar miembro");
        setTimeout(() => setErrorMessage(null), 5000);
        setDeleting(false);
        setMemberToDelete(null);
        return;
      }

      // Recargar lista de miembros
      const membersResponse = await fetch("/api/team/members", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setTeamMembers(membersData.members || []);
      }

      setMemberToDelete(null);
      setDeleting(false);
      setSuccessMessage("✅ Miembro eliminado del equipo");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Error eliminando miembro:", error);
      setErrorMessage("Error al eliminar miembro. Por favor intenta de nuevo.");
      setTimeout(() => setErrorMessage(null), 5000);
      setDeleting(false);
      setMemberToDelete(null);
    }
  };

  const cancelDeleteMember = () => {
    setMemberToDelete(null);
  };

  const getInitials = (email: string) => {
    const parts = email.split("@")[0]?.split(/[._-]/).filter(Boolean) || [];
    if (parts.length >= 2) {
      const first = parts[0];
      const second = parts[1];
      if (first && second && first[0] && second[0]) {
        return (first[0] + second[0]).toUpperCase();
      }
    }
    return email.slice(0, 2).toUpperCase();
  };


  return (
    <div className="space-y-4 max-md:space-y-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-3 max-md:mb-2">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
            style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
          >
            Gestión de Equipo
          </span>
        </div>
        <div className="flex items-center gap-2.5 max-md:gap-2 mt-1.5 max-md:mt-1">
          <div className="flex items-center gap-1.5 max-md:gap-1 text-xs max-md:text-[11px] text-gray-600">
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>
              {teamMembers.length} de {maxUsers === Infinity ? "∞" : maxUsers} usuarios
            </span>
          </div>
          {!canAddMembers && maxUsers !== Infinity && (
            <span className="inline-flex items-center gap-1 px-2 max-md:px-1.5 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-medium bg-amber-100 text-amber-800">
              <svg className="w-2.5 h-2.5 max-md:w-2 max-md:h-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Límite alcanzado
            </span>
          )}
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-xs font-medium text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Invitar Miembro */}
      {canAddMembers && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandPrimary}15` }}>
              <svg className="w-4 h-4" style={{ color: brandPrimary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-600">Invitar Miembro</h2>
              <p className="text-xs text-gray-500">Agrega nuevos miembros a tu equipo por correo electrónico</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg transition-all focus:outline-none"
                style={{ 
                  borderColor: 'rgb(229, 231, 235)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = brandPrimary;
                  e.target.style.boxShadow = `0 0 0 3px ${brandPrimary}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgb(229, 231, 235)';
                  e.target.style.boxShadow = '';
                }}
              />
            </div>
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              {inviting ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Invitar
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!canAddMembers && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-amber-900 mb-0.5">
                Límite de usuarios alcanzado
              </h3>
              <p className="text-xs text-amber-700 mb-2">
                Has alcanzado el límite de {maxUsers} usuarios para tu plan {planId === "pro" ? "Pro" : "Business"}.
              </p>
              {planId === "pro" && (
                <a
                  href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900"
                >
                  Actualizar a Business
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Miembro */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-gray-900/60"
            onClick={() => {
              if (!deleting) {
                cancelDeleteMember();
              }
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-sm w-full p-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 text-center mb-1.5">
                ¿Eliminar miembro del equipo?
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4">
                ¿Estás seguro de que quieres eliminar a <strong>{memberToDelete.email}</strong> del equipo? Esta acción no se puede deshacer y el miembro perderá acceso inmediatamente.
              </p>
              
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={cancelDeleteMember}
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-3 py-1.5 border border-red-300 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  onClick={confirmDeleteMember}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Miembros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-medium text-gray-600">Miembros del Equipo</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {teamMembers.length === 0 
                ? "Aún no hay miembros en tu equipo"
                : `${teamMembers.length} ${teamMembers.length === 1 ? "miembro" : "miembros"}`
              }
            </p>
          </div>
        </div>
        
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1.5">No hay miembros aún</h3>
            <p className="text-xs text-gray-500 mb-3">
              Invita miembros a tu equipo usando el formulario de arriba
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Miembro
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Fecha de unión
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMembers.map((member) => {
                  const rowId = member.member_id ?? member.id;
                  return (
                  <tr key={rowId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: brandPrimary }}
                        >
                          {getInitials(member.email)}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-900">{member.email}</div>
                          {member.role === "Owner" && (
                            <div className="text-[10px] text-gray-500">Propietario</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        member.role === "Owner" 
                          ? "bg-purple-100 text-purple-800"
                          : member.role === "Admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {member.role === "Owner" && (
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                        {member.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        member.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {member.status === "active" ? (
                          <>
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Activo
                          </>
                        ) : (
                          <>
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Pendiente
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {new Date(member.created_at).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-xs font-medium">
                      {isOwner && member.role !== "Owner" && member.role !== "owner" && (
                        <button
                          onClick={() => handleDeleteMember(rowId, member.email)}
                          className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EquipoPageWrapper() {
  return (
    <Suspense fallback={null}>
      <EquipoPage />
    </Suspense>
  );
}

