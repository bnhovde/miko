import { useCallback } from 'react';
import { useSheetStore } from '../stores/useSheetStore';
import { useEditorStore } from '../stores/useEditorStore';

/**
 * Hook for managing sheet operations
 */
export function useSheetManager() {
  const {
    currentSheet,
    selectedCellIndex,
    selectedSprite,
    cellRotation,
    cellFlip,
    selectCell,
    selectSprite,
    updateCell,
    rotateCell,
    flipCell,
    commitSheet,
  } = useSheetStore();

  const { currentSpriteTool, isDrawing, startDrawing, stopDrawing } = useEditorStore();

  const handleCellClick = useCallback((cellIndex: number, isFirstClick?: boolean) => {
    if (currentSpriteTool === 'select') {
      selectCell(cellIndex);
      return;
    }

    if (!isDrawing && !isFirstClick) {
      return;
    }

    if (isFirstClick) {
      startDrawing();
    }

    if (currentSpriteTool === 'eraser') {
      updateCell(cellIndex, null);
    } else if (currentSpriteTool === 'paint' || currentSpriteTool === 'fill') {
      if (selectedSprite) {
        updateCell(cellIndex, selectedSprite.id);
      }
    }
  }, [
    currentSpriteTool,
    isDrawing,
    selectedSprite,
    selectCell,
    updateCell,
    startDrawing,
  ]);

  const handleDrawEnd = useCallback(async () => {
    stopDrawing();
    await commitSheet();
  }, [stopDrawing, commitSheet]);

  const handleRotate = useCallback(() => {
    rotateCell();
  }, [rotateCell]);

  const handleFlip = useCallback((axis: 'x' | 'y') => {
    flipCell(axis);
  }, [flipCell]);

  return {
    currentSheet,
    selectedCellIndex,
    selectedSprite,
    cellRotation,
    cellFlip,
    currentSpriteTool,
    handleCellClick,
    handleDrawEnd,
    handleRotate,
    handleFlip,
    selectSprite,
  };
}

