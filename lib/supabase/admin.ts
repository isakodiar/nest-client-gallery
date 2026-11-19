import { createClient } from "@supabase/supabase-js";

/**
 * Trusted server routes only. NEVER import this file into a client component.
 * SUPABASE_SECRET_KEY is configured only for server-side Netlify Functions.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Server-side Supabase connection is not configured.");
  }

  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { "X-Client-Info": "nest-private-share" } },
  });
}
