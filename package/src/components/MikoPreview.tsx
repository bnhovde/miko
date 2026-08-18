import { useEffect, useState, type CSSProperties } from "react";

import { useMikoContext } from "../MikoContext";
import { getHashArray } from "../editing";
import { CHECKERBOARD, swatch } from "./swatch";

export type MikoPreviewProps = {
  /** Rendered size in px. Default 96. */
  size?: number;
  /** Override the sprite's own frame rate. */
  fps?: number;
  className?: string;
  style?: CSSProperties;
};

/** Plays the sprite's frames in a loop — what the sprite actually looks like
 *  in a game, rather than as a grid being edited. */
export function MikoPreview({ size = 96, fps, className, style }: MikoPreviewProps) {
  const { sprite } = useMikoContext();
  const [playhead, setPlayhead] = useState(0);
  const rate = fps ?? sprite.fps ?? 10;
  const frameCount = sprite.frames.length;

  useEffect(() => {
    if (frameCount < 2) {
      setPlayhead(0);
      return;
    }
    const id = setInterval(
      () => setPlayhead((current) => (current + 1) % frameCount),
      1000 / Math.max(rate, 1)
    );
    return () => clearInterval(id);
  }, [frameCount, rate]);

  // A frame can vanish mid-playback when one is deleted.
  const hash = sprite.frames[playhead] ?? sprite.frames[0] ?? "";

  return (
    <div
      className={className}
      aria-label={`${sprite.name} preview`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${sprite.size}, 1fr)`,
        width: size,
        height: size,
        ...CHECKERBOARD,
        ...style,
      }}
    >
      {getHashArray(hash, sprite.palette).map((color, index) => (
        <span key={index} style={{ background: swatch(color) }} />
      ))}
    </div>
  );
}
