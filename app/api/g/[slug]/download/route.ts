import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, { params }: RouteContext) {
  void _request;
  const { slug } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, title")
    .eq("slug", slug)
    .maybeSingle();

  if (!gallery) {
    return NextResponse.json({ error: "Gallery not found" }, { status: 404 });
  }

  const { data: photos } = await supabase
    .from("photos")
    .select("storage_path, filename, sort_order")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  if (!photos?.length) {
    return NextResponse.json({ error: "No photographs in this collection" }, { status: 404 });
  }

  if (photos.length > 30) {
    return NextResponse.json({ error: "This first version supports up to 30 photographs per ZIP." }, { status: 413 });
  }

  const zip = new JSZip();
  let totalBytes = 0;

  for (let index = 0; index < photos.length; index += 1) {
    const photo = photos[index];
    const { data: signed, error } = await supabase
      .storage
      .from("gallery-media")
      .createSignedUrl(photo.storage_path, 60);

    if (error || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not prepare one of the photographs." }, { status: 500 });
    }

    const response = await fetch(signed.signedUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ error: "A photograph could not be downloaded from storage." }, { status: 502 });
    }

    const bytes = await response.arrayBuffer();
    totalBytes += bytes.byteLength;

    if (totalBytes > 150 * 1024 * 1024) {
      return NextResponse.json({ error: "The collection is too large for a single ZIP download." }, { status: 413 });
    }

    const safeFilename = photo.filename || "photograph-" + String(index + 1).padStart(2, "0") + ".jpg";
    zip.file(String(index + 1).padStart(2, "0") + "-" + safeFilename, bytes);
  }

  const archive = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 3 },
  });

  const filename = slugify(gallery.title) + "-NEST.zip";

  return new NextResponse(new Uint8Array(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=\"" + filename + "\"",
      "Content-Length": String(archive.byteLength),
      "Cache-Control": "private, no-store",
    },
  });
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}