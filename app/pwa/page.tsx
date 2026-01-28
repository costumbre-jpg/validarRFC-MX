"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";
import { createClient } from "@/lib/supabase/client";

export default function PwaEntryPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authModalOpen, setAuthModalOpen] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    
    const redirectToDashboard = () => {
      if (!active) return;
      // En PWA, usar window.location para evitar loops de redirect
      // Esto fuerza una recarga completa que asegura que el middleware vea las cookies
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      } else {
        router.replace("/dashboard");
      }
    };

    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        if (user) {
          redirectToDashboard();
          return;
        } else {
          setAuthModalOpen(true);
          setAuthMode("login");
        }
      } catch (err) {
        console.error("PWA auth check error:", err);
        setAuthModalOpen(true);
        setAuthMode("login");
      } finally {
        if (active) setChecking(false);
      }
    };
    
    check();
    
    // Escuchar cambios en la sesión (cuando el usuario hace login desde el modal)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "SIGNED_IN" && session?.user) {
        redirectToDashboard();
      }
    });
    
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Si ya redirigió, no mostramos nada
  if (!authModalOpen && checking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => {
            // Si se cierra sin login, se vuelve a abrir
            setAuthModalOpen(true);
          }}
          initialMode={authMode}
          redirectTo="/dashboard"
          centered={true}
        />
      </div>
    </div>
  );
}

