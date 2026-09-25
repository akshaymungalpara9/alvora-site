import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { PUBLIC_PIECES, type JewelleryCollection } from "@shared/jewellery/catalog";
import "./jewellery.css";

const markImage = "/assets/alvora-faceted-a.webp";

type NavItem = { label: string; href: string; collection: JewelleryCollection };

const NAV: NavItem[] = [
  { label: "Engagement rings", href: "/engagement-rings", collection: "engagement-rings" },
  { label: "Antique cuts", href: "/jewellery/antique-cuts", collection: "antique-cuts" },
  { label: "Coloured stones", href: "/jewellery/coloured-stones", collection: "coloured-stones" },
  { label: "Earrings", href: "/earrings", collection: "earrings" },
  { label: "Necklaces & Pendants", href: "/necklaces", collection: "pendants" },
  { label: "Wedding & bands", href: "/wedding-bands", collection: "wedding-bands" },
];

/** Only collections with pieces on sale appear in the navigation. */
export const LIVE_NAV = NAV.filter((item) => PUBLIC_PIECES.some((piece) => piece.collections.includes(item.collection)));

export default function JewelleryShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <div className="jw jw-shell" id="top">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <p className="jw-announce">
        Lab-grown diamond jewellery from Surat · <Link href="/book-a-consultation">Book a free consultation</Link>
      </p>
      <header className="jw-header">
        <Link href="/" className="jw-brand" aria-label="Alvora home">
          <img src={markImage} alt="" width={28} height={28} />
          <span>ALVORA</span>
        </Link>
        <nav className="jw-nav" aria-label="Jewellery">
          {LIVE_NAV.map((item) => (
            <Link key={item.href} href={item.href} className={location === item.href ? "is-active" : undefined} aria-current={location === item.href ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="jw-header-actions">
          <Link href="/book-a-consultation" className="jw-header-cta">Book a consultation</Link>
          <a href="/trade" className="jw-header-trade">For the trade <ArrowUpRight size={13} strokeWidth={1.6} /></a>
        </div>
        <button className="jw-menu-toggle" type="button" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {menuOpen ? (
          <div className="jw-mobile-nav">
            <Link href="/jewellery">Shop all</Link>
            {LIVE_NAV.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
            <Link href="/book-a-consultation">Book a consultation</Link>
            <a href="/trade">For the trade <ArrowUpRight size={14} /></a>
          </div>
        ) : null}
      </header>

      <main id="main-content" tabIndex={-1}>{children}</main>

      <footer className="jw-footer">
        <div className="jw-footer-brand">
          <Link href="/" className="jw-brand" aria-label="Alvora home">
            <img src={markImage} alt="" width={28} height={28} />
            <span>ALVORA</span>
          </Link>
          <p>Fine jewellery set with lab-grown diamonds, from a diamond house in Surat, India.</p>
        </div>
        <nav aria-label="Shop">
          <h2>Shop</h2>
          <Link href="/jewellery">All jewellery</Link>
          {LIVE_NAV.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <nav aria-label="Help">
          <h2>Help</h2>
          <Link href="/book-a-consultation">Book a consultation</Link>
          <a href="/contact">Contact</a>
          <Link href="/guides/dutch-marquise-vs-marquise">Dutch marquise vs marquise</Link>
          <a href="/insights/are-lab-grown-diamonds-real-diamonds">Are lab-grown diamonds real?</a>
          <a href="/certifications">Certification</a>
        </nav>
        <nav aria-label="Alvora">
          <h2>Alvora</h2>
          <a href="/about">About us</a>
          <a href="/trade">For the trade</a>
          <a href="/availability">Loose diamonds</a>
          <a href="/insights">Journal</a>
        </nav>
        <div className="jw-footer-base">
          <span>© {new Date().getFullYear()} Alvora · Surat, India</span>
          <span>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
