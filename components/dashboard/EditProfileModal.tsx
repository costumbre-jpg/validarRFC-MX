"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: any;
  onUpdate: () => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  userData,
  onUpdate,
}: EditProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Get brand colors from CSS variables or use defaults
  const getBrandColor = (varName: string, defaultValue: string) => {
    if (typeof window === "undefined") return defaultValue;
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    return value || defaultValue;
  };

  const getBrandMeta = () => {
    if (typeof window === "undefined") return { name: "Maflipp", hide: false };
    const styles = getComputedStyle(document.documentElement);
    const name = styles.getPropertyValue("--brand-name").trim() || "Maflipp";
    const hide = styles.getPropertyValue("--hide-maflipp-brand").trim() === "1";
    return { name, hide };
  };

  const brandPrimary = getBrandColor("--brand-primary", "#2F7E7A");
  const brandSecondary = getBrandColor("--brand-secondary", "#1F5D59");
  const { name: brandName, hide: hideMaflipp } = getBrandMeta();

  useEffect(() => {
    const loadSession = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        setAccessToken(data.session?.access_token ?? null);
      } catch {
        setAccessToken(null);
      }
    };

    if (isOpen) {
      loadSession();
    }

    if (isOpen && userData) {
      setFullName(userData.full_name || "");
      setCompanyName(userData.company_name || "");
      setEmail(userData.email || "");
      setPhone(userData.phone || "");
      setAvatarPreview(userData.avatar_url || null);
      setAvatarFile(null);
      setError(null);
      setSuccess(false);
      setEmailVerificationSent(false);
    }
  }, [isOpen, userData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo
      if (!file.type.startsWith("image/")) {
        setError("Solo se permiten archivos de imagen");
        return;
      }
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen debe ser menor a 5MB");
        return;
      }
      setAvatarFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/profile/upload-avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      // Actualizar preview con la nueva URL
      if (data.avatar_url) {
        setAvatarPreview(data.avatar_url);
      }
    } catch (err: any) {
      setError(err.message || "Error al subir la imagen");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setEmailVerificationSent(false);
    setLoading(true);

    try {
      // Primero actualizar email si cambió
      const currentEmail = userData?.email || "";
      const emailChanged = email.trim().toLowerCase() !== currentEmail.toLowerCase();
      
      if (emailChanged) {
        const emailResponse = await fetch("/api/profile/update-email", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        });

        const emailData = await emailResponse.json();

        if (!emailResponse.ok) {
          throw new Error(emailData.error || "Error al actualizar email");
        }

        if (emailData.requiresVerification) {
          setEmailVerificationSent(true);
        }
      }

      // Subir avatar si hay uno nuevo
      if (avatarFile) {
        await handleAvatarUpload();
      }

      // Actualizar nombre, empresa y teléfono
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          full_name: fullName.trim() || null,
          company_name: companyName.trim() || null,
          phone: phone.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar perfil");
      }

      setSuccess(true);
      
      // Si solo se actualizaron nombre/empresa, cerrar después de 1 segundo
      // Si se cambió email, mantener abierto para mostrar mensaje de verificación
      if (!emailChanged) {
        setTimeout(() => {
          onUpdate();
          onClose();
        }, 1000);
      } else {
        // Recargar datos pero mantener modal abierto para mostrar mensaje
        onUpdate();
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al actualizar el perfil");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-md:p-4">
          <div className="flex items-center justify-between mb-6 max-md:mb-4">
            <span
              className="inline-flex items-center px-3 max-md:px-2.5 py-1.5 max-md:py-1 rounded-full text-base max-md:text-sm font-bold"
              style={{ backgroundColor: `${brandPrimary}15`, color: brandSecondary }}
            >
              Editar Perfil
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-md:space-y-3">
            {/* Foto de Perfil */}
            <div>
              <label className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4 max-md:gap-3">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="h-20 w-20 max-md:h-16 max-md:w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div 
                      className="h-20 w-20 max-md:h-16 max-md:w-16 rounded-full flex items-center justify-center text-2xl max-md:text-xl font-bold text-white"
                      style={{ backgroundColor: brandPrimary }}
                    >
                      {fullName ? fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U"}
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 h-6 w-6 max-md:h-5 max-md:w-5 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-xs max-md:text-[11px] text-gray-600 mb-1">
                    JPG, PNG o WebP. Máximo 5MB.
                  </p>
                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="text-xs max-md:text-[11px] font-medium text-brand-primary hover:underline disabled:opacity-50"
                    >
                      {uploadingAvatar ? "Subiendo..." : "Subir ahora"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 max-md:px-3 py-2 max-md:py-2 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 transition-all text-gray-900"
              />
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                Se enviará un email de confirmación al nuevo correo.
              </p>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                Nombre Completo
              </label>
              <input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                maxLength={100}
                className="w-full px-4 max-md:px-3 py-2 max-md:py-2 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 transition-all text-gray-900"
              />
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                Opcional. Este nombre aparecerá en tu perfil.
              </p>
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                Nombre de Empresa
              </label>
              <input
                id="company_name"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Ej: Mi Empresa S.A. de C.V."
                maxLength={100}
                className="w-full px-4 max-md:px-3 py-2 max-md:py-2 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 transition-all text-gray-900"
              />
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                Opcional. Útil si eres parte de una organización.
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: +52 55 1234 5678"
                maxLength={20}
                className="w-full px-4 max-md:px-3 py-2 max-md:py-2 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-0 focus:border-gray-300 transition-all text-gray-900"
              />
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                Opcional. Incluye código de país si es necesario.
              </p>
            </div>

            <div>
              <label className="block text-sm max-md:text-xs font-medium text-gray-700 mb-2 max-md:mb-1.5">
                País
              </label>
              <div className="flex items-center gap-2 px-4 max-md:px-3 py-2 max-md:py-2 border border-gray-300 rounded-lg bg-gray-50">
                <img 
                  src="https://flagcdn.com/w80/mx.png" 
                  srcSet="https://flagcdn.com/w160/mx.png 2x"
                  alt="Bandera de México" 
                  className="w-6 h-4 max-md:w-5 max-md:h-3.5 object-cover rounded-sm"
                  style={{ imageRendering: 'crisp-edges' }}
                  onError={(e) => {
                    // Fallback a emoji si la imagen no carga
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.flag-emoji')) {
                      const emoji = document.createElement('span');
                      emoji.className = 'flag-emoji text-lg';
                      emoji.textContent = '🇲🇽';
                      parent.insertBefore(emoji, parent.firstChild);
                    }
                  }}
                />
                <span className="text-sm max-md:text-xs font-medium text-gray-700">México</span>
              </div>
              <p className="text-xs max-md:text-[11px] text-gray-500 mt-1 max-md:mt-0.5">
                {hideMaflipp ? brandName : "Maflipp"} está disponible actualmente en México.
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 max-md:p-2.5 border border-red-200">
                <p className="text-sm max-md:text-xs text-red-800">{error}</p>
              </div>
            )}

            {emailVerificationSent && (
              <div className="rounded-md bg-blue-50 p-4 max-md:p-3 border border-blue-200">
                <div className="flex items-start gap-3 max-md:gap-2">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm max-md:text-xs font-semibold text-blue-900 mb-1 max-md:mb-0.5">
                      ✅ Cambios guardados correctamente
                    </p>
                    <p className="text-xs max-md:text-[11px] text-blue-800 mb-2 max-md:mb-1.5">
                      Hemos enviado un email de confirmación a <strong>{email}</strong>. Por favor revisa tu bandeja de entrada y haz clic en el enlace para confirmar el cambio de correo.
                    </p>
                    <p className="text-xs max-md:text-[11px] text-blue-700 italic">
                      Nota: El resto de tus cambios ya se han guardado. Solo necesitas confirmar el nuevo email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {success && !emailVerificationSent && (
              <div className="rounded-md bg-green-50 p-4 max-md:p-3 border border-green-200">
                <div className="flex items-start gap-3 max-md:gap-2">
                  <svg className="w-5 h-5 max-md:w-4 max-md:h-4 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm max-md:text-xs font-semibold text-green-900 mb-1 max-md:mb-0.5">
                      ✅ Cambios guardados correctamente
                    </p>
                    <p className="text-xs max-md:text-[11px] text-green-700">
                      Tu perfil ha sido actualizado exitosamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 max-md:gap-2 pt-4 max-md:pt-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 max-md:px-3 py-2 max-md:py-1.5 text-sm max-md:text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 max-md:px-4 py-2 max-md:py-1.5 text-sm max-md:text-xs font-semibold text-white rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-brand-primary hover-bg-brand-secondary"
              >
                {loading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


