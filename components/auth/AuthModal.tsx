"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
  redirectTo?: string;
  centered?: boolean;
}

export default function AuthModal({ isOpen, onClose, initialMode = "login", redirectTo, centered = false }: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [registerNeedsEmailConfirm, setRegisterNeedsEmailConfirm] = useState(false);
  const finalRedirectTo = redirectTo || "/dashboard";

  useEffect(() => {
    if (!isOpen) {
      // Reset completo al cerrar el modal para evitar estados de carga atascados
      setLoading(false);
      setError(null);
      setForgotSuccess(false);
      setRegisterNeedsEmailConfirm(false);
      return;
    }

    // Al abrir, restablecer modo inicial y limpiar mensajes
    setMode(initialMode);
    setError(null);
    setForgotSuccess(false);
    setRegisterNeedsEmailConfirm(false);
    setLoading(false);
  }, [isOpen, initialMode]);

  // Validación de email en tiempo real
  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailValue && !emailRegex.test(emailValue)) {
      setEmailError("Por favor ingresa un email válido");
      return false;
    } else {
      setEmailError(null);
      return true;
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      validateEmail(value);
    } else {
      setEmailError(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Sincronizar sesión con cookies para que el middleware pueda ver al usuario autenticado
      const session = data?.session;
      if (session) {
        try {
          await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: session.access_token,
              refresh_token: session.refresh_token,
            }),
            credentials: "include",
          });
          // Pequeño delay para asegurar que el navegador persista las cookies
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch {
          // Si falla, seguimos con la navegación usando solo localStorage
        }
      }

      onClose();
      // En PWA/móvil, usar window.location.href para evitar loops de redirect
      // Esto fuerza una recarga completa que asegura que las cookies se lean correctamente
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/pwa")) {
        window.location.href = finalRedirectTo;
      } else {
        router.push(finalRedirectTo);
        router.refresh();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setForgotSuccess(false);

    if (!validateEmail(email)) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setForgotSuccess(true);
      setLoading(false);
    } catch {
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRegisterNeedsEmailConfirm(false);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (signUpData?.user) {
        if (signUpData.session) {
          trackEvent("sign_up", { method: "email" });
          await new Promise(resolve => setTimeout(resolve, 500));
          onClose();
          window.location.href = finalRedirectTo;
          return;
        } else {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError && signInData?.session) {
            trackEvent("sign_up", { method: "email" });
            await new Promise(resolve => setTimeout(resolve, 500));
            onClose();
            window.location.href = finalRedirectTo;
            return;
          }

          // Email confirmation requerida: mostrar mensaje in-app (más profesional que alert)
          setError(null);
          setLoading(false);
          setRegisterNeedsEmailConfirm(true);
          trackEvent("sign_up_pending", { method: "email" });
          return;
        }
      }

      setError("No se pudo crear la cuenta. Por favor intenta de nuevo.");
      setLoading(false);
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    setError(null);

    try {
      const supabase = createClient();
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth-from", "oauth");
        }
      } catch (_e) {
        // ignore localStorage issues
      }
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: provider === "google" ? { prompt: "select_account" } : undefined,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado. Por favor intenta de nuevo.");
    }
  };

  // Contenido del formulario (reutilizable)
  const renderFormContent = () => (
    <>
      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 max-md:p-3 mb-4 max-md:mb-3">
          <p className="text-sm max-md:text-xs font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Register Success (needs email confirmation) */}
      {mode === "register" && registerNeedsEmailConfirm && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 max-md:p-3 mb-4 max-md:mb-3">
          <p className="text-sm max-md:text-xs font-semibold text-emerald-900">Cuenta creada</p>
          <p className="mt-1 max-md:mt-0.5 text-sm max-md:text-xs text-emerald-900/80">
            Te enviamos un <strong>enlace</strong> de confirmación a tu correo. Ábrelo para activar tu cuenta y luego inicia sesión.
          </p>
          <div className="mt-3 max-md:mt-2 flex gap-2 max-md:gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRegisterNeedsEmailConfirm(false);
                setMode("login");
              }}
              className="flex-1 py-2.5 max-md:py-2 rounded-lg font-semibold text-sm max-md:text-xs bg-[#2F7E7A] text-white hover:bg-[#1F5D59] transition-colors"
            >
              Ir a iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setRegisterNeedsEmailConfirm(false)}
              className="flex-1 py-2.5 max-md:py-2 rounded-lg font-semibold text-sm max-md:text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-4 max-md:space-y-3" autoComplete="off">
          <div>
            <label htmlFor="modal-email" className="sr-only">
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              className={`w-full px-4 max-md:px-3 py-3 max-md:py-2.5 text-sm max-md:text-sm border ${
                emailError ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900`}
              placeholder="Email"
              autoComplete="username"
            />
            {emailError && (
              <p className="mt-1 max-md:mt-0.5 text-sm max-md:text-xs text-red-600">{emailError}</p>
            )}
          </div>
          <div className="relative">
            <label htmlFor="modal-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="modal-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 max-md:px-3 py-3 max-md:py-2.5 pr-10 max-md:pr-9 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900"
              placeholder="Contraseña"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 max-md:pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="text-sm max-md:text-xs text-right">
            <a
              href="#"
              className="text-[#2F7E7A] hover:text-[#1F5D59]"
              onClick={(e) => {
                e.preventDefault();
                setError(null);
                setForgotSuccess(false);
                setLoading(false);
                setMode("forgot");
              }}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7E7A] text-white py-3 max-md:py-2.5 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          <p className="text-[11px] max-md:text-[10px] text-gray-500 text-center leading-relaxed">
            Seguridad de sesión • Datos protegidos
          </p>
        </form>
      ) : mode === "forgot" ? (
        <div className="space-y-4 max-md:space-y-3">
          <div>
            <h3 className="text-lg max-md:text-base font-semibold text-gray-900">Recuperar contraseña</h3>
            <p className="mt-1 max-md:mt-0.5 text-sm max-md:text-xs text-gray-600">
              Te enviaremos un <strong>enlace</strong> a tu correo para restablecer tu contraseña (no es un código).
            </p>
          </div>

          {forgotSuccess ? (
            <div className="rounded-md bg-green-50 p-4 max-md:p-3">
              <p className="text-sm max-md:text-xs font-medium text-green-800">
                Listo. Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4 max-md:space-y-3" autoComplete="off">
              <div>
                <label htmlFor="modal-forgot-email" className="sr-only">
                  Email
                </label>
                <input
                  id="modal-forgot-email"
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  className={`w-full px-4 max-md:px-3 py-3 max-md:py-2.5 text-sm max-md:text-sm border ${
                    emailError ? "border-red-300" : "border-gray-300"
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900`}
                  placeholder="Email"
                  autoComplete="username"
                />
                {emailError && <p className="mt-1 max-md:mt-0.5 text-sm max-md:text-xs text-red-600">{emailError}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2F7E7A] text-white py-3 max-md:py-2.5 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Enviando..." : "Enviar link de recuperación"}
              </button>
            </form>
          )}

          <button
            type="button"
            onClick={() => {
              setError(null);
              setForgotSuccess(false);
              setLoading(false);
              setMode("login");
            }}
            className="w-full py-3 max-md:py-2.5 rounded-lg font-semibold text-sm max-md:text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Volver a iniciar sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4 max-md:space-y-3" autoComplete="off">
          <div>
            <label htmlFor="modal-register-email" className="sr-only">
              Email
            </label>
            <input
              id="modal-register-email"
              type="email"
              required
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              className={`w-full px-4 max-md:px-3 py-3 max-md:py-2.5 text-sm max-md:text-sm border ${
                emailError ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900`}
              placeholder="Email"
              autoComplete="username"
            />
            {emailError && (
              <p className="mt-1 max-md:mt-0.5 text-sm max-md:text-xs text-red-600">{emailError}</p>
            )}
          </div>
          <div className="relative">
            <label htmlFor="modal-register-password" className="sr-only">
              Contraseña
            </label>
            <input
              id="modal-register-password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 max-md:px-3 py-3 max-md:py-2.5 pr-10 max-md:pr-9 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900"
              placeholder="Contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 max-md:pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="relative">
            <label htmlFor="modal-confirm-password" className="sr-only">
              Confirmar Contraseña
            </label>
            <input
              id="modal-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 max-md:px-3 py-3 max-md:py-2.5 pr-10 max-md:pr-9 text-sm max-md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2F7E7A] focus:border-[#2F7E7A] text-gray-900"
              placeholder="Confirmar Contraseña"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 max-md:pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 max-md:h-4 max-md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex items-center">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 max-md:h-3.5 w-4 max-md:w-3.5 text-[#2F7E7A] focus:ring-[#2F7E7A] border-gray-300 rounded"
            />
            <label htmlFor="accept-terms" className="ml-2 max-md:ml-1.5 text-sm max-md:text-xs text-gray-600">
              Acepto los{" "}
              <a
                href="/terminos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2F7E7A] hover:text-[#1F5D59]"
              >
                términos
              </a>{" "}
              y la{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2F7E7A] hover:text-[#1F5D59]"
              >
                privacidad
              </a>
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2F7E7A] text-white py-3 max-md:py-2.5 rounded-lg hover:bg-[#1F5D59] transition-colors font-semibold text-sm max-md:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
          <p className="text-[11px] max-md:text-[10px] text-gray-500 text-center leading-relaxed">
            Sin tarjeta • Cancela cuando quieras
          </p>
        </form>
      )}

      {/* Divider */}
      <div className="my-6 max-md:my-4 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 max-md:px-3 text-sm max-md:text-xs text-gray-500">O continúa con</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3 max-md:space-y-2">
        <button
          onClick={() => handleOAuthSignIn("google")}
          className="w-full flex items-center justify-center gap-3 max-md:gap-2 px-4 max-md:px-3 py-3 max-md:py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 max-md:w-4 max-md:h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-gray-700 font-medium text-sm max-md:text-xs">Google</span>
        </button>
      </div>
    </>
  );

  // Si está centrado, mostrar como contenido normal sin modal
  if (centered) {
    if (!isOpen) return null;
    
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-6 max-md:p-4">
        {/* Logo */}
        <div className="mb-3 max-md:mb-2 flex items-center justify-center">
          <Link
            href="/"
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
              router.refresh();
            }}
            className="inline-flex items-center justify-center"
            aria-label="Ir al inicio"
          >
            <Image
              src="/Maflipp-recortada.png"
              alt="Maflipp"
              width={72}
              height={72}
              className="h-14 max-md:h-12 w-14 max-md:w-12 object-contain"
              priority
            />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 max-md:mb-4">
          <button
            onClick={() => {
              setMode("login");
              setError(null);
              setForgotSuccess(false);
              setLoading(false);
            }}
            className={`flex-1 py-3 max-md:py-2 text-center font-medium transition-colors text-sm max-md:text-xs ${
              mode === "login"
                ? "text-[#2F7E7A] border-b-2 border-[#2F7E7A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => {
              setMode("register");
              setError(null);
              setForgotSuccess(false);
              setLoading(false);
            }}
            className={`flex-1 py-3 max-md:py-2 text-center font-medium transition-colors text-sm max-md:text-xs ${
              mode === "register"
                ? "text-[#2F7E7A] border-b-2 border-[#2F7E7A]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Registrarse
          </button>
        </div>

        {renderFormContent()}
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-30 transition-opacity z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      ></div>

      {/* Modal Panel - Desde la derecha */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="relative h-full overflow-y-auto p-6 max-md:p-4 pt-5 max-md:pt-4">
          {/* Close Button */}
          <button
            onClick={() => {
              setLoading(false);
              onClose();
            }}
            className="absolute top-4 max-md:top-3 right-4 max-md:right-3 text-gray-400 hover:text-gray-600 transition-colors p-2 max-md:p-1.5"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6 max-md:w-5 max-md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Logo */}
          <div className="mb-3 max-md:mb-2 flex items-center justify-center">
            <Link
              href="/"
              onClick={(e) => {
                // Mantener UX: cerrar modal al navegar al inicio
                e.preventDefault();
                onClose();
                router.push("/");
                router.refresh();
              }}
              className="inline-flex items-center justify-center"
              aria-label="Ir al inicio"
            >
              <Image
                src="/Maflipp-recortada.png"
                alt="Maflipp"
                width={72}
                height={72}
                className="h-14 max-md:h-12 w-14 max-md:w-12 object-contain"
                priority
              />
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6 max-md:mb-4">
            <button
              onClick={() => {
                setMode("login");
                setError(null);
                setForgotSuccess(false);
                setLoading(false);
              }}
              className={`flex-1 py-3 max-md:py-2 text-center font-medium transition-colors text-sm max-md:text-xs ${
                mode === "login"
                  ? "text-[#2F7E7A] border-b-2 border-[#2F7E7A]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError(null);
                setForgotSuccess(false);
                setLoading(false);
              }}
              className={`flex-1 py-3 max-md:py-2 text-center font-medium transition-colors text-sm max-md:text-xs ${
                mode === "register"
                  ? "text-[#2F7E7A] border-b-2 border-[#2F7E7A]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Registrarse
            </button>
          </div>

          {renderFormContent()}
        </div>
      </div>
    </>
  );
}
