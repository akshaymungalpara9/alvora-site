import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import { ROUTE_META } from "@shared/routeMeta";
import {
  SgCertificationNote,
  SgTrustPanel,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Lab-Grown Diamonds for Jewellers Singapore",
  serviceType: "Lab-Grown Diamond Supply for Jewellers",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies Singapore jewellers with IGI or GIA certified lab-grown diamonds from Surat. Fast quotation, certificate-matched video, round and oval emphasis, and bespoke sourcing.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "Can you source a specific shape and size for a customer appointment?",
    answer:
      "Yes. Send the brief (shape, carat weight, colour, clarity, and any proportions or cut-grade preferences) and we return availability and pricing within the Singapore business day. For customer appointments, certificate-matched video and a proportions diagram are included with every stone so you can present the stone accurately before it arrives.",
  },
  {
    question: "Does every stone come with a video before purchase?",
    answer:
      "Yes. Each stone dispatched to a new account is accompanied by a video, proportions diagram, fluorescence grade, and still image set. For repeat accounts, the media pack is available on request. The report number is laser-inscribed on the girdle and searchable on the IGI or GIA verification platform in real time.",
  },
  {
    question: "What is the minimum order for a jeweller trade account?",
    answer:
      "We work with three indicative parcel bands: trial under 15 ct, mid 15–50 ct, and bulk above 50 ct. For jewellers sourcing individual stones or small lots for customer appointments, the trial band covers individual stone or small parcel sourcing. Send your specification and we will advise on the practicable order size for your requirement.",
  },
  {
    question: "Which certificate is standard, and can I request GIA?",
    answer:
      "IGI certification is standard. Every stone ships laser-inscribed with the report number searchable on the IGI verification platform. GIA certification is available as an alternative for customers or accounts that require it; request it when placing your enquiry. Premium accounts can request an independent verification right before a parcel is released.",
  },
];

export default function SgForJewellers() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title={ROUTE_META["/singapore/for-jewellers"].title}
        description={ROUTE_META["/singapore/for-jewellers"].description}
        path="/singapore/for-jewellers"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-fj-h1">
        <p className="eyebrow eyebrow-bright"><span />FOR JEWELLERS · SINGAPORE</p>
        <h1 id="sg-fj-h1">
          Lab-grown diamonds for Singapore jewellers: fast quotation, certificate-matched video, and
          bespoke sourcing.
        </h1>
        <p className="specialty-hero-copy">
          Alvora supplies Singapore jewellers and appointment-led ateliers direct from our Surat
          production benches. We quote round and oval lab-grown diamonds to your customer brief,
          supply certificate-matched video and proportions with every stone, and hold availability
          until your design is confirmed. IGI or GIA certification is included per stone. Response
          within the Singapore business day. Trade accounts only; apply with your company name and
          a brief description of your requirement.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-fj-service">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />JEWELLER SUPPLY SERVICE</p>
          <h2 id="sg-fj-service">
            Lab-grown diamonds sourced for Singapore jewellers: round, oval, and bespoke shapes.
          </h2>
          <p>
            Your advantage is the design and the customer relationship. Our role is making the centre
            stone predictable: the right proportions, the right certificate, available when you need it.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "Fast quotation turnaround",
              "Send a customer brief (shape, carat weight, colour, clarity, cut preference) and we return pricing and availability within the Singapore business day. No standing account required to request a first quote.",
            ],
            [
              "Certificate-matched video",
              "Every stone comes with a video, proportions diagram, fluorescence grade, and still image set. The report number is laser-inscribed and searchable on IGI or GIA in real time. You can show the stone accurately before it arrives.",
            ],
            [
              "Round and oval emphasis",
              "Round brilliant and oval are our primary shapes for jeweller supply. Fancy shapes (pear, cushion, emerald, radiant, princess) are available on request and sourced to your specification.",
            ],
            [
              "Hold until design approval",
              "Stones can be held against an agreed reservation while a design is finalised. Confirm the hold window when requesting availability. We will not release the stone to another buyer during the agreed period.",
            ],
          ] as [string, string][]).map(([k, v]) => (
            <article key={k}>
              <span className="feat-mark">—</span>
              <div>
                <h3>{k}</h3>
                <p>{v}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-fj-matched-pairs">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />MATCHED PAIRS AND CUSTOM SPECIFICATION</p>
          <h2
            id="sg-fj-matched-pairs"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Pairs and bespoke sourcing for Singapore ateliers.
          </h2>
          <p>
            For two-stone rings, earring pairs, and design commissions requiring matched stones, we
            source oval and round pairs matched by colour, clarity, and proportions. For non-standard
            shapes or dimensions, the Custom Specification Desk handles individual cutting briefs.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="matched-pairs" pageSlug="for-jewellers" />
        </div>
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Certification and verification">
        <SgCertificationNote />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Payment terms">
        <SgPaymentTermsBlock />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Matched pairs", href: "/singapore/matched-pairs" },
            { label: "For manufacturers", href: "/singapore/for-manufacturers" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Apply for trade supply">
        <SgContactBlock submitLabel="Apply for Trade Supply" />
      </section>
    </SpecialtyPageShell>
  );
}
