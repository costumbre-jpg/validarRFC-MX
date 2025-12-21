"use client";

interface ConfirmLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmLogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: ConfirmLogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-md:p-4">
          <div className="flex items-center justify-center w-12 h-12 max-md:w-10 max-md:h-10 mx-auto mb-4 max-md:mb-3 bg-red-100 rounded-full">
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <h3 className="text-lg max-md:text-base font-semibold text-gray-900 text-center mb-2 max-md:mb-1.5">
            ¿Cerrar Sesión?
          </h3>
          <p className="text-sm max-md:text-xs text-gray-600 text-center mb-6 max-md:mb-4">
            Estás a punto de cerrar tu sesión. Podrás iniciar sesión nuevamente cuando quieras.
          </p>

          <div className="flex gap-3 max-md:gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 max-md:px-3 py-2.5 max-md:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm max-md:text-xs"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 max-md:px-3 py-2.5 max-md:py-2 border border-red-600 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm max-md:text-xs"
            >
              Sí, Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

