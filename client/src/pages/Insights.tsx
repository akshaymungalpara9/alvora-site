import { ArrowUpRight, MoveLeft } from "lucide-react";
import { useEffect } from "react";
import { applyDocumentMetadata, publicSocialImage } from "@/lib/publicSeo";

type Insight = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  sections: string[];
};

export const insights: Insight[] = [
  { slug: "how-we-cut-to-specification", eyebrow: "Production note 01", title: "How we cut to specification", description: "An Alvora Manufacturing Note on translating a buyer’s shape, dimension, ratio, and finish requirements into a controlled custom make.", sections: ["The specification before the make", "Calibration, ratios, and finish", "How an atelier brief becomes a working production note"] },
  { slug: "reading-an-igi-report", eyebrow: "Production note 02", title: "Reading an IGI report — what actually matters for the trade", description: "An Alvora Manufacturing Note on reading report information in the context of calibrated, jewellery-ready production.", sections: ["Identification and report matching", "The practical reading of proportions and finish", "What to verify before a commercial decision"] },
  { slug: "denomination-rules-france-italy-belgium", eyebrow: "Production note 03", title: "Denomination rules for lab-grown diamonds in France, Italy and Belgium", description: "An Alvora Manufacturing Note outlining where market-specific diamond terminology requires careful owner and counsel review before publication.", sections: ["France: terminology subject to formal review", "Italy and Belgium: market-facing language", "Documentation and local advice before release"] },
];

function DraftNotice() {
  return <p className="insight-draft-note"><span>Owner draft</span> Editorial copy is awaiting Alvora review before this note is released to search indexing.</p>;
}

export default function Insights({ articleSlug }: { articleSlug?: string }) {
  const article = articleSlug ? insights.find((item) => item.slug === articleSlug) : undefined;
  const path = article ? `/insights/${article.slug}` : "/insights";
  const title = article ? `Alvora Insights — ${article.title}` : "Alvora Trade Insights — Manufacturing Notes";
  const description = article ? article.description : "Alvora Manufacturing Notes for trade buyers on custom makes, report reading, and market-facing documentation.";
  useEffect(() => {
    applyDocumentMetadata({ lang: "en", path, title, description, robots: "noindex,follow,max-image-preview:large" });
  }, [description, path, title]);

  if (articleSlug && !article) return <main className="insight-page"><a className="insight-back" href="/insights"><MoveLeft size={15} /> Back to Trade insights</a><p className="eyebrow eyebrow-bright"><span />ALVORA / NOTES</p><h1>That note is not available.</h1></main>;

  if (article) return <main className="insight-page"><header className="insight-header"><a className="brand" href="/"><img className="brand-mark" src="/manus-storage/alvora-faceted-a_2ef055e2.png" alt="" /><span className="brand-name">ALVORA</span></a><a className="insight-back" href="/insights"><MoveLeft size={15} /> Trade insights</a></header><article className="insight-article"><p className="eyebrow eyebrow-bright"><span />{article.eyebrow}</p><h1>{article.title}</h1><p className="insight-dek">{article.description}</p><p className="insight-author">Alvora Manufacturing Notes</p><DraftNotice /><div className="insight-outline">{article.sections.map((section, index) => <section key={section}><span>0{index + 1}</span><h2>{section}</h2><p>Owner copy slot — replace this structured prompt with the approved 400–700 word trade note before publication.</p></section>)}</div></article></main>;

  return <main className="insight-page"><header className="insight-header"><a className="brand" href="/"><img className="brand-mark" src="/manus-storage/alvora-faceted-a_2ef055e2.png" alt="" /><span className="brand-name">ALVORA</span></a><a className="insight-back" href="/"><MoveLeft size={15} /> Alvora home</a></header><section className="insight-intro"><p className="eyebrow eyebrow-bright"><span />ALVORA / TRADE INSIGHTS</p><h1>Notes from the production floor.</h1><p>Short, practical editorial notes for trade buyers who need a clearer view of the make, the report, and the market context around a stone.</p><DraftNotice /></section><section className="insight-list" aria-label="Trade insight drafts">{insights.map((item) => <a href={`/insights/${item.slug}`} key={item.slug}><p>{item.eyebrow}</p><h2>{item.title}</h2><span>Open draft <ArrowUpRight size={17} /></span></a>)}</section></main>;
}
