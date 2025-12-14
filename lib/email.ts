/**
 * Servicio de envío de emails usando Resend
 * 
 * Para usar este servicio:
 * 1. Crea una cuenta en https://resend.com
 * 2. Obtén tu API key
 * 3. Agrega RESEND_API_KEY a tus variables de entorno
 * 4. Verifica tu dominio o usa el dominio de prueba
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("RESEND_API_KEY no está configurada");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: options.from || process.env.RESEND_FROM_EMAIL || "Maflipp <onboarding@resend.dev>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error enviando email:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
}

/**
 * Enviar alerta de umbral alcanzado
 */
export async function sendThresholdAlert(
  email: string,
  usagePercentage: number,
  queriesUsed: number,
  planLimit: number
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2F7E7A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .stats { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .stat-item:last-child { border-bottom: none; }
          .button { display: inline-block; background-color: #2F7E7A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta de Uso - Maflipp</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Te informamos que has alcanzado el <strong>${usagePercentage.toFixed(1)}%</strong> de tu límite mensual de validaciones.</p>
            
            <div class="alert-box">
              <strong>📊 Resumen de Uso:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Validaciones usadas: <strong>${queriesUsed.toLocaleString()}</strong></li>
                <li>Límite del plan: <strong>${planLimit === -1 ? "Ilimitado" : planLimit.toLocaleString()}</strong></li>
                <li>Porcentaje usado: <strong>${usagePercentage.toFixed(1)}%</strong></li>
              </ul>
            </div>

            <div class="stats">
              <div class="stat-item">
                <span>Validaciones restantes:</span>
                <strong>${planLimit === -1 ? "∞" : (planLimit - queriesUsed).toLocaleString()}</strong>
              </div>
            </div>

            <p>Si necesitas más validaciones, considera actualizar tu plan en tu dashboard.</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/billing" class="button">
              Ver Planes y Precios
            </a>

            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              Puedes gestionar tus preferencias de alertas en tu <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/cuenta">configuración de cuenta</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `⚠️ Has alcanzado el ${usagePercentage.toFixed(1)}% de tu límite mensual - Maflipp`,
    html,
  });
}

/**
 * Enviar alerta de límite alcanzado
 */
export async function sendLimitReachedAlert(
  email: string,
  queriesUsed: number,
  planLimit: number
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .alert-box { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background-color: #2F7E7A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Límite Alcanzado - Maflipp</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Te informamos que has <strong>alcanzado el 100%</strong> de tu límite mensual de validaciones.</p>
            
            <div class="alert-box">
              <strong>📊 Estado Actual:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Validaciones usadas: <strong>${queriesUsed.toLocaleString()}</strong></li>
                <li>Límite del plan: <strong>${planLimit.toLocaleString()}</strong></li>
                <li>Estado: <strong>Límite alcanzado</strong></li>
              </ul>
            </div>

            <p>No podrás realizar más validaciones hasta el próximo mes, cuando se reinicie tu contador.</p>
            <p>Si necesitas más validaciones ahora, considera actualizar tu plan.</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/billing" class="button">
              Actualizar Plan
            </a>

            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              Puedes gestionar tus preferencias de alertas en tu <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard/cuenta">configuración de cuenta</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "🚨 Has alcanzado tu límite mensual - Maflipp",
    html,
  });
}

/**
 * Enviar resumen mensual
 */
export async function sendMonthlySummary(
  email: string,
  queriesUsed: number,
  validCount: number,
  invalidCount: number,
  planLimit: number
): Promise<boolean> {
  const successRate = queriesUsed > 0 ? ((validCount / queriesUsed) * 100).toFixed(1) : "0";
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2F7E7A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .stats { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .stat-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .stat-item:last-child { border-bottom: none; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2F7E7A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Resumen Mensual - Maflipp</h1>
          </div>
          <div class="content">
            <p>Hola,</p>
            <p>Aquí está tu resumen de actividad del mes:</p>
            
            <div class="stats">
              <div class="stat-item">
                <span>Total de validaciones:</span>
                <span class="stat-value">${queriesUsed.toLocaleString()}</span>
              </div>
              <div class="stat-item">
                <span>RFCs válidos:</span>
                <span style="color: #10b981; font-weight: bold;">${validCount.toLocaleString()}</span>
              </div>
              <div class="stat-item">
                <span>RFCs inválidos:</span>
                <span style="color: #ef4444; font-weight: bold;">${invalidCount.toLocaleString()}</span>
              </div>
              <div class="stat-item">
                <span>Tasa de éxito:</span>
                <span style="font-weight: bold;">${successRate}%</span>
              </div>
              <div class="stat-item">
                <span>Límite del plan:</span>
                <span>${planLimit === -1 ? "Ilimitado" : planLimit.toLocaleString()}</span>
              </div>
            </div>

            <p>Tu contador se reiniciará el próximo mes. ¡Gracias por usar Maflipp!</p>
            
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/dashboard" style="display: inline-block; background-color: #2F7E7A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px;">
              Ver Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `📊 Resumen mensual - ${queriesUsed.toLocaleString()} validaciones - Maflipp`,
    html,
  });
}

