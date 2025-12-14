"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/button";

interface HeaderProps {
  showAuth?: boolean;
}

export default function Header({ showAuth = true }: HeaderProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo size="md" />

          {/* Navigation */}
          {!isDashboard && (
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium"
              >
                Inicio
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium"
              >
                Precios
              </Link>
              <Link
                href="/developers"
                className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium"
              >
                API
              </Link>
              <Link
                href="#contacto"
                className="text-gray-700 hover:text-[#2F7E7A] transition-colors font-medium"
              >
                Contacto
              </Link>
            </nav>
          )}

          {/* Auth Buttons */}
          {showAuth && !isDashboard && (
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" size="md">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="md">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

