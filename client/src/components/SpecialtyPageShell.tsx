import { useState } from "react";
import { ArrowUpRight, Menu, MessageCircle, MoveRight, X } from "lucide-react";
import { buildWhatsAppHref } from "@/lib/whatsapp";

const markImage = "/assets/alvora-faceted-a.webp";

const SPECIALTY_LINKS = [
  { label: "Calibrated Layouts", href: "/calibrated-diamond-layouts" },
  { label: "Matched Pairs", href: "/matched-pair-diamonds" },
  { label: "Custom Cut", href: "/custom-cut-diamonds" },
  { label: "Melee Diamonds", href: "/melee-diamonds" },
  { label: "Certifications", href: "/certifications" },
  { label: "About", href: "/about" },
  { label: "For Jewellery Brands", href: "/for-jewelry-brands" },
  { label: "Request a Quote", href: "/request-a-quote" },
];

export function SpecialtyCta() {
  const waHref = buildWhatsAppHref(import.meta.env.VITE_ALVORA_WHATSAPP_NUMBER);
  return (
    <section className="specialty-cta-section" aria-labelledby="specialty-cta-title">
      <div>
        <p className="eyebrow eyebrow-bright"><span />GET IN TOUCH</p>
        <h2 id="specialty-cta-title">Ready to discuss your requirement?</h2>
        <p>Tell us the programme, profile, or specification you need. We will return with the practical production detail.</p>
      </div>
      <div className="specialty-cta-actions">
        <a className="button button-signal" href="/request-a-quote">
          Request a Quote <ArrowUpRight size={18} strokeWidth={1.6} />
        </a>
        {waHref && (
          <a className="button button-outline" href={waHref} target="_blank" rel="noreferrer" data-umami-event="whatsapp_specialty_cta">
            WhatsApp Us <MessageCircle size={17} strokeWidth={1.6} />
          </a>
        )}
      </div>
    </section>
  );
}

export default function SpecialtyPageShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div id="top" className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>

      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Alvora home">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="/#production">Our production</a>
          <a href="/#made-to-spec">Made to specification</a>
          <a href="/about">About</a>
          <a href="/availability">Availability</a>
        </nav>

        <nav className="language-switcher" aria-label="Language selection">
          <a href="/">EN</a>
          <a href="/fr" lang="fr">FR</a>
          <a href="/it" lang="it">IT</a>
        </nav>

        <a className="header-cta" href="/request-a-quote">
          Request a quote <ArrowUpRight size={15} strokeWidth={1.7} />
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {menuOpen && (
          <div className="mobile-nav">
            <a href="/#production" onClick={() => setMenuOpen(false)}>Our production</a>
            <a href="/#made-to-spec" onClick={() => setMenuOpen(false)}>Made to specification</a>
            <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/availability" onClick={() => setMenuOpen(false)}>Availability</a>
            {SPECIALTY_LINKS.map(({ label, href }) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            ))}
            <nav className="language-switcher" aria-label="Language selection">
              <a href="/">EN</a><a href="/fr" lang="fr">FR</a><a href="/it" lang="it">IT</a>
            </nav>
            <a className="button button-signal" href="/request-a-quote" style={{ marginTop: 8 }}>
              Request a Quote <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </div>
        <p>Lab-grown diamond manufacturing<br />Surat, India</p>
        <nav className="footer-legal" aria-label="Information">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms of trade</a>
        </nav>
        <a href="#top">Back to top <ArrowUpRight size={15} /></a>
        <nav className="footer-specialty" aria-label="Products and services">
          {SPECIALTY_LINKS.map(({ label, href }) => (
            <a key={href} href={href}>{label}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
