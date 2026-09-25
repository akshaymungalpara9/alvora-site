import { Link } from "wouter";
import { formatFromPrice, type JewelleryPiece } from "@shared/jewellery/catalog";
import PieceImage from "./PieceImage";
import MetalSwatches from "./MetalSwatches";

type Props = { piece: JewelleryPiece; priority?: boolean; hidePrice?: boolean };

export function pieceHref(piece: Pick<JewelleryPiece, "slug">) {
  return `/jewellery/${piece.slug}`;
}

/**
 * Grid card: square photo (second photo on hover), Alvora name, shape and
 * setting in mono, gold colours and the from-price.
 */
export default function ProductCard({ piece, priority = false, hidePrice = false }: Props) {
  const second = piece.images[1];
  const detail = [piece.shapeLabel, piece.styleLabel].filter(Boolean).join(" · ");
  return (
    <Link href={pieceHref(piece)} className="jw-card">
      <div className={`jw-card-media${second ? " has-alt" : ""}`}>
        <PieceImage piece={piece} priority={priority} />
        {second ? <PieceImage piece={piece} image={second} className="jw-card-alt" /> : null}
      </div>
      <div className="jw-card-body">
        <h3 className="jw-card-name">{piece.name}</h3>
        <p className="jw-card-detail">{detail}</p>
        <div className="jw-card-foot">
          <MetalSwatches colours={piece.metalColours} />
          {hidePrice ? <span className="jw-card-price">{piece.code}</span> : <span className="jw-card-price">{formatFromPrice(piece)}</span>}
        </div>
      </div>
    </Link>
  );
}
