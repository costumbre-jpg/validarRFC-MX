import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";
import {
  sendThresholdAlert,
  sendLimitReachedAlert,
  sendMonthlySummary,
} from "@/lib/email";

/**
 * Endpoint para verificar y enviar alertas por email
 * Este endpoint puede ser llamado por un cron job de Vercel o manualmente
 */
export async function GET(request: NextRequest) {
  return handleAlerts(request);
}

export async function POST(request: NextRequest) {
  return handleAlerts(request);
}

async function handleAlerts(request: NextRequest) {
  try {
    // Verificar que sea una llamada autorizada
    // Vercel Cron envía el header 'x-vercel-cron' automáticamente
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Permitir si es Vercel Cron o si tiene el secret correcto
    if (!isVercelCron) {
      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
    }

    const supabase = await createClient();

    // Obtener todos los usuarios con planes Pro o Business que tengan alertas habilitadas
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, email, subscription_status, rfc_queries_this_month")
      .in("subscription_status", ["pro", "business"]);

    if (usersError) {
      console.error("Error obteniendo usuarios:", usersError);
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ message: "No hay usuarios para verificar" });
    }

    const results = {
      thresholdAlerts: 0,
      limitAlerts: 0,
      monthlySummaries: 0,
      errors: 0,
    };

    // Verificar cada usuario
    for (const user of users) {
      try {
        // Obtener preferencias de alertas
        const { data: preferences } = await supabase
          .from("email_alert_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Si no tiene preferencias o tiene alertas deshabilitadas, saltar
        if (!preferences || !preferences.alerts_enabled) {
          continue;
        }

        const planId = user.subscription_status as PlanId;
        const plan = getPlan(planId);
        const planLimit = plan.validationsPerMonth;
        const queriesUsed = user.rfc_queries_this_month || 0;

        if (planLimit === -1) {
          // Plan ilimitado, no necesita alertas
          continue;
        }

        const usagePercentage = (queriesUsed / planLimit) * 100;
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        // Verificar si ya se envió una alerta este mes para evitar duplicados
        const { data: sentAlerts } = await supabase
          .from("email_alerts_sent")
          .select("*")
          .eq("user_id", user.id)
          .eq("month_year", currentMonth);

        const sentTypes = new Set(sentAlerts?.map((a) => a.alert_type) || []);

        // 1. Alerta de límite alcanzado (100%)
        if (queriesUsed >= planLimit && !sentTypes.has("limit_reached")) {
          const sent = await sendLimitReachedAlert(
            user.email,
            queriesUsed,
            planLimit
          );

          if (sent) {
            await supabase.from("email_alerts_sent").insert({
              user_id: user.id,
              alert_type: "limit_reached",
              month_year: currentMonth,
            });
            results.limitAlerts++;
          } else {
            results.errors++;
          }
        }
        // 2. Alerta de umbral alcanzado
        else if (
          usagePercentage >= preferences.alert_threshold &&
          !sentTypes.has("threshold")
        ) {
          const sent = await sendThresholdAlert(
            user.email,
            usagePercentage,
            queriesUsed,
            planLimit
          );

          if (sent) {
            await supabase.from("email_alerts_sent").insert({
              user_id: user.id,
              alert_type: "threshold",
              month_year: currentMonth,
            });
            results.thresholdAlerts++;
          } else {
            results.errors++;
          }
        }

        // 3. Resumen mensual (enviar el último día del mes)
        const today = new Date();
        const lastDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0
        ).getDate();

        if (
          today.getDate() === lastDayOfMonth &&
          !sentTypes.has("monthly_summary") &&
          queriesUsed > 0
        ) {
          // Obtener estadísticas de validaciones
          const { data: validations } = await supabase
            .from("validations")
            .select("is_valid")
            .eq("user_id", user.id)
            .gte(
              "created_at",
              new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
            );

          const validCount =
            validations?.filter((v) => v.is_valid).length || 0;
          const invalidCount =
            validations?.filter((v) => !v.is_valid).length || 0;

          const sent = await sendMonthlySummary(
            user.email,
            queriesUsed,
            validCount,
            invalidCount,
            planLimit
          );

          if (sent) {
            await supabase.from("email_alerts_sent").insert({
              user_id: user.id,
              alert_type: "monthly_summary",
              month_year: currentMonth,
            });
            results.monthlySummaries++;
          } else {
            results.errors++;
          }
        }
      } catch (error: any) {
        console.error(`Error procesando usuario ${user.id}:`, error);
        results.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Procesados ${users.length} usuarios`,
    });
  } catch (error: any) {
    console.error("Error en send alerts:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

