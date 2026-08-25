/**
 * Alvora — The Precision House: dark editorial craftsmanship built from graphite fields,
 * calibration rules, restrained signal-lime accents, and direct production language.
 */
import { FormEvent, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Menu,
  MoveRight,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/alvora-hero-qc_9e0d540e.jpg";
const facetingImage = "/manus-storage/alvora-cutting-faceting_9e45364b.jpg";
const laserImage = "/manus-storage/alvora-laser-calibration_fe325862.jpg";
const markImage = "/manus-storage/alvora-faceted-a_2ef055e2.png";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestType, setRequestType] = useState("Production run");
  const [submitted, setSubmitted] = useState(false);

  const openBrief = (type = "Production run") => {
    setRequestType(type);
    setSubmitted(false);
    setMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById("production-brief")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

  const submitBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="site-shell">
      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Alvora home">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#production">Our production</a>
          <a href="#made-to-spec">Made to specification</a>
          <a href="#how-we-work">How we work</a>
        </nav>

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
            <button type="button" onClick={() => openBrief()}>Commission a make <ArrowUpRight size={16} /></button>
          </div>
        )}
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <img className="hero-image" src={heroImage} alt="A diamond being inspected through a jeweller's loupe during quality control." />
          <div className="hero-scrim" />
          <div className="hero-rule hero-rule-a" />
          <div className="hero-rule hero-rule-b" />
          <div className="hero-content">
            <p className="eyebrow eyebrow-bright"><span /> Lab-Grown Diamond Manufacturers, Surat</p>
            <h1 id="hero-title">Diamonds made to a standard exacting buyers can rely on.</h1>
            <p className="hero-copy">Alvora manufactures certified, calibrated lab-grown diamonds for jewellery teams that need control in every dimension.</p>
            <p className="hero-maker-line">You’re buying from the bench — there’s no factory behind us to go around.</p>
            <div className="hero-actions">
              <button className="button button-signal" type="button" onClick={() => openBrief()}>
                Commission a make <ArrowDownRight size={18} strokeWidth={1.6} />
              </button>
              <a className="text-link text-link-light" href="#production">See our production <MoveRight size={17} strokeWidth={1.5} /></a>
            </div>
          </div>
          <div className="hero-index" aria-label="Alvora manufacturing location">
            <span>01</span>
            <p>Surat manufacturing,<br />direct to your bench</p>
          </div>
          <div className="hero-footer">
            <span>Certified / Calibrated / Made in Surat</span>
            <span className="scroll-note">Scroll to inspect <ArrowDownRight size={14} /></span>
          </div>
        </section>

        <section className="heritage-section" id="heritage" aria-labelledby="heritage-title">
          <p className="section-number">02 — MADE IN SURAT</p>
          <div className="heritage-content">
            <h2 id="heritage-title">Made in Surat,<br /><em>by our benches.</em></h2>
            <div className="heritage-prose">
              <p>Alvora is built inside Surat’s lab-grown cutting-and-polishing cluster: close to the work, the tools and the people who understand the make.</p>
              <p>Every stone we ship is calibrated to our standard make: <strong>Excellent/Ideal cut, no fluorescence, no BGM.</strong> It is IGI laser-inscribed and validated against the IGI database before dispatch.</p>
              <p>We make to a specification, and we can rework what we have made.</p>
              <p className="heritage-maker-line">Cut, calibrated and IGI-certified by our own team.</p>
            </div>
          </div>
          <div className="by-numbers" aria-label="Alvora production proof points">
            <p>By the numbers</p>
            <div className="numbers-strip">
              <article><strong>[XX]</strong><span>months of production history</span></article>
              <article><strong>[XXX]</strong><span>stones dispatched</span></article>
              <article><strong>100%</strong><span>IGI standard on every stone</span></article>
              <article><strong>DIRECT</strong><span>from-bench pricing</span></article>
            </div>
          </div>
        </section>

        <section className="production-section" id="production" aria-labelledby="production-title">
          <div className="section-heading production-heading">
            <div>
              <p className="eyebrow"><span /> 03 — OUR PRODUCTION</p>
              <h2 id="production-title">What we make.</h2>
            </div>
            <p>Certified lab-grown diamonds, cut, calibrated and finished for reliable work at the bench.</p>
          </div>

          <div className="production-grid">
            <article className="production-image-card">
              <img src={facetingImage} alt="A diamond is cut and faceted on a professional workshop tool." />
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
            <p className="eyebrow eyebrow-bright"><span /> 04 — MADE TO SPECIFICATION</p>
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
            <img src={laserImage} alt="A laser station inscribes a finished diamond while a calibrated parcel rests at the bench." />
            <div className="process-image-overlay" />
            <p className="process-image-label">Laser inscription / identification / final check</p>
          </div>
          <div className="process-content">
            <p className="eyebrow"><span /> 05 — HOW WE WORK</p>
            <h2 id="process-title">A clear make.<br />Practical terms.</h2>
            <p>We begin with the specification and stay accountable to the stone after the finished make leaves our benches.</p>
            <div className="commercial-panels">
              <article>
                <span>Payment</span>
                <h3>Built for working jewellers.</h3>
                <p>We work with established jewellers and ateliers on flexible, negotiated trade terms. First orders confirm the make; ongoing accounts move to agreed terms after credit and reference checks. We are not a prepaid-only exporter.</p>
              </article>
              <article>
                <span>Assured make</span>
                <h3>Repair or replace.</h3>
                <p>Every stone is verified against its certificate before dispatch. In the rare case a piece needs correction — a spec mismatch, a chip, a make issue — it goes back to our benches. We repair or replace and return it. You are never left with a stone you cannot sell.</p>
              </article>
            </div>
            <a className="text-link" href="#production-brief">Start a production brief <MoveRight size={17} strokeWidth={1.5} /></a>
          </div>
        </section>

        <section className="faq-section" id="faq" aria-labelledby="faq-title">
          <div className="faq-heading">
            <p className="eyebrow"><span /> 06 — FAQ</p>
            <h2 id="faq-title">The useful questions.</h2>
          </div>
          <div className="faq-content">
            <details open>
              <summary>What are your payment terms?<span>+</span></summary>
              <p>We work with established jewellers and ateliers on flexible, negotiated trade terms. A first order confirms the make; ongoing accounts move to agreed terms after credit and reference checks.</p>
            </details>
            <details>
              <summary>What if a stone needs correction?<span>+</span></summary>
              <p>Every stone is verified against its certificate before dispatch. If a piece needs correction — a spec mismatch, a chip, or a make issue — it goes back to our benches. We repair or replace and return it, so you are never left with a stone you cannot sell.</p>
            </details>
            <details open>
              <summary>What can I specify in a custom make?<span>+</span></summary>
              <p>Shape, exact dimensions, ratios, finish, parcel requirements and timing can all be placed in the production brief.</p>
            </details>
            <details>
              <summary>Can you match stones for a manufacturing layout?<span>+</span></summary>
              <p>Yes. Matched layouts and calibrated parcels are prepared around the proportions and visual consistency your finished piece requires.</p>
            </details>
            <details>
              <summary>Can a stone be reworked after it is made?<span>+</span></summary>
              <p>We can assess recut, repolish and rework requirements for stones made by Alvora, with the original production information close at hand.</p>
            </details>
            <p className="faq-maker-line">Every stone we ship is one we made.</p>
          </div>
        </section>

        <section className="brief-section" id="production-brief" aria-labelledby="brief-title">
          <div className="brief-intro">
            <p className="eyebrow eyebrow-bright"><span /> 07 — PRODUCTION BRIEF</p>
            <h2 id="brief-title">Commission a make.</h2>
            <p>Tell us the programme, profile, or specification you need. We will return with the practical production detail.</p>
            <div className="brief-aside">
              <span>ALVORA / SURAT</span>
              <span>MANUFACTURING ENQUIRY</span>
            </div>
          </div>

          <form className="brief-form" onSubmit={submitBrief}>
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
                <input name="name" type="text" required placeholder="Name" />
              </label>
              <label>
                <span>Work email</span>
                <input name="email" type="email" required placeholder="name@company.com" />
              </label>
            </div>
            <label>
              <span>Company / workshop</span>
              <input name="company" type="text" placeholder="Company name" />
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
            <p className="form-qualification-note">These details are used only to assess the right account approach for your enquiry.</p>
            <label>
              <span>What needs to be made?</span>
              <textarea name="brief" required rows={5} placeholder="Shape, dimensions, ratios, finish, quantity, timing or anything already decided at your bench." />
            </label>
            <div className="form-submit-row">
              <button className="button button-signal" type="submit">Send production brief <ArrowUpRight size={18} /></button>
              <p>We use this information only to understand the make you require.</p>
            </div>
            {submitted && <p className="form-confirmation" role="status">Thank you. Your production brief has been prepared for the Alvora team.</p>}
          </form>
        </section>
      </main>

      <section className="credentials-strip" aria-label="Credentials and compliance">
        <p className="credentials-title">Credentials &amp; compliance <span>details to confirm</span></p>
        <div className="credentials-list">
          <p><b>IEC</b><span>India IEC-registered exporter <em>[IEC no. to confirm]</em></span></p>
          <p><b>GJ</b><span>GJEPC member <em>[membership no. to confirm]</em></span></p>
          <p><b>IGI</b><span>IGI laboratory-authorised supplier <em>[authorisation to confirm]</em></span></p>
          <p><b>INS</b><span>Shipments fully insured via <em>[insurer / DHL / FedEx to confirm]</em></span></p>
          <p><b>FR</b><span>France-market documentation compliant with Décret n°2002-65 <em>[document reference to confirm]</em></span></p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-brand">
          <img className="brand-mark" src={markImage} alt="" />
          <span className="brand-name">ALVORA</span>
        </div>
        <p>Lab-grown diamond manufacturing<br />Surat, India</p>
        <a href="#top">Back to top <ArrowUpRight size={15} /></a>
      </footer>
    </div>
  );
}
