"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DeleteAccountCard from "@/components/dashboard/DeleteAccountCard";
import EmailAlerts from "@/components/dashboard/EmailAlerts";
import EditProfileModal from "@/components/dashboard/EditProfileModal";
import { getPlan, type PlanId } from "@/lib/plans";

function CuentaPage() {
  const [userData, setUserData] = useState<any>(null);
  const [safeUser, setSafeUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const searchParams = useSearchParams();

  // Combinar userData con email del usuario autenticado para el modal
  const userDataForModal = safeUser ? {
    ...userData,
    email: safeUser.email || userData?.email,
  } : userData;

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Modo diseño: permitir acceso sin login
      if (!user) {
        // Leer parámetro 'plan' de la URL para modo diseño
        const planParam = searchParams.get("plan");
        const designPlan = planParam && ["pro", "business"].includes(planParam) ? planParam : "free";
        
        setSafeUser({ id: "mock-user", email: "diseño@maflipp.com" } as any);
        setUserData({
          id: "mock-user",
          email: "diseño@maflipp.com",
          subscription_status: designPlan, // Usar plan de la URL o 'free' por defecto
          created_at: new Date().toISOString(),
        });
        setLoading(false);
        return;
      }

      // Get user data real
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      // Calcular total_validations si no está disponible
      if (dbUser && (!(dbUser as any).total_validations || (dbUser as any).total_validations === 0)) {
        const { count } = await supabase
          .from("validations")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        
        if (count !== null) {
          (dbUser as any).total_validations = count;
        }
      }
      
      setSafeUser(user);
      setUserData(dbUser);
      setLoading(false);
    };

    loadData();
  }, [searchParams]);

  const handleProfileUpdate = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Recargar usuario autenticado (por si cambió el email)
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (updatedUser) {
        setSafeUser(updatedUser);
      }

      // Recargar datos de la tabla users
      const { data: dbUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (dbUser) {
        setUserData(dbUser);
      }
    }
  };

  const handleAvatarClick = () => {
    // Abrir el modal de editar perfil al hacer clic en la cámara
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const planName = 
    userData?.subscription_status === "free" ? "Gratis" :
    userData?.subscription_status === "pro" ? "Pro" :
    userData?.subscription_status === "business" ? "Business" :
    userData?.subscription_status === "enterprise" ? "Empresarial" : "Gratis";

  const planColor = 
    userData?.subscription_status === "free" ? "bg-gray-100 text-gray-800" :
    userData?.subscription_status === "pro" ? "bg-brand-primary text-white" :
    userData?.subscription_status === "business" ? "bg-blue-100 text-blue-800" :
    "bg-purple-100 text-purple-800";

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimaryColor = getBrandColor('--brand-primary', '#2F7E7A');
  const brandSecondaryColor = getBrandColor('--brand-secondary', '#1F5D59');

  const displayName =
    userData?.company_name ||
    userData?.full_name ||
    safeUser?.email?.split("@")[0] ||
    "Usuario";

  const getInitials = (text: string) => {
    if (!text) return "U";
    const parts = text.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0];
    if (!first) return "U";
    if (parts.length === 1) return first.slice(0, 2).toUpperCase();
    const second = parts[1];
    if (!second || !first[0] || !second[0]) {
      const firstChar = first[0];
      return firstChar ? firstChar.toUpperCase() : "U";
    }
    return (first[0] + second[0]).toUpperCase();
  };

  return (
    <div className="space-y-4 max-md:space-y-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap mb-3 max-md:mb-2">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
            style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
          >
            Mi Cuenta
          </span>
        </div>
        <p className="text-xs max-md:text-[11px] text-gray-600">Gestiona tu información personal y preferencias de cuenta</p>
      </div>

      {/* Perfil de Usuario */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 max-md:gap-3">
          <div className="relative">
            {userData?.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={displayName}
                className="h-20 w-20 max-md:h-16 max-md:w-16 rounded-full object-cover border-2 border-white shadow-lg ring-2 ring-gray-100"
              />
            ) : (
              <div 
                className="h-20 w-20 max-md:h-16 max-md:w-16 rounded-full flex items-center justify-center text-2xl max-md:text-xl font-bold text-white shadow-lg ring-2 ring-gray-100"
                style={{ backgroundColor: brandPrimaryColor }}
              >
                {getInitials(displayName)}
              </div>
            )}
            <button
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 h-8 w-8 max-md:h-7 max-md:w-7 rounded-full bg-white border-2 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-105 cursor-pointer z-10"
              style={{ borderColor: brandPrimaryColor }}
              title="Cambiar foto de perfil"
            >
              <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 max-md:gap-2 mb-2.5 max-md:mb-2 flex-wrap">
              <h2 className="text-xl max-md:text-lg font-bold text-gray-900">{displayName}</h2>
              <span className="inline-flex items-center px-3 max-md:px-2 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold bg-green-100 text-green-800 border border-green-200">
                <svg className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Activo
              </span>
            </div>
            <div className="space-y-1.5 max-md:space-y-1 mb-3 max-md:mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-xs max-md:text-[11px] text-gray-700 font-medium">{safeUser?.email}</p>
              </div>
              {userData?.phone && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <p className="text-xs max-md:text-[11px] text-gray-700 font-medium">{userData.phone}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 max-md:gap-1 flex-wrap">
              <span className={`inline-flex items-center px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-full text-[10px] max-md:text-[9px] font-bold ${planColor} border`}>
                Plan {planName}
              </span>
              <span className="inline-flex items-center gap-1 max-md:gap-0.5 px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                <img 
                  src="https://flagcdn.com/w40/mx.png" 
                  srcSet="https://flagcdn.com/w80/mx.png 2x"
                  alt="Bandera de México" 
                  className="w-3.5 h-2.5 max-md:w-3 max-md:h-2 object-cover rounded-sm"
                  style={{ imageRendering: 'crisp-edges' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.flag-emoji')) {
                      const emoji = document.createElement('span');
                      emoji.className = 'flag-emoji';
                      emoji.textContent = '🇲🇽';
                      parent.insertBefore(emoji, parent.firstChild);
                    }
                  }}
                />
                México
              </span>
              {userData?.subscription_status === "free" && (
                <a
                  href="/dashboard/billing"
                  className="inline-flex items-center gap-1 max-md:gap-0.5 px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold transition-all hover:scale-105 border"
                  style={{ 
                    color: brandPrimaryColor, 
                    backgroundColor: `${brandPrimaryColor}10`,
                    borderColor: `${brandPrimaryColor}30`
                  }}
                >
                  Mejorar
                  <svg className="w-2.5 h-2.5 max-md:w-2 max-md:h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 max-md:gap-1 px-4 max-md:px-3 py-2 max-md:py-1.5 rounded-lg text-xs max-md:text-[11px] font-semibold text-white transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
              style={{ backgroundColor: brandPrimaryColor }}
            >
              <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Información del Perfil */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <div className="flex items-center justify-between mb-3 max-md:mb-2">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
            style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
          >
            Información del Perfil
          </span>
        </div>
        <div className="space-y-4 max-md:space-y-3">
          <div className="grid md:grid-cols-2 gap-4 max-md:gap-3">
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">Email</label>
              </div>
              <div className="flex items-center gap-1.5 max-md:gap-1 flex-wrap">
                <p className="text-xs max-md:text-[11px] text-gray-900 font-medium">{safeUser?.email}</p>
                <span className="inline-flex items-center px-1.5 max-md:px-1 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-green-100 text-green-800 border border-green-200">
                  <svg className="w-2.5 h-2.5 max-md:w-2 max-md:h-2 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verificado
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">Teléfono</label>
              </div>
              <p className="text-xs max-md:text-[11px] text-gray-900 font-medium">
                {userData?.phone || <span className="text-gray-400 italic">No proporcionado</span>}
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-md:gap-3">
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">Plan Actual</label>
              </div>
              <div className="flex items-center gap-2 max-md:gap-1.5 flex-wrap">
                <span className={`inline-flex items-center px-2.5 max-md:px-2 py-1 max-md:py-0.5 rounded-full text-xs max-md:text-[11px] font-bold ${planColor} border`}>
                  {planName}
                </span>
                {userData?.subscription_status === "free" && (
                  <a
                    href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
                    className="inline-flex items-center gap-1 max-md:gap-0.5 text-xs max-md:text-[11px] font-semibold transition-all hover:scale-105"
                    style={{ color: brandPrimaryColor }}
                  >
                    Mejorar Plan
                    <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">País</label>
              </div>
              <div className="flex items-center gap-1.5">
                <img 
                  src="https://flagcdn.com/w80/mx.png" 
                  srcSet="https://flagcdn.com/w160/mx.png 2x"
                  alt="Bandera de México" 
                  className="w-5 h-3.5 max-md:w-4 max-md:h-3 object-cover rounded-sm"
                  style={{ imageRendering: 'crisp-edges' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.flag-emoji')) {
                      const emoji = document.createElement('span');
                      emoji.className = 'flag-emoji text-base';
                      emoji.textContent = '🇲🇽';
                      parent.insertBefore(emoji, parent.firstChild);
                    }
                  }}
                />
                <p className="text-xs max-md:text-[11px] text-gray-900 font-semibold">México</p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 max-md:gap-3">
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">Fecha de Registro</label>
              </div>
              <p className="text-xs max-md:text-[11px] text-gray-900 font-medium">
                {userData?.created_at
                  ? new Date(userData.created_at).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 max-md:p-2.5 border border-gray-100">
              <div className="flex items-center gap-1.5 mb-1.5 max-md:mb-1">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                <label className="text-xs max-md:text-[11px] font-semibold text-gray-700">ID de Usuario</label>
              </div>
              <p className="text-xs max-md:text-[11px] text-gray-500 font-mono bg-white px-1.5 max-md:px-1 py-0.5 rounded border border-gray-200 inline-block">{safeUser?.id?.substring(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Uso */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <div className="mb-3 max-md:mb-2">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
            style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
          >
            Estadísticas de Uso
          </span>
        </div>
        {(() => {
          const planId = (userData?.subscription_status || "free") as PlanId;
          const plan = getPlan(planId);
          const planLimit = plan.validationsPerMonth;
          const isPro = planId === "pro" || planId === "business";
          const apiLimit = plan.features.apiCallsPerMonth || 0;
          // Incluir validaciones demo desde localStorage
          let demoCount = 0;
          try {
            demoCount = parseInt(localStorage.getItem("maflipp_demo_validations_count") || "0", 10);
          } catch (e) {
            // Ignore
          }
          const queriesThisMonth = (userData?.rfc_queries_this_month || 0) + demoCount;
          
          return (
            <div className={`grid gap-4 max-md:gap-3 ${isPro ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 max-md:p-2.5 border-2 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brandPrimaryColor }}>
                <div className="flex items-center gap-1.5 max-md:gap-1 mb-2 max-md:mb-1.5">
                  <div className="p-1.5 max-md:p-1 rounded-lg" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                    <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">Validaciones este mes</p>
                </div>
                <p className="text-2xl max-md:text-xl font-bold mb-0.5" style={{ color: brandPrimaryColor }}>{queriesThisMonth}</p>
                <p className="text-[10px] max-md:text-[9px] text-gray-500">
                  {planLimit === -1 ? "Ilimitadas" : `de ${planLimit.toLocaleString()} disponibles`}
                </p>
              </div>
              {isPro ? (
                <>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 max-md:p-2.5 border-2 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brandPrimaryColor }}>
                    <div className="flex items-center gap-1.5 max-md:gap-1 mb-2 max-md:mb-1.5">
                      <div className="p-1.5 max-md:p-1 rounded-lg" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">Total validaciones</p>
                    </div>
                    <p className="text-2xl max-md:text-xl font-bold mb-0.5" style={{ color: brandPrimaryColor }}>
                      {userData?.total_validations || 0}
                    </p>
                    <p className="text-[10px] max-md:text-[9px] text-gray-500">Historial completo</p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 max-md:p-2.5 border-2 border-l-4 shadow-sm hover:shadow-md transition-shadow" style={{ borderLeftColor: brandPrimaryColor }}>
                    <div className="flex items-center gap-1.5 max-md:gap-1 mb-2 max-md:mb-1.5">
                      <div className="p-1.5 max-md:p-1 rounded-lg" style={{ backgroundColor: `${brandPrimaryColor}15` }}>
                        <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5" style={{ color: brandPrimaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                      <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">Llamadas API</p>
                    </div>
                    <p className="text-2xl max-md:text-xl font-bold mb-0.5" style={{ color: brandPrimaryColor }}>
                      {userData?.api_calls_this_month || 0}
                    </p>
                    <p className="text-[10px] max-md:text-[9px] text-gray-500">
                      {apiLimit === -1 ? "Ilimitadas" : `de ${apiLimit.toLocaleString()}/mes`}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 max-md:p-2.5 border-2 border-l-4 border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 max-md:gap-1 mb-2 max-md:mb-1.5">
                    <div className="p-1.5 max-md:p-1 rounded-lg bg-gray-100">
                      <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">Total de validaciones</p>
                  </div>
                  <p className="text-2xl max-md:text-xl font-bold text-gray-300 mb-0.5">-</p>
                  <p className="text-[10px] max-md:text-[9px] text-gray-500">Disponible en planes Pro+</p>
                </div>
              )}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 max-md:p-2.5 border-2 border-l-4 border-gray-200 shadow-sm">
                <div className="flex items-center gap-1.5 max-md:gap-1 mb-2 max-md:mb-1.5">
                  <div className="p-1.5 max-md:p-1 rounded-lg bg-gray-100">
                    <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs max-md:text-[11px] font-semibold text-gray-700">Miembro desde</p>
                </div>
                <p className="text-lg max-md:text-base font-bold text-gray-900">
                  {userData?.created_at
                    ? new Date(userData.created_at).toLocaleDateString("es-MX", { month: "short", year: "numeric" })
                    : "N/A"}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Alertas por Email - Solo para Pro y Business */}
      {(userData?.subscription_status === "pro" || userData?.subscription_status === "business") && (
        <EmailAlerts userData={userData} />
      )}

      {/* Configuración de Seguridad */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-md:p-3">
        <div className="mb-3 max-md:mb-2">
          <span
            className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-xs max-md:text-[11px] font-semibold"
            style={{ backgroundColor: `${brandPrimaryColor}15`, color: brandSecondaryColor }}
          >
            Seguridad
          </span>
        </div>
        <div className="space-y-2.5 max-md:space-y-2">
          <div className="flex items-center justify-between p-3 max-md:p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2.5 max-md:gap-2">
              <div className="p-1.5 max-md:p-1 rounded-lg bg-white border border-gray-200">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-900">Autenticación de dos factores</p>
                <p className="text-[10px] max-md:text-[9px] text-gray-500 mt-0.5">Aumenta la seguridad de tu cuenta</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Próximamente
            </span>
          </div>
          <div className="flex items-center justify-between p-3 max-md:p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2.5 max-md:gap-2">
              <div className="p-1.5 max-md:p-1 rounded-lg bg-white border border-gray-200">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-900">Cambiar contraseña</p>
                <p className="text-[10px] max-md:text-[9px] text-gray-500 mt-0.5">Actualiza tu contraseña regularmente</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Próximamente
            </span>
          </div>
          <div className="flex items-center justify-between p-3 max-md:p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-2.5 max-md:gap-2">
              <div className="p-1.5 max-md:p-1 rounded-lg bg-white border border-gray-200">
                <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs max-md:text-[11px] font-semibold text-gray-900">Sesiones activas</p>
                <p className="text-[10px] max-md:text-[9px] text-gray-500 mt-0.5">Gestiona tus dispositivos conectados</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 max-md:px-2 py-0.5 rounded-full text-[10px] max-md:text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
              Próximamente
            </span>
          </div>
        </div>
      </div>

      {/* Eliminar Cuenta */}
      <DeleteAccountCard />

      {/* Modal de Editar Perfil */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        userData={userDataForModal}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default function CuentaPageWrapper() {
  return (
    <Suspense fallback={null}>
      <CuentaPage />
    </Suspense>
  );
}


