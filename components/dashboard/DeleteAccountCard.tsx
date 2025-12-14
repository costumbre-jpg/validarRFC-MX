"use client";

import { useState } from "react";

export default function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    alert(
      "Función de eliminar cuenta en desarrollo. Por favor contacta a soporte para eliminar tu cuenta."
    );
    setOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Zona de Peligro
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Una vez que elimines tu cuenta, no podrás recuperarla. Todos tus
              datos, validaciones e historial serán eliminados permanentemente.
            </p>
            <button
              className="px-4 py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
              onClick={() => setOpen(true)}
            >
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>

      {/* Modal profesional */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-gray-900/60"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
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
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                ¿Eliminar tu cuenta?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Esta acción es permanente y no se puede deshacer. Se eliminarán
                tus datos, validaciones e historial.
              </p>
              <div className="mb-5">
                <label className="text-xs font-medium text-gray-700 block mb-2">
                  Escribe <span className="font-semibold">ELIMINAR</span> para confirmar
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ELIMINAR"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex-1 px-4 py-2.5 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirm}
                  disabled={confirmText.trim().toUpperCase() !== "ELIMINAR"}
                >
                  Eliminar cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

