import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message, company } = body;

    // Validación básica
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Construir HTML del mensaje
    const html = `
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
          </style>
        </head>
        <body>
          <div class="container">
              <div class="card">
              <div class="header">
                <div style="margin-bottom: 16px; text-align: center;">
                  <img src="${process.env.NEXT_PUBLIC_SITE_URL || "https://maflipp.com"}/imagencorreo.jpg" alt="Maflipp Logo" style="height: 60px; width: auto; display: block; margin: 0 auto; border-radius: 8px; background-color: #f3f4f6; padding: 8px;" />
                </div>
                <div class="pill">Nuevo mensaje de contacto</div>
                <p style="margin-top: 12px; font-size: 14px; color: #4b5563;">
                  Has recibido un nuevo mensaje desde el formulario de contacto de Maflipp.
                </p>
              </div>
              <div>
                <div class="field">
                  <div class="label">Nombre</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Empresa</div>
                  <div class="value">${company || "—"}</div>
                </div>
                <div class="field" style="margin-top: 16px;">
                  <div class="label">Mensaje</div>
                  <div class="value" style="white-space: pre-wrap;">${message}</div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email a soporte
    console.log("📧 Preparando envío de email de contacto...");
    const result = await sendEmail({
      to: "soporte@maflipp.com",
      subject: "Nuevo mensaje desde el formulario de contacto - Maflipp",
      html,
    });

    if (!result.success) {
      console.error("❌ ERROR al enviar email de contacto:");
      console.error("   Error:", result.error);
      console.error("   Variables de entorno:");
      console.error("   - RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Configurada" : "❌ NO configurada");
      console.error("   - RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "❌ NO configurada");
      
      return NextResponse.json(
        {
          error:
            result.error?.includes("RESEND_API_KEY")
              ? "Error de configuración del servidor. Por favor contacta al administrador."
              : `No se pudo enviar el mensaje por email: ${result.error || "Error desconocido"}`,
        },
        { status: 500 }
      );
    }

    console.log("Contact form submission:", {
      name,
      email,
      company,
      message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Mensaje enviado correctamente. Te responderemos pronto a tu correo.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      {
        error:
          "Error al procesar el formulario. Por favor intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}

