import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string; photoId: string }>;
};

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteContext) {
  void _request;
  const { slug, photoId } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const { data: photo } = await supabase
    .from("photos")
    .select("storage_path, filename")
    .eq("id", photoId)
    .eq("gallery_id", gallery.id)
    .maybeSingle();

  if (!photo) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  const { data: signed, error } = await supabase
    .storage
    .from("gallery-media")
    .createSignedUrl(photo.storage_path, 60, { download: photo.filename });

  if (error || !signed?.signedUrl) {
    return NextResponse.json({ error: "Could not prepare download" }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl, {
    headers: { "Cache-Control": "private, no-store" },
  });
}