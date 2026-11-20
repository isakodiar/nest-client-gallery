"use client";

import JSZip from "jszip";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownToLine, Check, LoaderCircle, Upload, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export type UploadGallery = {
  id: string;
  slug: string;
  title: string;
};

type UploadClientProps = {
  galleries: UploadGallery[];
  ownerId: string;
};

const COVER_FILENAME = "andy anakin (20).png";
const PREFERRED_ORDER = [
  "andy anakin (20).png",
  "andy anakin (27).png",
  "andy anakin 1.png",
  "andy anakin (16).png",
  "andy anakin (13).png",
  "andy anakin (15).png",
  "andy anakin (19).png",
  "andy anakin (21).png",
  "andy anakin (23).png",
  "andy anakin (24).png",
  "andy anakin (4).png",
  "andy anakin (5).png",
  "andy anakin (6).png",
  "andy anakin 4.png",
  "andy anakin 5.png",
  "andy anakin 6.png",
  "andy anakin 3.png",
  "andy anakin 2.png",
  "andy anakin 9.png",
  "andy anakin 10.png",
  "andy anakin 11.png",
  "andy anakin 12.png",
  "andy anakin (10).png",
  "andy anakin (11).png",
  "andy anakin (12).png",
  "andy anakin (14).png",
  "andy anakin (17).png",
  "andy anakin (18).png",
  "andy anakin (22).png",
  "andy anakin (25).png",
  "andy anakin (26).png",
  "andy anakin 7.png",
  "andy anakin 8.jpg",
  "andy anakin.png",
  "andy anakin (2).png",
  "andy anakin (7).png",
  "andy anakin (8).png",
  "andy anakin (9).png",
];

const MAX_FILE_BYTES = 50 * 1024 * 1024;

function getMimeType(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return "image/png";
}

function safeFilename(filename: string) {
  return filename
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function orderEntries<T extends { name: string }>(entries: T[]) {
  return [...entries].sort((a, b) => {
    const aName = a.name.split("/").pop() || a.name;
    const bName = b.name.split("/").pop() || b.name;
    const aIndex = PREFERRED_ORDER.indexOf(aName);
    const bIndex = PREFERRED_ORDER.indexOf(bName);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return aName.localeCompare(bName, "en", { numeric: true, sensitivity: "base" });
  });
}

async function createPreview(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 2000;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return null;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.86));
  } catch {
    return null;
  }
}

export default function UploadClient({ galleries: initialGalleries, ownerId }: UploadClientProps) {
  const [galleries, setGalleries] = useState(initialGalleries);
  const [galleryId, setGalleryId] = useState(initialGalleries[0]?.id || "");
  const [createNew, setCreateNew] = useState(initialGalleries.length === 0);
  const [title, setTitle] = useState("SKYWALKER PHOTOSHOOT");
  const [slug, setSlug] = useState("skywalker-photoshoot");
  const [clientName, setClientName] = useState("GALIVERSE");
  const [description, setDescription] = useState("Long time ago in a galaxy far, far away.");
  const [archive, setArchive] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completedSlug, setCompletedSlug] = useState("");

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === galleryId),
    [galleries, galleryId]
  );

  async function handleUpload() {
    if (!archive || busy) return;
    setBusy(true);
    setError("");
    setMessage("Reading the ZIP archive…");
    setProgress(0);
    setCompletedSlug("");

    const supabase = createClient();
    const uploadedPaths: string[] = [];
    let targetGalleryId = galleryId;
    let targetSlug = selectedGallery?.slug || slugify(slug || title);

    try {
      const zip = await JSZip.loadAsync(archive);
      const entries = orderEntries(
        Object.values(zip.files).filter((entry) =>
          !entry.dir && /\.(jpe?g|png|webp)$/i.test(entry.name)
        )
      );

      if (!entries.length) {
        throw new Error("No encontré fotografías JPG, PNG o WEBP dentro del ZIP.");
      }

      const imageSizes = entries.map((entry) => {
        const size = entry._data?.uncompressedSize;
        return typeof size === "number" ? size : 0;
      });
      if (imageSizes.some((size) => size > MAX_FILE_BYTES)) {
        throw new Error("Una de las fotografías supera el límite de 50 MB por archivo de tu bucket de Supabase.");
      }

      setTotal(entries.length);

      if (createNew) {
        const cleanSlug = slugify(slug || title);
        if (!cleanSlug) throw new Error("Escribe un identificador válido para la colección.");
        const { data: newGallery, error: galleryError } = await supabase
          .from("galleries")
          .insert({
            slug: cleanSlug,
            title: title.trim(),
            client_name: clientName.trim(),
            description: description.trim() || null,
            owner_id: ownerId,
            is_published: false,
          })
          .select("id, slug, title")
          .single();

        if (galleryError || !newGallery) {
          throw new Error(galleryError?.message || "No pude crear la colección.");
        }

        targetGalleryId = newGallery.id;
        targetSlug = newGallery.slug;
        setGalleries((current) => [newGallery, ...current]);
        setGalleryId(newGallery.id);
        setCreateNew(false);
      }

      if (!targetGalleryId) {
        throw new Error("Selecciona una colección o crea una nueva antes de subir las fotos.");
      }

      setMessage("Uploading private originals and web previews…");
      const records: Array<{
        gallery_id: string;
        storage_path: string;
        preview_path: string;
        filename: string;
        alt_text: string;
        sort_order: number;
      }> = [];

      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const filename = entry.name.split("/").pop() || entry.name;
        const mimeType = getMimeType(filename);
        const rawBlob = await entry.async("blob");
        const originalFile = new File([rawBlob], filename, { type: mimeType });
        const uniqueId = crypto.randomUUID();
        const basePath = targetGalleryId + "/";
        const originalPath = basePath + "originals/" + uniqueId + "-" + safeFilename(filename);
        const previewPath = basePath + "previews/" + uniqueId + ".webp";

        const { error: originalError } = await supabase.storage
          .from("gallery-media")
          .upload(originalPath, originalFile, {
            contentType: mimeType,
            cacheControl: "31536000",
            upsert: false,
          });

        if (originalError) throw new Error("No pude subir " + filename + ": " + originalError.message);
        uploadedPaths.push(originalPath);

        const previewBlob = await createPreview(originalFile);
        let finalPreviewPath = originalPath;
        if (previewBlob) {
          const { error: previewError } = await supabase.storage
            .from("gallery-media")
            .upload(previewPath, previewBlob, {
              contentType: "image/webp",
              cacheControl: "31536000",
              upsert: false,
            });
          if (previewError) throw new Error("No pude preparar la vista previa de " + filename + ": " + previewError.message);
          uploadedPaths.push(previewPath);
          finalPreviewPath = previewPath;
        }

        records.push({
          gallery_id: targetGalleryId,
          storage_path: originalPath,
          preview_path: finalPreviewPath,
          filename,
          alt_text: "SKYWALKER PHOTOSHOOT — FRAME " + String(index + 1).padStart(2, "0"),
          sort_order: index,
        });
        setProgress(index + 1);
      }

      const { error: insertError } = await supabase.from("photos").insert(records);
      if (insertError) throw new Error("Las imágenes se subieron, pero no pude registrar la galería: " + insertError.message);

      setMessage("Collection ready — " + records.length + " photographs uploaded.");
      setCompletedSlug(targetSlug);
      setArchive(null);
    } catch (uploadError) {
      if (uploadedPaths.length) {
        await supabase.storage.from("gallery-media").remove(uploadedPaths);
      }
      setError(uploadError instanceof Error ? uploadError.message : "Ocurrió un error al subir la colección.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="upload-workspace">
      <section className="upload-panel">
        <div className="upload-panel-heading">
          <span className="eyebrow">01 / DESTINATION</span>
          <h2>Choose a collection.</h2>
        </div>

        {galleries.length > 0 ? (
          <label className="upload-field">
            <span>EXISTING COLLECTION</span>
            <select
              value={createNew ? "__new__" : galleryId}
              onChange={(event) => {
                if (event.target.value === "__new__") {
                  setCreateNew(true);
                } else {
                  setCreateNew(false);
                  setGalleryId(event.target.value);
                }
              }}
              disabled={busy}
            >
              {galleries.map((gallery) => (
                <option value={gallery.id} key={gallery.id}>{gallery.title}</option>
              ))}
              <option value="__new__">+ Create a new collection</option>
            </select>
          </label>
        ) : null}

        {createNew ? (
          <div className="upload-create-grid">
            <label className="upload-field">
              <span>COLLECTION TITLE</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} disabled={busy} />
            </label>
            <label className="upload-field">
              <span>CLIENT / COSPLAYER</span>
              <input value={clientName} onChange={(event) => setClientName(event.target.value)} disabled={busy} />
            </label>
            <label className="upload-field">
              <span>COLLECTION URL SLUG</span>
              <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} disabled={busy} />
            </label>
            <label className="upload-field upload-field-wide">
              <span>INTRODUCTION</span>
              <input value={description} onChange={(event) => setDescription(event.target.value)} disabled={busy} />
            </label>
          </div>
        ) : null}
      </section>

      <section className="upload-panel">
        <div className="upload-panel-heading">
          <span className="eyebrow">02 / PHOTOGRAPHS</span>
          <h2>Drop the session ZIP.</h2>
          <p>We’ll extract the 38 images, put the selected cover first, and keep full-resolution originals private.</p>
        </div>

        <label className={"zip-dropzone " + (archive ? "zip-dropzone-selected" : "")}>
          <input
            type="file"
            accept=".zip,application/zip"
            disabled={busy}
            onChange={(event) => {
              setArchive(event.target.files?.[0] || null);
              setError("");
              setMessage("");
              setCompletedSlug("");
            }}
          />
          {archive ? (
            <>
              <Check size={24} />
              <strong>{archive.name}</strong>
              <span>{(archive.size / (1024 * 1024)).toFixed(1)} MB · READY TO UPLOAD</span>
            </>
          ) : (
            <>
              <Upload size={25} />
              <strong>Select an image ZIP</strong>
              <span>JPG, PNG and WEBP files · 50 MB max per image</span>
            </>
          )}
        </label>

        {archive && !busy ? (
          <button className="upload-clear" type="button" onClick={() => setArchive(null)}>
            <X size={14} /> REMOVE ZIP
          </button>
        ) : null}

        {busy ? (
          <div className="upload-progress" aria-live="polite">
            <div className="upload-progress-copy">
              <span>{message}</span>
              <strong>{progress} / {total || "—"}</strong>
            </div>
            <div className="upload-progress-track"><span style={{ width: total ? (progress / total) * 100 + "%" : "0%" }} /></div>
          </div>
        ) : null}

        {error ? <p className="upload-message upload-message-error">{error}</p> : null}
        {message && !busy ? <p className="upload-message upload-message-success">{message}</p> : null}

        {completedSlug ? (
          <Link className="upload-view-link" href={"/g/" + completedSlug}>
            VIEW SKYWALKER COLLECTION <ArrowDownToLine size={15} />
          </Link>
        ) : null}

        <button className="upload-submit" type="button" onClick={handleUpload} disabled={!archive || busy}>
          {busy ? <><LoaderCircle className="upload-spinner" size={16} /> UPLOADING COLLECTION…</> : <>UPLOAD PRIVATE COLLECTION <ArrowDownToLine size={16} /></>}
        </button>
      </section>

      <p className="upload-security-note">
        PRIVATE BY DESIGN / Originals and previews are stored in the private Supabase bucket. The public GitHub repository only receives application code.
      </p>
    </div>
  );
}
