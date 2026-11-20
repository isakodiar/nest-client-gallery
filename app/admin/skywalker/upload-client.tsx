"use client";

import JSZip from "jszip";
import { useState } from "react";
import { ArrowUpRight, Check, Copy, LoaderCircle, Upload } from "lucide-react";

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

function mimeTypeFor(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "webp") return "image/webp";
  return "image/png";
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
    const maxDimension = 1800;
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
    return await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.82));
  } catch {
    return null;
  }
}

type UploadResult = { ok?: boolean; error?: string; shareUrl?: string; expiresAt?: string };

export default function UploadClient({ configurationIssue = "" }: { configurationIssue?: string }) {
  const [adminCode, setAdminCode] = useState("");
  const [archive, setArchive] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(38);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleUpload() {
    if (!archive || !adminCode.trim() || busy) return;
    setBusy(true);
    setProgress(0);
    setTotal(38);
    setError("");
    setMessage("Leyendo el ZIP…");
    setShareUrl("");
    setCopied(false);

    try {
      const zip = await JSZip.loadAsync(archive);
      const entries = orderEntries(
        Object.values(zip.files).filter((entry) =>
          !entry.dir &&
          !entry.name.split("/").some((part) => part.startsWith("__")) &&
          /\.(jpe?g|png|webp)$/i.test(entry.name)
        )
      );

      if (entries.length !== 38) {
        throw new Error("El ZIP debe contener exactamente 38 fotografías. Encontré " + entries.length + ".");
      }

      setTotal(entries.length);

      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        const filename = entry.name.split("/").pop() || entry.name;
        const rawBlob = await entry.async("blob");
        if (rawBlob.size > 5 * 1024 * 1024) {
          throw new Error(filename + " supera el límite de 5 MB por fotografía para esta carga.");
        }

        const original = new File([rawBlob], filename, { type: mimeTypeFor(filename) });
        const previewBlob = await createPreview(original);
        const formData = new FormData();
        formData.append("original", original, filename);
        formData.append("filename", filename);
        formData.append("sortOrder", String(index));

        if (previewBlob) {
          const previewName = filename.replace(/\.[^.]+$/, "") + ".webp";
          const preview = new File([previewBlob], previewName, { type: "image/webp" });
          formData.append("preview", preview, previewName);
        }

        setMessage("Subiendo " + filename + "…");

        const response = await fetch("/api/admin/skywalker/upload", {
          method: "POST",
          headers: { "x-nest-admin-code": adminCode.trim() },
          body: formData,
        });
        const result = (await response.json()) as UploadResult;
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "No se pudo subir " + filename + ".");
        }

        setProgress(index + 1);
      }

      setMessage("Preparando el enlace privado…");
      const completeResponse = await fetch("/api/admin/skywalker/complete", {
        method: "POST",
        headers: { "x-nest-admin-code": adminCode.trim() },
      });
      const completeResult = (await completeResponse.json()) as UploadResult;
      if (!completeResponse.ok || !completeResult.shareUrl) {
        throw new Error(completeResult.error || "Las fotos se subieron, pero no se pudo crear el enlace privado.");
      }

      setShareUrl(completeResult.shareUrl);
      setMessage("Colección lista: 38 fotografías cargadas y enlace privado creado.");
      setArchive(null);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Ocurrió un error durante la carga.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  }

  return (
    <div className="skywalker-upload-workspace">
      <section className="skywalker-upload-panel">
        <label className="skywalker-upload-field">
          <span>ADMIN CODE</span>
          <input
            type="password"
            autoComplete="current-password"
            value={adminCode}
            onChange={(event) => setAdminCode(event.target.value)}
            placeholder="Ingresa tu código privado de NEST"
            disabled={busy}
          />
        </label>

        <label className={"skywalker-dropzone" + (archive ? " skywalker-dropzone--selected" : "")}>
          <input
            type="file"
            accept=".zip,application/zip"
            disabled={busy}
            onChange={(event) => {
              setArchive(event.target.files?.[0] || null);
              setError("");
              setMessage("");
              setShareUrl("");
            }}
          />
          {archive ? <Check size={26} /> : <Upload size={26} />}
          <strong>{archive ? archive.name : "Selecciona el ZIP de SKYWALKER"}</strong>
          <span>{archive ? (archive.size / (1024 * 1024)).toFixed(1) + " MB · LISTO PARA CARGAR" : "38 FOTOGRAFÍAS / JPG, PNG O WEBP"}</span>
        </label>

        {busy ? (
          <div className="skywalker-progress" aria-live="polite">
            <div className="skywalker-progress-copy">
              <span>{message}</span>
              <strong>{progress} / {total}</strong>
            </div>
            <div className="skywalker-progress-track">
              <span style={{ width: (progress / Math.max(total, 1)) * 100 + "%" }} />
            </div>
          </div>
        ) : null}

        {configurationIssue ? <p className="skywalker-upload-error">{configurationIssue}</p> : null}
        {error ? <p className="skywalker-upload-error">{error}</p> : null}
        {message && !busy ? <p className="skywalker-upload-success">{message}</p> : null}

        <button
          className="skywalker-upload-submit"
          type="button"
          onClick={handleUpload}
          disabled={!archive || !adminCode.trim() || busy || Boolean(configurationIssue)}
        >
          {busy ? <><LoaderCircle className="skywalker-spinner" size={17} /> CARGANDO COLECCIÓN…</> : <>UPLOAD COLLECTION <ArrowUpRight size={17} /></>}
        </button>
      </section>

      {shareUrl ? (
        <section className="skywalker-share-result">
          <p className="eyebrow">02 / CLIENT DELIVERY</p>
          <h2>Your private link<br /><span>is ready.</span></h2>
          <p>Este enlace abre la galería directamente. El cliente no necesita crear una cuenta ni recibir un correo.</p>
          <div className="skywalker-share-url">{shareUrl}</div>
          <button type="button" onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "LINK COPIED" : "COPY CLIENT LINK"}
          </button>
          <a href={shareUrl} target="_blank" rel="noreferrer">OPEN COLLECTION <ArrowUpRight size={15} /></a>
        </section>
      ) : null}

      <p className="skywalker-upload-note">
        PRIVATE BY DESIGN / Los originales y previews se almacenan en el bucket privado de Supabase.
        Ninguna fotografía se sube a GitHub.
      </p>
    </div>
  );
}
