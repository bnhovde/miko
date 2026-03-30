"use client";

import React from "react";
import { useDrawingStore } from "stores/drawing";
import { useSpriteStore } from "stores/sprite";
import { useSheetStore } from "stores/sheet";

type Props = {
  children: React.ReactNode;
};

/**
 * Wrapper for all editor pages that stops drawing on any pointer-up or
 * pointer-leave event. This ensures strokes are committed even when the user
 * releases the mouse outside the canvas.
 *
 * On pointer-up it:
 *   1. Calls stopDrawing (clears isDrawingSprite / isDrawingSheet flags).
 *   2. Calls commitDraw on both stores — each is a no-op when nothing is unsaved.
 */
const EditorLayout: React.FC<Props> = ({ children }) => {
  const { stopDrawing } = useDrawingStore();
  const commitSprite = useSpriteStore((s) => s.commitDraw);
  const commitSheet = useSheetStore((s) => s.commitDraw);

  const handleStopDrawing = () => {
    stopDrawing();
    commitSprite();
    commitSheet();
  };

  return (
    <div
      onMouseUp={handleStopDrawing}
      onTouchEnd={handleStopDrawing}
      onTouchCancel={handleStopDrawing}
      onMouseLeave={handleStopDrawing}
    >
      {children}
    </div>
  );
};

export default EditorLayout;
