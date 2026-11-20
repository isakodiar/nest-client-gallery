import "./collections.css";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import BrandMark from "@/components/brand-mark";
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
    <main className="collections-page nest-redesign">
      <header className="collections-header">
        <BrandMark priority />
        <span>CREATIVE DELIVERY / MEMBERS AREA</span>
        <form action={signOutAction}>
          <button type="submit">SIGN OUT ↗</button>
        </form>
      </header>

      <section className="collections-content">
        <div className="collections-intro-block"><p className="eyebrow">NEST / YOUR COLLECTIONS / 001</p>
        <h1>YOUR WORK.<br /><em>ALL HERE.</em></h1>
        <p className="collections-intro">Un espacio para volver a tus sesiones, explorar tus proyectos y descargar tus entregables de NEST.</p></div>
        <div className="collections-marquee">PRIVATE COLLECTIONS / CURATED BY NEST / PRIVATE COLLECTIONS / CURATED BY NEST /</div>

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
        <span>CREATIVE DELIVERY / PERSONAL ACCESS</span>
      </footer>
    </main>
  );
}