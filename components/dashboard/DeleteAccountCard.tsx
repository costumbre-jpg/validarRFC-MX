"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleConfirm = async () => {
    if (confirmText.trim().toUpperCase() !== "ELIMINAR") {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Llamar a la API para eliminar la cuenta
      const response = await fetch("/api/profile/delete-account", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la cuenta");
      }

      // Cerrar sesión
      await supabase.auth.signOut();

      // Redirigir al landing con mensaje
      router.push("/?accountDeleted=true");
      router.refresh();
    } catch (err: any) {
      console.error("Error eliminando cuenta:", err);
      setError(err.message || "Ocurrió un error al eliminar la cuenta. Por favor intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6 max-md:p-4">
        <div className="flex items-start gap-4 max-md:gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 max-md:w-8 max-md:h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 max-md:w-4 max-md:h-4 text-red-600"
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
          </div>
          <div className="flex-1">
            <h2 className="text-lg max-md:text-base font-semibold text-gray-900 mb-2 max-md:mb-1.5">
              Zona de Peligro
            </h2>
            <p className="text-sm max-md:text-xs text-gray-600 mb-4 max-md:mb-3">
              Una vez que elimines tu cuenta, no podrás recuperarla. Todos tus
              datos, validaciones e historial serán eliminados permanentemente.
            </p>
            <button
              className="px-4 max-md:px-3 py-2 max-md:py-1.5 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm max-md:text-xs"
              onClick={() => setOpen(true)}
            >
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal - Similar al de cerrar sesión */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => {
              if (!loading) {
                setOpen(false);
                setError(null);
                setConfirmText("");
              }
            }}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-md:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center w-12 h-12 max-md:w-10 max-md:h-10 mx-auto mb-4 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 max-md:w-5 max-md:h-5 text-red-600"
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

              <h3 className="text-lg max-md:text-base font-semibold text-gray-900 text-center mb-2">
                ¿Eliminar tu cuenta?
              </h3>
              <p className="text-sm max-md:text-xs text-gray-600 text-center mb-6 max-md:mb-4">
                Esta acción es permanente y no se puede deshacer. Se eliminarán
                tus datos, validaciones e historial.
              </p>
              
              {error && (
                <div className="mb-4 max-md:mb-3 p-3 max-md:p-2.5 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm max-md:text-xs text-red-800">{error}</p>
                </div>
              )}

              <div className="mb-5 max-md:mb-4">
                <label className="text-xs max-md:text-[11px] font-medium text-gray-700 block mb-2 max-md:mb-1.5">
                  Escribe <span className="font-semibold">ELIMINAR</span> para confirmar
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  disabled={loading}
                  className="w-full px-3 max-md:px-2.5 py-2 max-md:py-1.5 border border-gray-300 rounded-lg text-sm max-md:text-xs focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex gap-3 max-md:gap-2">
                <button
                  className="flex-1 px-4 max-md:px-3 py-2.5 max-md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm max-md:text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                    setConfirmText("");
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 max-md:px-3 py-2.5 max-md:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm max-md:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={handleConfirm}
                  disabled={confirmText.trim().toUpperCase() !== "ELIMINAR" || loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 max-md:h-3.5 max-md:w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    "Eliminar cuenta"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

