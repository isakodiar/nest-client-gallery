import Link from "next/link";
import { ArrowUpRight, LockKeyhole, MoveRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="landing">
      <header className="site-header">
        <Link className="wordmark" href="/">NEST<span>®</span></Link>
        <span className="header-note">PHOTOGRAPHY / PRIVATE COLLECTIONS</span>
        <Link className="header-link" href="/login">CLIENT ACCESS <ArrowUpRight size={14} /></Link>
      </header>

      <section className="landing-hero">
        <div className="landing-kicker"><span className="kicker-line" /> A PRIVATE SPACE FOR YOUR IMAGES</div>
        <div className="landing-title-wrap">
          <h1>Moments,<br /><em>made lasting.</em></h1>
          <div className="landing-copy">
            <p>A considered space to revisit, experience and download the photographs created with NEST.</p>
            <Link className="primary-link" href="/login">ENTER YOUR GALLERY <MoveRight size={16} /></Link>
          </div>
        </div>
        <div className="landing-image">
          <div className="landing-image-shade" />
          <div className="landing-image-caption">
            <span>01 / PRIVATE COLLECTIONS</span>
            <span>CAPTURED WITH INTENTION.</span>
          </div>
          <div className="landing-image-lock"><LockKeyhole size={15} /> PRIVATE BY DESIGN</div>
        </div>
      </section>

      <footer className="landing-footer">
        <span>© NEST STUDIO</span>
        <span>PHOTOGRAPHY · DIRECTION · EXPERIENCE</span>
        <Link href="/preview">VIEW DESIGN PREVIEW <ArrowUpRight size={13} /></Link>
      </footer>
    </main>
  );
}