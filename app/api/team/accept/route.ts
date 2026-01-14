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
    // Token es opcional ahora - buscaremos por email si no se proporciona

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

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Autenticación robusta: intenta con admin + fallback al cliente normal
    let user = null;
    let authError: any = null;
    if (jwt) {
      const adminRes = await supabaseAdmin.auth.getUser(jwt);
      if (adminRes.data?.user) {
        user = adminRes.data.user;
      } else {
        const userRes = await supabaseAuth.auth.getUser(jwt);
        user = userRes.data?.user ?? null;
        authError = adminRes.error || userRes.error;
      }
    } else {
      const userRes = await supabaseAuth.auth.getUser();
      user = userRes.data?.user ?? null;
      authError = userRes.error;
    }

    if (authError || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userEmailLower = (user.email || "").toLowerCase().trim();

    console.log("[TEAM ACCEPT] Buscando invitación:", {
      token: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
      userEmail: user.email,
      userEmailLower,
      userId: user.id,
    });

    let invitation: any = null;

    // 1) Si hay token, intentar buscar por token primero
    if (token) {
      const { data: tokenInvite, error: tokenError } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("invitation_token", token)
        .maybeSingle();
      
      if (tokenInvite) {
        invitation = tokenInvite;
        console.log("[TEAM ACCEPT] Invitación encontrada por token:", invitation.id);
      } else {
        console.log("[TEAM ACCEPT] No se encontró invitación por token:", tokenError?.message);
      }
    }

    // 2) Si no se encontró por token (o no hay token), buscar todas las pendientes por email
    if (!invitation && userEmailLower) {
      const { data: pendingInvites, error: pendingError } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .ilike("email", userEmailLower) // Usar ilike para comparación case-insensitive
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      console.log("[TEAM ACCEPT] Búsqueda por email pendiente:", {
        found: pendingInvites?.length || 0,
        emails: pendingInvites?.map((p: any) => p.email),
        error: pendingError?.message,
      });

      if (pendingInvites && pendingInvites.length > 0) {
        // Tomar la más reciente
        invitation = pendingInvites[0];
        console.log("[TEAM ACCEPT] Invitación encontrada por email pendiente:", invitation.id);
      }
    }

    // 3) Si no hay pendiente, buscar si ya es activo
    if (!invitation && userEmailLower) {
      const { data: activeMembers, error: activeError } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .ilike("email", userEmailLower)
        .eq("status", "active")
        .limit(1);
      
      console.log("[TEAM ACCEPT] Búsqueda por email activo:", {
        found: activeMembers?.length || 0,
        error: activeError?.message,
      });

      if (activeMembers && activeMembers.length > 0) {
        const active = activeMembers[0];
        // Si ya está activo pero no tiene user_id, asociarlo
        if (!active.user_id || active.user_id !== user.id) {
          console.log("[TEAM ACCEPT] Asociando user_id a miembro activo existente");
          await supabaseAdmin
            .from("team_members")
            .update({
              user_id: user.id,
              status: "active",
              accepted_at: new Date().toISOString(),
            })
            .eq("id", active.id);
        }
        return NextResponse.json({ success: true });
      }
    }

    // 4) Si aún no hay invitación, hacer búsqueda más amplia (cualquier estado)
    if (!invitation && userEmailLower) {
      const { data: anyInvites, error: anyError } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .ilike("email", userEmailLower)
        .order("created_at", { ascending: false })
        .limit(5);
      
      console.log("[TEAM ACCEPT] Búsqueda amplia por email:", {
        found: anyInvites?.length || 0,
        invites: anyInvites?.map((i: any) => ({
          id: i.id,
          email: i.email,
          status: i.status,
          token: i.invitation_token ? `${i.invitation_token.substring(0, 20)}...` : null,
        })),
        error: anyError?.message,
      });

      if (anyInvites && anyInvites.length > 0) {
        // Intentar con la más reciente pendiente o inactive
        const pendingOrInactive = anyInvites.find((i: any) => i.status === "pending" || i.status === "inactive");
        if (pendingOrInactive) {
          invitation = pendingOrInactive;
          console.log("[TEAM ACCEPT] Usando invitación pendiente/inactiva encontrada:", invitation.id);
        }
      }
    }

    // 5) Si aún no hay invitación, devolver error con información de debug
    if (!invitation) {
      console.error("[TEAM ACCEPT] ERROR: No se encontró ninguna invitación", {
        token: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
        userEmail: user.email,
        userEmailLower,
      });
      return NextResponse.json(
        { 
          error: "Invitación no encontrada o token inválido",
          debug: {
            hasToken: !!token,
            userEmail: user.email,
            suggestion: "Verifica que el email de tu cuenta coincida exactamente con el email al que se envió la invitación"
          }
        },
        { status: 404 }
      );
    }

    console.log("[TEAM ACCEPT] Invitación encontrada:", {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      userId: invitation.user_id,
      currentUserId: user.id,
    });

    // 6) Si ya está activa y con user_id, devolver success
    if (invitation.status === "active" && invitation.user_id === user.id) {
      console.log("[TEAM ACCEPT] Invitación ya está activa y asociada al usuario");
      return NextResponse.json({ success: true });
    }

    // 7) Aceptar: asociar user y activar sin validar email para evitar bloqueos
    console.log("[TEAM ACCEPT] Actualizando invitación a activa...");
    const { error: updateError } = await supabaseAdmin
      .from("team_members")
      .update({
        user_id: user.id,
        status: "active",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", invitation.id);

    if (updateError) {
      console.error("[TEAM ACCEPT] Error actualizando invitación:", updateError);
      return NextResponse.json(
        { error: "No se pudo aceptar la invitación", detail: updateError.message },
        { status: 500 }
      );
    }

    console.log("[TEAM ACCEPT] ✅ Invitación aceptada exitosamente");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en aceptar invitación:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}


