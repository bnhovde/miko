import type { CSSProperties } from "react";

import { useMikoContext } from "../MikoContext";
import { TRANSPARENT, isLockedColor } from "../editing";
import { swatch } from "./swatch";

export type MikoPaletteProps = {
  /** Let the user recolour a swatch with a native colour input. Transparent
   *  and black stay locked either way. Default false. */
  editable?: boolean;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

/** Expands a 3 or 4 digit hex so `<input type="color">` will accept it. */
const toHexInput = (hex: string): string => {
  const clean = hex.replace("#", "").toLowerCase();
  if (clean.length === 3 || clean.length === 4) {
    return `#${clean.slice(0, 3).split("").map((c) => c + c).join("")}`;
  }
  return clean.length >= 6 ? `#${clean.slice(0, 6)}` : "#000000";
};

export function MikoPalette({
  editable = false,
  size = 24,
  className,
  style,
}: MikoPaletteProps) {
  const { colors, color: selected, setColor, updateColor } = useMikoContext();

  return (
    <div
      className={className}
      style={{ display: "flex", gap: 4, flexWrap: "wrap", ...style }}
    >
      {colors.map((color, index) => {
        // Transparent is never a swatch — the eraser is how you clear pixels.
        if (color === TRANSPARENT) return null;
        const isSelected = color === selected;

        return (
          <span key={`${index}-${color}`} style={{ position: "relative", lineHeight: 0 }}>
            <button
              type="button"
              aria-label={`Colour #${color}`}
              aria-pressed={isSelected}
              onClick={() => setColor(color)}
              style={{
                width: size,
                height: size,
                padding: 0,
                borderRadius: 4,
                cursor: "pointer",
                border: isSelected
                  ? "2px solid var(--miko-selected, #333)"
                  : "1px solid var(--miko-line, #999)",
                background: swatch(color),
              }}
            />
            {editable && !isLockedColor(color) && (
              <input
                type="color"
                aria-label={`Edit colour #${color}`}
                value={toHexInput(color)}
                onChange={(event) =>
                  updateColor(index, event.target.value.replace("#", ""))
                }
                // Sits invisibly over the swatch so a double-click opens the
                // OS colour picker without needing a second control.
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  pointerEvents: isSelected ? "auto" : "none",
                }}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
