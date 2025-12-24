import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maflipp | Validación de RFCs en segundos",
  applicationName: "Maflipp",
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
    url: "https://maflipp.com",
    images: [
      {
        url: "https://maflipp.com/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Maflipp Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maflipp | Validación de RFCs en segundos",
    description: "Valida RFCs contra el SAT en segundos. Plataforma profesional B2B.",
    images: ["https://maflipp.com/web-app-manifest-512x512.png"],
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
    "og:site_name": "Maflipp",
    "application-name": "Maflipp",
  },
  manifest: "/pwa.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maflipp",
    url: "https://maflipp.com",
    logo: "https://maflipp.com/web-app-manifest-512x512.png",
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Maflipp",
    alternateName: "Maflipp",
    url: "https://maflipp.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://maflipp.com/?s={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Maflipp",
        item: "https://maflipp.com",
      },
    ],
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

