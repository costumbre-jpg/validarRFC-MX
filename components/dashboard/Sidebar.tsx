"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface SidebarProps {
  user: User;
  userData: any;
}

export default function Sidebar({ user, userData }: SidebarProps) {
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
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link href="/" className="text-2xl font-bold text-[#10B981]">
            ValidaRFC.mx
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
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
              </ul>
            </li>
            <li className="mt-auto">
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
    </div>
  );
}

