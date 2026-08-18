import { TRANSPARENT } from "../editing";

/** Turns a stored colour into something CSS will accept. Colours are kept
 *  without a leading "#", and the transparent sentinel is not a colour at
 *  all — it renders as a checkerboard so an empty pixel reads as empty
 *  rather than white. */
export const swatch = (color: string): string =>
  color === TRANSPARENT ? "transparent" : `#${color}`;

export const CHECKERBOARD: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(45deg, var(--miko-checker, #e8e8e8) 25%, transparent 25%), " +
    "linear-gradient(-45deg, var(--miko-checker, #e8e8e8) 25%, transparent 25%), " +
    "linear-gradient(45deg, transparent 75%, var(--miko-checker, #e8e8e8) 75%), " +
    "linear-gradient(-45deg, transparent 75%, var(--miko-checker, #e8e8e8) 75%)",
  backgroundSize: "8px 8px",
  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
};
