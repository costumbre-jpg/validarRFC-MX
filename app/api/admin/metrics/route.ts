import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Servidor mal configurado" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;
    if (!jwt) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    if (userError || !userData?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const adminEmails = parseAdminEmails();
    const userEmail = userData.user.email.toLowerCase();
    if (adminEmails.length > 0 && !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [{ count: usersCount }, { count: validationsCount }, { count: validationsMonthCount }] =
      await Promise.all([
        supabaseAdmin.from("users").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("validations").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("validations")
          .select("id", { count: "exact", head: true })
          .gte("created_at", startOfMonth.toISOString()),
      ]);

    const { data: apiKeys } = await supabaseAdmin
      .from("api_keys")
      .select("api_calls_this_month");

    const totalApiCallsThisMonth = (apiKeys || []).reduce(
      (sum, key) => sum + (key?.api_calls_this_month || 0),
      0
    );

    const { count: activeSubscriptions } = await supabaseAdmin
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");

    return NextResponse.json({
      usersCount: usersCount || 0,
      validationsCount: validationsCount || 0,
      validationsMonthCount: validationsMonthCount || 0,
      totalApiCallsThisMonth,
      activeSubscriptions: activeSubscriptions || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
