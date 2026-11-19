import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./nest-redesign.css";

export const metadata: Metadata = {
  title: { default: "NEST Creative Delivery", template: "%s — NEST Creative Delivery" },
  description: "Tu proyecto, en un solo lugar. Entregas privadas de fotografía y contenido creativo por NEST.",
  icons: {
    icon: "/brand/nest-app-red.svg",
    shortcut: "/brand/nest-app-red.svg",
    apple: "/brand/nest-app-red.svg",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#b71f3d",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
