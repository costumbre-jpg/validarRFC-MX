import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getPlan, type PlanId } from "@/lib/plans";
import { sendEmail } from "@/lib/email";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

// Necesitamos runtime Node para poder usar la service role key
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
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
    const jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

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
    const { data: authUserData, error: authError } = jwt
      ? await supabaseAdmin.auth.getUser(jwt)
      : await supabase.auth.getUser();
    const user = authUserData?.user || null;

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar que el usuario tenga plan Pro o Business
    const { data: dbUser } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (dbUser?.subscription_status || "free") as PlanId;
    const plan = getPlan(planId);
    const isPro = planId === "pro" || planId === "business";

    if (!isPro) {
      return NextResponse.json(
        { error: "La gestión de equipo está disponible solo para planes Pro y Business" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Verificar límite de usuarios
    const maxUsers = plan.features.users === -1 ? Infinity : plan.features.users;
    const { count: currentMembersCount, error: membersCountError } = await supabaseAdmin
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .eq("team_owner_id", user.id)
      .in("status", ["pending", "active"]);

    if (membersCountError) {
      console.error("Error contando miembros:", membersCountError);
      return NextResponse.json(
        { error: "No se pudo validar el límite de usuarios" },
        { status: 500 }
      );
    }

    if (currentMembersCount !== null && currentMembersCount >= maxUsers) {
      return NextResponse.json(
        { error: `Has alcanzado el límite de ${maxUsers} usuarios para tu plan` },
        { status: 403 }
      );
    }

    // Verificar que el email no esté ya en el equipo
    const { data: existingMember } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("team_owner_id", user.id)
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "Este email ya está en tu equipo" },
        { status: 400 }
      );
    }

    // Generar token de invitación único
    const invitationToken = crypto.randomUUID() + "-" + Date.now().toString(36);

    // Crear invitación con service role (evita bloqueos por RLS)
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from("team_members")
      .insert({
        team_owner_id: user.id,
        email: email.toLowerCase(),
        role: "member",
        status: "pending",
        invitation_token: invitationToken,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creando invitación:", inviteError);
      return NextResponse.json(
        { error: "Error al crear invitación" },
        { status: 500 }
      );
    }

    // Enviar email de invitación (opcional - puede fallar silenciosamente)
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/equipo/accept?token=${invitationToken}`;
      await sendEmail({
        to: email,
        subject: `Invitación a unirte al equipo de Maflipp`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2F7E7A;">Invitación al Equipo</h2>
            <p>Has sido invitado a unirte al equipo de Maflipp.</p>
            <p>Haz clic en el siguiente enlace para aceptar la invitación:</p>
            <a href="${inviteUrl}" style="display: inline-block; background-color: #2F7E7A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Aceptar Invitación
            </a>
            <p style="color: #666; font-size: 12px;">Si no solicitaste esta invitación, puedes ignorar este email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error enviando email de invitación:", emailError);
      // Continuar aunque falle el email
    }

    return NextResponse.json(
      {
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          status: invitation.status,
        },
      },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error en invite route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

