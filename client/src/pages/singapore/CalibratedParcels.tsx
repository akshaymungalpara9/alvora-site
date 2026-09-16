import SpecialtyPageShell from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import { ROUTE_META } from "@shared/routeMeta";
import {
  SgTrustPanel,
  SgReplenishmentWorkflow,
  SgPaymentTermsBlock,
  SgFaqBlock,
  SgContactBlock,
  SgProductPanel,
  SgSiblingNav,
} from "@/components/SingaporeBlocks";

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Calibrated Lab-Grown Diamond Parcels Singapore",
  serviceType: "Calibrated Lab-Grown Diamond Parcel Programme",
  provider: {
    "@type": "Organization",
    name: "Alvora",
    address: { "@type": "PostalAddress", addressLocality: "Surat", addressCountry: "IN" },
  },
  description:
    "Alvora supplies calibrated lab-grown diamond parcels to Singapore manufacturers. Standard size bands from 1.0 mm melee, held to tolerance for halo, pavé, and tennis production.",
  areaServed: "SG",
};

const SIZE_BANDS = [
  ["1.0 mm", "Smallest melee; pavé and micro-pavé settings"],
  ["1.2 mm", "Pavé and halo accent stones"],
  ["1.3 mm", "Standard melee for halo rows and pavé bands"],
  ["1.5 mm", "Halo and accent; common in tennis bracelet programmes"],
  ["1.7 mm", "Larger melee; halo and side stones in lighter designs"],
  ["1.8 mm", "Halo keystones and shoulder accents"],
  ["2.0 mm", "Tennis bracelet and graduated halo"],
  ["2.5 mm", "Side stones, three-stone settings, graduated pieces"],
  ["3.0 mm", "Shoulder stones and featured accent positions"],
  ["Above 3.0 mm", "Larger calibrated sizes available to specification; send the required diameter and we advise on cut and carat weight"],
];

const PAGE_FAQS = [
  {
    question: "What does 'calibrated' mean for setting house production?",
    answer:
      "A calibrated stone is cut and polished so that the girdle diameter falls within a defined tolerance, for example 1.50 mm ±0.05 mm. When every stone in a halo parcel holds that tolerance, the setter does not spend time sorting or resizing. Bench efficiency improves and rework from inconsistent fit is reduced.",
  },
  {
    question: "What colour and clarity bands are available for calibrated melee?",
    answer:
      "Calibrated parcels are available in three standard colour bands (D–F, G–H, and I–J) and two clarity bands (IF through VS and SI1 through SI2 with no eye-visible inclusions confirmed per stone). Mixed bands are available for specific applications; describe your requirement and we will advise on parcel construction.",
  },
  {
    question: "How tight is the size tolerance held?",
    answer:
      "Tolerance is specification-specific and confirmed at the enquiry stage. Standard production targets ±0.05 mm on girdle diameter for melee sizes; for larger calibrated sizes, the tolerance is agreed per order. Send your size and tolerance requirement and we will confirm what can be held in production.",
  },
  {
    question: "Can a calibrated parcel specification be held for replenishment?",
    answer:
      "Yes. Once a parcel specification has been approved (size, colour band, clarity band, cut grade, and tolerance) it is held on file and can be dispatched on a regular cadence without re-briefing. The replenishment workflow is described in the section above.",
  },
];

export default function SgCalibratedParcels() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title={ROUTE_META["/singapore/calibrated-parcels"].title}
        description={ROUTE_META["/singapore/calibrated-parcels"].description}
        path="/singapore/calibrated-parcels"
        jsonLd={JSON_LD}
      />

      <section className="specialty-hero" aria-labelledby="sg-cp-h1">
        <p className="eyebrow eyebrow-bright"><span />CALIBRATED PARCEL PROGRAMME · SINGAPORE</p>
        <h1 id="sg-cp-h1">
          Calibrated lab-grown diamond parcels for Singapore: size-held melee and above for halo,
          pavé, and tennis production.
        </h1>
        <p className="specialty-hero-copy">
          Alvora manufactures calibrated lab-grown diamond parcels at its Surat benches and supplies
          Singapore manufacturers and setting houses with stones held to a defined girdle-diameter
          tolerance. Standard size bands run from 1.0 mm melee through 3.0 mm and above, in colour
          bands D–F, G–H, and I–J, clarity IF–VS and SI. Consistent calibration reduces bench sorting
          time at the setter and improves throughput on halo, pavé, and tennis-bracelet programmes.
        </p>
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-cp-sizes">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />STANDARD SIZE BANDS</p>
          <h2 id="sg-cp-sizes">
            Calibrated lab-grown diamond parcels for Singapore production: melee to larger accent stones.
          </h2>
          <p>
            The table below shows the standard size bands available for Singapore supply. Custom sizes
            and tolerances are available on enquiry; send your requirement and we will advise on
            production feasibility and lead time.
          </p>
        </div>
        <table
          style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginTop: 36 }}
          aria-label="Calibrated parcel size bands"
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rule)" }}>
              <th scope="col" style={{ textAlign: "left", padding: "8px 0", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e", width: "20%" }}>
                Size band
              </th>
              <th scope="col" style={{ textAlign: "left", padding: "8px 0 8px 16px", fontFamily: "var(--mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 400, color: "#71736e" }}>
                Typical application
              </th>
            </tr>
          </thead>
          <tbody>
            {SIZE_BANDS.map(([size, use]) => (
              <tr key={size} style={{ borderBottom: "1px solid var(--rule)" }}>
                <td style={{ padding: "10px 0", fontWeight: 500, verticalAlign: "top", fontFamily: "var(--mono)", fontSize: "0.82rem" }}>{size}</td>
                <td style={{ padding: "10px 0 10px 16px", color: "#9fa19a", verticalAlign: "top" }}>{use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="specialty-section specialty-section-ink" aria-label="Replenishment workflow">
        <SgReplenishmentWorkflow />
      </section>

      <section className="specialty-section specialty-section-light" aria-labelledby="sg-cp-programme">
        <div className="specialty-section-lead">
          <p className="eyebrow"><span />CALIBRATED PARCEL PROGRAMME</p>
          <h2
            id="sg-cp-programme"
            style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}
          >
            Standing programme for production consistency.
          </h2>
          <p>
            Calibrated parcels can be supplied as a one-off order or as a standing programme with
            approved specifications dispatched on an agreed cadence.
          </p>
        </div>
        <div style={{ marginTop: 40 }}>
          <SgProductPanel programme="calibrated" pageSlug="calibrated-parcels" />
        </div>
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
            { label: "For manufacturers", href: "/singapore/for-manufacturers" },
            { label: "Melee diamonds", href: "/singapore/melee" },
          ]}
        />
      </section>

      <section className="specialty-section" aria-label="Send size and shape requirements">
        <SgContactBlock submitLabel="Send Size and Shape Requirements" />
      </section>
    </SpecialtyPageShell>
  );
}
