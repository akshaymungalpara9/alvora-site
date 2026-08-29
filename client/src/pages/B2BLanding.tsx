import { ArrowUpRight, Check, MoveLeft, MoveRight } from "lucide-react";
import { useEffect } from "react";
import { applyDocumentMetadata } from "@/lib/publicSeo";

type LandingKey = "oem" | "wholesale" | "export" | "custom" | "rings" | "catalogue" | "proof";
type LandingContent = { eyebrow: string; title: string; description: string; intro: string; audience: string; proof: string[]; steps: string[]; questions: string[] };

const content: Record<LandingKey, LandingContent> = {
  oem: {
    eyebrow: "B2B / OEM & PRIVATE LABEL",
    title: "A manufacturing route for jewellery brands with a specification to protect.",
    description: "Alvora supports OEM and private-label lab-grown diamond programmes from its Surat benches, with certified, calibrated production and a practical brief-led process.",
    intro: "Bring the design direction, CAD, category, quantity, or stone profile. We turn a defined requirement into a production conversation with a clear next step.",
    audience: "For independent jewellery brands, D2C teams, and retailers developing a repeatable collection.",
    proof: ["Specification-led production", "Certified and calibrated diamonds", "Matched layouts and parcels", "Confidential brief discussion available by agreement"],
    steps: ["Send the category, brief, quantity, and timing.", "Confirm the make, sample route, and approval point.", "Move from accepted sample to repeatable production."],
    questions: ["What is the difference between OEM and private label?", "Can Alvora work from CAD or a stone specification?", "How is the production reference confirmed?"],
  },
  wholesale: {
    eyebrow: "B2B / WHOLESALE",
    title: "A current menu for buyers who need repeatable diamond profiles.",
    description: "Browse Alvora’s current lab-grown diamond availability for jewellery teams, then move a suitable profile into a clear production enquiry.",
    intro: "The public catalogue shows current profiles and certificate destinations where supplied. Product detail is visible before an enquiry so the right buyers can qualify the fit.",
    audience: "For retailers, regional chains, manufacturing jewellers, and trade buyers reviewing current availability.",
    proof: ["Current production profiles", "Full technical details on listed stones", "Certificate links where a trusted destination is present", "Direct enquiry from the stone detail"],
    steps: ["Filter the current menu by collection and profile.", "Review the technical record and certificate destination.", "Request the next commercial step from the relevant stone or profile."],
    questions: ["What is current production availability?", "Can Alvora prepare matched layouts?", "How are certificate references handled?"],
  },
  export: {
    eyebrow: "B2B / EXPORT ENQUIRIES",
    title: "A clearer export conversation starts before the quotation.",
    description: "Alvora prepares shipment and documentation details against the confirmed destination and delivery arrangement for each order.",
    intro: "Tell us the destination market, product category, quantity, and required date. Export, documentation, and delivery details can then be confirmed against the actual order.",
    audience: "For international brands, retailers, distributors, and importers evaluating an India-based manufacturing relationship.",
    proof: ["Surat manufacturing origin", "Shipment documentation against the destination", "Insured dispatch route confirmed per shipment", "Delivery detail recorded in the written order"],
    steps: ["Share the destination and business context.", "Confirm product, certification, packing, and delivery requirements.", "Approve the written quotation and shipment arrangement."],
    questions: ["Which documents will apply to my destination?", "Who confirms delivery and insurance details?", "Can export questions be included in the production brief?"],
  },
  custom: {
    eyebrow: "B2B / CUSTOM MANUFACTURING",
    title: "From dimensions and ratios to a make at the bench.",
    description: "Alvora manufactures lab-grown diamonds to buyer specification, including custom cuts, calibrated profiles, matched layouts, and rework assessment.",
    intro: "Describe the make your jewellery programme requires. Shape, exact dimensions, ratios, finish, parcel requirements, and timing can all be placed in the production brief.",
    audience: "For manufacturing jewellers and jewellery teams whose setting or collection depends on a controlled stone profile.",
    proof: ["Custom cut and calibration", "Matched layouts for repeatable settings", "Recut, repolish, and rework assessment", "Typical specification-make timing presented as 5–10 working days"],
    steps: ["Submit the technical requirement and intended quantity.", "Review the make and agree the sample or production reference.", "Confirm the accepted specification in writing."],
    questions: ["What can be specified in a custom make?", "Can Alvora match stones for a layout?", "What happens if a made stone needs correction?"],
  },
  rings: {
    eyebrow: "B2B / RINGS & BRIDAL",
    title: "Ring programmes built around the setting, not a generic stone menu.",
    description: "Alvora supports jewellery teams with certified, calibrated lab-grown diamond profiles for ring, bridal, and repeatable setting programmes.",
    intro: "Use the brief to describe the shape, dimensions, ratio, finish, and quantity the setting requires. A matched or calibrated route can then be assessed before production.",
    audience: "For bridal specialists, ring manufacturers, and brands building a consistent engagement or wedding-band range.",
    proof: ["Calibrated profiles", "Matched layouts and parcels", "Certificate verification where supplied", "Direct production discussion from Surat"],
    steps: ["Share the setting requirement and range direction.", "Agree the stone profile and matching standard.", "Confirm the sample or production route."],
    questions: ["Can you support repeatable ring settings?", "Can you work with matched parcels?", "How are proportions and finish recorded?"],
  },
  catalogue: {
    eyebrow: "B2B / TRADE CATALOGUE",
    title: "Start with the current menu. Ask for the make behind it.",
    description: "Alvora’s public trade catalogue experience lets buyers browse current production profiles, technical details, verified certificate destinations, and the route to a production enquiry.",
    intro: "The public view is intentionally useful before contact. For a profile not in the current menu, use the production brief to describe the make your jewellery programme requires.",
    audience: "For trade buyers who want to qualify current availability before starting a deeper production conversation.",
    proof: ["Fancy Colour, White, and Statement views where available", "Technical detail before enquiry", "Certificate destination shown only where supplied", "Production brief for profiles outside the menu"],
    steps: ["Browse current availability.", "Review technical details and supplied media.", "Request the relevant next step."],
    questions: ["Is the catalogue public?", "Can I request a profile not shown?", "Can I enquire directly from a stone page?"],
  },
  proof: {
    eyebrow: "B2B / PROCESS & DOCUMENTATION",
    title: "Proof that helps a buyer make a decision.",
    description: "Alvora’s process and documentation pages explain what is verified, what is confirmed per order, and what a buyer should ask before proceeding.",
    intro: "Trust is not a list of adjectives. It is a clear record of the make, the certificate destination, the agreed specification, and the confirmed shipment arrangement.",
    audience: "For procurement and jewellery teams carrying out supplier due diligence before a sample or production order.",
    proof: ["Specification confirmed in writing", "Certificate links only where an official destination is present", "Shipment documents against the destination", "Repair or replace assessment for an Alvora-made stone"],
    steps: ["Review the public process and documentation posture.", "Ask the questions relevant to your market and programme.", "Record the agreed details in the quotation or order confirmation."],
    questions: ["What documentation is available for a confirmed order?", "How are certificate links handled?", "What is the correction process for an Alvora-made stone?"],
  },
};

const routes: Record<LandingKey, string> = { oem: "/oem-private-label-lab-grown-diamond-jewellery", wholesale: "/wholesale-lab-grown-diamond-jewellery", export: "/export-lab-grown-diamond-jewellery", custom: "/custom-jewellery-manufacturing", rings: "/lab-grown-diamond-rings-wholesale", catalogue: "/trade-catalogue", proof: "/process-and-documentation" };

export default function B2BLanding({ page }: { page: LandingKey }) {
  const current = content[page];
  const path = routes[page];
  useEffect(() => { applyDocumentMetadata({ lang: "en", path, title: `${current.title} — Alvora Diamonds`, description: current.description }); }, [current, path]);
  return <main className="b2b-page">
    <header className="b2b-header"><a className="brand" href="/"><img className="brand-mark" src="/assets/alvora-faceted-a.webp" alt="" /><span className="brand-name">ALVORA</span></a><a className="insight-back" href="/"><MoveLeft size={15} /> Alvora home</a></header>
    <section className="b2b-hero"><p className="eyebrow eyebrow-bright"><span />{current.eyebrow}</p><h1>{current.title}</h1><p className="b2b-dek">{current.intro}</p><div className="b2b-actions"><a className="button button-signal" href="/#production-brief" data-umami-event="phase2_production_brief_cta" data-umami-event-data={JSON.stringify({ page })}>Start a production brief <ArrowUpRight size={16} /></a><a className="text-link text-link-light" href={page === "catalogue" || page === "wholesale" ? "/availability" : "/trade-catalogue"} data-umami-event="phase2_catalogue_cta">{page === "catalogue" || page === "wholesale" ? "View current availability" : "View the trade catalogue"} <MoveRight size={16} /></a></div></section>
    <section className="b2b-grid"><div><p className="eyebrow"><span />01 — FIT</p><h2>{current.audience}</h2></div><div className="b2b-proof-list">{current.proof.map(item => <p key={item}><Check size={15} />{item}</p>)}</div></section>
    <section className="b2b-steps"><div><p className="eyebrow eyebrow-bright"><span />02 — THE ROUTE</p><h2>A practical conversation, in three steps.</h2></div><div className="b2b-step-list">{current.steps.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></article>)}</div></section>
    <section className="b2b-faq"><p className="eyebrow"><span />03 — QUESTIONS TO QUALIFY</p>{current.questions.map(question => <details key={question}><summary>{question}<span>+</span></summary><p>Include this question in the production brief and Alvora will confirm the relevant route, evidence, and timing for the specific requirement.</p></details>)}</section>
    <section className="b2b-footer-cta"><p className="eyebrow eyebrow-bright"><span />ALVORA / SURAT</p><h2>Bring the requirement. We will bring the production detail.</h2><a className="button button-signal" href="/#production-brief" data-umami-event="phase2_footer_brief_cta">Commission a make <ArrowUpRight size={16} /></a></section>
  </main>;
}
