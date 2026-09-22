import React from "react";

interface Plate {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

const F1: Plate = {
  name: "plate-bench-loupes",
  alt: "Grading bench, Surat. Two graders at the loupe. Parcel papers banded by lot.",
  sizes: "(min-width: 900px) 1200px, 100vw",
};

const ROW2_LEFT: Plate = {
  name: "plate-bench-scale-1350",
  alt: "Grading bench, Surat. Scale reads 1.350 ct.",
  sizes: "(min-width: 900px) 700px, 100vw",
};
const ROW2_RIGHT: Plate = {
  name: "plate-bench-tweezers-0352",
  alt: "Tweezers and tray. Scale reads 0.352 ct.",
  sizes: "(min-width: 900px) 500px, 100vw",
};

const ROW3_LEFT: Plate = {
  name: "plate-bench-overhead",
  alt: "Grading bench from above. Marble top, two stations.",
  sizes: "(min-width: 900px) 500px, 100vw",
};
const ROW3_RIGHT: Plate = {
  name: "plate-emerald-tweezers",
  alt: "Emerald cut in tweezers under the bench lamp.",
  sizes: "(min-width: 900px) 700px, 100vw",
};

function PlateFigure({ plate }: { plate: Plate }) {
  const src = `/assets/plates/${plate.name}.webp`;
  const src800 = `/assets/plates/${plate.name}-800.webp`;
  return (
    <figure className="plate-figure">
      <picture>
        <source type="image/webp" srcSet={`${src800} 800w, ${src} 1600w`} sizes={plate.sizes} />
        <img
          src={src}
          alt={plate.alt}
          loading={plate.priority ? "eager" : "lazy"}
          {...(plate.priority ? { fetchPriority: "high" as const } : {})}
        />
      </picture>
      <figcaption>{plate.alt}</figcaption>
    </figure>
  );
}

export default function PlateSpread() {
  return (
    <div className="plate-spread">
      <div className="plate-row plate-row-hero">
        <PlateFigure plate={F1} />
      </div>
      <div className="plate-row plate-row-75">
        <PlateFigure plate={ROW2_LEFT} />
        <PlateFigure plate={ROW2_RIGHT} />
      </div>
      <div className="plate-row plate-row-57">
        <PlateFigure plate={ROW3_LEFT} />
        <PlateFigure plate={ROW3_RIGHT} />
      </div>
    </div>
  );
}
