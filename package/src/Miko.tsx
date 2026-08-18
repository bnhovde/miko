import type { CSSProperties } from "react";

import { MikoProvider, type MikoProviderProps } from "./MikoContext";
import { MikoCanvas } from "./components/MikoCanvas";
import { MikoPalette } from "./components/MikoPalette";
import { MikoPreview } from "./components/MikoPreview";
import { MikoTimeline } from "./components/MikoTimeline";
import { MikoToolbar } from "./components/MikoToolbar";

export type MikoProps = Omit<MikoProviderProps, "children"> & {
  /** Cell size for the canvas, in px. Default 20. */
  cellSize?: number;
  /** Hide the frame strip for a single-frame editor. Default true. */
  showTimeline?: boolean;
  /** Show the looping playback preview. Default true when the sprite has
   *  more than one frame. */
  showPreview?: boolean;
  /** Allow recolouring swatches. Default true. */
  editablePalette?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** The whole editor in one component. It is nothing more than a MikoProvider
 *  around a default arrangement of the same public pieces — when this layout
 *  isn't the one you want, compose MikoCanvas/MikoTimeline/MikoToolbar/
 *  MikoPalette/MikoPreview yourself inside a MikoProvider. */
export function Miko({
  cellSize = 20,
  showTimeline = true,
  showPreview,
  editablePalette = true,
  className,
  style,
  ...options
}: MikoProps) {
  const previewVisible = showPreview ?? (options.value?.frames.length ?? 1) > 1;

  return (
    <MikoProvider {...options}>
      <div
        className={className}
        style={{
          display: "inline-flex",
          flexDirection: "column",
          gap: 12,
          font: "var(--miko-font, 14px/1.4 system-ui, sans-serif)",
          color: "var(--miko-text, #000)",
          ...style,
        }}
      >
        <MikoToolbar />
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <MikoCanvas cellSize={cellSize} />
          {previewVisible && <MikoPreview />}
        </div>
        <MikoPalette editable={editablePalette} />
        {showTimeline && <MikoTimeline />}
      </div>
    </MikoProvider>
  );
}
