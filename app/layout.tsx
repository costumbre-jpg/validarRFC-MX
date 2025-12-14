import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maflipp - Validación de RFCs contra el SAT en 2 segundos",
  description: "Plataforma profesional B2B para validar RFCs contra el SAT en tiempo real. Ideal para contadores, empresas, fintechs y desarrolladores. Validación instantánea, 100% precisa.",
  keywords: ["validación RFC", "SAT", "RFC México", "validar RFC", "consulta SAT", "padrón contribuyentes", "validación fiscal"],
  authors: [{ name: "Maflipp" }],
  openGraph: {
    title: "Maflipp - Validación de RFCs contra el SAT",
    description: "Valida RFCs contra el SAT en 2 segundos. Plataforma profesional para contadores, empresas y desarrolladores.",
    type: "website",
    locale: "es_MX",
    siteName: "Maflipp",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maflipp - Validación de RFCs contra el SAT",
    description: "Valida RFCs contra el SAT en 2 segundos. Plataforma profesional B2B.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/Maflipp512.png", type: "image/png", sizes: "512x512" },
      { url: "/Maflipp512.png", type: "image/png", sizes: "192x192" },
      { url: "/Maflipp512.png", type: "image/png", sizes: "32x32" },
      { url: "/Maflipp512.png", type: "image/png", sizes: "16x16" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/Maflipp512.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  other: {
    "msapplication-TileImage": "/Maflipp512.png",
    "msapplication-TileColor": "#2F7E7A",
    "msapplication-square70x70logo": "/Maflipp512.png",
    "msapplication-square150x150logo": "/Maflipp512.png",
    "msapplication-wide310x150logo": "/Maflipp512.png",
    "msapplication-square310x310logo": "/Maflipp512.png",
  },
  manifest: "/site.webmanifest",
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

