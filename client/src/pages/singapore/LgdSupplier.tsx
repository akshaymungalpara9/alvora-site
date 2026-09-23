import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import {
  SgTrustPanel,
  SgCertificationNote,
  SgLandedCostBlock,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Lab-Grown Diamond Supplier Singapore",
  serviceType: "Lab-Grown Diamond Supplier: Specification and Catalogue",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies Singapore with lab-grown diamonds across all major shapes, 0.10–5 ct+, D–J colour, IF–SI2 clarity, IGI or GIA certified, direct from Surat manufacture.",
  areaServed: "SG",
};

const CAPABILITY = [
  ["Shapes", "Round brilliant, oval, princess, cushion, emerald cut, pear, radiant, marquise, heart"],
  ["Size range", "0.10 ct melee to 5 ct and above; weight available to specification"],
  ["Colour", "D through J; tighter colour ranges available within the band on request"],
  ["Clarity", "IF, VVS1, VVS2, VS1, VS2, SI1, SI2; SI2 with no eye-visible inclusions confirmed per stone"],
  ["Cut grades", "Excellent, Very Good; Ideal on round brilliants on request"],
  ["Treatment disclosure", "All treatments disclosed per stone on the certificate and the shipment invoice"],
  ["Fluorescence", "None, Faint, Medium, Strong (disclosed per stone); None available as a standing specification"],
  ["Certification", "IGI standard (laser-inscribed, searchable in real time); GIA on request"],
];

const PAGE_FAQS = [
  {
    question: "What shapes and sizes does Alvora supply?",
    answer:
      "Alvora supplies all major shapes (round brilliant, oval, princess, cushion, emerald cut, pear, radiant, marquise, and heart) from 0.10 ct melee through to 5 ct and above. Non-standard dimensions or cuts outside standard production can be handled through the Custom Specification Desk; send the specification and we return a cutting schedule and price.",
  },
  {
    question: "How are treatment and fluorescence disclosed?",
    answer:
      "Every stone ships with explicit treatment and fluorescence disclosure on the IGI or GIA certificate and on the per-stone shipment invoice. If a standing specification requires 'none' for fluorescence or a clean treatment status, that is held as a standing filter and applied to every replenishment parcel.",
  },
  {
    question: "What documentation is prepared for Singapore Customs?",
    answer:
      "Each parcel ships with a per-stone invoice reconciled to the certificate report number, insured against declared CIF value, and with full export documentation ready for Singapore Customs permit declaration and import GST accounting. Confirm your HS classification and GST registration with a Singapore customs broker before the first shipment.",
  },
  {
    question: "Can I request a sample parcel before placing a standing order?",
    answer:
      "Yes. A trial parcel (under 15 ct) is the standard starting point for new accounts. It lets you verify colour consistency, clarity, cut grade, and certificate accuracy against your specification before committing to a mid or bulk programme. Send your specification and we will advise on parcel composition and payment terms for the trial.",
  },
];

export default function SgLgdSupplier() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Diamond Supplier Singapore: Capability and Catalogue | Alvora"
        description="Surat lab-grown diamond supplier for Singapore. Shapes, sizes 0.10–5 ct+, D–J colour, IF–SI2 clarity, cut grades, IGI or GIA. Trade catalogue on request."
        path="/singapore/lab-grown-diamond-supplier"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-lgds-h1">
        <p className="eyebrow eyebrow-bright"><span />LAB-GROWN DIAMOND SUPPLIER · SINGAPORE</p>
        <h1 id="sg-lgds-h1">
          Lab-grown diamond supplier for Singapore: capability matrix, IGI or GIA certified, direct
          from Surat.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures lab-grown diamonds at its own benches in Surat and supplies Singapore's
          importers, wholesalers, and re-exporters across the full production range. Shapes from round
          to fancy, sizes from 0.10 ct melee to 5 ct and above, colour D–J, clarity IF–SI2, with
          complete treatment and fluorescence disclosure per stone. IGI certification is standard;
          GIA is available on request. Request a trade catalogue and sample parcel to qualify the
          specification.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-lgds-capability">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />CAPABILITY MATRIX</p>
          <h2 id="sg-lgds-capability">
            Singapore's lab-grown diamond supplier: full production range, declared and certified.
          </h2>
          <p>
            The table below summarises the production range available for Singapore supply. All
            parameters are available to specification; contact us with the exact requirement if your
            combination is not listed.
          </p>
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginTop: 36 }}
          aria-label="Alvora lab-grown diamond capability matrix"
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rule)" }}>
              <th
                scope="col"
                style={{ textAlign: "left", padding: "8px 0 8px 0", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e", width: "30%" }}
              >
                Parameter
              </th>
              <th
                scope="col"
                style={{ textAlign: "left", padding: "8px 0 8px 16px", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e" }}
              >
                Available range
              </th>
            </tr>
          </thead>
          <tbody>
            {CAPABILITY.map(([param, range]) => (
              <tr key={param} style={{ borderBottom: "1px solid var(--rule)" }}>
                <td style={{ padding: "12px 0", fontWeight: 500, verticalAlign: "top" }}>{param}</td>
                <td style={{ padding: "12px 0 12px 16px", color: "#9fa19a", lineHeight: 1.6, verticalAlign: "top" }}>{range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Supply credentials">
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Certification and verification">
        <SgCertificationNote />
      </section>

      <section className="specialty-section specialty-section-ink" aria-labelledby="sg-lgds-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2
            id="sg-lgds-programmes"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Supply programmes for Singapore importers and re-exporters.
          </h2>
          <p>
            All programmes ship from Surat with IGI or GIA certification, insured, and with a
            declared per-stone invoice ready for Singapore Customs permit and GST declaration.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="all" pageSlug="lab-grown-diamond-supplier" />
        </div>
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Payment terms">
        <SgPaymentTermsBlock />
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
            { label: "Surat to Singapore", href: "/singapore/surat-to-singapore" },
            { label: "Wholesale parcels", href: "/singapore/wholesale-parcels" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Request catalogue and sample">
        <SgContactBlock submitLabel="Request Catalogue and Parcel Sample" />
      </section>
    </SpecialtyPageShell>
  );
}
