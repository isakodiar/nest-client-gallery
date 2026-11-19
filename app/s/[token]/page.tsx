import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GalleryView, { type GalleryPhoto } from "@/components/gallery-view";
import { getSharedGallery } from "@/lib/share-links";

type PageProps = { params: Promise<{ token: string }> };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Private collection — NEST",
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
};

export default async function SharedGalleryPage({ params }: PageProps) {
  const { token } = await params;
  const shared = await getSharedGallery(token);
  if (!shared) notFound();
  const { gallery, supabase } = shared;

  const { data: photoRows, error } = await supabase
    .from("photos")
    .select("id,filename,alt_text,sort_order,storage_path,preview_path")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  if (error) notFound();

  const photos: GalleryPhoto[] = await Promise.all(
    (photoRows || []).map(async (photo) => {
      const { data } = await supabase.storage
        .from("gallery-media")
        .createSignedUrl(photo.preview_path || photo.storage_path, 10 * 60);

      return {
        id: photo.id,
        src: data?.signedUrl || "",
        alt: photo.alt_text || photo.filename,
        filename: photo.filename,
        caption: photo.filename,
        downloadHref: `/api/s/${token}/photos/${photo.id}/download`,
      };
    })
  );

  // A pre-generated ZIP enables reliable full collection downloads on
  // serverless hosting, including sessions with more than 30 photos.
  const { data: archives } = await supabase
    .from("assets")
    .select("id")
    .eq("gallery_id", gallery.id)
    .eq("asset_type", "archive")
    .eq("is_downloadable", true)
    .order("sort_order", { ascending: true })
    .limit(1);

  return (
    <GalleryView
      title={gallery.title}
      clientName={gallery.client_name}
      description={gallery.description}
      dateLabel={gallery.event_date || "NEST STUDIO"}
      photos={photos.filter((photo) => Boolean(photo.src))}
      downloadAllHref={archives?.length ? `/api/s/${token}/download` : undefined}
      sharedAccess
    />
  );
}
