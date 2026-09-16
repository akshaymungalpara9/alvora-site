import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import { ROUTE_META } from "@shared/routeMeta";
import {
  SgTrustPanel,
  SgCertificationNote,
  SgLandedCostBlock,
  SgFaqBlock,
  SgContactBlock,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Surat Lab-Grown Diamonds Singapore",
  serviceType: "Factory-Direct Lab-Grown Diamond Supply, Surat to Singapore",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora ships lab-grown diamonds factory-direct from Surat to Singapore. IGI or GIA report per stone, insured dispatch, and full export documentation prepared for Singapore Customs.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "How long does a Surat-to-Singapore shipment typically take?",
    answer:
      "As an illustrative planning reference only, air freight from Surat to Singapore typically takes 5–10 business days when combining production, documentation preparation, carrier collection, and customs clearance at both ends. This figure is not a carrier commitment. Replace it with a forwarder quote and a confirmed transit schedule before pricing any transaction.",
  },
  {
    question: "What documentation is prepared for Singapore Customs?",
    answer:
      "Each parcel ships with a per-stone invoice reconciled to the IGI or GIA report number, insured against the declared CIF value, and with full export documentation ready for Singapore Customs permit declaration and import GST accounting. Confirm your HS classification and GST registration with a Singapore customs broker before the first shipment.",
  },
  {
    question: "What certification is standard on Surat-manufactured stones?",
    answer:
      "IGI certification is standard. Every stone ships laser-inscribed with the report number searchable on the IGI verification platform by any buyer in any market in real time. GIA certification is available as an alternative for accounts that require it; request it when placing your enquiry. The report number is reconciled to the per-stone invoice line in the shipment documentation.",
  },
  {
    question: "What are the import costs when receiving stones in Singapore?",
    answer:
      "Loose diamonds are not a dutiable category under Singapore Customs, so the applicable rate is 0% customs duty plus 9% import GST calculated on CIF value (the stone price, freight, and insurance combined). A GST-registered Singapore buyer can typically claim the import GST back as input tax. The illustrative landed-cost model in the section above shows how the figures compose at an assumed stone price; replace all assumptions with live forwarder quotes and confirmed exchange rates before pricing.",
  },
];

export default function SgSuratToSingapore() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title={ROUTE_META["/singapore/surat-to-singapore"].title}
        description={ROUTE_META["/singapore/surat-to-singapore"].description}
        path="/singapore/surat-to-singapore"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-s2s-h1">
        <p className="eyebrow eyebrow-bright"><span />SURAT TO SINGAPORE · FACTORY DIRECT</p>
        <h1 id="sg-s2s-h1">
          Surat lab-grown diamonds for Singapore: factory-direct, IGI or GIA certified, insured and
          documented for customs.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at its own benches in Surat and ships direct to
          Singapore buyers. Every parcel ships IGI laser-inscribed or GIA certified, insured against
          declared CIF value, with a per-stone invoice reconciled to the certificate and full export
          documentation prepared for Singapore Customs permit declaration and import GST accounting.
          No broker, no intermediary. Manufacturer to your receiving address.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-s2s-corridor">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />THE FACTORY-DIRECT CORRIDOR</p>
          <h2 id="sg-s2s-corridor">
            Surat lab-grown diamonds to Singapore: factory-direct advantages over broker-supplied supply.
          </h2>
          <p>
            When a manufacturer supplies direct, the stone that leaves the polishing bench is the
            same stone that arrives in your parcel. Certificate, invoice, and stone are reconciled at
            every point.
          </p>
        </div>
        <div className="specialty-feature-list on-light" style={{ marginTop: 40 }}>
          {([
            [
              "No intermediary step",
              "Alvora owns the production bench. The supply chain from polishing to your parcel involves no wholesaler, agent, or intermediary. Fewer steps means fewer certificate-to-stone discrepancies and fewer price layers.",
            ],
            [
              "IGI or GIA report per stone",
              "Every stone ships laser-inscribed with the report number searchable on the IGI or GIA verification platform by any buyer in any market in real time. The report number is inscribed on the girdle and reconciled to the per-stone invoice line.",
            ],
            [
              "Insured dispatch, declared invoice",
              "Parcels ship insured against declared CIF value. The per-stone invoice is prepared in a format suitable for Singapore Customs permit declaration. Freight, insurance, and clearance assumptions are detailed in the landed-cost section below.",
            ],
            [
              "Export documentation prepared",
              "Full export documentation is prepared before dispatch, including the invoice, packing list, and relevant certificate copies. All documents are formatted for Singapore Customs import permit requirements.",
            ],
            [
              "Illustrative 5–10 business-day window",
              "As a planning reference only: air freight from Surat to Singapore typically completes within 5–10 business days when combining production, documentation, carrier collection, and clearance. Replace with a confirmed forwarder quote before pricing any transaction.",
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

      <section className="specialty-section specialty-section-ink" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Certification and verification">
        <SgCertificationNote />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Singapore landed cost">
        <SgLandedCostBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Wholesale parcels", href: "/singapore/wholesale-parcels" },
            { label: "Lab-grown diamond supplier", href: "/singapore/lab-grown-diamond-supplier" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Request insured shipping quote">
        <SgContactBlock submitLabel="Request Insured Shipping Quote" />
      </section>
    </SpecialtyPageShell>
  );
}
