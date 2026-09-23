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
  name: "Lab-Grown Diamond Wholesaler Singapore",
  serviceType: "Lab-Grown Diamond Wholesale Trade Account",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora is a Surat-based lab-grown diamond manufacturer supplying Singapore wholesale trade accounts direct. IGI or GIA certified, insured shipping, CAD and LC terms for first orders.",
  areaServed: "SG",
};

const PAGE_FAQS = [
  {
    question: "How do I open a trade account?",
    answer:
      "Send an enquiry with your company name, the nature of your business (wholesaler, manufacturer, jeweller, or importer) and a brief description of your requirement including shape, carat range, colour, clarity, and approximate volume. We will respond within the Singapore business day with pricing guidance and the steps for account qualification.",
  },
  {
    question: "Is Alvora IGI or GIA certified?",
    answer:
      "IGI is our default certification for lab-grown diamonds and is publicly used by established Singapore market retailers and manufacturers. GIA certification is available as an alternative for accounts that require it; request it at the enquiry stage. Premium and repeat accounts can request an independent verification right before parcel release.",
  },
  {
    question: "What payment terms are available for a first wholesale order?",
    answer:
      "Cash against documents (CAD) and letter of credit at sight (LC at sight) are the recommended structures for a first cross-border order. Both give the buyer documentary control before funds are released while giving the supplier confirmed payment before the parcel is delivered. After the first order has been verified, 50% pre-dispatch with balance before dispatch is available.",
  },
  {
    question: "Can Singapore buyers recover the import GST?",
    answer:
      "Singapore levies 9% import GST on CIF value for loose diamonds at 0% customs duty. A GST-registered Singapore buyer can typically claim the import GST back as input tax, meaning the effective landed cost in most circumstances is the stone price plus logistics and clearance fees. Confirm your GST registration status and HS classification with a Singapore customs broker before the first shipment.",
  },
];

export default function SgLgdWholesaler() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Lab-Grown Diamond Wholesaler Singapore: Trade Accounts | Alvora"
        description="Trade-only lab-grown diamond wholesaler for Singapore. Surat factory direct, IGI or GIA certified, insured shipping, and CAD or LC terms for first orders."
        path="/singapore/lab-grown-diamond-wholesaler"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-lgdw-h1">
        <p className="eyebrow eyebrow-bright"><span />LAB-GROWN DIAMOND WHOLESALER · SINGAPORE</p>
        <h1 id="sg-lgdw-h1">
          Direct-factory lab-grown diamond wholesaler for Singapore: IGI and GIA certified, insured
          from Surat, trade accounts only.
        </h1>
        <p className="specialty-hero-copy">
          Alvora is a Surat-based lab-grown diamond manufacturer supplying Singapore wholesale
          accounts direct. Every parcel ships IGI laser-inscribed or GIA certified, with a declared
          per-stone invoice and full export documentation prepared for Singapore Customs permit and
          GST declaration. Insured dispatch covers the declared merchandise value. We respond to
          trade enquiries within the Singapore business day. Accounts are trade-only; send a company
          name and brief requirement to begin the account process.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-lgdw-credentials">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLIER QUALIFICATIONS</p>
          <h2 id="sg-lgdw-credentials">
            Your lab-grown diamond wholesaler for Singapore: direct factory, no broker layer.
          </h2>
          <p>
            Every stone passes from our own production benches in Surat to your parcel. No agent,
            intermediary, or wholesale step is added between manufacture and dispatch.
          </p>
        </div>
        <SgTrustPanel />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Certification and verification">
        <SgCertificationNote />
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-lgdw-programmes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />SUPPLY PROGRAMMES</p>
          <h2
            id="sg-lgdw-programmes"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Programmes available for Singapore wholesale accounts.
          </h2>
          <p>
            All programmes ship insured with a declared per-stone invoice ready for Singapore Customs
            permit and GST declaration.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="all" pageSlug="lab-grown-diamond-wholesaler" />
        </div>
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Payment terms">
        <SgPaymentTermsBlock />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Singapore landed cost">
        <SgLandedCostBlock />
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Frequently asked questions">
        <SgFaqBlock items={PAGE_FAQS} />
      </section>

      <section className="specialty-section specialty-section-light" aria-label="Related pages">
        <SgSiblingNav
          siblings={[
            { label: "Wholesale lab-grown diamonds", href: "/singapore/wholesale-lab-grown-diamonds" },
            { label: "Wholesale parcels", href: "/singapore/wholesale-parcels" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Request trade account">
        <SgContactBlock submitLabel="Request Trade Account and Price List" />
      </section>
    </SpecialtyPageShell>
  );
}
