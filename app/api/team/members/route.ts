import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Obtener miembros del equipo
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener miembros del equipo donde el usuario es el dueño
    const { data: members, error } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_owner_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error obteniendo miembros:", error);
      return NextResponse.json(
        { error: "Error al obtener miembros del equipo" },
        { status: 500 }
      );
    }

    // También incluir al dueño del equipo
    const { data: ownerData } = await supabase
      .from("users")
      .select("id, email")
      .eq("id", user.id)
      .single();

    const allMembers = [
      {
        id: ownerData?.id,
        email: ownerData?.email,
        role: "owner",
        status: "active",
        created_at: new Date().toISOString(),
      },
      ...(members || []).map((m) => ({
        id: m.user_id || m.id,
        email: m.email,
        role: m.role,
        status: m.status,
        created_at: m.created_at,
      })),
    ];

    return NextResponse.json({ members: allMembers });
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
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
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

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error en delete member route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

