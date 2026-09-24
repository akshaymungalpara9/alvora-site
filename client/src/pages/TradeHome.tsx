/**
 * Alvora, The Precision House: dark editorial craftsmanship built from graphite fields,
 * calibration rules, restrained signal-lime accents, and direct production language.
 */
import { FormEvent, MouseEvent, useEffect, useRef, useState } from "react";
import * as Accordion from "@radix-ui/react-accordion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Menu,
  MoveRight,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import PublicMetadata from "@/components/PublicMetadata";
import HeroStone from "@/components/HeroStone";
import StockLedger from "@/components/StockLedger";
import PlateSpread from "@/components/PlateSpread";
import { COMPANY } from "@shared/companyInfo";
import { useLocation } from "wouter";
import { navigateToPublicAnchor, scrollToPublicAnchor, usePublicHashNavigation } from "@/lib/hashNavigation";
import "./home-proof.css";

const isDev = import.meta.env.DEV;
function Todo() {
  if (isDev) return <mark data-alvora-todo style={{ background: "rgba(255,180,0,.28)", padding: "0 .3em", fontFamily: "var(--mono)", fontSize: ".82em" }}>TODO</mark>;
  return <span data-alvora-todo aria-hidden="true" />;
}

const facetingImage = "/assets/plates/plate-parcel-spill.webp";
const laserImage = "/assets/plates/plate-bench-loupe-close.webp";
const markImage = "/assets/alvora-faceted-a.webp";

export default function TradeHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestType, setRequestType] = useState("Production run");
  const [briefText, setBriefText] = useState("");
  const [submissionState, setSubmissionState] = useState<"idle" | "sending" | "sent" | "saved" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const [location] = useLocation();
  usePublicHashNavigation();
  const submitProductionBrief = trpc.productionBrief.submit.useMutation({
    onMutate: () => setSubmissionState("sending"),
    onSuccess: (result) => {
      setSubmissionState(result.alertStatus === "sent" ? "sent" : "saved");
      formRef.current?.reset();
      setRequestType("Production run");
      setBriefText("");
    },
    onError: () => setSubmissionState("error"),
  });

  const openBrief = (type = "Production run") => {
    setRequestType(type);
    setSubmissionState("idle");
    setMenuOpen(false);
    window.requestAnimationFrame(() => scrollToPublicAnchor("#production-brief"));
  };

  useEffect(() => {
    const availability = new URLSearchParams(window.location.search).get("availability");
    if (!availability) return;
    setRequestType("Production run");
    setBriefText(`Current production availability enquiry\n${availability}\n\nPlease confirm this make and current availability.`);
    window.requestAnimationFrame(() => scrollToPublicAnchor("#production-brief"));
  }, [location]);

  const handlePublicAnchor = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    const hash = link?.getAttribute("href");
    if (!link || !hash || link.classList.contains("skip-link") || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (navigateToPublicAnchor(hash)) event.preventDefault();
  };

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setSubmissionState("idle");
    submitProductionBrief.mutate({
      requestType: String(values.get("request_type")),
      market: "GLOBAL",
      website: String(values.get("_website") || ""),
      contactName: String(values.get("name")).trim(),
      email: String(values.get("email")).trim(),
      company: String(values.get("company") || "").trim() || undefined,
      yearsTrading: String(values.get("years_trading")) as "Under 2" | "2–5" | "5–10" | "10+",
      tradeReferencesAvailable: String(values.get("trade_references")) as "Yes" | "No",
      preferredPaymentApproach: String(values.get("preferred_payment_approach")) as "Prepaid on proforma" | "Agreed trade terms subject to credit check" | "Open to discussion",
      referrerName: String(values.get("referrer_name") || "").trim() || undefined,
      brief: String(values.get("brief")).trim(),
    });
  };

  return (
    <div id="top" className="site-shell" onClickCapture={handlePublicAnchor}><PublicMetadata locale="global" /><a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="/" aria-label="Alvora home">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#production">Our production</a>
          <a href="#made-to-spec">Made to specification</a>
          <a href="#how-we-work">How we work</a>
          <a href="/availability">Availability</a>
          <a href="/">Fine jewellery</a>
        </nav>

        <nav className="language-switcher" aria-label="Language selection"><a href="/trade" className="is-active">EN</a><a href="/fr" lang="fr">FR</a><a href="/it" lang="it">IT</a></nav>

        <button
          className="header-cta"
          type="button"
          onClick={() => openBrief()}
        >
          Commission a make <ArrowUpRight size={15} strokeWidth={1.7} />
        </button>

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {menuOpen && (
          <div className="mobile-nav">
            <a href="#production" onClick={() => setMenuOpen(false)}>Our production</a>
            <a href="#made-to-spec" onClick={() => setMenuOpen(false)}>Made to specification</a>
            <a href="#how-we-work" onClick={() => setMenuOpen(false)}>How we work</a>
            <a href="/availability" onClick={() => setMenuOpen(false)}>Availability</a>
            <a href="/" onClick={() => setMenuOpen(false)}>Fine jewellery</a>
            <nav className="language-switcher" aria-label="Language selection"><a href="/trade" className="is-active">EN</a><a href="/fr" lang="fr">FR</a><a href="/it" lang="it">IT</a></nav>
            <button type="button" onClick={() => openBrief()}>Commission a make <ArrowUpRight size={16} /></button>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex={-1}>
        <HeroStone openBrief={() => openBrief()} leadTimes={{ stockShort: COMPANY.leadTime.stockShort, custom: COMPANY.leadTime.custom }} />

        <StockLedger />

        <section className="heritage-section" id="heritage" aria-labelledby="heritage-title">
          <div className="heritage-content">
            <h2 id="heritage-title">Made in Surat, by our benches.</h2>
            <div className="heritage-prose">
              <p>Alvora is built inside Surat's lab-grown cutting-and-polishing cluster: close to the work, the tools and the people who understand the make.</p>
              <p>Every stone we ship is calibrated to our standard make: <strong>Excellent/Ideal cut, no fluorescence, no BGM.</strong> It is IGI laser-inscribed and validated against the IGI database before dispatch.</p>
              <p>We make to a specification, and we can rework what we have made.</p>
              <p className="heritage-maker-line">Cut, calibrated and IGI-certified by our own team.</p>
            </div>
          </div>
          <PlateSpread />
        </section>

        <section className="production-section" id="production" aria-labelledby="production-title">
          <div className="section-heading production-heading">
            <div>
              <p className="eyebrow"><span /> 04 · OUR PRODUCTION</p>
              <h2 id="production-title">What we make.</h2>
            </div>
            <p>Certified lab-grown diamonds, cut, calibrated and finished for reliable work at the bench.</p>
          </div>

          <div className="production-grid">
            <article className="production-image-card">
              <img src={facetingImage} alt="Melee parcel opened onto the tray." loading="lazy" />
              <div className="image-caption">
                <span>FACETING / IN PROCESS</span>
                <span>SURAT / IND</span>
              </div>
            </article>
            <div className="production-list">
              <article>
                <span className="list-index">01</span>
                <div>
                  <h3>Certified stones</h3>
                  <p>Production with certification handled as part of the make, not as an afterthought.</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1.4} />
              </article>
              <article>
                <span className="list-index">02</span>
                <div>
                  <h3>Calibrated profiles</h3>
                  <p>Repeatable dimensions and ratios for programmes where the setting already sets the terms.</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1.4} />
              </article>
              <article>
                <span className="list-index">03</span>
                <div>
                  <h3>Matched parcels</h3>
                  <p>Layouts matched for tonal consistency, proportion, and the way a finished piece must read.</p>
                </div>
                <ArrowUpRight size={18} strokeWidth={1.4} />
              </article>
            </div>
          </div>
        </section>

        <section className="spec-section" id="made-to-spec" aria-labelledby="spec-title">
          <div className="spec-masthead">
            <p className="eyebrow eyebrow-bright"><span /> 05 · MADE TO SPECIFICATION</p>
            <p className="spec-stamp">SPEC 05–10 DAYS</p>
          </div>
          <div className="spec-lead">
            <h2 id="spec-title">Made to<br /><em>your</em> specification.</h2>
            <p>A broker can match a requirement. A manufacturer can cut to it. Send the specification your jewellery programme needs, and we make the diamond to meet it.</p>
          </div>
          <div className="spec-grid">
            <article>
              <span className="spec-number">A</span>
              <h3>Custom cut &amp; calibration</h3>
              <p>Shape, exact dimensions, ratios and finish are worked to the buyer’s specification sheet.</p>
            </article>
            <article>
              <span className="spec-number">B</span>
              <h3>Layouts made for manufacture</h3>
              <p>Matched layouts and calibrated parcels for manufacturing jewellers and repeatable settings.</p>
            </article>
            <article>
              <span className="spec-number">C</span>
              <h3>Rework within the house</h3>
              <p>Recut, repolish and rework of stones we have made, with continuity of production knowledge.</p>
            </article>
          </div>
          <div className="spec-action-row">
            <p><span className="status-dot" /> Typical lead time for a spec make: <strong>5–10 working days</strong></p>
            <button className="button button-outline" type="button" onClick={() => openBrief("Custom / made-to-spec.")}>Commission a spec make <ArrowDownRight size={18} /></button>
          </div>
        </section>

        <section className="process-section" id="how-we-work" aria-labelledby="process-title">
          <div className="process-image-wrap">
            <img src={laserImage} alt="Loupe inspection, grading bench, Surat." loading="lazy" />
            <div className="process-image-overlay" />
            <p className="process-image-label">Laser inscription / identification / final check</p>
          </div>
          <div className="process-content">
            <p className="eyebrow"><span /> 06 · HOW WE WORK</p>
            <h2 id="process-title">A clear make.<br />Practical terms.</h2>
            <p>We begin with the specification and stay accountable to the stone after the finished make leaves our benches.</p>
            <div className="commercial-panels">
              <article>
                <span>Payment</span>
                <h3>Built for working jewellers.</h3>
                <p>We work with established jewellers and ateliers on flexible, negotiated trade terms. First orders confirm the make; ongoing accounts move to agreed terms after credit and reference checks. We work beyond a prepaid model.</p>
              </article>
              <article>
                <span>Assured make</span>
                <h3>Repair or replace.</h3>
                <p>Every stone is verified against its certificate before dispatch. In the rare case a piece needs correction (a spec mismatch, a chip, a make issue), it goes back to our benches. We repair or replace and return it. You are never left with a stone you cannot sell.</p>
              </article>
            </div>
            <a className="text-link" href="#production-brief">Start a production brief <MoveRight size={17} strokeWidth={1.5} /></a>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="faq-heading">
            <p className="eyebrow"><span /> 07 · FAQ</p>
            <h2 id="faq-title">The useful questions.</h2>
          </div>
          <Accordion.Root type="multiple" defaultValue={["q1", "q4"]} className="faq-content">
            <Accordion.Item value="q1" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">Is there a minimum order?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>The minimum order depends on the product, size, shape, certification, and whether the request is stock, a sample, a layout, or custom production. Category-specific minimums are <Todo /> and confirmed in the quotation before approval. Buyers should include the expected quantity and repeat-order plan so the applicable minimum can be discussed clearly.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q2" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">Are your stones IGI or GIA certified?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>Alvora can supply IGI-certified laboratory-grown diamonds where applicable, with report-linked identity and familiar 4Cs information. IGI is generally the practical wholesale baseline for comparison and inventory workflows. GIA can be requested when a retailer or destination channel requires its name; buyers should confirm the report format needed for colourless or coloured laboratory-grown diamonds before ordering.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q3" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">Can I request a sample or memo?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>A sample or memo request can be discussed before the first production order, subject to the goods and commercial terms. Availability, return conditions, shipping, insurance, and any charges should be confirmed in writing. Alvora's memo terms are <Todo />, and custom-cut or specially produced goods may require separate treatment from standard stock.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q4" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">How fast do you respond to a quote request?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>Within 24 hours during business days. Same-day on WhatsApp during Surat hours (IST 09:00–19:00). A complete brief (shape, measurements, quality, quantity, certification, destination, and any CAD or reference file) helps Alvora respond with a useful quotation rather than a generic initial indication.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q5" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">What are your lead times?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>Lead time depends on whether the requirement is available stock, a selected layout or pair, melee sorting, certification, or custom cutting. Alvora's confirmed timing is <Todo />, with actual days by product stated in the quotation. The schedule distinguishes feasibility review, production, grading, buyer approval, packing, and dispatch.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q6" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">Do you ship to the US, Canada, EU, or GCC?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>Alvora can discuss courier shipment to the US, Canada, EU, and GCC, with insurance and applicable IGI paperwork arranged according to the order. The buyer is responsible for destination-country duties, taxes, and import clearance. For reference: US 25% duty, Canada 0%, EU standard, GCC standard. Confirm current rates with the relevant customs authority before shipment.</p>
              </Accordion.Content>
            </Accordion.Item>
            <Accordion.Item value="q7" className="faq-item">
              <Accordion.Header className="faq-header">
                <Accordion.Trigger className="faq-trigger">How do I place my first order?<span aria-hidden="true">+</span></Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content forceMount className="faq-answer">
                <p>Start with WhatsApp or an RFQ containing the design and stone specification. Alvora reviews the requirement and sends a quote, then the buyer can discuss a memo or sample where available before issuing a PO. After approval: production, documentation and QC, buyer confirmation where applicable, packing, and dispatch.</p>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion.Root>
          <p className="faq-maker-line">Every stone we ship is one we made.</p>
        </section>

        <section className="brief-section" id="production-brief" aria-labelledby="brief-title">
          <div className="brief-intro">
            <p className="eyebrow eyebrow-bright"><span /> 08 · PRODUCTION BRIEF</p>
            <h2 id="brief-title">Commission a make.</h2>
            <p>Tell us the programme, profile, or specification you need. We will return with the practical production detail.</p>
            <div className="brief-aside">
              <span>ALVORA / SURAT</span>
              <span>MANUFACTURING ENQUIRY</span>
            </div>
          </div>

          <form ref={formRef} className="brief-form" onSubmit={submitBrief}>
            <div className="honeypot-field" aria-hidden="true"><label>Website<input name="_website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
            <label>
              <span>Request type</span>
              <select name="request_type" value={requestType} onChange={(event) => setRequestType(event.target.value)}>
                <option>Production run</option>
                <option>Custom / made-to-spec.</option>
                <option>Matched layout / calibrated parcel</option>
                <option>Rework of an Alvora stone</option>
              </select>
            </label>
            <div className="form-row">
              <label>
                <span>Your name</span>
                <input name="name" type="text" autoComplete="name" minLength={2} maxLength={180} required placeholder="Name" />
              </label>
              <label>
                <span>Work email</span>
                <input name="email" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} maxLength={320} required placeholder="name@company.com" />
              </label>
            </div>
            <label>
              <span>Company / workshop</span>
              <input name="company" type="text" autoComplete="organization" maxLength={180} placeholder="Company name" />
            </label>
            <div className="form-qualification-grid">
              <label>
                <span>Years trading</span>
                <select name="years_trading" defaultValue="2–5">
                  <option>Under 2</option>
                  <option>2–5</option>
                  <option>5–10</option>
                  <option>10+</option>
                </select>
              </label>
              <label>
                <span>Trade references available on request</span>
                <select name="trade_references" defaultValue="Yes">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>
            </div>
            <label>
              <span>Preferred payment approach for a first order</span>
              <select name="preferred_payment_approach" defaultValue="Agreed trade terms subject to credit check">
                <option>Prepaid on proforma</option>
                <option>Agreed trade terms subject to credit check</option>
                <option>Open to discussion</option>
              </select>
            </label>
            <label>
              <span>Introduced by a trade contact? <em>(optional)</em></span>
              <input name="referrer_name" type="text" maxLength={180} placeholder="Name of the introducing contact" />
            </label>
            <p className="form-qualification-note">These details are used only to assess the right account approach for your enquiry.</p>
            <label>
              <span>What needs to be made?</span>
              <textarea name="brief" value={briefText} onChange={(event) => setBriefText(event.target.value)} minLength={10} maxLength={5000} required rows={5} placeholder="Shape, dimensions, ratios, finish, quantity, timing or anything already decided at your bench." />
            </label>
            <div className="form-submit-row">
              <button className="button button-signal" type="submit" disabled={submitProductionBrief.isPending}>{submitProductionBrief.isPending ? "Recording brief…" : <>Send production brief <ArrowUpRight size={18} /></>}</button>
              <p>We use this information only to understand the make you require.</p>
            </div>
            {submissionState !== "idle" && <p className={`form-confirmation form-confirmation-${submissionState}`} role={submissionState === "error" ? "alert" : "status"} aria-live="polite">{submissionState === "sending" ? "Recording your production brief…" : submissionState === "sent" ? "Thank you. Your production brief has been recorded and sent to the Alvora team." : submissionState === "saved" ? "Thank you. Your production brief has been safely recorded for the Alvora team." : "Your brief could not be recorded. Please try again, or contact Alvora directly."}</p>}
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </div>
        <p>Lab-grown diamond manufacturing<br />Surat, India</p>
        <p className="footer-registrations">{`${COMPANY.legalName} · ${COMPANY.address.city}, ${COMPANY.address.state}, ${COMPANY.address.country} · ${COMPANY.phone} · ${COMPANY.email}`}</p>
        <nav className="footer-legal" aria-label="Information"><a href="/privacy">Privacy</a><a href="/terms">Terms of trade</a></nav>
        <a href="#top">Back to top <ArrowUpRight size={15} /></a>
        <nav className="footer-specialty" aria-label="Products and services">
          <a href="/calibrated-diamond-layouts">Calibrated Layouts</a>
          <a href="/matched-pair-diamonds">Matched Pairs</a>
          <a href="/custom-cut-diamonds">Custom Cut</a>
          <a href="/melee-diamonds">Melee Diamonds</a>
          <a href="/certifications">Certifications</a>
          <a href="/about">About</a>
          <a href="/for-jewelry-brands">For Jewellery Brands</a>
          <a href="/request-a-quote">Request a Quote</a>
        </nav>
      </footer>
    </div>
  );
}
