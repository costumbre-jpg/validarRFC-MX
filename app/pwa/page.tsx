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
    const check = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!active) return;
        if (user) {
          router.replace("/dashboard");
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
    return () => {
      active = false;
    };
  }, [router, supabase]);

  // Si ya redirigió, no mostramos nada
  if (!authModalOpen && checking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          // Si se cierra sin login, se vuelve a abrir
          setAuthModalOpen(true);
        }}
        initialMode={authMode}
        redirectTo="/dashboard"
      />
    </div>
  );
}

