import type { Metadata } from "next";
import GalleryView from "@/components/gallery-view";

export const metadata: Metadata = {
  title: "SKYWALKER PHOTOSHOOT — NEST",
  robots: { index: false, follow: false, noarchive: true },
};

export default function PreviewPage() {
  return (
    <>
      <div className="preview-notice">
        <span>DESIGN PREVIEW</span>
        <span>La galería final mostrará las 38 fotografías originales después de la carga.</span>
      </div>
      <GalleryView
        title="SKYWALKER PHOTOSHOOT"
        clientName="GALIVERSE"
        description="Una colección creada para volver a esos momentos. Cada imagen, seleccionada y preparada para conservarse en alta resolución."
        dateLabel="NOVEMBER 2026"
        photos={[]}
        isDemo
      />
    </>
  );
}
