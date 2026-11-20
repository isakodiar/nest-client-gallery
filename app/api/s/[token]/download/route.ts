import { NextRequest, NextResponse } from "next/server";
import { getSharedGallery } from "@/lib/share-links";

type RouteContext = { params: Promise<{ token: string }> };
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { token } = await params;
  const shared = await getSharedGallery(token);
  if (!shared) {
    return NextResponse.json({ error: "Link unavailable" }, { status: 404 });
  }

  // Deliver an uploaded collection ZIP through a short-lived signed URL.
  // This avoids Netlify function response-size limits for 30+ originals.
  const archiveId = request.nextUrl.searchParams.get("archive");
  if (archiveId && !/^[a-f0-9-]{36}$/.test(archiveId)) {
    return NextResponse.json({ error: "Archive unavailable" }, { status: 404 });
  }

  let query = shared.supabase
    .from("assets")
    .select("storage_path,filename")
    .eq("gallery_id", shared.gallery.id)
    .eq("asset_type", "archive")
    .eq("is_downloadable", true);

  if (archiveId) query = query.eq("id", archiveId);

  const { data: archive, error } = await query
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !archive) {
    return NextResponse.json({ error: "Full collection download is being prepared" }, { status: 404 });
  }

  const { data: signed, error: signError } = await shared.supabase.storage
    .from("gallery-media")
    .createSignedUrl(archive.storage_path, 60 * 60, { download: archive.filename });

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
