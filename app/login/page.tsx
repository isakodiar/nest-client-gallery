import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = { title: "Client access" };

export default function LoginPage() {
  const configured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );

  return (
    <main className="login-page">
      <header className="site-header login-header">
        <Link className="wordmark" href="/">NEST<span>®</span></Link>
        <Link className="header-link" href="/">BACK TO HOME</Link>
      </header>
      <section className="login-panel">
        <p className="eyebrow">NEST / CLIENT ACCESS</p>
        <h1>Your photographs,<br /><em>in one place.</em></h1>
        <p className="login-description">Enter the email address associated with your collection. We will send you a secure access link.</p>
        <LoginForm configured={configured} />
        <p className="login-footnote">Access is individual and invitation-only. If you need access, contact the NEST team.</p>
      </section>
      <footer className="login-footer"><span>© NEST STUDIO</span><span>PRIVATE COLLECTIONS</span></footer>
    </main>
  );
}