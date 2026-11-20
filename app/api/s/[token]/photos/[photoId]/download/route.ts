import { NextRequest, NextResponse } from "next/server";
import { getSharedGallery } from "@/lib/share-links";

type RouteContext = {
  params: Promise<{ token: string; photoId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { token, photoId } = await params;
  const shared = await getSharedGallery(token);
  if (!shared) {
    return NextResponse.json({ error: "Link unavailable" }, { status: 404 });
  }

  const { data: photo, error } = await shared.supabase
    .from("photos")
    .select("storage_path,filename")
    .eq("gallery_id", shared.gallery.id)
    .eq("id", photoId)
    .maybeSingle();

  if (error || !photo) {
    return NextResponse.json({ error: "Photograph unavailable" }, { status: 404 });
  }

  const { data: signed, error: signError } = await shared.supabase.storage
    .from("gallery-media")
    .createSignedUrl(photo.storage_path, 60 * 60, { download: photo.filename });

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
