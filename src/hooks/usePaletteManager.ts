import { useCallback } from 'react';
import { useSpriteStore } from '../stores/useSpriteStore';
import { useEditorStore } from '../stores/useEditorStore';

/**
 * Hook for managing sprite palette
 */
export function usePaletteManager() {
  const { currentSprite, updatePalette, optimizeFrames } = useSpriteStore();
  const { currentColor, setColor } = useEditorStore();

  const palette = currentSprite?.palette || [];

  const selectColor = useCallback((color: string) => {
    setColor(color);
  }, [setColor]);

  const addColor = useCallback((color: string) => {
    if (!palette.includes(color)) {
      const newPalette = [...palette, color];
      updatePalette(newPalette);
    }
  }, [palette, updatePalette]);

  const removeColor = useCallback((colorIndex: number) => {
    if (colorIndex === 0) return; // Can't remove transparent
    const newPalette = palette.filter((_, i) => i !== colorIndex);
    updatePalette(newPalette);
  }, [palette, updatePalette]);

  const replaceColor = useCallback((oldColor: string, newColor: string) => {
    const newPalette = palette.map(c => c === oldColor ? newColor : c);
    updatePalette(newPalette);
  }, [palette, updatePalette]);

  const optimizePalette = useCallback(() => {
    optimizeFrames();
  }, [optimizeFrames]);

  return {
    palette,
    currentColor,
    selectColor,
    addColor,
    removeColor,
    replaceColor,
    optimizePalette,
  };
}

