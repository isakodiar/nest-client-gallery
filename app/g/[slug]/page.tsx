import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import GalleryView, { GalleryPhoto } from "@/components/gallery-view";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: "Private collection — " + slug };
}

export default async function ClientGalleryPage({ params }: PageProps) {
  const { slug } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) redirect("/login");

  const { data: gallery } = await supabase
    .from("galleries")
    .select("id, slug, title, client_name, description, event_date")
    .eq("slug", slug)
    .maybeSingle();

  if (!gallery) notFound();

  const { data: photoRows } = await supabase
    .from("photos")
    .select("id, filename, alt_text, sort_order, storage_path, preview_path")
    .eq("gallery_id", gallery.id)
    .order("sort_order", { ascending: true });

  const photos: GalleryPhoto[] = await Promise.all(
    (photoRows || []).map(async (photo) => {
      const previewPath = photo.preview_path || photo.storage_path;
      const { data: signedPreview } = await supabase
        .storage
        .from("gallery-media")
        .createSignedUrl(previewPath, 60 * 15);

      return {
        id: photo.id,
        src: signedPreview?.signedUrl || "",
        alt: photo.alt_text || photo.filename,
        filename: photo.filename,
        caption: photo.filename,
        downloadHref: "/api/g/" + slug + "/photos/" + photo.id + "/download",
      };
    })
  );

  const visiblePhotos = photos.filter((photo) => Boolean(photo.src));

  return (
    <>
      <div className="account-bar">
        <span>SECURE CLIENT SESSION</span>
        <form action={signOutAction}>
          <button type="submit">SIGN OUT ↗</button>
        </form>
      </div>
      <GalleryView
        title={gallery.title}
        clientName={gallery.client_name}
        description={gallery.description}
        dateLabel={gallery.event_date || "NEST STUDIO"}
        photos={visiblePhotos}
        downloadAllHref={"/api/g/" + slug + "/download"}
      />
    </>
  );
}