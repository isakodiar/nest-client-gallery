"use client";

import { FormEvent, useState } from "react";
import { ArrowUpRight, Check, LoaderCircle, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!configured) {
      setError("La conexión con Supabase todavía no está configurada.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + "/auth/callback",
      },
    });
    setPending(false);

    if (authError) {
      setError("No pudimos enviar el enlace. Verifica el correo o contacta al equipo NEST.");
      return;
    }

    setMessage("Si este correo tiene acceso autorizado, recibirás un enlace seguro en tu bandeja de entrada.");
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <label htmlFor="client-email">EMAIL ADDRESS</label>
      <div className="email-input-wrap">
        <Mail size={17} aria-hidden="true" />
        <input
          id="client-email"
          type="email"
          autoComplete="email"
          placeholder="name@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={pending}
        />
      </div>
      <button className="primary-button" type="submit" disabled={pending || !email.trim()}>
        {pending ? <LoaderCircle className="spin" size={17} /> : <>SEND ACCESS LINK <ArrowUpRight size={16} /></>}
      </button>
      {message ? <p className="form-message success"><Check size={16} />{message}</p> : null}
      {error ? <p className="form-message error">{error}</p> : null}
      {!configured ? <p className="form-hint">Demo preview is available while the private access service is being configured.</p> : null}
    </form>
  );
}