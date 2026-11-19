import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type SharedGallery = {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  description: string | null;
  event_date: string | null;
};

export async function getSharedGallery(token: string) {
  // Only unpredictable 256-bit hex tokens; reject short or malformed input.
  if (!/^[a-f0-9]{64}$/.test(token)) return null;

  const supabase = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");

  const { data: link, error } = await supabase
    .from("gallery_share_links")
    .select("gallery_id,expires_at,revoked_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !link || link.revoked_at || new Date(link.expires_at).getTime() <= Date.now()) {
    return null;
  }

  // Do not expose draft galleries, even with an otherwise valid link.
  const { data: gallery, error: galleryError } = await supabase
    .from("galleries")
    .select("id,slug,title,client_name,description,event_date")
    .eq("id", link.gallery_id)
    .eq("is_published", true)
    .maybeSingle();

  if (galleryError || !gallery) return null;

  return { supabase, gallery: gallery as SharedGallery };
}
