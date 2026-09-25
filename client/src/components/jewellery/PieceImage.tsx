import type { JewelleryImage, JewelleryPiece } from "@shared/jewellery/catalog";
import ShapeIcon from "./ShapeIcon";

type Props = {
  piece: Pick<JewelleryPiece, "name" | "shape" | "shapeLabel" | "code" | "images" | "styleLabel">;
  image?: JewelleryImage;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * A catalogue photo, or a drawn placeholder while photography is pending.
 * The placeholder keeps the grid calm: ivory ground, the stone outline and
 * the piece code in mono, so an unphotographed piece still reads as intended.
 */
export default function PieceImage({ piece, image = piece.images[0], sizes = "(min-width: 1100px) 25vw, (min-width: 700px) 33vw, 50vw", priority = false, className = "" }: Props) {
  if (!image) {
    return (
      <div className={`jw-image jw-image-placeholder ${className}`} role="img" aria-label={`${piece.name}, photography to follow`}>
        <ShapeIcon shape={piece.shape} size={72} className="jw-placeholder-shape" />
        <span className="jw-placeholder-code">{piece.code}</span>
      </div>
    );
  }
  return (
    <img
      className={`jw-image ${className}`}
      src={image.src}
      srcSet={`${image.thumb} 600w, ${image.src} 1400w`}
      sizes={sizes}
      width={image.width ?? 1400}
      height={image.height ?? 1400}
      alt={`${piece.name}${piece.styleLabel ? `, ${piece.styleLabel.toLowerCase()} setting` : ""}`}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );
}
