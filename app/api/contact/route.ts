import { NextRequest, NextResponse } from "next/server";

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

    // Aquí puedes integrar con un servicio de email como:
    // - Resend
    // - SendGrid
    // - Nodemailer
    // - O simplemente guardar en base de datos
    
    // Por ahora, solo retornamos éxito
    // TODO: Integrar servicio de email real
    
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
        message: "Mensaje enviado correctamente. Te responderemos pronto." 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Error al procesar el formulario. Por favor intenta de nuevo." },
      { status: 500 }
    );
  }
}

