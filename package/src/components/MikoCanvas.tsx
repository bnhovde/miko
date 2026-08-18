import { useEffect, type CSSProperties } from "react";

import { useMikoContext } from "../MikoContext";
import { TRANSPARENT } from "../editing";
import { swatch } from "./swatch";

export type MikoCanvasProps = {
  /** Side length of a cell in px. Default 20. */
  cellSize?: number;
  className?: string;
  style?: CSSProperties;
};

/** The pixel grid. Click and drag to paint; right-click picks up the colour
 *  under the cursor, the way every pixel editor's eyedropper does. */
export function MikoCanvas({ cellSize = 20, className, style }: MikoCanvasProps) {
  const { sprite, cells, startDrawing, draw, endDrawing, setColor, isDrawing } =
    useMikoContext();

  // A stroke that ends outside the grid still has to end — otherwise the
  // canvas keeps painting after the button has been released.
  useEffect(() => {
    if (!isDrawing) return;
    const stop = () => endDrawing();
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, [isDrawing, endDrawing]);

  // Touch events fire against the element the touch started on, so the cell
  // under the finger has to be looked up by position instead.
  const onTouchMove = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const index = target?.getAttribute("data-miko-cell");
    if (index !== null && index !== undefined) draw(parseInt(index, 10));
  };

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sprite.size}, ${cellSize}px)`,
        gap: 1,
        background: "var(--miko-grid-line, #ccc)",
        padding: 1,
        width: "max-content",
        touchAction: "none",
        ...style,
      }}
      onTouchMove={onTouchMove}
    >
      {cells.map((color, index) => (
        <button
          key={index}
          type="button"
          data-miko-cell={index}
          aria-label={`Pixel ${index + 1}`}
          onMouseDown={(event) => {
            // Right-click is the eyedropper, not a paint stroke.
            if (event.button === 2) return;
            event.preventDefault();
            startDrawing(index);
          }}
          onMouseEnter={() => draw(index)}
          onTouchStart={(event) => {
            event.preventDefault();
            startDrawing(index);
          }}
          onContextMenu={(event) => {
            event.preventDefault();
            if (color !== TRANSPARENT) setColor(color);
          }}
          style={{
            width: cellSize,
            height: cellSize,
            padding: 0,
            border: "none",
            cursor: "crosshair",
            background: swatch(color),
          }}
        />
      ))}
    </div>
  );
}
