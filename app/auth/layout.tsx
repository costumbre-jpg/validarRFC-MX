import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Maflipp",
  description: "Inicia sesión en tu cuenta de Maflipp para validar RFCs contra el SAT en tiempo real.",
  robots: {
    index: false, // No indexar páginas de autenticación
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

