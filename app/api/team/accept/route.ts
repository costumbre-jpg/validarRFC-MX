import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

// Aseguramos runtime Node (no Edge) para usar service role
export const runtime = "nodejs";

// Aceptar invitación de equipo usando Service Role para evitar bloqueo por RLS
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor" },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    const body = await request.json().catch(() => null);
    const token = body?.token as string | undefined;
    if (!token) {
      return NextResponse.json(
        { error: "Token de invitación requerido" },
        { status: 400 }
      );
    }

    // Cliente para autenticar al usuario (respeta RLS); usa cookie o header
    const supabaseAuth = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // no-op
        },
      },
      global: jwt
        ? {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        : undefined,
    });

    const {
      data: { user },
      error: authError,
    } = jwt ? await supabaseAuth.auth.getUser(jwt) : await supabaseAuth.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Cliente admin para saltar RLS en la actualización controlada
    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);

    // Buscar invitación por token
    let { data: invitation, error: inviteError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("invitation_token", token)
      .single();

    // Fallback: si el token no se encuentra, buscar por email pendiente (caso de enlaces viejos o duplicados)
    if ((inviteError || !invitation) && user.email) {
      const { data: pendingInvites } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("email", user.email.toLowerCase())
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
      if (pendingInvites && pendingInvites.length === 1) {
        invitation = pendingInvites[0];
      }
    }

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitación no encontrada o token inválido" },
        { status: 404 }
      );
    }

    // Validar email coincide
    const invitationEmail = (invitation.email || "").toLowerCase();
    const userEmail = (user.email || "").toLowerCase();
    if (!invitationEmail || invitationEmail !== userEmail) {
      return NextResponse.json(
        {
          error: `Esta invitación fue enviada a ${invitationEmail || "email desconocido"}, pero la sesión es ${userEmail ||
            "otro email"}.`,
        },
        { status: 400 }
      );
    }

    // Actualizar invitación a activa y asociar usuario
    const { error: updateError } = await supabaseAdmin
      .from("team_members")
      .update({
        user_id: user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      return NextResponse.json(
        { error: "No se pudo aceptar la invitación" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en aceptar invitación:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}


