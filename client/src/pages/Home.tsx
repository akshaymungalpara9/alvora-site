/**
 * Alvora jewellery home. Lab-grown diamond jewellery leads; the wholesale
 * manufacturing site lives at /trade and is one click away.
 */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import * as Accordion from "@radix-ui/react-accordion";
import { ArrowRight, Plus } from "lucide-react";
import JewelleryShell, { LIVE_NAV } from "@/components/jewellery/JewelleryShell";
import CollectionGrid from "@/components/jewellery/CollectionGrid";
import ShapeSelector, { SHOP_SHAPES } from "@/components/jewellery/ShapeSelector";
import EditorialBand from "@/components/jewellery/EditorialBand";
import PieceImage from "@/components/jewellery/PieceImage";
import { pieceHref } from "@/components/jewellery/ProductCard";
import { PUBLIC_PIECES, formatFromPrice } from "@shared/jewellery/catalog";
import { JEWELLERY_HOME_META } from "@shared/jewellery/seo";
import { JEWELLERY_FAQ } from "@shared/jewellery/faq";
import { applyJewellerySeo } from "@/lib/jewellerySeo";
import "./home-jewellery.css";

/** Anchors that used to live on the homepage and now belong to /trade. */
const TRADE_ANCHORS = new Set(["#production", "#made-to-spec", "#how-we-work", "#production-brief", "#heritage", "#faq"]);

const byScore = (a: { featuredScore: number }, b: { featuredScore: number }) => b.featuredScore - a.featuredScore;
const engagement = PUBLIC_PIECES.filter((piece) => piece.collections.includes("engagement-rings")).sort(byScore);
const everyday = PUBLIC_PIECES.filter((piece) => piece.category === "earrings" || piece.category === "pendant").sort(byScore);
const heroPiece = engagement.find((piece) => piece.images.length) ?? null;
const liveShapes = SHOP_SHAPES.filter(({ shape }) => engagement.some((piece) => piece.shape === shape));
const lowestEveryday = everyday.reduce<number | null>((low, piece) => (piece.fromPriceUsd != null && (low == null || piece.fromPriceUsd < low) ? piece.fromPriceUsd : low), null);

const collectionIndex = LIVE_NAV.map((item) => ({
  ...item,
  count: PUBLIC_PIECES.filter((piece) => piece.collections.includes(item.collection)).length,
}));

export default function Home() {
  const [, navigate] = useLocation();

  useEffect(() => {
    applyJewellerySeo("/", JEWELLERY_HOME_META.title, JEWELLERY_HOME_META.description);
    // Old links such as /#production-brief now belong to the trade home.
    if (TRADE_ANCHORS.has(window.location.hash)) navigate(`/trade${window.location.hash}`, { replace: true });
  }, [navigate]);

  return (
    <JewelleryShell>
      <section className="jh-hero">
        <div className="jh-hero-media">
          {heroPiece ? (
            <Link href={pieceHref(heroPiece)} className="jh-hero-piece" aria-label={heroPiece.name}>
              <PieceImage piece={heroPiece} priority sizes="(min-width: 900px) 55vw, 100vw" />
            </Link>
          ) : (
            <picture>
              <source type="image/webp" srcSet="/assets/plates/plate-bench-loupe-close-800.webp 800w, /assets/plates/plate-bench-loupe-close.webp 1600w" sizes="(min-width: 900px) 55vw, 100vw" />
              <img src="/assets/plates/plate-bench-loupe-close.webp" alt="A diamond under the loupe at the Alvora bench in Surat" fetchPriority="high" />
            </picture>
          )}
          <span className="jh-hero-stamp">SURAT / IND</span>
        </div>
        <div className="jh-hero-copy">
          <p className="jw-eyebrow">Lab-grown diamond jewellery</p>
          <h1 className="jw-display">
            Fine jewellery from a <em>Surat</em> diamond house.
          </h1>
          <p className="jw-lede">
            Engagement rings, earrings and pendants in solid gold, set with lab-grown diamonds. Choose a piece, tell us your metal and size, and we confirm the price before anything is made.
          </p>
          <div className="jh-hero-actions">
            <Link href="/engagement-rings" className="jw-button">Explore engagement rings <ArrowRight size={15} strokeWidth={1.6} /></Link>
            <Link href="/book-a-consultation" className="jw-button jw-button-ghost">Book a consultation</Link>
          </div>
          <dl className="jh-hero-facts">
            <div><dt>Metals</dt><dd>14K &amp; 18K gold</dd></div>
            <div><dt>Colours</dt><dd>Yellow · white · rose</dd></div>
            <div><dt>Pieces</dt><dd>{PUBLIC_PIECES.length} designs</dd></div>
          </dl>
        </div>
      </section>

      {liveShapes.length ? (
        <section className="jh-section jh-shapes" aria-labelledby="shop-by-shape">
          <header className="jh-heading">
            <div>
              <p className="jw-eyebrow">Shop by shape</p>
              <h2 id="shop-by-shape" className="jh-title">Start with the stone.</h2>
            </div>
            <Link href="/engagement-rings" className="jw-link">All engagement rings <ArrowRight size={13} /></Link>
          </header>
          <ShapeSelector shapes={liveShapes} />
        </section>
      ) : null}

      <section className="jh-section" aria-labelledby="engagement-heading">
        <header className="jh-heading">
          <div>
            <p className="jw-eyebrow">Engagement rings</p>
            <h2 id="engagement-heading" className="jh-title">Most loved</h2>
          </div>
          <Link href="/engagement-rings" className="jw-link">View all {engagement.length} <ArrowRight size={13} /></Link>
        </header>
        <CollectionGrid pieces={engagement.slice(0, 8)} priorityCount={0} />
      </section>

      <EditorialBand
        image="/assets/plates/plate-emerald-tweezers.webp"
        image800="/assets/plates/plate-emerald-tweezers-800.webp"
        alt="An emerald-cut diamond held in tweezers under the bench lamp"
        caption="Emerald cut under the bench lamp · Surat"
        eyebrow="From the bench"
        title={<>Cut, graded and set with a diamond maker’s eye.</>}
      >
        <p>Alvora began as a diamond house in Surat, cutting and grading lab-grown stones for jewellers around the world. Our jewellery brings that same attention to the finished piece: well-matched stones, clean settings, honest descriptions.</p>
        <a href="/about" className="jw-link">About Alvora <ArrowRight size={13} /></a>
      </EditorialBand>

      <section className="jh-section jh-index" aria-labelledby="collections-heading">
        <header className="jh-heading">
          <div>
            <p className="jw-eyebrow">Collections</p>
            <h2 id="collections-heading" className="jh-title">Find your piece</h2>
          </div>
        </header>
        <ol className="jh-index-list">
          {collectionIndex.map((item, index) => (
            <li key={item.href}>
              <Link href={item.href}>
                <span className="jh-index-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="jh-index-name">{item.label}</span>
                <span className="jh-index-count">{item.count} {item.count === 1 ? "piece" : "pieces"}</span>
                <ArrowRight size={18} strokeWidth={1.3} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {everyday.length ? (
        <section className="jh-section" aria-labelledby="everyday-heading">
          <header className="jh-heading">
            <div>
              <p className="jw-eyebrow">Earrings &amp; pendants</p>
              <h2 id="everyday-heading" className="jh-title">Everyday diamonds{lowestEveryday != null ? <span className="jh-title-note"> {formatFromPrice({ fromPriceUsd: lowestEveryday }).toLowerCase()}</span> : null}</h2>
            </div>
            <Link href="/earrings" className="jw-link">Shop earrings <ArrowRight size={13} /></Link>
          </header>
          <CollectionGrid pieces={everyday.slice(0, 4)} priorityCount={0} />
        </section>
      ) : null}

      <section className="jh-section jh-steps" aria-labelledby="how-heading">
        <header className="jh-heading">
          <div>
            <p className="jw-eyebrow">How it works</p>
            <h2 id="how-heading" className="jh-title">Made for you, confirmed first.</h2>
          </div>
        </header>
        <ol className="jh-steps-list">
          <li>
            <span>01</span>
            <h3>Choose a piece</h3>
            <p>Pick a design and the shape you love. Every piece shows its starting price.</p>
          </li>
          <li>
            <span>02</span>
            <h3>Tell us your details</h3>
            <p>Metal, gold colour, carat and ring size. Not sure? Book a consultation and we will guide you.</p>
          </li>
          <li>
            <span>03</span>
            <h3>We confirm, then make</h3>
            <p>You receive a written price and timeline for your exact piece before anything is made.</p>
          </li>
        </ol>
      </section>

      <section className="jh-trade" aria-labelledby="trade-heading">
        <div>
          <p className="jw-eyebrow">For the trade</p>
          <h2 id="trade-heading" className="jh-title">Buying for a store or a brand?</h2>
        </div>
        <div>
          <p>Alvora also makes loose lab-grown diamonds, matched pairs, calibrated layouts and finished jewellery for retailers and brands, with trade pricing and private-label options.</p>
          <a href="/trade" className="jw-button jw-button-light">Visit Alvora Trade <ArrowRight size={15} strokeWidth={1.6} /></a>
        </div>
      </section>

      <section className="jh-section jh-faq" aria-labelledby="faq-heading">
        <header className="jh-heading">
          <div>
            <p className="jw-eyebrow">Questions</p>
            <h2 id="faq-heading" className="jh-title">Good to know</h2>
          </div>
        </header>
        <Accordion.Root type="single" collapsible className="jh-faq-list">
          {JEWELLERY_FAQ.map((item, index) => (
            <Accordion.Item key={item.q} value={`faq-${index}`} className="jh-faq-item">
              <Accordion.Header asChild>
                <h3>
                  <Accordion.Trigger className="jh-faq-trigger">
                    {item.q}
                    <Plus size={16} strokeWidth={1.4} aria-hidden="true" />
                  </Accordion.Trigger>
                </h3>
              </Accordion.Header>
              <Accordion.Content className="jh-faq-answer">
                <p>{item.a}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </section>
    </JewelleryShell>
  );
}
