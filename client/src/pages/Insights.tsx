import { ArrowUpRight, MoveLeft, MoveRight } from "lucide-react";
import { useEffect } from "react";
import { applyDocumentMetadata } from "@/lib/publicSeo";

type Article = {
  slug: string;
  label: string;
  title: string;
  dek: string;
  sections: { heading: string; body: string }[];
};

const articles: Article[] = [
  {
    slug: "choose-lab-grown-diamond-manufacturer-india",
    label: "Buyer guide / 01",
    title: "How to choose a lab-grown diamond manufacturer in India",
    dek: "A practical manufacturer-evaluation checklist for jewellery brands, retailers, and manufacturing teams.",
    sections: [
      {
        heading: "Start with the make, not the adjective",
        body: "A serious procurement review begins with the specification the manufacturer can actually repeat: shape, dimensions, ratios, finish, colour, clarity, fluorescence, and the documentation supplied with the stone. Ask to see the same information on a current production profile, not only in a brand statement.",
      },
      {
        heading: "Ask how quality is checked",
        body: "A useful manufacturer conversation should explain where calibration is checked, how matching is assessed, how reports are verified, and what happens when a stone does not meet the agreed make. Alvora’s public standard is built around certified, calibrated production and verification before dispatch; buyers should still confirm the requirements for their own programme.",
      },
      {
        heading: "Qualify the commercial fit",
        body: "MOQ, sample timing, bulk lead time, payment approach, export documentation, and the person responsible for follow-up are not secondary details. They determine whether a manufacturer can support a launch, a replenishment programme, or only a one-off enquiry.",
      },
      {
        heading: "Protect the brief",
        body: "If the project begins with CAD, an exclusive layout, or a new collection direction, ask how the manufacturer handles the brief and what can be agreed about confidentiality and permitted use before sending sensitive design information.",
      },
    ],
  },
  {
    slug: "oem-odm-private-label-jewellery",
    label: "Commercial guide / 02",
    title:
      "OEM, ODM, or private label: which manufacturing route fits a jewellery brand?",
    dek: "The terms overlap in the market. The useful distinction is who owns the specification, the design decision, and the repeatable production brief.",
    sections: [
      {
        heading: "OEM: your specification, manufactured",
        body: "OEM is the clearest route when the buyer brings a defined brief, CAD, stone requirements, or an existing production standard. The manufacturer’s value is execution: translating the requirement into a repeatable make, sample, and production run.",
      },
      {
        heading: "ODM: a starting point to develop",
        body: "ODM usually begins with a manufacturer’s existing capability, collection direction, or technical base. The buyer and maker then decide what is adapted, exclusive, or ready to order. Confirm what can be changed and how the final specification is recorded.",
      },
      {
        heading: "Private label: a commercial programme",
        body: "Private label adds the brand layer: packaging, assortment, naming, and a route to market under the buyer’s identity. The right manufacturer conversation covers the product brief and the operating details together, including sampling, minimums, replenishment, and permitted use of brand assets.",
      },
      {
        heading: "The question to ask next",
        body: "Do not choose a label first. Send the intended category, target quantity, launch or replenishment date, and the level of design control required. A useful manufacturer should then recommend the route, evidence, and next step.",
      },
    ],
  },
  {
    slug: "cad-to-certified-sample-qc-process",
    label: "Process note / 03",
    title:
      "From CAD to certified sample: what a controlled jewellery brief should contain",
    dek: "A better brief reduces rework because the buyer and manufacturer agree what ‘right’ means before production begins.",
    sections: [
      {
        heading: "1. Record the non-negotiables",
        body: "Start with the stone shape, exact dimensions or tolerances, proportions, colour and clarity requirements, metal, finish, setting context, and the intended quantity. If the design is a matched layout, state how consistency will be judged.",
      },
      {
        heading: "2. Separate the sample from the production run",
        body: "A sample is a decision point, not a promise that every later unit is automatically identical. Agree the approval path, what changes are included, and how the approved sample or stone profile becomes the reference for the run.",
      },
      {
        heading: "3. Verify the record",
        body: "For certified stones, record the report number and the verification step. For made-to-specification work, keep the accepted dimensions, ratios, and finish with the brief so the next conversation begins from an agreed reference.",
      },
      {
        heading: "4. Close the loop",
        body: "When a make misses the brief, the manufacturer should be able to explain whether the answer is rework, recut, repolish, replacement, or a revised specification. Clear ownership is part of quality control.",
      },
    ],
  },
  {
    slug: "lab-grown-diamond-moq-sampling-lead-time",
    label: "Procurement note / 04",
    title:
      "MOQ, sampling, and lead time: the questions to answer before an RFQ",
    dek: "A quote becomes useful when the buyer and maker are talking about the same quantity, specification, and delivery event.",
    sections: [
      {
        heading: "MOQ is not one universal number",
        body: "Minimums can vary by shape, size, matching requirement, certification, customization, and whether the request is a sample, a small replenishment, or a production run. Ask for the minimum by project type rather than publishing a single number that may mislead.",
      },
      {
        heading: "Sampling needs a definition",
        body: "Confirm whether the sample is a loose stone, matched parcel, finished jewellery item, or a complete CAD-to-make exercise. Ask what information the buyer receives with the sample and how approval affects the production timeline.",
      },
      {
        heading: "Lead time starts after the brief is usable",
        body: "A timing promise should state its starting point: receipt of a complete specification, approval of CAD, confirmation of the sample, or acceptance of the quotation. Alvora currently presents a typical 5–10 working-day window for a specification make; buyers should confirm the applicable brief and current capacity before relying on it.",
      },
      {
        heading: "Make the RFQ easy to qualify",
        body: "Include the buyer type, country, category, target quantity, target price band, required date, and a concise specification. That gives the manufacturer enough context to respond with a relevant route instead of a generic catalogue.",
      },
    ],
  },
  {
    slug: "export-jewellery-manufacturer-due-diligence",
    label: "Export checklist / 05",
    title:
      "Export-ready jewellery procurement: the documents and questions to confirm",
    dek: "Export confidence comes from a clear document trail and a manufacturer who can explain what applies to the buyer’s market.",
    sections: [
      {
        heading: "Confirm the commercial record",
        body: "Before placing an order, confirm the legal entity, invoice details, banking instructions, payment approach, shipping responsibility, and the contact who owns the shipment conversation. Keep the agreed details together with the quotation.",
      },
      {
        heading: "Ask what travels with the product",
        body: "Depending on the product and destination, the buyer may need commercial, packing, certification, origin, or customs documentation. Ask the manufacturer and the buyer’s freight or customs adviser to confirm the exact list for the shipment rather than relying on a generic web checklist.",
      },
      {
        heading: "Separate product proof from export proof",
        body: "A diamond report, a manufacturing claim, and an export document answer different questions. A strong manufacturer page makes those distinctions visible and avoids using one document as proof of everything.",
      },
      {
        heading: "Use a written pre-shipment check",
        body: "Agree the product description, quantities, report references, packaging, consignee information, and dispatch approval before the shipment leaves. A short written check protects both sides from avoidable mismatch.",
      },
    ],
  },
];

const metadata = (article?: Article) =>
  article
    ? {
        lang: "en",
        path: `/insights/${article.slug}`,
        title: `${article.title} — Alvora Trade Insights`,
        description: article.dek,
      }
    : {
        lang: "en",
        path: "/insights",
        title: "Trade Insights for Jewellery Buyers — Alvora",
        description:
          "Practical procurement notes for jewellery brands, retailers, and manufacturing teams working with lab-grown diamond production.",
      };

export default function Insights({ articleSlug }: { articleSlug?: string }) {
  const article = articles.find(item => item.slug === articleSlug);
  const current = metadata(article);
  useEffect(() => {
    applyDocumentMetadata({
      ...current,
      robots: "index,follow,max-image-preview:large",
    });
  }, [current]);

  return (
    <main className="insight-page">
      <header className="insight-header">
        <a className="brand" href="/">
          <img
            className="brand-mark"
            src="/assets/alvora-faceted-a.webp"
            alt=""
          />
          <span className="brand-name">ALVORA</span>
        </a>
        <a className="insight-back" href="/">
          <MoveLeft size={15} /> Alvora home
        </a>
      </header>
      {article ? (
        <article className="insight-article">
          <p className="eyebrow eyebrow-bright">
            <span />
            ALVORA / {article.label}
          </p>
          <h1>{article.title}</h1>
          <p className="insight-dek">{article.dek}</p>
          <div className="insight-article-actions">
            <a
              className="button button-signal"
              href="#production-brief"
              data-umami-event="insight_rfq_click"
              data-umami-event-data={JSON.stringify({ article: article.slug })}
            >
              Start a production brief <ArrowUpRight size={15} />
            </a>
            <a className="text-link text-link-light" href="/insights">
              All trade insights <MoveRight size={16} />
            </a>
          </div>
          <div className="insight-outline">
            {article.sections.map((section, index) => (
              <section key={section.heading}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h2>{section.heading}</h2>
                  <p>{section.body}</p>
                </div>
              </section>
            ))}
          </div>
          <aside className="insight-proof-callout">
            <p className="eyebrow eyebrow-bright">
              <span />A useful next step
            </p>
            <h2>Send the brief, not just the question.</h2>
            <p>
              Include your category, quantity, market, required date, and the
              make you need. Alvora can then route the conversation toward a
              specification, sample, or production run.
            </p>
            <a
              className="text-link text-link-light"
              href="/#production-brief"
              data-umami-event="insight_production_brief_click"
            >
              Commission a make <MoveRight size={16} />
            </a>
          </aside>
        </article>
      ) : (
        <>
          <section className="insight-intro">
            <p className="eyebrow eyebrow-bright">
              <span />
              ALVORA / TRADE INSIGHTS
            </p>
            <h1>Useful notes for the buying side of the bench.</h1>
            <p>
              Short, practical guidance for jewellery brands, retailers, and
              manufacturing teams evaluating lab-grown diamond production. The
              aim is not generic diamond commentary; it is a clearer buying
              conversation.
            </p>
            <div className="insight-intro-actions">
              <a
                className="button button-signal"
                href="/#production-brief"
                data-umami-event="insights_production_brief_click"
              >
                Start a production brief <ArrowUpRight size={15} />
              </a>
              <a
                className="text-link text-link-light"
                href="/availability"
                data-umami-event="insights_availability_click"
              >
                View current availability <MoveRight size={16} />
              </a>
            </div>
          </section>
          <section className="insight-list" aria-label="Trade insight articles">
            {articles.map(item => (
              <a
                key={item.slug}
                href={`/insights/${item.slug}`}
                data-umami-event="insight_article_open"
                data-umami-event-data={JSON.stringify({ article: item.slug })}
              >
                <p>{item.label}</p>
                <h2>{item.title}</h2>
                <span>
                  Read note <MoveRight size={15} />
                </span>
              </a>
            ))}
          </section>
          <section className="insight-proof-callout insight-proof-library">
            <p className="eyebrow eyebrow-bright">
              <span />
              Proof library / next release
            </p>
            <h2>Case studies should show the work, not just the result.</h2>
            <p>
              Alvora will publish customer stories only when the buyer has
              approved the details. Each story will document the brief,
              category, timeline, QC checkpoints, and reorder outcome without
              exposing confidential information.
            </p>
            <a
              className="text-link text-link-light"
              href="/#production-brief"
              data-umami-event="insight_case_study_interest"
            >
              Discuss a production brief <MoveRight size={16} />
            </a>
          </section>
        </>
      )}
    </main>
  );
}
