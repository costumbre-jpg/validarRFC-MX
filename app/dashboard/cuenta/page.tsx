import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function CuentaPage() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi Cuenta</h1>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan</label>
            <p className="mt-1 text-sm text-gray-900">
              {userData?.subscription_status === "free" && "Gratis"}
              {userData?.subscription_status === "pro" && "Pro"}
              {userData?.subscription_status === "enterprise" && "Empresarial"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de registro</label>
            <p className="mt-1 text-sm text-gray-900">
              {userData?.created_at
                ? new Date(userData.created_at).toLocaleDateString("es-MX")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

