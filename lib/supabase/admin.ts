import { createClient } from "@supabase/supabase-js";

/**
 * Trusted server routes only. NEVER import this file into a client component.
 * Supports Supabase's current secret key and the legacy service-role variable.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const secret =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en las variables de entorno de Netlify.");
  }
  if (!secret) {
    throw new Error(
      "Falta SUPABASE_SECRET_KEY en Netlify. Agrega la Secret API key de Supabase con ese nombre (o usa SUPABASE_SERVICE_ROLE_KEY si ya tienes la clave legacy). No uses NEXT_PUBLIC_ para una clave secreta."
    );
  }

  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "nest-private-share" } },
  });
}
