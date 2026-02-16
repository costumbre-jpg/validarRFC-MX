"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { planHasFeature, type PlanId } from "@/lib/plans";
import ConfirmLogoutModal from "@/components/dashboard/ConfirmLogoutModal";

interface SidebarProps {
  userData: any;
  branding?: {
    brand_name?: string;
    custom_logo_url?: string | null;
    hide_maflipp_brand?: boolean;
    show_brand_name?: boolean;
  };
}

export default function Sidebar({ userData, branding }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSignOut = async () => {
    try {
      // Set logout flag in sessionStorage before signing out
      sessionStorage.setItem("auth-logout-success", "true");
    } catch {
      // sessionStorage might not be available
    }
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const planId = (userData?.subscription_status || "free") as PlanId;
  const isPro = planId === "pro" || planId === "business";
  const hasHistory = planHasFeature(planId, "history");

  const baseNavItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: "Mi Cuenta",
      href: "/dashboard/cuenta",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      name: "Facturación",
      href: "/dashboard/billing",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    {
      name: "Ayuda / FAQs",
      href: "/dashboard/help",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  const historyItem = hasHistory ? [{
    name: "Historial",
    href: "/dashboard/historial",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }] : [];

  const bulkUploadItem = {
    name: "Carga Masiva",
    href: "/dashboard/carga-masiva",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    )
  };

  const proItems = isPro ? [
    {
      name: "Equipo",
      href: "/dashboard/equipo",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "API Keys",
      href: "/dashboard/api-keys",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      )
    }
  ] : [];

  const businessItems = planId === "business" ? [
    {
      name: "White Label",
      href: "/dashboard/white-label",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
    },
    {
      name: "Onboarding",
      href: "/dashboard/onboarding",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 20a5.5 5.5 0 1111 0" />
        </svg>
      )
    },
    {
      name: "CFDI",
      href: "/dashboard/cfdi",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
        </svg>
      )
    }
  ] : [];

  const navItems = [
    ...baseNavItems,
    ...historyItem,
    bulkUploadItem,
    ...proItems,
    ...businessItems
  ].filter(Boolean);

  const canWhiteLabel = planId === "business";
  const showCustomLogo = canWhiteLabel && branding?.custom_logo_url;
  const hideMaflipp = canWhiteLabel && branding?.hide_maflipp_brand;
  const brandName = canWhiteLabel && branding?.brand_name ? branding.brand_name : null;
  const showBrandName = canWhiteLabel && branding?.show_brand_name && brandName;

  // Lógica: 
  // 1. Si hay logo personalizado → mostrar logo personalizado
  // 2. Si no hay logo personalizado pero hideMaflipp está activado → mostrar círculo
  // 3. Si no hay logo personalizado y hideMaflipp está desactivado → mostrar logo Maflipp
  // 4. Si no es Business → siempre mostrar logo Maflipp

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-20 shrink-0 items-center gap-3">
          <div className="flex flex-col items-start gap-1">
            {showCustomLogo ? (
              <Image
                src={branding?.custom_logo_url || ""}
                alt={branding?.brand_name || "Logo"}
                width={140}
                height={56}
                className="h-14 w-auto object-contain"
                unoptimized
              />
            ) : hideMaflipp ? (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md bg-transparent border-2 border-gray-300"
                aria-hidden
              />
            ) : (
              <Logo size="lg" showText={false} />
            )}
            {showBrandName && (
              <span className="text-xs font-semibold text-gray-700 truncate max-w-[160px]">
                {brandName}
              </span>
            )}
          </div>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navItems.map((item) => {
                  // Comparar solo la ruta sin query params
                  const itemPath = item.href.split('?')[0];
                  const currentPath = pathname.split('?')[0];
                  const isActive = currentPath === itemPath;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`${isActive
                          ? "text-white shadow-sm border-l-4"
                          : "text-gray-700 hover:bg-gray-50"
                          } group flex gap-x-3 rounded-md p-2.5 text-sm leading-6 font-medium transition-all duration-200`}
                        style={
                          isActive
                            ? {
                              backgroundColor: "var(--brand-primary, #2F7E7A)",
                              borderColor: "var(--brand-secondary, #1F5D59)",
                            }
                            : {
                              color: "inherit",
                            }
                        }
                      >
                        <span className={`flex-shrink-0 ${isActive ? "text-white" : ""}`}>{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li className="mt-auto">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="group -mx-2 flex gap-x-3 rounded-md p-2.5 text-sm font-medium leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors w-full"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Modal de Confirmación */}
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
      />
    </div>
  );
}


