import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GALLERY_SLUG = "skywalker-photoshoot";
const GALLERY_TITLE = "SKYWALKER PHOTOSHOOT";
const CLIENT_NAME = "GALIVERSE";
const DESCRIPTION = "Long time ago in a galaxy far, far away.";
const MAX_ORIGINAL_BYTES = 5 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 2 * 1024 * 1024;
const MAX_REQUEST_FILES_BYTES = 5_500_000;

function authorized(request: NextRequest) {
  const expected = process.env.NEST_ADMIN_CODE || "";
  const supplied = request.headers.get("x-nest-admin-code") || "";
  if (!expected || !supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function safeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function allowedMime(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

async function getOrCreateGallery(supabase: ReturnType<typeof createAdminClient>) {
  const { data: existing, error: lookupError } = await supabase
    .from("galleries")
    .select("id")
    .eq("slug", GALLERY_SLUG)
    .maybeSingle();

  if (lookupError) throw lookupError;
  if (existing) return existing.id as string;

  const { data: created, error: createError } = await supabase
    .from("galleries")
    .insert({
      slug: GALLERY_SLUG,
      title: GALLERY_TITLE,
      client_name: CLIENT_NAME,
      description: DESCRIPTION,
      event_date: null,
      owner_id: null,
      is_published: false,
    })
    .select("id")
    .single();

  if (createError || !created) throw createError || new Error("Could not create the gallery.");
  return created.id as string;
}

export async function POST(request: NextRequest) {
  if (!process.env.NEST_ADMIN_CODE) {
    return jsonError("NEST_ADMIN_CODE todavía no está configurado en Netlify.", 503);
  }
  if (!authorized(request)) return jsonError("Código de administrador incorrecto.", 401);

  try {
    const form = await request.formData();
    const original = form.get("original");
    const preview = form.get("preview");
    const filenameValue = form.get("filename");
    const sortOrderValue = form.get("sortOrder");

    if (!(original instanceof File) || typeof filenameValue !== "string" || typeof sortOrderValue !== "string") {
      return jsonError("Falta la fotografía o sus metadatos.", 400);
    }

    const filename = filenameValue.trim();
    const mimeType = allowedMime(filename);
    const sortOrder = Number(sortOrderValue);

    if (!mimeType || !filename || filename.length > 180) {
      return jsonError("Formato o nombre de archivo no permitido.", 400);
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder >= 38) {
      return jsonError("Orden de fotografía no válido.", 400);
    }
    if (original.size <= 0 || original.size > MAX_ORIGINAL_BYTES) {
      return jsonError(filename + " supera el límite de 5 MB.", 413);
    }
    if (original.type && original.type !== mimeType) {
      return jsonError("El tipo de archivo no coincide con su extensión.", 400);
    }
    if (preview !== null && !(preview instanceof File)) {
      return jsonError("La vista previa no es válida.", 400);
    }
    if (preview instanceof File && (preview.type !== "image/webp" || preview.size > MAX_PREVIEW_BYTES)) {
      return jsonError("La vista previa WebP supera el límite permitido.", 413);
    }
    if (original.size + (preview instanceof File ? preview.size : 0) > MAX_REQUEST_FILES_BYTES) {
      return jsonError("La fotografía y su vista previa superan el límite de carga.", 413);
    }

    const supabase = createAdminClient();
    const galleryId = await getOrCreateGallery(supabase);
    const safe = safeFilename(filename) || ("frame-" + String(sortOrder + 1) + ".png");
    const orderPrefix = String(sortOrder + 1).padStart(2, "0");
    const originalPath = galleryId + "/originals/" + orderPrefix + "-" + safe;
    const previewFilename = safe.replace(/\.[^.]+$/, "") + ".webp";
    const previewPath = galleryId + "/previews/" + orderPrefix + "-" + previewFilename;

    const originalBytes = Buffer.from(await original.arrayBuffer());
    const { error: originalError } = await supabase.storage
      .from("gallery-media")
      .upload(originalPath, originalBytes, {
        contentType: mimeType,
        cacheControl: "31536000",
        upsert: true,
      });

    if (originalError) throw originalError;

    let finalPreviewPath = originalPath;
    if (preview instanceof File) {
      const previewBytes = Buffer.from(await preview.arrayBuffer());
      const { error: previewError } = await supabase.storage
        .from("gallery-media")
        .upload(previewPath, previewBytes, {
          contentType: "image/webp",
          cacheControl: "31536000",
          upsert: true,
        });
      if (previewError) throw previewError;
      finalPreviewPath = previewPath;
    }

    const altText = sortOrder === 0
      ? "SKYWALKER PHOTOSHOOT — COVER"
      : "SKYWALKER PHOTOSHOOT — FRAME " + String(sortOrder + 1).padStart(2, "0");

    const { data: existingPhoto, error: photoLookupError } = await supabase
      .from("photos")
      .select("id")
      .eq("gallery_id", galleryId)
      .eq("filename", filename)
      .maybeSingle();

    if (photoLookupError) throw photoLookupError;

    const photoRecord = {
      gallery_id: galleryId,
      storage_path: originalPath,
      preview_path: finalPreviewPath,
      filename,
      alt_text: altText,
      sort_order: sortOrder,
    };

    const photoWrite = existingPhoto
      ? await supabase.from("photos").update(photoRecord).eq("id", existingPhoto.id)
      : await supabase.from("photos").insert(photoRecord);

    if (photoWrite.error) throw photoWrite.error;

    return NextResponse.json({ ok: true, galleryId, filename, sortOrder }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado al guardar la fotografía.";
    return jsonError(message, 500);
  }
}
