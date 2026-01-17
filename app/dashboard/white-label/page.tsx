"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type PlanId } from "@/lib/plans";
import { createClient } from "@/lib/supabase/client";

interface WhiteLabelSettings {
  brand_name: string;
  custom_logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  hide_maflipp_brand: boolean;
}

const defaults: WhiteLabelSettings = {
  brand_name: "",
  custom_logo_url: null,
  primary_color: "#2F7E7A",
  secondary_color: "#1F5D59",
  hide_maflipp_brand: true,
};

function WhiteLabelPage() {
  const [settings, setSettings] = useState<WhiteLabelSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [planId, setPlanId] = useState<PlanId>("free");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const load = async () => {
      // Modo diseño: permitir plan por query
      const planParam = searchParams.get("plan");
      const designPlan = (planParam && ["pro", "business"].includes(planParam)
        ? planParam
        : "free") as PlanId;

      let token: string | null = null;
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || null;
        if (token) {
          setAccessToken(token);
        }
      } catch (e) {
        console.error("Error obteniendo sesión:", e);
      }

      try {
        const res = await fetch("/api/branding", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          credentials: "include",
        });
        if (res.status === 401) {
          // Sin sesión: usa preview local si existe (modo diseño business)
          if (designPlan === "business" && typeof window !== "undefined") {
            const stored = window.localStorage.getItem("branding_preview");
            if (stored) {
              try {
                setSettings({ ...defaults, ...JSON.parse(stored) });
              } catch {
                setSettings(defaults);
              }
            } else {
              setSettings(defaults);
            }
          } else {
            setSettings(defaults);
          }
          setPlanId(designPlan);
          setLoading(false);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setSettings({
            ...defaults,
            ...data,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        // Obtener plan real y verificar si es miembro de equipo
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const planParam = searchParams.get("plan");
          const planFromUrl = planParam && ["free", "pro", "business"].includes(planParam)
            ? (planParam as PlanId)
            : null;
          if (user) {
            const { data: userData } = await supabase
              .from("users")
              .select("subscription_status")
              .eq("id", user.id)
              .single();
            
            const subscriptionStatus = (userData as any)?.subscription_status;
            if (planFromUrl) {
              setPlanId(planFromUrl);
            } else if (subscriptionStatus && ["free", "pro", "business"].includes(subscriptionStatus)) {
              setPlanId(subscriptionStatus as PlanId);
            } else {
              setPlanId(designPlan);
            }
          } else {
            setPlanId(planFromUrl || designPlan);
          }
        } catch (e) {
          console.error("Error obteniendo plan:", e);
          setPlanId(designPlan);
        }
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const isBusiness = planId === "business";

  const handleFileUpload = async (file: File) => {
    if (!isBusiness) {
      setErrorMessage("White label está disponible solo para plan Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Validar tipo de archivo
    const validTypes = ["image/png", "image/svg+xml", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Tipo de archivo no válido. Solo se permiten PNG, SVG o JPG");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    // Validar tamaño (máximo 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage("El archivo es demasiado grande. Máximo 2MB");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }

    setUploadingLogo(true);
    setLogoError(false);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || accessToken;

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/branding/upload-logo", {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Error al subir el logo");
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        setSettings({ ...settings, custom_logo_url: data.logo_url });
        setSuccessMessage("✅ Logo subido correctamente");
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e: any) {
      console.error("Error subiendo logo:", e);
      setErrorMessage(`Error al subir el logo: ${e?.message || "Error desconocido"}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({
      ...prev,
      custom_logo_url: null,
    }));
  };

  const handleRestoreMaflipp = () => {
    setSettings((prev) => ({
      ...prev,
      custom_logo_url: null,
      hide_maflipp_brand: false,
    }));
  };

  const handleSave = async () => {
    if (!isBusiness) {
      setErrorMessage("White label está disponible solo para plan Business");
      setTimeout(() => setErrorMessage(null), 5000);
      return;
    }
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    
    console.log("💾 Guardando configuración:", settings);
    
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || accessToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch("/api/branding", {
        method: "POST",
        headers,
        body: JSON.stringify(settings),
        credentials: "include",
      });
      
      console.log("📡 Respuesta del servidor:", res.status, res.statusText);
      
      const data = await res.json();
      console.log("📦 Datos recibidos:", data);
      
      if (!res.ok) {
        console.error("❌ Error al guardar:", data);
        setErrorMessage(data.error || "No se pudo guardar");
        // Guardado local para vista previa sin sesión
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem("branding_preview", JSON.stringify(settings));
            setSuccessMessage("✅ Guardado local para vista previa (sin sesión). Recarga para ver.");
            setTimeout(() => setSuccessMessage(null), 5000);
          } catch (e) {
            console.error("Error guardando preview local:", e);
          }
        }
        setTimeout(() => setErrorMessage(null), 5000);
      } else {
        console.log("✅ Configuración guardada exitosamente");
        setSuccessMessage("✅ Configuración guardada correctamente");
        setTimeout(() => setSuccessMessage(null), 5000);
        
        // Recargar la página para que el layout actualice el branding
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (e: any) {
      console.error("❌ Error en handleSave:", e);
      setErrorMessage(`Error al guardar: ${e?.message || "Error desconocido"}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === 'undefined') return defaultValue;
    const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return value || defaultValue;
  };

  const brandPrimary = getBrandColor('--brand-primary', '#2F7E7A');

  // Contrast helper to warn if text over white might not meet AA
  const getContrastWithWhite = (hex: string) => {
    const normalized = hex.trim();
    if (!/^#([0-9a-fA-F]{6})$/.test(normalized)) return 21; // assume ok if invalid
    const r = parseInt(normalized.slice(1, 3), 16) / 255;
    const g = parseInt(normalized.slice(3, 5), 16) / 255;
    const b = parseInt(normalized.slice(5, 7), 16) / 255;
    const toLum = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    const lum = 0.2126 * toLum(r) + 0.7152 * toLum(g) + 0.0722 * toLum(b);
    const whiteLum = 1;
    return (whiteLum + 0.05) / (lum + 0.05);
  };

  const primaryContrastOk = getContrastWithWhite(settings.primary_color) >= 4.5;
  const secondaryContrastOk = getContrastWithWhite(settings.secondary_color) >= 4.5;

  if (!isBusiness) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 max-md:px-4 py-6 max-md:py-4">
          <div className="flex items-start gap-4 max-md:gap-3 mb-6 max-md:mb-4">
            <div className="w-12 max-md:w-10 h-12 max-md:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 max-md:w-5 max-md:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl max-md:text-lg font-semibold text-gray-900 mb-1 max-md:mb-0.5">White Label Premium</h3>
              <p className="text-sm max-md:text-xs text-gray-600">
                Personaliza completamente tu marca y ofrece una experiencia única a tus usuarios con el plan Business.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-md:gap-3 mb-6 max-md:mb-4">
            <div className="text-center p-4 max-md:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 max-md:w-8 h-10 max-md:h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 max-md:mb-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 max-md:mb-0.5 text-sm max-md:text-xs">Logo Personalizado</h4>
              <p className="text-xs max-md:text-[11px] text-gray-600">Sube tu logo y aparecerá en todo el dashboard</p>
            </div>
            <div className="text-center p-4 max-md:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 max-md:w-8 h-10 max-md:h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 max-md:mb-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 max-md:mb-0.5 text-sm max-md:text-xs">Colores a Medida</h4>
              <p className="text-xs max-md:text-[11px] text-gray-600">Elige tus colores primarios y secundarios</p>
            </div>
            <div className="text-center p-4 max-md:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-10 max-md:w-8 h-10 max-md:h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3 max-md:mb-2">
                <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1 max-md:mb-0.5 text-sm max-md:text-xs">Sin Marcas</h4>
              <p className="text-xs max-md:text-[11px] text-gray-600">Oculta referencias a la marca original</p>
            </div>
          </div>
          <div className="text-center">
            <a
              href={`/dashboard/billing${searchParams.get("plan") && ["pro", "business"].includes(searchParams.get("plan")!) ? `?plan=${searchParams.get("plan")}` : ""}`}
              className="inline-flex items-center gap-2 max-md:gap-1.5 px-6 max-md:px-4 py-2.5 max-md:py-2 text-sm max-md:text-xs text-white rounded-lg transition-all font-semibold shadow-sm hover:shadow-md"
              style={{ backgroundColor: brandPrimary }}
            >
              <svg className="w-5 h-5 max-md:w-4 max-md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Actualizar a Plan Business
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-md:space-y-3">
      {/* Header Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 max-md:p-3">
        <div className="flex items-center gap-2.5 max-md:gap-2">
          <div className="w-8 max-md:w-7 h-8 max-md:h-7 bg-gray-100 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 max-md:w-3.5 max-md:h-3.5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg max-md:text-base font-semibold text-gray-500">White Label</h1>
            <p className="text-xs max-md:text-[11px] text-gray-500 mt-0.5">
              Personaliza tu empresa y colores del dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-md:p-2.5 flex items-center gap-2 max-md:gap-1.5">
          <div className="w-6 max-md:w-5 h-6 max-md:h-5 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs max-md:text-[11px] font-semibold text-green-800">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-md:p-2.5 flex items-center gap-2 max-md:gap-1.5">
          <div className="w-6 max-md:w-5 h-6 max-md:h-5 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-xs max-md:text-[11px] font-semibold text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4 max-md:gap-3">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-2 space-y-3">
          {/* Brand Identity Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 max-md:px-3 py-2.5 max-md:py-2 border-b border-gray-200">
              <h2 className="text-sm max-md:text-xs font-semibold text-gray-900 flex items-center gap-1.5 max-md:gap-1">
                <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Identidad de Empresa
              </h2>
            </div>
            <div className="p-4 max-md:p-3 space-y-3 max-md:space-y-2.5">
              <div>
                <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
                  Nombre de la empresa
                </label>
                <input
                  type="text"
                  value={settings.brand_name}
                  onChange={(e) =>
                    setSettings({ ...settings, brand_name: e.target.value })
                  }
                  maxLength={80}
                  className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-gray-50 focus:bg-white text-gray-900"
                  placeholder="Ej: Mi Empresa S.A. de C.V."
                />
              </div>
              
              <div>
                <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
                  Logo de tu empresa
                </label>
                
                {/* Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-4 max-md:p-3 transition-all ${
                    dragActive
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 bg-gray-50/50"
                  } ${uploadingLogo ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-gray-300"}`}
                >
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/png,image/svg+xml,image/jpeg,image/jpg"
                    onChange={handleFileInput}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    {uploadingLogo ? (
                      <>
                        <svg className="animate-spin h-5 w-5 max-md:h-4 max-md:w-4 text-gray-400 mb-2 max-md:mb-1.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-xs max-md:text-[11px] text-gray-500">Subiendo...</p>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-gray-400 mb-2 max-md:mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs max-md:text-[11px] text-gray-600 mb-1 max-md:mb-0.5">
                          <span className="font-semibold text-gray-700">Haz clic para subir</span> o arrastra el archivo aquí
                        </p>
                        <p className="text-xs max-md:text-[11px] text-gray-500">PNG, SVG o JPG (máx. 2MB)</p>
                      </>
                    )}
                  </label>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2 max-md:gap-1.5 my-3 max-md:my-2">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="text-xs max-md:text-[11px] text-gray-400">o</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>

                {/* URL Input */}
                <div>
                  <label className="block text-xs max-md:text-[11px] font-medium text-gray-600 mb-1 max-md:mb-0.5">
                    Ingresar URL del logo
                  </label>
                  <input
                    type="url"
                    value={settings.custom_logo_url || ""}
                    onChange={(e) => {
                      setLogoError(false);
                      setSettings({ ...settings, custom_logo_url: e.target.value });
                    }}
                    className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 text-sm max-md:text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-white"
                    placeholder="https://ejemplo.com/logo.png"
                  />
                </div>

                {/* Preview */}
                {settings.custom_logo_url && (
                  <div className="mt-3 max-md:mt-2 p-3 max-md:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs max-md:text-[11px] font-medium text-gray-700 mb-2 max-md:mb-1.5">Vista previa:</p>
                    <div className="flex items-center justify-center p-3 max-md:p-2.5 bg-white rounded border border-gray-200 mb-2 max-md:mb-1.5">
                      {logoError ? (
                        <p className="text-xs max-md:text-[11px] text-red-600">Error al cargar el logo</p>
                      ) : (
                        <img
                          src={settings.custom_logo_url}
                          alt="Logo preview"
                          className="max-h-12 max-md:max-h-10 max-w-full object-contain"
                          onError={() => setLogoError(true)}
                        />
                      )}
                    </div>
                    <div className="flex gap-2 max-md:gap-1.5">
                      <button
                        onClick={handleRemoveLogo}
                        className="flex-1 px-3 max-md:px-2 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
                      >
                        Eliminar Logo
                      </button>
                      <button
                        onClick={handleRestoreMaflipp}
                        className="flex-1 px-3 max-md:px-2 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium text-white rounded-lg transition-colors shadow-sm hover:shadow"
                        style={{ backgroundColor: brandPrimary }}
                      >
                        Restaurar Maflipp
                      </button>
                    </div>
                  </div>
                )}
                {!settings.custom_logo_url && settings.hide_maflipp_brand && (
                  <div className="mt-2 max-md:mt-1.5">
                    <button
                      onClick={handleRestoreMaflipp}
                      className="w-full px-3 max-md:px-2 py-1.5 max-md:py-1 text-xs max-md:text-[11px] font-medium text-white rounded-lg transition-colors shadow-sm hover:shadow"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      Restaurar Logo de Maflipp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Color Palette Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 max-md:px-3 py-2.5 max-md:py-2 border-b border-gray-200">
              <h2 className="text-sm max-md:text-xs font-semibold text-gray-900 flex items-center gap-1.5 max-md:gap-1">
                <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Paleta de Colores (opcional)
              </h2>
            </div>
            <div className="p-4 max-md:p-3">
              <div className="grid md:grid-cols-2 gap-4 max-md:gap-3">
                <div>
                  <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
                    Color Primario
                  </label>
                  <div className="flex items-center gap-3 max-md:gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) =>
                          setSettings({ ...settings, primary_color: e.target.value })
                        }
                        className="h-10 max-md:h-9 w-16 max-md:w-14 rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:shadow transition-shadow"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.primary_color}
                        onChange={(e) =>
                          setSettings({ ...settings, primary_color: e.target.value })
                        }
                        className="w-full px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-gray-50 focus:bg-white font-mono text-gray-900"
                        placeholder="#2F7E7A"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 max-md:gap-1 mt-1.5 max-md:mt-1">
                    {!primaryContrastOk && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 max-md:px-1 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-xs max-md:text-[11px]">
                        ⚠ Contraste bajo
                      </span>
                    )}
                    <p className="text-xs max-md:text-[11px] text-gray-500">Botones principales</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs max-md:text-[11px] font-semibold text-gray-700 mb-1.5 max-md:mb-1">
                    Color Secundario
                  </label>
                  <div className="flex items-center gap-3 max-md:gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={settings.secondary_color}
                        onChange={(e) =>
                          setSettings({ ...settings, secondary_color: e.target.value })
                        }
                        className="h-10 max-md:h-9 w-16 max-md:w-14 rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:shadow transition-shadow"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={settings.secondary_color}
                        onChange={(e) =>
                          setSettings({ ...settings, secondary_color: e.target.value })
                        }
                        className="w-full px-3 max-md:px-2.5 py-1.5 max-md:py-1 text-xs max-md:text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all bg-gray-50 focus:bg-white font-mono text-gray-900"
                        placeholder="#1F5D59"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 max-md:gap-1 mt-1.5 max-md:mt-1">
                    {!secondaryContrastOk && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 max-md:px-1 py-0.5 rounded bg-amber-100 text-amber-800 font-medium text-xs max-md:text-[11px]">
                        ⚠ Contraste bajo
                      </span>
                    )}
                    <p className="text-xs max-md:text-[11px] text-gray-500">Elementos secundarios</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Visibility Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 max-md:px-3 py-2.5 max-md:py-2 border-b border-gray-200">
              <h2 className="text-sm max-md:text-xs font-semibold text-gray-900 flex items-center gap-1.5 max-md:gap-1">
                <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visibilidad de la marca
              </h2>
            </div>
            <div className="p-4 max-md:p-3">
              <div className="flex items-start gap-3 max-md:gap-2 p-3 max-md:p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <input
                  id="hide-brand"
                  type="checkbox"
                  checked={settings.hide_maflipp_brand}
                  onChange={(e) =>
                    setSettings({ ...settings, hide_maflipp_brand: e.target.checked })
                  }
                  className="h-4 max-md:h-3.5 w-4 max-md:w-3.5 text-gray-600 border-gray-300 rounded focus:ring-1 focus:ring-gray-400 mt-0.5 cursor-pointer"
                />
                <div className="flex-1">
                  <label htmlFor="hide-brand" className="text-xs max-md:text-[11px] font-semibold text-gray-900 cursor-pointer block mb-0.5">
                    Ocultar marca Maflipp en el dashboard
                  </label>
                  <p className="text-xs max-md:text-[11px] text-gray-500 leading-relaxed">
                    {settings.custom_logo_url 
                      ? "Reemplazará 'Maflipp' por tu marca en PDFs y textos. El logo ya está personalizado."
                      : "Ocultará el logo de Maflipp (mostrará un círculo) y reemplazará 'Maflipp' por tu marca en PDFs y textos."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 max-md:gap-2 justify-end pt-3 max-md:pt-2">
            <button
              type="button"
              onClick={() => setSettings(defaults)}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 max-md:gap-1 px-4 max-md:px-3 py-2 max-md:py-1.5 text-xs max-md:text-[11px] font-semibold rounded-lg transition-all border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restablecer
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-1.5 max-md:gap-1 px-5 max-md:px-4 py-2 max-md:py-1.5 text-xs max-md:text-[11px] font-semibold text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow bg-brand-primary hover-bg-brand-secondary"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-3.5 max-md:h-3 w-3.5 max-md:w-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-3.5 max-md:w-3 h-3.5 max-md:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 max-md:static overflow-hidden">
            <div className="bg-gray-50 px-4 max-md:px-3 py-2.5 max-md:py-2 border-b border-gray-200">
              <h3 className="text-sm max-md:text-xs font-semibold text-gray-900 flex items-center gap-1.5 max-md:gap-1">
                <svg className="w-3.5 h-3.5 max-md:w-3 max-md:h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa
              </h3>
            </div>
            <div className="p-4 max-md:p-3 space-y-3 max-md:space-y-2.5">
              {/* Logo Preview */}
              <div>
                <h4 className="text-xs max-md:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 max-md:mb-1.5">Logo</h4>
                <div className="bg-white rounded-lg p-4 max-md:p-3 border border-gray-200 flex items-center justify-center min-h-[80px] max-md:min-h-[85px]">
                  {settings.custom_logo_url && !logoError ? (
                    <img
                      src={settings.custom_logo_url}
                      alt="Logo preview"
                      className="max-h-16 max-md:max-h-12 max-w-full object-contain"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-12 max-md:w-10 h-12 max-md:h-10 mx-auto mb-2 max-md:mb-1.5 rounded-lg flex items-center justify-center bg-gray-100">
                        <svg className="w-6 h-6 max-md:w-5 max-md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs max-md:text-[11px] font-medium text-gray-600">{logoError ? "No se pudo cargar" : (settings.brand_name || "")}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Color Preview */}
              <div>
                <h4 className="text-xs max-md:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 max-md:mb-1.5">Colores</h4>
                <div className="space-y-2 max-md:space-y-1.5">
                  <div className="flex items-center gap-2 max-md:gap-1.5">
                    <div 
                      className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: settings.primary_color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs max-md:text-[11px] font-semibold text-gray-900">Primario</p>
                      <p className="text-xs max-md:text-[11px] text-gray-500 font-mono">{settings.primary_color}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 max-md:gap-1.5">
                    <div 
                      className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: settings.secondary_color }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs max-md:text-[11px] font-semibold text-gray-900">Secundario</p>
                      <p className="text-xs max-md:text-[11px] text-gray-500 font-mono">{settings.secondary_color}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Preview */}
              <div>
                <h4 className="text-xs max-md:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 max-md:mb-1.5">Botones</h4>
                <div className="space-y-2 max-md:space-y-1.5">
                  <button
                    className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 rounded-lg text-white text-xs max-md:text-[11px] font-semibold shadow-sm transition-all"
                    style={{ backgroundColor: settings.primary_color }}
                  >
                    Botón Primario
                  </button>
                  <button
                    className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 rounded-lg text-white text-xs max-md:text-[11px] font-semibold shadow-sm transition-all"
                    style={{ backgroundColor: settings.secondary_color }}
                  >
                    Botón Secundario
                  </button>
                </div>
              </div>

              {/* Brand Name Preview */}
              <div>
                <h4 className="text-xs max-md:text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2 max-md:mb-1.5">Nombre de Empresa</h4>
                <div className="bg-white rounded-lg p-3 max-md:p-2.5 border border-gray-200 space-y-1">
                  <p className="text-sm max-md:text-xs font-semibold text-gray-900">{settings.brand_name || ""}</p>
                  <p className="text-xs max-md:text-[11px] text-gray-500">Así se verá el nombre en el dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WhiteLabelPageWrapper() {
  return (
    <Suspense fallback={null}>
      <WhiteLabelPage />
    </Suspense>
  );
}


