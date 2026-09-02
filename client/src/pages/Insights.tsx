import { MoveLeft, MoveRight } from "lucide-react";
import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { applyDocumentMetadata } from "@/lib/publicSeo";
import { findArticle, INSIGHTS } from "@/lib/insightsContent";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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
        {INSIGHTS.map((article) => (
          <a key={article.slug} href={`/insights/${article.slug}`}>
            <p>{article.eyebrow}</p>
            <h2>{article.title}</h2>
            <span>Read <MoveRight size={13} /></span>
          </a>
        ))}
      </nav>
    </main>
  );
}

function InsightArticlePage({ slug }: { slug: string }) {
  const article = findArticle(slug);

  useEffect(() => {
    if (!article) return;
    applyDocumentMetadata({
      lang: "en",
      path: `/insights/${slug}`,
      title: `${article.title} | Alvora`,
      description: article.description,
      robots: "index,follow,max-image-preview:large",
    });
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
        <p className="insight-author">{formatDate(article.published)} · Alvora Diamonds</p>

        <div className="insight-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
        </div>

        <div className="insight-cta-block">
          <p>Discuss your requirement with Alvora.</p>
          <a className="insight-cta-link" href="/request-a-quote">Request a quote <MoveRight size={14} /></a>
        </div>
      </article>
    </main>
  );
}

export default function Insights({ articleSlug }: { articleSlug?: string }) {
  if (articleSlug) return <InsightArticlePage slug={articleSlug} />;
  return <InsightHub />;
}
