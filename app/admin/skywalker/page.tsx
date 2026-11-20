import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand-mark";
import UploadClient from "./upload-client";
import "./upload.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private media intake",
  robots: { index: false, follow: false, noarchive: true },
};

export default function SkywalkerUploadPage() {
  const missing = [
    !process.env.NEXT_PUBLIC_SUPABASE_URL ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? "SUPABASE_SECRET_KEY" : null,
    !process.env.NEST_ADMIN_CODE ? "NEST_ADMIN_CODE" : null,
  ].filter(Boolean);
  const configurationIssue = missing.length
    ? "Falta configurar en Netlify: " + missing.join(", ") + ". No es necesario compartir ninguna clave por chat."
    : "";

  return (
    <main className="skywalker-admin nest-redesign">
      <header className="skywalker-admin-header">
        <BrandMark priority />
        <span>NEST / PRIVATE MEDIA INTAKE</span>
        <Link href="/">BACK TO NEST ↗</Link>
      </header>

      <section className="skywalker-admin-content">
        <p className="eyebrow">01 / SKYWALKER PHOTOSHOOT</p>
        <h1>Bring the<br /><span>frames in.</span></h1>
        <p className="skywalker-admin-intro">
          Carga el ZIP original. NEST organizará las 38 fotografías, preparará
          vistas optimizadas y generará un enlace privado para compartir la colección.
        </p>
        <UploadClient configurationIssue={configurationIssue} />
      </section>

      <footer className="skywalker-admin-footer">
        <span>© NEST STUDIO</span>
        <span>PRIVATE STORAGE / ADMINISTRATOR ACCESS</span>
      </footer>
    </main>
  );
}
