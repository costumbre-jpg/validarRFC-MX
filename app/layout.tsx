import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Validar FC.MX",
  description: "Sistema de validación de RFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

