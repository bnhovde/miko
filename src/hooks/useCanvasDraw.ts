import { useCallback } from 'react';
import { useSpriteStore } from '../stores/useSpriteStore';
import { useEditorStore } from '../stores/useEditorStore';

/**
 * Hook for handling canvas drawing operations
 */
export function useCanvasDraw() {
  const { currentTool, currentColor, isDrawing, startDrawing, stopDrawing } = useEditorStore();
  const { currentSprite, updatePixel, fillPixel, commitFrame } = useSpriteStore();

  const handleDrawStart = useCallback(() => {
    startDrawing();
  }, [startDrawing]);

  const handleDrawEnd = useCallback(async () => {
    stopDrawing();
    await commitFrame();
  }, [stopDrawing, commitFrame]);

  const handlePixelClick = useCallback((pixelIndex: number, isFirstClick?: boolean) => {
    if (!currentSprite || (!isDrawing && !isFirstClick)) {
      return;
    }

    if (isFirstClick) {
      startDrawing();
    }

    // Get color index from palette
    const colorIndex = currentSprite.palette.indexOf(currentColor);
    if (colorIndex === -1) {
      // Color not in palette, add it
      currentSprite.palette.push(currentColor);
    }

    const finalColorIndex = currentSprite.palette.indexOf(currentColor);

    // Handle different tools
    if (currentTool === 'fill') {
      fillPixel(pixelIndex, finalColorIndex);
    } else if (currentTool === 'eraser') {
      updatePixel(pixelIndex, 0); // 0 = transparent
    } else {
      updatePixel(pixelIndex, finalColorIndex);
    }
  }, [currentSprite, currentTool, currentColor, isDrawing, startDrawing, updatePixel, fillPixel]);

  return {
    currentTool,
    currentColor,
    isDrawing,
    handleDrawStart,
    handleDrawEnd,
    handlePixelClick,
  };
}

