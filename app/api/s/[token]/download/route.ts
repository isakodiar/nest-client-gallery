import { NextRequest, NextResponse } from "next/server";
import { getSharedGallery } from "@/lib/share-links";

type RouteContext = { params: Promise<{ token: string }> };
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const shared = await getSharedGallery(token);
  if (!shared) {
    return NextResponse.json({ error: "Link unavailable" }, { status: 404 });
  }

  // Deliver an uploaded collection ZIP through a short-lived signed URL.
  // This avoids Netlify function response-size limits for 30+ originals.
  const { data: archive, error } = await shared.supabase
    .from("assets")
    .select("storage_path,filename")
    .eq("gallery_id", shared.gallery.id)
    .eq("asset_type", "archive")
    .eq("is_downloadable", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !archive) {
    return NextResponse.json({ error: "Full collection download is being prepared" }, { status: 404 });
  }

  const { data: signed, error: signError } = await shared.supabase.storage
    .from("gallery-media")
    .createSignedUrl(archive.storage_path, 60, { download: archive.filename });

  if (signError || !signed?.signedUrl) {
    return NextResponse.json({ error: "Download temporarily unavailable" }, { status: 502 });
  }

  return NextResponse.redirect(signed.signedUrl, {
    headers: {
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
