import type { Metadata } from "next";
import Link from "next/link";
import BrandMark from "@/components/brand-mark";
import UploadClient from "./upload-client";
import "./upload.css";

export const metadata: Metadata = {
  title: "Private media intake",
  robots: { index: false, follow: false, noarchive: true },
};

export default function SkywalkerUploadPage() {
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
        <UploadClient />
      </section>

      <footer className="skywalker-admin-footer">
        <span>© NEST STUDIO</span>
        <span>PRIVATE STORAGE / ADMINISTRATOR ACCESS</span>
      </footer>
    </main>
  );
}
