"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { planHasFeature, type PlanId } from "@/lib/plans";
import ConfirmLogoutModal from "@/components/dashboard/ConfirmLogoutModal";

interface MobileSidebarProps {
  userData: any;
  branding?: {
    brand_name?: string;
    custom_logo_url?: string | null;
    hide_maflipp_brand?: boolean;
    show_brand_name?: boolean;
  };
}

export default function MobileSidebar({ userData, branding }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/?loggedOut=1");
    router.refresh();
  };

  // Obtener parámetro 'plan' de la URL para mantenerlo en los links
  const planParam = searchParams.get("plan");
  const urlSuffix = planParam && ["pro", "business"].includes(planParam) ? `?plan=${planParam}` : "";

  // Priorizar el parámetro 'plan' de la URL sobre subscription_status de la BD
  // Esto permite el modo diseño con ?plan=pro o ?plan=business
  const planFromUrl = planParam && ["pro", "business"].includes(planParam) ? planParam : null;
  
  // SIEMPRE priorizar el parámetro de la URL si existe
  // Esto es crítico para el modo diseño
  const planId = planFromUrl 
    ? (planFromUrl as PlanId) 
    : ((userData?.subscription_status || "free") as PlanId);
  const isPro = planId === "pro" || planId === "business";
  const hasHistory = planHasFeature(planId, "history");

  const navItems = [
    { 
      name: "Dashboard", 
      href: `/dashboard${urlSuffix}`, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    ...(hasHistory ? [{ 
      name: "Historial", 
      href: `/dashboard/historial${urlSuffix}`, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }] : []),
    { 
      name: "Mi Cuenta", 
      href: `/dashboard/cuenta${urlSuffix}`, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    { 
      name: "Facturación", 
      href: `/dashboard/billing${urlSuffix}`, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    { 
      name: "Ayuda / FAQs", 
      href: `/dashboard/help${urlSuffix}`, 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    ...(isPro ? [
      { 
        name: "Equipo", 
        href: `/dashboard/equipo${urlSuffix}`, 
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      },
      { 
        name: "API Keys", 
        href: `/dashboard/api-keys${urlSuffix}`, 
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        )
      }
    ] : []),
    ...(planId === "business" ? [
      {
        name: "White Label",
        href: `/dashboard/white-label${urlSuffix}`,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        )
      },
      {
        name: "Onboarding",
        href: `/dashboard/onboarding${urlSuffix}`,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 20a5.5 5.5 0 1111 0" />
          </svg>
        )
      },
      {
        name: "CFDI",
        href: `/dashboard/cfdi${urlSuffix}`,
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m-7 4h8m-9 4h10m-9 4h8" />
          </svg>
        )
      }
    ] : [])
  ];

  const canWhiteLabel = planId === "business";
  const showCustomLogo = canWhiteLabel && branding?.custom_logo_url;
  const hideMaflipp = canWhiteLabel && branding?.hide_maflipp_brand;
  const brandName = canWhiteLabel && branding?.brand_name ? branding.brand_name : null;
  const showBrandName = canWhiteLabel && branding?.show_brand_name && brandName;

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
            <div className="flex-1 text-sm font-semibold leading-6 text-gray-900 flex items-center gap-2 min-w-0">
              <div className="flex flex-col items-start gap-0.5">
                {showCustomLogo ? (
                  <img
                    src={branding?.custom_logo_url || ""}
                    alt={branding?.brand_name || "Logo"}
                    className="h-10 w-auto object-contain"
                  />
                ) : hideMaflipp ? (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-transparent border-2 border-gray-300"
                    aria-hidden
                  />
                ) : (
                  <Logo size="md" showText={false} />
                )}
                {showBrandName && (
                  <span className="truncate text-xs font-semibold text-gray-900">
                    {brandName}
                  </span>
                )}
              </div>
            </div>
      </div>

      {/* Mobile sidebar overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-200 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 z-50 w-1/2 max-w-xs overflow-y-auto bg-white shadow-2xl border-r border-gray-200 px-4 max-md:px-3 pb-4 transition-transform duration-200 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex justify-between items-center p-4 max-md:p-3">
            <div className="flex flex-col items-start gap-0.5">
              {showCustomLogo ? (
                <img
                  src={branding?.custom_logo_url || ""}
                  alt={branding?.brand_name || "Logo"}
                  className="h-10 max-md:h-8 w-auto object-contain"
                />
              ) : hideMaflipp ? (
                <div
                  className="w-10 max-md:w-8 h-10 max-md:h-8 rounded-full flex items-center justify-center shadow-sm bg-transparent border-2 border-gray-300"
                  aria-hidden
                />
              ) : (
                <Logo size="md" showText={false} />
              )}
              {showBrandName && (
                <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[140px]">
                  {brandName}
                </span>
              )}
            </div>
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-brand-primary"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
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
          <nav className="flex flex-col space-y-2 px-4 max-md:px-3 pt-4 max-md:pt-6">
            <ul role="list" className="space-y-1">
                {navItems.map((item) => {
                  // Comparar solo la ruta sin query params
                  const itemPath = item.href.split('?')[0];
                  const currentPath = pathname.split('?')[0];
                  const isActive = currentPath === itemPath;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`${
                          isActive
                            ? "text-white shadow-sm border-l-4"
                            : "text-gray-700 hover:bg-gray-50"
                        } group flex gap-x-3 rounded-md p-2.5 text-sm leading-6 font-medium transition-all duration-200`}
                        style={
                          isActive
                            ? {
                                backgroundColor: "var(--brand-primary, #2F7E7A)",
                                borderColor: "var(--brand-secondary, #1F5D59)",
                              }
                            : {}
                        }
                      >
                        <span className={`flex-shrink-0 ${isActive ? "text-white" : ""}`}>{item.icon}</span>
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
                <li className="pt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowLogoutModal(true);
                    }}
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
      </div>

      {/* Modal de Confirmación */}
      <ConfirmLogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
      />
    </>
  );
}


