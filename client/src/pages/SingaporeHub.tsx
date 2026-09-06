import SpecialtyPageShell, { SpecialtyCta } from "@/components/SpecialtyPageShell";
import SpecialtyPageMeta from "@/components/SpecialtyPageMeta";
import { MoveRight } from "lucide-react";

const SINGAPORE_PAGES = [
  { label: "Wholesale Lab-Grown Diamonds", href: "/singapore/wholesale-lab-grown-diamonds" },
  { label: "Lab-Grown Diamond Wholesaler", href: "/singapore/lab-grown-diamond-wholesaler" },
  { label: "For Jewellers", href: "/singapore/for-jewellers" },
  { label: "Lab-Grown Diamond Supplier", href: "/singapore/lab-grown-diamond-supplier" },
  { label: "Calibrated Parcels", href: "/singapore/calibrated-parcels" },
  { label: "Matched Pairs", href: "/singapore/matched-pairs" },
  { label: "Melee Diamonds", href: "/singapore/melee" },
  { label: "For Manufacturers", href: "/singapore/for-manufacturers" },
  { label: "Surat to Singapore", href: "/singapore/surat-to-singapore" },
  { label: "Wholesale Parcels", href: "/singapore/wholesale-parcels" },
];

export default function SingaporeHub() {
  return (
    <SpecialtyPageShell>
      <SpecialtyPageMeta
        title="Wholesale Lab-Grown Diamonds Singapore | Alvora"
        description="Alvora supplies certified lab-grown diamonds wholesale to Singapore jewellers, manufacturers, and wholesalers direct from Surat."
        path="/singapore"
      />

      <section className="specialty-hero" aria-labelledby="singapore-hub-h1">
        <p className="eyebrow eyebrow-bright"><span />ALVORA DIAMONDS · SURAT</p>
        <h1 id="singapore-hub-h1">Wholesale Lab-Grown Diamonds for Singapore</h1>
        <p className="specialty-hero-copy">
          Alvora manufactures certified, calibrated lab-grown diamonds in Surat and supplies
          the Singapore jewellery trade direct — wholesalers, manufacturers, and jewellers.
          Content for this section is being prepared.
        </p>
      </section>

      <section className="specialty-section specialty-section-ink">
        <div className="product-body">
          <p>
            This hub covers Alvora's lab-grown diamond supply programme for Singapore.
            Use the links below to navigate to the relevant topic page.
          </p>
          <nav aria-label="Singapore section pages">
            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {SINGAPORE_PAGES.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                    {label} <MoveRight size={15} strokeWidth={1.5} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      <SpecialtyCta />
    </SpecialtyPageShell>
  );
}
