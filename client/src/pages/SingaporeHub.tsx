import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgTrustPanel,
  SgLandedCostBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
} from "@/components/SingaporeBlocks";
import { MoveRight } from "lucide-react";

const BUYER_GROUPS = [
  {
    title: "Wholesaler / Dealer",
    pages: [
      { label: "Wholesale Lab-Grown Diamonds", href: "/singapore/wholesale-lab-grown-diamonds" },
      { label: "Lab-Grown Diamond Wholesaler", href: "/singapore/lab-grown-diamond-wholesaler" },
      { label: "Wholesale Parcels", href: "/singapore/wholesale-parcels" },
    ],
  },
  {
    title: "Manufacturer / Workshop",
    pages: [
      { label: "For Manufacturers", href: "/singapore/for-manufacturers" },
      { label: "Calibrated Parcels", href: "/singapore/calibrated-parcels" },
      { label: "Melee Diamonds", href: "/singapore/melee" },
    ],
  },
  {
    title: "Jeweller / Atelier",
    pages: [
      { label: "For Jewellers", href: "/singapore/for-jewellers" },
      { label: "Matched Pairs", href: "/singapore/matched-pairs" },
    ],
  },
  {
    title: "Importer / Re-exporter",
    pages: [
      { label: "Lab-Grown Diamond Supplier", href: "/singapore/lab-grown-diamond-supplier" },
      { label: "Surat to Singapore", href: "/singapore/surat-to-singapore" },
    ],
  },
];

const HUB_FAQS = [
  {
    question: "What import duties apply to lab-grown diamonds entering Singapore?",
    answer:
      "Loose diamonds are not a dutiable category under Singapore Customs, so the applicable rate is 0% customs duty plus 9% GST calculated on CIF value — the stone price, freight, and insurance combined. A GST-registered Singapore buyer can typically claim the import GST as input tax, so the effective landed cost in most circumstances is the stone price plus logistics and clearance fees only. Confirm your GST registration status and the applicable HS classification with a Singapore customs broker before the first shipment.",
  },
  {
    question: "Which certification is standard — IGI or GIA?",
    answer:
      "IGI is our standard. Every stone ships laser-inscribed with the report number searchable on the IGI verification platform by any buyer in any market in real time without contacting us. GIA certification is available as an alternative — request it when placing your enquiry. Premium and repeat accounts can request an independent verification right before a parcel is released.",
  },
  {
    question: "What payment terms are available for a first order?",
    answer:
      "For a first cross-border order with a new supplier, the safest structures are cash against documents (CAD) and letter of credit at sight (LC at sight). Both give the buyer documentary control before funds are released while giving the supplier confirmed payment before the parcel is delivered. After a first order has been verified, we offer 50% pre-dispatch with the balance due before dispatch of the confirmed parcel.",
  },
  {
    question: "Is there a minimum order quantity?",
    answer:
      "We work with three indicative parcel bands — trial (under 15 ct), mid (15–50 ct), and bulk (50 ct+), each quoted in USD/ct and SGD/ct. We do not publish a fixed minimum; send your specification and we will advise on the practicable parcel size for your requirement.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Wholesale Lab-Grown Diamonds Singapore",
  serviceType: "Diamond Manufacturing and Wholesale Supply",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora manufactures IGI and GIA certified lab-grown diamonds in Surat and supplies Singapore wholesalers, manufacturers, jewellers, and importers direct.",
  areaServed: "SG",
};

export default function SingaporeHub() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Diamonds Singapore — Wholesale, Manufacturing & Trade | Alvora"
        description="Alvora supplies Singapore's jewellery trade with IGI or GIA certified lab-grown diamonds from Surat. Calibrated, matched, and made to specification."
        path="/singapore"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="singapore-hub-h1">
        <p className="eyebrow eyebrow-bright"><span />ALVORA DIAMONDS · SURAT, INDIA</p>
        <h1 id="singapore-hub-h1">
          Surat manufactured, certified lab-grown diamonds for Singapore jewellery production and wholesale.
          Calibrated, matched, and made to specification.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at our own benches in Surat and supplies
          Singapore's jewellery trade direct — wholesalers, manufacturers, jewellers, and importers.
          No intermediary, no broker layer. Every stone ships IGI or GIA certified, laser-inscribed,
          and verified against the certificate before dispatch. We quote in USD/ct and SGD/ct, offer
          CAD and letter-of-credit terms for first orders, and respond within the Singapore business day.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-hub-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2 id="sg-hub-programmes">Wholesale lab-grown diamond supply for Singapore's jewellery trade.</h2>
          <p>
            Choose the programme that matches your production model. All three ship from Surat
            with IGI or GIA certification, insured, and with a declared per-stone invoice ready
            for Singapore Customs permit and GST declaration.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="all" pageSlug="singapore-hub" />
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-hub-buyers">
        <p className="eyebrow"><span />FIND YOUR PAGE</p>
        <h2 id="sg-hub-buyers" style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 32 }}>
          Supply pages by buyer type.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "2.5rem" }}>
          {BUYER_GROUPS.map(({ title, pages }) => (
            <div key={title}>
              <p style={{ fontFamily: "var(--mono)", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--signal)", marginBottom: "0.85rem" }}>
                {title}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {pages.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.88rem" }}>
                      {label} <MoveRight size={13} strokeWidth={1.5} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Singapore landed cost">
        <SgLandedCostBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Frequently asked questions">
        <SgFaqBlock items={HUB_FAQS} />
      </section>

      <section className="specialty-section" aria-label="Singapore supply enquiry">
        <SgContactBlock />
      </section>
    </SpecialtyPageShell>
  );
}
