import React, { useEffect } from "react";
import { useSpriteStore } from "../stores/useSpriteStore";
import { useSheetStore } from "../stores/useSheetStore";
import { useEditorStore } from "../stores/useEditorStore";

/**
 * Provider that sets up global event listeners for drawing
 */
export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { commitFrame } = useSpriteStore();
  const { commitSheet } = useSheetStore();
  const { stopDrawing, isDrawing } = useEditorStore();

  useEffect(() => {
    const handleMouseUp = async () => {
      if (!isDrawing) return;

      stopDrawing();
      
      // Commit changes for whichever editor is active
      try {
        await Promise.all([commitFrame(), commitSheet()]);
      } catch (error) {
        console.error("Failed to commit changes:", error);
      }
    };

    const handleTouchEnd = async () => {
      if (!isDrawing) return;

      stopDrawing();
      
      try {
        await Promise.all([commitFrame(), commitSheet()]);
      } catch (error) {
        console.error("Failed to commit changes:", error);
      }
    };

    // Add global event listeners
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDrawing, stopDrawing, commitFrame, commitSheet]);

  return <>{children}</>;
};

