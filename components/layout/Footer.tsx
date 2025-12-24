import Link from "next/link";
import Logo from "@/components/layout/Logo";
import InstallAppLink from "@/components/layout/InstallAppLink";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Logo size="lg" className="mb-4" showText={true} />
            <p className="text-gray-400 text-sm">
              Plataforma profesional de validación de RFCs contra el SAT
            </p>
          </div>

          {/* Producto */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-[#2F7E7A] transition-colors text-sm"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/developers"
                  className="hover:text-[#2F7E7A] transition-colors text-sm"
                >
                  Documentación API
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-[#2F7E7A] transition-colors text-sm"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <InstallAppLink />
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/terminos"
                  className="hover:text-[#2F7E7A] transition-colors text-sm"
                >
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidad"
                  className="hover:text-[#2F7E7A] transition-colors text-sm"
                >
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <p className="text-gray-400 text-sm mb-2">
              <a
                href="mailto:soporte@maflipp.com"
                className="hover:text-[#2F7E7A] transition-colors"
              >
                soporte@maflipp.com
              </a>
            </p>
            <div className="flex space-x-4 mt-4">
              {/* Puedes agregar íconos de redes sociales aquí */}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 Maflipp. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

