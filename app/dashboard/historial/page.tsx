import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ValidationHistory from "@/components/dashboard/ValidationHistory";

export default async function HistorialPage() {
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

  // Get all validations
  const { data: validations } = await supabase
    .from("validations")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Historial de Validaciones</h1>
      <ValidationHistory
        validations={validations || []}
        userData={userData}
        showFullTable={true}
      />
    </div>
  );
}

