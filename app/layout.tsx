import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NEST Client Gallery", template: "%s — NEST" },
  description: "Private editorial photography collections by NEST.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ed",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}