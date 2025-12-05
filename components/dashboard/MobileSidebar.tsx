"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface MobileSidebarProps {
  user: User;
  userData: any;
}

export default function MobileSidebar({ user, userData }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isPro = userData?.subscription_status === "pro" || userData?.subscription_status === "enterprise";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "Historial", href: "/dashboard/historial", icon: "📋" },
    { name: "Mi Cuenta", href: "/dashboard/cuenta", icon: "👤" },
    { name: "Facturación", href: "/dashboard/billing", icon: "💳" },
    ...(isPro ? [{ name: "API Keys", href: "/dashboard/api-keys", icon: "🔑" }] : []),
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="sr-only">Abrir menú</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          <Link href="/" className="text-[#10B981]">
            ValidaRFC.mx
          </Link>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 pb-4 lg:hidden">
            <div className="flex h-16 shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-[#10B981]">
                ValidaRFC.mx
              </Link>
              <button
                type="button"
                className="ml-auto -m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setIsOpen(false)}
              >
                <span className="sr-only">Cerrar menú</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="mt-8">
              <ul role="list" className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`${
                          isActive
                            ? "bg-[#10B981] text-white"
                            : "text-gray-700 hover:text-[#10B981] hover:bg-gray-50"
                        } group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors`}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-4">
                  <button
                    onClick={handleSignOut}
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors w-full"
                  >
                    <span className="text-lg">🚪</span>
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      )}
    </>
  );
}

