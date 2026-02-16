import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAuthTokenFromRequest } from "@/lib/jwt-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "Falta configuración de Supabase." },
        { status: 500 }
      );
    }

    const jwt = getAuthTokenFromRequest(request);

    if (!jwt) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(jwt);
    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    const { error: deleteError } = await supabaseAdmin
      .from("validations")
      .delete()
      .eq("user_id", userId);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "Error al eliminar validaciones" },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ rfc_queries_this_month: 0 })
      .eq("id", userId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: "Error al reiniciar contador" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/validations/reset:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

