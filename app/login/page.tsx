import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/brand-mark";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Client portal — NEST" };

export default function LoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return (
    <main className="login-page nest-redesign">
      <header className="site-header masthead login-header">
        <BrandMark priority />
        <span className="header-note">NEST / CLIENT PORTAL</span>
        <Link className="header-link" href="/">BACK TO HOME <ArrowUpRight size={14} /></Link>
      </header>
      <div className="login-layout">
        <div className="login-brand-panel">
          <span className="login-panel-top">01 / THE NEST EXPERIENCE</span>
          <div className="login-panel-headline">YOUR<br/><em>WORK.</em><br/>TOGETHER.</div>
          <span className="login-panel-script">Creative work, kept close.</span>
          <span className="login-panel-bottom">PRIVATE / CURATED / DELIVERED</span>
        </div>
        <section className="login-panel">
          <p className="eyebrow">NEST / ACCESO RECURRENTE</p>
          <h1>Welcome<br/><em>back.</em></h1>
          <p className="login-description">Si trabajas con NEST de forma recurrente, ingresa tu correo autorizado para consultar todos tus proyectos y colecciones.</p>
          <LoginForm configured={configured} />
          <div className="login-one-time-note">
            <span>¿UNA ENTREGA POR ÚNICA VEZ?</span>
            <p>No necesitas entrar aquí. Abre directamente el enlace privado que te compartimos por WhatsApp.</p>
            <Link href="/"><ArrowLeft size={13}/> VOLVER A INICIO</Link>
          </div>
        </section>
      </div>
      <footer className="login-footer"><span>© NEST STUDIO 2026</span><span>YOUR WORK, BEAUTIFULLY DELIVERED.</span></footer>
    </main>
  );
}
