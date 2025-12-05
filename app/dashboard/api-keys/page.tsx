import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function APIKeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get user data
  const { data: userData } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const isPro = userData?.subscription_status === "pro" || userData?.subscription_status === "enterprise";

  if (!isPro) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">API Keys</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Las API Keys están disponibles solo para planes Pro y Empresarial.
            </p>
            <a
              href="/dashboard/billing"
              className="inline-block px-4 py-2 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
            >
              Mejorar Plan
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">API Keys</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Gestiona tus API Keys y consulta la documentación completa en la página de desarrolladores.
          </p>
          <a
            href="/developers"
            className="inline-block px-6 py-3 bg-[#10B981] text-white rounded-lg hover:bg-[#059669] transition-colors font-medium"
          >
            Ir a Documentación API
          </a>
        </div>
      </div>
    </div>
  );
}

