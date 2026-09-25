interface HeroStoneProps {
  openBrief?: () => void;
  leadTimes?: { stockShort: string; custom: string };
}

export default function HeroStone({ openBrief, leadTimes }: HeroStoneProps) {
  const stockShort = leadTimes?.stockShort ?? "1 to 5 working days";
  const custom = leadTimes?.custom ?? "5 to 10 working days";

  return (
    <section className="hero-stone" aria-labelledby="hero-stone-title">
      <div className="hero-stone-grid">
        <div className="hero-stone-left settle d1">
          <div className="tray hero-stone-tray">
            <img
              className="hero-stone-image"
              src="/assets/alvora-hero-qc.webp"
              alt="A diamond being inspected through a jeweller's loupe during quality control."
              width={1920}
              height={1080}
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        </div>
        <div className="hero-stone-right">
          <h1 id="hero-stone-title" className="hero-stone-h1 settle">
            Lab-grown diamonds, cut in Surat, certified by IGI.
          </h1>
          <p className="hero-stone-body settle d1">
            {`Standard specifications ship in ${stockShort} from stock or our matched network. Anything outside standard is cut to your brief at our benches in ${custom}.`}
          </p>
          <div className="hero-stone-actions settle d3">
            <a className="hero-stone-button" href="/availability">
              See what is available
            </a>
            <a
              className="hero-stone-button"
              href="#production-brief"
              onClick={(event) => {
                if (openBrief) {
                  event.preventDefault();
                  openBrief();
                }
              }}
            >
              Send a production brief
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
