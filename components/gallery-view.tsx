"use client";

import Image from "next/image";
import Link from "next/link";
import BrandMark from "@/components/brand-mark";
import { useEffect, useState } from "react";
import { ArrowDownToLine, ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  filename?: string;
  downloadHref?: string;
};

type GalleryViewProps = {
  title: string;
  clientName: string;
  description?: string | null;
  dateLabel?: string;
  photos: GalleryPhoto[];
  downloadAllHref?: string;
  isDemo?: boolean;
  sharedAccess?: boolean;
  collectionDownloads?: { href: string; label: string }[];
};

function formatIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

export default function GalleryView({
  title,
  clientName,
  description,
  dateLabel,
  photos,
  downloadAllHref,
  isDemo = false,
  sharedAccess = false,
  collectionDownloads,
}: GalleryViewProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const downloadLinks = collectionDownloads ?? (downloadAllHref ? [{href: downloadAllHref, label: "DOWNLOAD COLLECTION"}] : []);

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null ? null : (current + 1) % photos.length);
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
    }

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, photos.length]);

  return (
    <main className="gallery-page">
      <header className="gallery-header">
        <BrandMark priority />
        <span className="gallery-header-center">NEST CREATIVE DELIVERY / PRIVATE COLLECTION</span>
        {isDemo ? (
          <span className="gallery-header-right">DESIGN PREVIEW</span>
        ) : sharedAccess ? (
          <span className="gallery-header-right">PRIVATE LINK ACCESS</span>
        ) : (
          <Link className="gallery-header-right gallery-header-link" href="/collections">MY COLLECTIONS ↗</Link>
        )}
      </header>

      <section className="gallery-content">
        <div className="gallery-overline">
          <span>NEST / COLLECTION Nº 001</span>
          <span>{dateLabel || "NEST STUDIO"}</span>
        </div>

        <div className="gallery-heading">
          <div className="gallery-title-block">
            <p className="eyebrow">CURATED WITH INTENTION / MADE TO KEEP</p>
            <h1>{title}</h1>
            <span className="gallery-title-signature">The NEST collection.</span>
          </div>
          <div className="gallery-intro-copy">
            <p>{description || "Una colección privada de fotografías, preparada por NEST para conservar y compartir."}</p>
            <span>DELIVERED TO / {clientName}</span>
          </div>
        </div>

        {photos.length > 0 ? (
          <div className="gallery-cover">
            <Image
              src={photos[0].src}
              alt={photos[0].alt}
              fill
              priority
              unoptimized
              sizes="(max-width: 900px) 100vw, 1400px"
            />
            <div className="cover-gradient" />
            <div className="cover-top-label"><span>PRIVATE EDITION</span><span>NEST CREATIVE DELIVERY</span></div>
            <div className="cover-editorial-headline" aria-hidden="true">YOUR<br /><em>MOMENTS.</em></div>
            <div className="cover-caption">
              <span>THE COLLECTION</span>
              <strong>{clientName}</strong>
            </div>
            <span className="cover-index">Nº 001 — {String(photos.length).padStart(2, "0")}</span>
          </div>
        ) : (
          <div className="gallery-empty">
            <span>COLLECTION IN PROGRESS</span>
            <p>Las fotografías de esta colección estarán disponibles próximamente.</p>
          </div>
        )}

        <div className="gallery-marquee" aria-label="Curated by NEST Creative Delivery">
          <div className="gallery-marquee-track">NEST / CREATIVE DELIVERY / PRIVATE COLLECTION / MADE TO KEEP / NEST / CREATIVE DELIVERY / PRIVATE COLLECTION / MADE TO KEEP /</div>
        </div>

        <div className="gallery-steps" aria-label="Cómo disfrutar tu galería">
          <div><span>01 / EXPLORE</span><strong>EXPLORE YOUR FRAMES.</strong><p>Recorre las imágenes seleccionadas para tu colección.</p></div>
          <div><span>02 / ENJOY</span><strong>TAKE IT ALL IN.</strong><p>Abre cada fotografía para verla con todo detalle.</p></div>
          <div><span>03 / KEEP</span><strong>MAKE THEM YOURS.</strong><p>Descarga cada imagen o los paquetes disponibles.</p></div>
        </div>

        <div className="collection-toolbar">
          <div className="collection-count">
            <span className="eyebrow">YOUR COLLECTION / SELECTED FRAMES</span>
            <strong>{String(photos.length).padStart(2, "0")} <span>PHOTOGRAPHS</span></strong>
          </div>
          {downloadLinks.length > 0 && photos.length > 0 ? (
            <div className="download-collection-group">
              {downloadLinks.map((download) => (
                <a className="download-collection" href={download.href} key={download.href}>
                  {download.label} <ArrowDownToLine size={15} />
                </a>
              ))}
            </div>
          ) : (
            <span className="preview-stamp">{isDemo ? "SAMPLE IMAGERY / NOT FOR DOWNLOAD" : "YOUR COLLECTION IS BEING PREPARED"}</span>
          )}
        </div>

        <div className="photo-grid">
          {photos.map((photo, index) => (
            <article className={"photo-card " + (index % 5 === 1 ? "photo-card-tall" : "")} key={photo.id}>
              <button
                className="photo-open"
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={"Open photograph " + formatIndex(index)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                />
                <span className="photo-number">{formatIndex(index)}</span>
                <span className="photo-open-hint">VIEW FRAME ↗</span>
              </button>
              <div className="photo-meta">
                <span>{photo.caption || "FRAME " + formatIndex(index)}</span>
                {photo.downloadHref ? (
                  <a href={photo.downloadHref} aria-label={"Download " + photo.filename}>
                    <ArrowDownToLine size={15} />
                  </a>
                ) : (
                  <span className="photo-meta-index">{formatIndex(index)} / {String(photos.length).padStart(2, "0")}</span>
                )}
              </div>
            </article>
          ))}
        </div>

        <footer className="gallery-footer">
          <div>
            <BrandMark variant="white" />
            <p>Made with intention. Kept for a lifetime.</p>
          </div>
          <div className="gallery-footer-right"><span>CREATIVE DELIVERY / PRIVATE BY DESIGN</span><span>© NEST STUDIO / ALL RIGHTS RESERVED</span></div>
        </footer>
      </section>

      {activePhoto && activeIndex !== null ? (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photograph viewer">
          <div className="lightbox-top">
            <span>NEST / FRAME {formatIndex(activeIndex)}</span>
            <button className="lightbox-close" type="button" onClick={() => setActiveIndex(null)} aria-label="Close viewer">
              <X size={22} />
            </button>
          </div>
          <button
            className="lightbox-arrow lightbox-prev"
            type="button"
            onClick={() => setActiveIndex((activeIndex - 1 + photos.length) % photos.length)}
            aria-label="Previous photograph"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="lightbox-image">
            <Image src={activePhoto.src} alt={activePhoto.alt} fill unoptimized sizes="100vw" />
          </div>
          <button
            className="lightbox-arrow lightbox-next"
            type="button"
            onClick={() => setActiveIndex((activeIndex + 1) % photos.length)}
            aria-label="Next photograph"
          >
            <ChevronRight size={28} />
          </button>
          <div className="lightbox-bottom">
            <span>{activePhoto.caption || activePhoto.alt}</span>
            <span>{formatIndex(activeIndex)} / {String(photos.length).padStart(2, "0")}</span>
          </div>
        </div>
      ) : null}
    </main>
  );
}