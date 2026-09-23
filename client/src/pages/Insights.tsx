import { MoveLeft, MoveRight } from "lucide-react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { trackArticleRead } from "@/lib/ga4";
import { applyDocumentMetadata } from "@/lib/publicSeo";
import { findInsightArticle, INSIGHT_ARTICLES } from "@/lib/insightsArticles";
import WhatsAppQuickContact from "@/components/WhatsAppQuickContact";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function routeToLabel(route: string): string {
  return route.slice(1).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function InsightHub() {
  useEffect(() => {
    applyDocumentMetadata({
      lang: "en",
      path: "/insights",
      title: "Diamond Industry Insights — Alvora",
      description: "Analysis, reports, and market commentary from Alvora's diamond manufacturing team in Surat.",
      robots: "index,follow,max-image-preview:large",
    });
  }, []);

  const allEntries = [...INSIGHT_ARTICLES]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

  return (
    <main className="insight-page">
      <header className="insight-header">
        <a className="brand" href="/">
          <img className="brand-mark" src="/assets/alvora-faceted-a.webp" alt="" />
          <span className="brand-name">ALVORA</span>
        </a>
        <a className="insight-back" href="/">
          <MoveLeft size={15} /> Alvora home
        </a>
      </header>

      <section className="insight-intro">
        <p className="eyebrow eyebrow-bright"><span />ALVORA / TRADE INSIGHTS</p>
        <h1>Manufacturing notes<br />for trade buyers.</h1>
        <p className="insight-dek">
          Practical guides, Q&amp;A, and sourcing notes from Alvora's team in Surat — on certification,
          specification, pricing, and choosing the right wholesale format.
        </p>
      </section>

      <nav className="insight-list" aria-label="All insights">
        {allEntries.map((article) => (
          <a key={article.slug} href={`/insights/${article.slug}`}>
            <p>{article.eyebrow}</p>
            <div className="insight-list-body">
              <h2>{article.title}</h2>
              <p className="insight-description">{article.description}</p>
              <p className="insight-date">{formatDate(article.publishedDate)}</p>
            </div>
            <span>Read <MoveRight size={13} /></span>
          </a>
        ))}
      </nav>
    </main>
  );
}

function InsightArticlePage({ slug }: { slug: string }) {
  const article = findInsightArticle(slug);

  const published = article?.publishedDate ?? '';
  const author = article?.author ?? 'Alvora Diamonds';
  const readingTime = article?.readingTime;
  const relatedProduct = article?.relatedProduct;
  const description = article?.description ?? '';

  useEffect(() => {
    if (!article) return;
    applyDocumentMetadata({
      lang: "en",
      path: `/insights/${slug}`,
      title: `${article.title} | Alvora`,
      description,
      robots: "index,follow,max-image-preview:large",
    });
  }, [article, slug, description]);

  useEffect(() => {
    if (!article?.jsonLd) return;
    const blocks = Array.isArray(article.jsonLd) ? article.jsonLd : [article.jsonLd];
    const scripts = blocks.map((block) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.dataset.insightLd = 'true';
      s.textContent = JSON.stringify(block);
      document.head.appendChild(s);
      return s;
    });
    return () => scripts.forEach((s) => s.remove());
  }, [article]);

  useEffect(() => {
    if (!article) return;
    let fired = false;
    const handle = () => {
      if (fired) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > 0 && scrolled / total >= 0.6) {
        fired = true;
        trackArticleRead(slug);
        window.removeEventListener('scroll', handle);
      }
    };
    window.addEventListener('scroll', handle, { passive: true });
    return () => window.removeEventListener('scroll', handle);
  }, [article, slug]);

  if (!article) {
    return (
      <main className="insight-page">
        <header className="insight-header">
          <a className="brand" href="/">
            <img className="brand-mark" src="/assets/alvora-faceted-a.webp" alt="" />
            <span className="brand-name">ALVORA</span>
          </a>
          <a className="insight-back" href="/insights">
            <MoveLeft size={15} /> All insights
          </a>
        </header>
        <section className="insight-intro">
          <h1>Article not found.</h1>
          <p><a className="text-link" href="/insights">View all insights</a></p>
        </section>
      </main>
    );
  }

  return (
    <main className="insight-page">
      <header className="insight-header">
        <a className="brand" href="/">
          <img className="brand-mark" src="/assets/alvora-faceted-a.webp" alt="" />
          <span className="brand-name">ALVORA</span>
        </a>
        <a className="insight-back" href="/insights">
          <MoveLeft size={15} /> All insights
        </a>
      </header>

      <article className="insight-article">
        <p className="eyebrow eyebrow-bright"><span />ALVORA / TRADE INSIGHTS · {article.eyebrow}</p>
        <h1>{article.title}</h1>
        <p className="insight-author">
          {formatDate(published)} · {author}{readingTime && <> · {readingTime} read</>}
        </p>

        <div className="insight-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
        </div>

        <div className="insight-cta-block">
          <p>Discuss your requirement with Alvora. We respond within 24 hours.</p>
          <div className="insight-cta-actions">
            <WhatsAppQuickContact />
            {relatedProduct && (
              <a className="insight-cta-link" href={relatedProduct}>
                {routeToLabel(relatedProduct)} <MoveRight size={14} />
              </a>
            )}
            <a className="insight-cta-link" href="/request-a-quote">
              Request a quote <MoveRight size={14} />
            </a>
          </div>
        </div>
      </article>
    </main>
  );
}

export default function Insights({ articleSlug }: { articleSlug?: string }) {
  if (articleSlug) return <InsightArticlePage slug={articleSlug} />;
  return <InsightHub />;
}
