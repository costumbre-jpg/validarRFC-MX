import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { checkBlacklist } from "@/lib/blacklist";
import { getPlanValidationLimit, type PlanId } from "@/lib/plans";
import { validateRFC, normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";
import { rateLimit } from "@/lib/rate-limit";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { getAuthTokenFromRequest } from "@/lib/jwt-utils";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests por minuto
const RATE_LIMIT_WINDOW_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, valid: false, rfc: "", remaining: 0, message: "Falta configuración de Supabase." },
        { status: 500 }
      );
    }

    const jwt = getAuthTokenFromRequest(request);

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let user: { id: string; email?: string } | null = null;
    let userEmail: string | undefined = undefined;
    if (jwt) {
      const { data, error } = await supabaseAdmin.auth.getUser(jwt);
      if (!error && data?.user) {
        user = { id: data.user.id, email: data.user.email };
        userEmail = data.user.email;
      }
    }
    // Fallback: obtener usuario desde cookies con createServerClient (Next.js)
    if (!user) {
      try {
        const supabaseServer = await createServerSupabase();
        const { data: { user: serverUser } } = await supabaseServer.auth.getUser();
        if (serverUser) {
          user = { id: serverUser.id, email: serverUser.email };
          userEmail = serverUser.email;
        }
      } catch (_) {
        // ignore
      }
    }
    if (!user) {
      return NextResponse.json(
        { success: false, valid: false, rfc: "", remaining: 0, message: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Parsear body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Body JSON inválido",
        },
        { status: 400 }
      );
    }

    const { rfc, forceRefresh = false } = body;

    // 3. Validar que RFC esté presente
    if (!rfc || typeof rfc !== "string") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "RFC es requerido",
        },
        { status: 400 }
      );
    }

    // 4. Limpiar y formatear RFC
    const formattedRFC = normalizeRFC(rfc);

    // 5. Validar formato RFC
    if (!isValidRFCFormatStrict(formattedRFC)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: 0,
          message: "Formato de RFC inválido",
        },
        { status: 400 }
      );
    }

    // 6. Rate limiting
    let rate = { allowed: true, remaining: RATE_LIMIT, resetSeconds: 0 };
    if (user) {
      rate = await rateLimit({
        key: `validate:${user.id}`,
        limit: RATE_LIMIT,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
        fallbackMap: rateLimitMap,
      });
      if (!rate.allowed) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            rfc: formattedRFC,
            remaining: 0,
            message: "Límite de solicitudes excedido. Intenta de nuevo en un minuto.",
          },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": RATE_LIMIT.toString(),
              "X-RateLimit-Remaining": "0",
              "Retry-After": rate.resetSeconds.toString(),
            },
          }
        );
      }
    }

    // 7. Verificar límite mensual del usuario
    let plan: PlanId = "free";
    let planLimit = getPlanValidationLimit(plan);
    let queriesThisMonth = 0;
    let remaining = -1;

    if (user) {
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("subscription_status, rfc_queries_this_month")
        .eq("id", user.id)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        return NextResponse.json(
          {
            success: false,
            valid: false,
            rfc: formattedRFC,
            remaining: 0,
            message: "Error al verificar límite de usuario",
          },
          { status: 500 }
        );
      }

      plan = (userData?.subscription_status || "free") as PlanId;
      planLimit = getPlanValidationLimit(plan);
      queriesThisMonth = userData?.rfc_queries_this_month || 0;

      if (planLimit !== -1 && queriesThisMonth >= planLimit) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            rfc: formattedRFC,
            remaining: 0,
            message: `Has alcanzado el límite de ${planLimit} validaciones este mes. Mejora tu plan para obtener más.`,
          },
          { status: 403 }
        );
      }
    }

    // 8. Consultar SAT (con caché)
    const satResult = await validateRFC(formattedRFC, {
      useCache: true,
      forceRefresh,
    });

    // 9. Guardar en base de datos
    if (user) {
      if (!satResult.success) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            rfc: formattedRFC,
            remaining: Math.max(0, remaining),
            message: satResult.message || "Error al validar el RFC",
          },
          { status: 502 }
        );
      }

      // Verificar que el usuario existe en la tabla users
      const { data: userExists, error: userCheckError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (userCheckError || !userExists) {
        console.error("User not found in users table:", user.id, userCheckError);
        // Intentar crear el usuario si no existe
        let finalEmail = userEmail || user.email || "";
        if (!finalEmail) {
          finalEmail = `${user.id}@temp.maflipp.com`;
        }
        const { error: createUserError } = await supabaseAdmin
          .from("users")
          .insert({
            id: user.id,
            email: finalEmail,
            subscription_status: "free",
            rfc_queries_this_month: 0,
          });

        if (createUserError) {
          console.error("Error creating user (non-fatal):", createUserError);
        }
      }

      // Check blacklist
      const blacklistResult = await checkBlacklist(formattedRFC);

      // INSERT VALIDATION with select to verify
      const { error: insertError } = await supabaseAdmin
        .from("validations")
        .insert({
          user_id: user.id,
          rfc: formattedRFC,
          is_valid: satResult.valid === true,
          response_time: satResult.responseTime ?? 0,
          blacklist_status: blacklistResult.status // New column
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error saving validation to DB:", insertError);
        // We will still return success to the user (since SAT validated), but log the DB error
      } else {
        // console.log("Validation saved successfully:", insertedValidation);
      }

      // Actualizar contador del usuario
      const { data: currentUserData, error: selectError } = await supabaseAdmin
        .from("users")
        .select("rfc_queries_this_month")
        .eq("id", user.id)
        .single();

      let newCount = 0;
      if (selectError) {
        console.error("Error fetching user data for count update (non-fatal):", selectError);
      } else {
        newCount = (currentUserData?.rfc_queries_this_month || 0) + 1;
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({ rfc_queries_this_month: newCount })
          .eq("id", user.id)
          .select(); // Asegurar que el update se procese y retorne

        if (updateError) {
          console.error("Error updating user count (non-fatal):", updateError);
        }
      }

      // Obtener límite restante
      const { data: updatedUserData } = await supabaseAdmin
        .from("users")
        .select("subscription_status, rfc_queries_this_month")
        .eq("id", user.id)
        .single();

      const planAfter = (updatedUserData?.subscription_status || "free") as PlanId;
      const planLimitAfter = getPlanValidationLimit(planAfter);
      const newQueriesThisMonth = updatedUserData?.rfc_queries_this_month ?? newCount;
      remaining =
        planLimitAfter === -1
          ? -1
          : planLimitAfter - newQueriesThisMonth;

      // Incluir contador actualizado para que el dashboard muestre 1/5000, 2/5000, etc.
      return NextResponse.json(
        {
          success: satResult.success,
          valid: satResult.valid,
          rfc: formattedRFC,
          remaining: Math.max(0, remaining),
          queriesThisMonth: newQueriesThisMonth,
          message: satResult.message,
          source: satResult.source,
          responseTime: satResult.responseTime,
          cached: satResult.cached,
          name: satResult.name,
          regime: satResult.regime,
          startDate: satResult.startDate,
        },
        {
          status: satResult.success ? 200 : 502,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": Math.max(rate.remaining, 0).toString(),
          },
        }
      );
    }

    // Sin usuario (no debería llegar aquí por el 401 arriba)
    remaining = planLimit === -1 ? -1 : Math.max(0, planLimit - queriesThisMonth);

    return NextResponse.json(
      {
        success: satResult.success,
        valid: satResult.valid,
        rfc: formattedRFC,
        remaining: Math.max(0, remaining),
        message: satResult.message,
        source: satResult.source,
        responseTime: satResult.responseTime,
        cached: satResult.cached,
        name: satResult.name,
        regime: satResult.regime,
        startDate: satResult.startDate,
      },
      {
        status: satResult.success ? 200 : 502,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": Math.max(rate.remaining, 0).toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Error in validate route:", error);

    return NextResponse.json(
      {
        success: false,
        valid: false,
        rfc: "",
        remaining: 0,
        message: error?.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// Método GET para información de la API
export async function GET() {
  return NextResponse.json(
    {
      message: "Maflipp API",
      version: "1.0.0",
      endpoint: "/api/validate",
      method: "POST",
      body: {
        rfc: "string (required)",
      },
      rateLimit: {
        limit: RATE_LIMIT,
        window: "1 minute",
      },
    },
    { status: 200 }
  );
}
