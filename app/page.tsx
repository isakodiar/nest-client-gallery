import Link from "next/link";
import { ArrowDownToLine, ArrowUpRight, LockKeyhole, MoveRight } from "lucide-react";
import BrandMark from "@/components/brand-mark";

export default function HomePage() {
  return (
    <main className="landing nest-redesign">
      <header className="site-header masthead">
        <BrandMark priority />
        <div className="masthead-middle">
          <span>CREATIVE DELIVERY®</span>
          <span>BY NEST STUDIO</span>
        </div>
        <Link className="header-link masthead-access" href="/login">
          CLIENT PORTAL <ArrowUpRight size={15} />
        </Link>
      </header>

      <section className="campaign-hero" aria-labelledby="campaign-title">
        <div className="campaign-hero-content">
          <div className="campaign-overline"><span className="campaign-red-dot" /> ISSUE NO. 001 / CREATIVE DELIVERY</div>
          <span className="hero-outline-word" aria-hidden="true">DELIVERED</span>
          <div className="campaign-title-group">
            <h1 id="campaign-title">
              MADE<br />
              <span>TO KEEP.</span>
            </h1>
            <p className="campaign-handwritten">The NEST experience.</p>
          </div>
          <div className="campaign-hero-bottom">
            <div>
              <span className="campaign-small-index">01 / A NEW WAY TO RECEIVE YOUR WORK</span>
              <p>Tu proyecto, en un solo lugar. Una experiencia privada para revivir cada imagen, explorar cada detalle y conservar lo que creamos juntos.</p>
            </div>
            <Link className="campaign-action" href="/preview">
              EXPLORE THE GALLERY <MoveRight size={18} />
            </Link>
          </div>
        </div>
        <div className="campaign-portrait" role="img" aria-label="Fotografía editorial de referencia en la experiencia de NEST">
          <span className="portrait-top">NEST — CURATED MOMENTS</span>
          <div className="campaign-portrait-type" aria-hidden="true">YOUR<br/>MOMENTS.</div>
          <span className="portrait-bottom">INTENTIONAL WORK. LASTING IMPACT.</span>
        </div>
        <div className="campaign-hero-index">NEST / 2026</div>
      </section>

      <div className="editorial-marquee" aria-label="NEST Creative Delivery, private collections">
        <div className="editorial-marquee-inner" aria-hidden="true">
          PRIVATE COLLECTIONS ✳ NEST CREATIVE DELIVERY ✳ MADE TO KEEP ✳ PRIVATE COLLECTIONS ✳ NEST CREATIVE DELIVERY ✳ MADE TO KEEP ✳
        </div>
      </div>

      <section className="home-modules" aria-label="Cómo funcionan las entregas">
        <article className="home-module module-01">
          <div className="module-label"><span>/ 01</span><span>DIRECT ACCESS</span></div>
          <div className="module-symbol"><LockKeyhole size={41} strokeWidth={1.4} /></div>
          <div className="module-bottom"><h2>ONE LINK.<br/>ALL YOURS.</h2><p>Un enlace privado, sin registros innecesarios, para entregas de una sola ocasión.</p></div>
        </article>
        <article className="home-module module-02">
          <div className="module-label"><span>/ 02</span><span>THE COLLECTION</span></div>
          <div className="module-symbol"><span className="module-giant-number">∞</span><span className="module-number-note">YOUR MOMENTS<br/>IN FOCUS</span></div>
          <div className="module-bottom"><h2>FRAMES<br/>THAT LAST.</h2><p>Una presentación editorial para disfrutar cada fotografía a tu ritmo.</p></div>
        </article>
        <article className="home-module module-03">
          <div className="module-label"><span>/ 03</span><span>YOUR FILES</span></div>
          <div className="module-symbol"><ArrowDownToLine size={48} strokeWidth={1.3} /></div>
          <div className="module-bottom"><h2>VIEW IT.<br/>KEEP IT.</h2><p>Descarga tus fotografías y materiales finales desde una misma galería.</p></div>
        </article>
        <article className="home-module module-feature">
          <span className="module-feature-kicker">NEST CREATIVE DELIVERY / 2026</span>
          <strong>EVERY<br/><em>DETAIL.</em></strong>
          <span className="module-feature-bottom">THE DELIVERY IS PART OF THE EXPERIENCE. <ArrowUpRight size={22}/></span>
        </article>
      </section>

      <section className="home-story" aria-labelledby="home-story-title">
        <div className="home-story-photo">
          <span>THE EXPERIENCE / NEST</span>
        </div>
        <div className="home-story-copy">
          <p className="eyebrow">NEST / CREATIVE STUDIO</p>
          <h2 id="home-story-title">Not just<br/><em>files.</em><br/><span>Feelings.</span></h2>
          <p>Creemos que la entrega merece el mismo cuidado que la producción. Por eso reunimos cada proyecto en una experiencia visual pensada para ti.</p>
          <Link className="primary-link" href="/preview">SEE HOW IT WORKS <ArrowUpRight size={17}/></Link>
        </div>
      </section>

      <footer className="brand-footer">
        <div className="brand-footer-top"><BrandMark variant="white" /><span>MADE WITH INTENTION.<br/>KEPT FOR A LIFETIME.</span></div>
        <div className="brand-footer-bottom"><span>© NEST STUDIO 2026</span><span>CREATIVE DELIVERY / PRIVATE BY DESIGN</span><Link href="/login">CLIENT PORTAL ↗</Link></div>
      </footer>
    </main>
  );
}
