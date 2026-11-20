import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GALLERY_SLUG = "skywalker-photoshoot";
const EXPECTED_PHOTOS = 38;
const LINK_LIFETIME_DAYS = 90;

function authorized(request: NextRequest) {
  const expected = process.env.NEST_ADMIN_CODE || "";
  const supplied = request.headers.get("x-nest-admin-code") || "";
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  if (!process.env.NEST_ADMIN_CODE) {
    return jsonError("NEST_ADMIN_CODE todavía no está configurado en Netlify.", 503);
  }
  if (!authorized(request)) return jsonError("Código de administrador incorrecto.", 401);

  try {
    const supabase = createAdminClient();
    const { data: gallery, error: galleryError } = await supabase
      .from("galleries")
      .select("id")
      .eq("slug", GALLERY_SLUG)
      .maybeSingle();

    if (galleryError || !gallery) {
      return jsonError("No encontré la colección. Vuelve a cargar las fotografías.", 404);
    }

    const { count, error: countError } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true })
      .eq("gallery_id", gallery.id);

    if (countError) throw countError;
    if (count !== EXPECTED_PHOTOS) {
      return jsonError("La colección tiene " + String(count || 0) + " de 38 fotografías. Completa la carga antes de publicarla.", 409);
    }

    const { error: publishError } = await supabase
      .from("galleries")
      .update({ is_published: true })
      .eq("id", gallery.id);

    if (publishError) throw publishError;

    const now = new Date();
    const { error: revokeError } = await supabase
      .from("gallery_share_links")
      .update({ revoked_at: now.toISOString() })
      .eq("gallery_id", gallery.id)
      .is("revoked_at", null);

    if (revokeError) throw revokeError;

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(now.getTime() + LINK_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

    const { error: linkError } = await supabase
      .from("gallery_share_links")
      .insert({
        gallery_id: gallery.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      });

    if (linkError) throw linkError;

    const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://nestclientgallery.netlify.app").replace(/\/+$/, "");
    const shareUrl = baseUrl + "/s/" + token;

    return NextResponse.json({
      shareUrl,
      expiresAt: expiresAt.toISOString(),
      photoCount: count,
    }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo completar la entrega.";
    return jsonError(message, 500);
  }
}
