import type { Metadata } from "next";
import GalleryView, { GalleryPhoto } from "@/components/gallery-view";

export const metadata: Metadata = { title: "SKYWALKER PHOTOSHOOT — NEST" };

const samplePhotos: GalleryPhoto[] = [
  {
    id: "sample-01",
    src: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1800&q=88",
    alt: "Editorial fashion portrait in a minimal studio",
    caption: "FRAME 01 — THE ARRIVAL",
  },
  {
    id: "sample-02",
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=88",
    alt: "Editorial portrait with dramatic styling",
    caption: "FRAME 02 — CHARACTER",
  },
  {
    id: "sample-03",
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=88",
    alt: "Close editorial portrait",
    caption: "FRAME 03 — DETAILS",
  },
  {
    id: "sample-04",
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=88",
    alt: "Fashion portrait in natural light",
    caption: "FRAME 04 — IN MOTION",
  },
  {
    id: "sample-05",
    src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=88",
    alt: "Editorial fashion photography",
    caption: "FRAME 05 — THE SILHOUETTE",
  },
  {
    id: "sample-06",
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=88",
    alt: "Editorial portrait and styling",
    caption: "FRAME 06 — THE COLLECTION",
  },
];

export default function PreviewPage() {
  return (
    <>
      <div className="preview-notice">
        <span>DESIGN PREVIEW</span>
        <span>Las imágenes son referencias temporales, no fotografías de la entrega Star Wars.</span>
      </div>
      <GalleryView
        title="SKYWALKER PHOTOSHOOT"
        clientName="A NEST PHOTOGRAPHY COLLECTION"
        description="Una colección creada para volver a esos momentos. Cada imagen, seleccionada y preparada para conservarse en alta resolución."
        dateLabel="NOVEMBER 2026"
        photos={samplePhotos}
        isDemo
      />
    </>
  );
}