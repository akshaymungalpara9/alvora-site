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
          <a href="#process">The work</a>
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
            <a href="#process" onClick={() => setMenuOpen(false)}>The work</a>
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

        <section className="process-section" id="process" aria-labelledby="process-title">
          <div className="process-image-wrap">
            <img src={laserImage} alt="A laser station inscribes a finished diamond while a calibrated parcel rests at the bench." />
            <div className="process-image-overlay" />
            <p className="process-image-label">Laser inscription / identification / final check</p>
          </div>
          <div className="process-content">
            <p className="eyebrow"><span /> 05 — THE WORK</p>
            <h2 id="process-title">The details that hold in the finished piece.</h2>
            <p>Every make is evaluated for the things a sheet does not capture on its own: facet discipline, polish, visual balance, matching, and the final check at the bench.</p>
            <ul className="check-list">
              <li><Check size={17} /> Dimensions recorded against the approved make.</li>
              <li><Check size={17} /> Calibrated stones checked as a parcel, not in isolation.</li>
              <li><Check size={17} /> Certificate identification inscribed after final assessment.</li>
            </ul>
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
