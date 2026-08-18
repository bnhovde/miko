import type { CSSProperties } from "react";

import { useMikoContext } from "../MikoContext";
import { getHashArray } from "../editing";
import { CHECKERBOARD, swatch } from "./swatch";

export type MikoTimelineProps = {
  /** Side length of each frame thumbnail in px. Default 48. */
  thumbnailSize?: number;
  className?: string;
  style?: CSSProperties;
};

/** A thumbnail of one frame, drawn as a CSS grid of its pixels — no canvas,
 *  no image encoding, so it stays crisp at any size. */
function FrameThumbnail({
  hash,
  palette,
  size,
  pixels,
}: {
  hash: string;
  palette: string[];
  size: number;
  pixels: number;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${pixels}, 1fr)`,
        width: size,
        height: size,
        ...CHECKERBOARD,
      }}
    >
      {getHashArray(hash, palette).map((color, index) => (
        <span key={index} style={{ background: swatch(color) }} />
      ))}
    </span>
  );
}

/** The frame strip: every frame as a thumbnail, plus add and delete. */
export function MikoTimeline({
  thumbnailSize = 48,
  className,
  style,
}: MikoTimelineProps) {
  const { sprite, frame, setFrame, addFrame, deleteFrame } = useMikoContext();

  return (
    <div
      className={className}
      style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", ...style }}
    >
      {sprite.frames.map((hash, index) => (
        <span key={`${index}-${hash}`} style={{ position: "relative", lineHeight: 0 }}>
          <button
            type="button"
            aria-label={`Frame ${index + 1}`}
            aria-pressed={index === frame}
            onClick={() => setFrame(index)}
            style={{
              padding: 2,
              lineHeight: 0,
              borderRadius: 4,
              cursor: "pointer",
              border: index === frame
                ? "2px solid var(--miko-selected, #333)"
                : "1px solid var(--miko-line, #999)",
              background: "var(--miko-bg, #fff)",
            }}
          >
            <FrameThumbnail
              hash={hash}
              palette={sprite.palette}
              size={thumbnailSize}
              pixels={sprite.size}
            />
          </button>
          {sprite.frames.length > 1 && (
            <button
              type="button"
              aria-label={`Delete frame ${index + 1}`}
              onClick={() => deleteFrame(index)}
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                width: 18,
                height: 18,
                padding: 0,
                borderRadius: "50%",
                border: "1px solid var(--miko-line, #999)",
                background: "var(--miko-bg, #fff)",
                color: "var(--miko-text, #000)",
                cursor: "pointer",
                font: "inherit",
                fontSize: 11,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          )}
        </span>
      ))}

      <button
        type="button"
        aria-label="Add frame"
        // Duplicating the current frame is nearly always what you want when
        // animating — a blank frame throws away the work you just did.
        onClick={() => addFrame(frame, sprite.frames[frame])}
        style={{
          width: thumbnailSize + 6,
          height: thumbnailSize + 6,
          borderRadius: 4,
          border: "1px dashed var(--miko-line, #999)",
          background: "var(--miko-bg, #fff)",
          color: "var(--miko-text, #000)",
          cursor: "pointer",
          font: "inherit",
          fontSize: 20,
        }}
      >
        +
      </button>
    </div>
  );
}
