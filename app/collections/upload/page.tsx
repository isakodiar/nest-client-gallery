import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UploadClient, { type UploadGallery } from "./upload-client";
import "./upload.css";

export const dynamic = "force-dynamic";

export default async function CollectionUploadPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const ownerId = claimsData?.claims?.sub;

  if (!ownerId) redirect("/login");

  const { data: galleryRows } = await supabase
    .from("galleries")
    .select("id, slug, title")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  const galleries: UploadGallery[] = (galleryRows || []).map((gallery) => ({
    id: gallery.id,
    slug: gallery.slug,
    title: gallery.title,
  }));

  return (
    <main className="upload-page">
      <header className="upload-header">
        <Link className="wordmark" href="/">NEST<span>®</span></Link>
        <span>PRIVATE MEDIA INTAKE</span>
        <Link href="/collections" className="upload-back-link">BACK TO COLLECTIONS ↗</Link>
      </header>

      <section className="upload-content">
        <p className="eyebrow">NEST / CREATIVE DELIVERY</p>
        <h1>Bring the<br /><em>frames in.</em></h1>
        <p className="upload-intro">
          Upload a session ZIP once. NEST will organize the photographs, prepare lightweight previews,
          and keep the original files inside your private gallery storage.
        </p>
        <UploadClient galleries={galleries} ownerId={ownerId} />
      </section>

      <footer className="upload-footer">
        <span>© NEST STUDIO</span>
        <span>PRIVATE STORAGE / OWNER ACCESS ONLY</span>
      </footer>
    </main>
  );
}
