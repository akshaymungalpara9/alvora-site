import type { ReactNode } from "react";
import type { JewelleryPiece } from "@shared/jewellery/catalog";
import ProductCard from "./ProductCard";

type Props = {
  pieces: JewelleryPiece[];
  empty?: ReactNode;
  hidePrices?: boolean;
  /** Number of leading cards to load eagerly (above the fold). */
  priorityCount?: number;
};

export default function CollectionGrid({ pieces, empty, hidePrices = false, priorityCount = 4 }: Props) {
  if (!pieces.length) {
    return <div className="jw-grid-empty">{empty ?? <p>No pieces match these filters yet.</p>}</div>;
  }
  return (
    <ul className="jw-grid">
      {pieces.map((piece, index) => (
        <li key={piece.code}>
          <ProductCard piece={piece} priority={index < priorityCount} hidePrice={hidePrices} />
        </li>
      ))}
    </ul>
  );
}
