import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

// Usamos runtime Node para poder utilizar la service role key
export const runtime = "nodejs";

// Extrae el JWT de cookies supabase (pueden venir como JSON stringificado)
const extractJwtFromCookie = (raw?: string) => {
  if (!raw) return undefined;
  if (raw.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr[0]) {
        return arr[0] as string;
      }
    } catch {
      // ignore parse error
    }
  }
  return raw;
};

// GET: Obtener miembros del equipo
export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: false }, { status: 200 });

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
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    // Fallback: intentar obtener el token de cookies (sb-access-token)
    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieSetOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
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

    // Validar usuario; si hay JWT úsalo vía service role para evitar fallos de cookies
    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    let user = null;
    let authError: any = null;
    if (jwt) {
      const adminRes = await supabaseAdmin.auth.getUser(jwt);
      user = adminRes.data?.user || null;
      authError = adminRes.error;
      if (!user) {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user || null;
        authError = authError || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
      authError = userRes.error;
    }

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Buscar si el usuario es owner de algún equipo
    const { data: ownedMembers, error: ownedError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("team_owner_id", user.id)
      .order("created_at", { ascending: false });

    // Buscar si el usuario es miembro de algún equipo (donde user_id coincide)
    const userEmailLower = (user.email || "").toLowerCase().trim();

    // Buscar si el usuario es miembro (user_id poblado). Tomar la invitación más reciente.
    const { data: memberOf, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("user_id", user.id)
      .in("status", ["active", "pending"])
      .order("created_at", { ascending: false })
      .maybeSingle();

    // Fallback solo lectura: si no hay user_id, buscar por email activo/pendiente
    let memberByEmail: any = null;
    if (!memberOf) {
      const { data: memberEmailData } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .ilike("email", userEmailLower)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      memberByEmail = memberEmailData || null;
    }

    let teamOwnerId = user.id; // Por defecto, el usuario es owner
    let members: any[] = [];

    if (ownedMembers && ownedMembers.length > 0) {
      // El usuario es owner de un equipo
      members = ownedMembers;
      teamOwnerId = user.id;
    } else if (memberOf || memberByEmail) {
      // El usuario es miembro de un equipo (no owner)
      const memberRow = memberOf || memberByEmail;
      teamOwnerId = memberRow.team_owner_id;
      // Obtener todos los miembros de ese equipo
      const { data: allTeamMembers, error: teamError } = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("team_owner_id", teamOwnerId)
        .order("created_at", { ascending: false });
      
      if (!teamError && allTeamMembers) {
        members = allTeamMembers;
      }
    }

    if (ownedError && memberError) {
      console.error("Error obteniendo miembros:", ownedError || memberError);
      return NextResponse.json(
        { error: "Error al obtener miembros del equipo" },
        { status: 500 }
      );
    }

    // Obtener datos del owner del equipo (incluyendo subscription_status y avatar_url)
    const { data: ownerData } = await supabaseAdmin
      .from("users")
      .select("id, email, subscription_status, avatar_url")
      .eq("id", teamOwnerId)
      .single();

    // Obtener avatar_url de los miembros que tienen user_id
    const memberUserIds = (members || [])
      .filter((m) => m.user_id)
      .map((m) => m.user_id);
    
    let memberAvatars: Record<string, string | null> = {};
    if (memberUserIds.length > 0) {
      const { data: memberUsers } = await supabaseAdmin
        .from("users")
        .select("id, avatar_url")
        .in("id", memberUserIds);
      
      if (memberUsers) {
        memberAvatars = memberUsers.reduce((acc, u) => {
          acc[u.id] = u.avatar_url || null;
          return acc;
        }, {} as Record<string, string | null>);
      }
    }

    const allMembers = [
      {
        id: ownerData?.id,
        member_id: null,
        user_id: ownerData?.id,
        email: ownerData?.email,
        avatar_url: ownerData?.avatar_url || null,
        role: "owner",
        status: "active",
        created_at: new Date().toISOString(),
      },
      ...(members || []).map((m) => ({
        id: m.user_id || m.id,
        member_id: m.id,
        user_id: m.user_id,
        email: m.email,
        avatar_url: m.user_id ? (memberAvatars[m.user_id] || null) : null,
        role: m.role,
        status: m.status,
        created_at: m.created_at,
      })),
    ];

    return NextResponse.json(
      { 
        members: allMembers,
        ownerPlan: ownerData?.subscription_status || "free"
      },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error en members route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar miembro del equipo
export async function DELETE(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: false }, { status: 200 });

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
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    // Fallback: intentar obtener el token de cookies
    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieSetOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
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

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    let user = null;
    let authError: any = null;
    if (jwt) {
      const adminRes = await supabaseAdmin.auth.getUser(jwt);
      user = adminRes.data?.user || null;
      authError = adminRes.error;
      if (!user) {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user || null;
        authError = authError || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
      authError = userRes.error;
    }

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "ID de miembro requerido" },
        { status: 400 }
      );
    }

    // Verificar que el usuario sea el dueño del equipo
    const { data: member, error: memberError } = await supabase
      .from("team_members")
      .select("*")
      .eq("id", memberId)
      .eq("team_owner_id", user.id)
      .single();

    if (memberError || !member) {
      return NextResponse.json(
        { error: "Miembro no encontrado o no tienes permisos" },
        { status: 404 }
      );
    }

    // No permitir eliminar al dueño
    if (member.user_id === user.id) {
      return NextResponse.json(
        { error: "No puedes eliminarte a ti mismo del equipo" },
        { status: 400 }
      );
    }

    // Eliminar miembro
    const { error: deleteError } = await supabase
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("team_owner_id", user.id);

    if (deleteError) {
      console.error("Error eliminando miembro:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar miembro" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error en delete member route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

