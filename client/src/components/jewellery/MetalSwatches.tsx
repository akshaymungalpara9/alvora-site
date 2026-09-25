import type { MetalColour } from "@shared/jewellery/catalog";

export const METAL_LABELS: Record<MetalColour, string> = {
  yellow: "Yellow gold",
  white: "White gold",
  rose: "Rose gold",
};

type Props = {
  colours: MetalColour[];
  selected?: MetalColour;
  onSelect?: (colour: MetalColour) => void;
  size?: "sm" | "md";
};

/**
 * Gold colour dots. Static on cards; a labelled radio group when onSelect is
 * given (product page).
 */
export default function MetalSwatches({ colours, selected, onSelect, size = "sm" }: Props) {
  if (!onSelect) {
    return (
      <span className={`jw-swatches jw-swatches-${size}`} aria-label={`Available in ${colours.map((c) => METAL_LABELS[c].toLowerCase()).join(", ")}`}>
        {colours.map((colour) => (
          <span key={colour} className={`jw-swatch jw-swatch-${colour}`} aria-hidden="true" />
        ))}
      </span>
    );
  }
  return (
    <div className={`jw-swatches jw-swatches-${size}`} role="radiogroup" aria-label="Metal colour">
      {colours.map((colour) => (
        <button
          key={colour}
          type="button"
          role="radio"
          aria-checked={selected === colour}
          aria-label={METAL_LABELS[colour]}
          title={METAL_LABELS[colour]}
          className={`jw-swatch jw-swatch-${colour}${selected === colour ? " is-selected" : ""}`}
          onClick={() => onSelect(colour)}
        />
      ))}
    </div>
  );
}
