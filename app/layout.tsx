import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maflipp | Validación de RFCs en segundos",
  description:
    "Plataforma profesional B2B para validar RFCs contra el SAT en tiempo real. Ideal para contadores, empresas, fintechs y desarrolladores. Validación precisa y rápida.",
  keywords: ["validación RFC", "SAT", "RFC México", "validar RFC", "consulta SAT", "padrón contribuyentes", "validación fiscal"],
  authors: [{ name: "Maflipp" }],
  openGraph: {
    title: "Maflipp | Validación de RFCs en segundos",
    description: "Valida RFCs contra el SAT en segundos. Plataforma profesional para contadores, empresas y desarrolladores.",
    type: "website",
    locale: "es_MX",
    siteName: "Maflipp",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maflipp | Validación de RFCs en segundos",
    description: "Valida RFCs contra el SAT en segundos. Plataforma profesional B2B.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/web-app-manifest-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/web-app-manifest-512x512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: "/favicon.ico",
  },
  other: {
    "msapplication-TileImage": "/web-app-manifest-512x512.png",
    "msapplication-TileColor": "#2F7E7A",
    "msapplication-square70x70logo": "/web-app-manifest-192x192.png",
    "msapplication-square150x150logo": "/web-app-manifest-192x192.png",
    "msapplication-wide310x150logo": "/web-app-manifest-512x512.png",
    "msapplication-square310x310logo": "/web-app-manifest-512x512.png",
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

