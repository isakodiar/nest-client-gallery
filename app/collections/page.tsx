import "./collections.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) redirect("/login");

  const { data: galleries } = await supabase
    .from("galleries")
    .select("id, slug, title, client_name, description, event_date, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="collections-page">
      <header className="collections-header">
        <Link className="wordmark" href="/">NEST<span>®</span></Link>
        <span>YOUR PRIVATE COLLECTIONS</span>
        <Link className="collections-upload-link" href="/collections/upload">UPLOAD SESSION ↗</Link>
        <form action={signOutAction}>
          <button type="submit">SIGN OUT ↗</button>
        </form>
      </header>

      <section className="collections-content">
        <p className="eyebrow">NEST / CLIENT SPACE</p>
        <h1>Your moments,<br /><em>collected.</em></h1>
        <p className="collections-intro">A private place for the photographs made with you. Select a collection to revisit and download your images.</p>

        {galleries?.length ? (
          <div className="collection-list">
            {galleries.map((gallery, index) => (
              <Link className="collection-row" href={"/g/" + gallery.slug} key={gallery.id}>
                <span className="collection-row-number">{String(index + 1).padStart(2, "0")}</span>
                <div className="collection-row-main">
                  <span className="eyebrow">{gallery.client_name}</span>
                  <h2>{gallery.title}</h2>
                  {gallery.description ? <p>{gallery.description}</p> : null}
                </div>
                <div className="collection-row-meta">
                  <span>{gallery.event_date || "PRIVATE COLLECTION"}</span>
                  <ArrowUpRight size={19} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="collections-empty">
            <span>NO COLLECTIONS YET</span>
            <p>Your NEST gallery will appear here once it is ready.</p>
          </div>
        )}
      </section>

      <footer className="collections-footer">
        <span>© NEST STUDIO</span>
        <span>PRIVATE COLLECTIONS / PERSONAL ACCESS</span>
      </footer>
    </main>
  );
}