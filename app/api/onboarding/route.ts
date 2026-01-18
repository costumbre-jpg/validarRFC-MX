import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getPlan, type PlanId } from "@/lib/plans";
import { sendEmail } from "@/lib/email";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

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

const sanitize = (value: any, max = 500) =>
  typeof value === "string" ? value.slice(0, max).trim() : null;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(_request: NextRequest) {
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

    const authHeader = _request.headers.get("authorization") || "";
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(_request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(_request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(_request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return _request.cookies.getAll();
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

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;

    const { data, error } = await supabaseAdmin
      .from("onboarding_requests")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      planId,
      onboarding: data || null,
    });
  } catch (error) {
    console.error("Error obteniendo onboarding:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

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

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

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

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;
    const plan = getPlan(planId);

    if (planId !== "business" || !plan.features.other?.includes("Onboarding personalizado")) {
      return NextResponse.json(
        { error: "Onboarding personalizado disponible solo para plan Business" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const payload = {
      user_id: user.id,
      company_name: sanitize(body.company_name, 120),
      industry: sanitize(body.industry, 120),
      team_size: sanitize(body.team_size, 80),
      use_cases: sanitize(body.use_cases, 800),
      data_sources: sanitize(body.data_sources, 800),
      integration_preferences: sanitize(body.integration_preferences, 800),
      webhook_url: sanitize(body.webhook_url, 240),
      sandbox: Boolean(body.sandbox),
      contact_name: sanitize(body.contact_name, 120),
      contact_email: sanitize(body.contact_email, 200),
      status: sanitize(body.status, 40) || "pendiente",
      notes: sanitize(body.notes, 1000),
      updated_at: new Date().toISOString(),
    };

    if (payload.contact_email && !emailRegex.test(payload.contact_email)) {
      return NextResponse.json(
        { error: "Email de contacto inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("onboarding_requests")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error guardando onboarding:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Enviar emails solo cuando el status es "pendiente" (no para borradores)
    if (payload.status === "pendiente" && payload.contact_email) {
      // Email a soporte con todos los datos
      const supportEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charSet="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f3f4f6; }
              .container { max-width: 600px; margin: 0 auto; padding: 24px; }
              .card { background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }
              .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; text-align: left; }
              .pill { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 9999px; background-color: #ecfdf5; color: #047857; font-size: 12px; font-weight: 600; }
              .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 4px; }
              .value { font-size: 14px; color: #111827; }
              .field { margin-bottom: 12px; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; background-color: #dbeafe; color: #1e40af; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div style="margin-bottom: 16px; text-align: center;">
                    <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/imagencorreo.jpg" alt="Maflipp Logo" style="height: 60px; width: auto; display: block; margin: 0 auto; border-radius: 8px; background-color: #f3f4f6; padding: 8px;" />
                  </div>
                  <div class="pill">Nueva solicitud de onboarding personalizado</div>
                  <p style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                    Se ha recibido una nueva solicitud de onboarding personalizado desde el dashboard.
                  </p>
                </div>
                <div>
                  <div class="field">
                    <div class="label">Empresa</div>
                    <div class="value"><strong>${payload.company_name || "—"}</strong></div>
                  </div>
                  <div class="field">
                    <div class="label">Industria</div>
                    <div class="value">${payload.industry || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Tamaño del equipo</div>
                    <div class="value">${payload.team_size || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Contacto</div>
                    <div class="value"><strong>${payload.contact_name || "—"}</strong></div>
                  </div>
                  <div class="field">
                    <div class="label">Email de contacto</div>
                    <div class="value">${payload.contact_email || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Casos de uso</div>
                    <div class="value" style="white-space: pre-wrap;">${payload.use_cases || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Fuentes de datos</div>
                    <div class="value" style="white-space: pre-wrap;">${payload.data_sources || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Preferencias de integración</div>
                    <div class="value" style="white-space: pre-wrap;">${payload.integration_preferences || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Webhook URL</div>
                    <div class="value">${payload.webhook_url || "—"}</div>
                  </div>
                  <div class="field">
                    <div class="label">Requisitos especiales</div>
                    <div class="value">
                      ${payload.sandbox ? '<span class="badge">Necesita ambiente sandbox</span>' : "No"}
                    </div>
                  </div>
                  ${payload.notes ? `
                  <div class="field" style="margin-top: 16px;">
                    <div class="label">Notas adicionales</div>
                    <div class="value" style="white-space: pre-wrap;">${payload.notes}</div>
                  </div>
                  ` : ''}
                  <div class="field" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                    <div class="label">Usuario ID</div>
                    <div class="value" style="font-size: 11px; color: #6b7280; font-family: monospace;">${user.id}</div>
                  </div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Email de confirmación al cliente
      const clientEmailHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charSet="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f3f4f6; }
              .container { max-width: 600px; margin: 0 auto; padding: 24px; }
              .card { background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }
              .header { border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 16px; text-align: center; }
              .content { color: #4b5563; }
              .button { display: inline-block; background-color: #2F7E7A !important; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin-top: 20px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="card">
                <div class="header">
                  <div style="margin-bottom: 16px;">
                    <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/imagencorreo.jpg" alt="Maflipp Logo" style="height: 60px; width: auto; display: block; margin: 0 auto; border-radius: 8px; background-color: #f3f4f6; padding: 8px;" />
                  </div>
                  <h1 style="margin: 0; color: #111827; font-size: 24px;">Solicitud recibida</h1>
                </div>
                <div class="content">
                  <p>Hola <strong>${payload.contact_name || ""}</strong>,</p>
                  <p>Hemos recibido tu solicitud de onboarding personalizado para <strong>${payload.company_name || ""}</strong>.</p>
                  <p>Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo pronto para configurar tu cuenta según tus necesidades.</p>
                  <p>Si tienes alguna pregunta adicional, no dudes en contactarnos.</p>
                  <p style="margin-top: 24px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/onboarding" class="button" style="background-color: #2F7E7A !important; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
                      Ver mi solicitud
                    </a>
                  </p>
                  <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
                    Saludos,<br />
                    El equipo de Maflipp
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;

      // Enviar email a soporte (no bloquea si falla)
      sendEmail({
        to: "soporte@maflipp.com",
        subject: `Nueva solicitud de onboarding - ${payload.company_name || "Sin empresa"}`,
        html: supportEmailHtml,
      }).catch((err) => {
        console.error("❌ Error enviando email a soporte:", err);
      });

      // Enviar confirmación al cliente (no bloquea si falla)
      sendEmail({
        to: payload.contact_email,
        subject: "Solicitud de onboarding recibida - Maflipp",
        html: clientEmailHtml,
      }).catch((err) => {
        console.error("❌ Error enviando email de confirmación al cliente:", err);
      });
    }

    return NextResponse.json({ success: true, onboarding: data });
  } catch (error) {
    console.error("Error guardando onboarding:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

