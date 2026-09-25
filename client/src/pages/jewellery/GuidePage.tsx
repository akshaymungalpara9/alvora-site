import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import JewelleryShell from "@/components/jewellery/JewelleryShell";
import CollectionGrid from "@/components/jewellery/CollectionGrid";
import NotFound from "@/pages/NotFound";
import { findGuide } from "@shared/jewellery/editorial";
import { applyJewellerySeo } from "@/lib/jewellerySeo";
import "./jewellery-pages.css";

/** Answer-first buying guide that supports a money page. */
export default function GuidePage({ slug }: { slug: string }) {
  const guide = findGuide(slug);

  useEffect(() => {
    if (guide) applyJewellerySeo(`/guides/${guide.slug}`, guide.title, guide.description);
  }, [guide]);

  if (!guide) return <NotFound />;
  const pieces = guide.pieces();

  return (
    <JewelleryShell>
      <article className="jg">
        <header className="jg-head">
          <nav className="jc-crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Guides</span>
          </nav>
          <h1 className="jw-display">{guide.heading}</h1>
          <p className="jg-answer">{guide.answer}</p>
          <p className="jg-meta">Alvora, Surat · {new Date(`${guide.published}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p>
          <Link href={guide.cta.href} className="jw-button">{guide.cta.label} <ArrowRight size={15} strokeWidth={1.6} /></Link>
        </header>

        {guide.video ? (
          <figure className="jg-video" style={{ margin: "0 0 2rem" }}>
            <div style={{ position: "relative", paddingTop: "56.25%" }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${guide.video.youtubeId}`}
                title={guide.video.title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          </figure>
        ) : null}

        <div className="jg-body">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.link ? <Link href={section.link.href} className="jw-link">{section.link.label} <ArrowRight size={13} /></Link> : null}
            </section>
          ))}
        </div>
      </article>

      {pieces.length ? (
        <section className="jp-related" aria-labelledby="guide-pieces">
          <h2 id="guide-pieces">Rings from this guide</h2>
          <CollectionGrid pieces={pieces} priorityCount={0} />
          <p className="jg-more"><Link href={guide.cta.href} className="jw-link">{guide.cta.label} <ArrowRight size={13} /></Link></p>
        </section>
      ) : null}
    </JewelleryShell>
  );
}
