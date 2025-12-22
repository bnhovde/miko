import { useCallback } from 'react';
import { useSpriteStore } from '../stores/useSpriteStore';

/**
 * Hook for managing sprite frames
 */
export function useFrameManager() {
  const {
    currentSprite,
    currentFrame,
    setFrame,
    addFrame,
    deleteFrame,
    reorderFrames,
  } = useSpriteStore();

  const frames = currentSprite?.frames || [];
  const totalFrames = frames.length;

  const goToFrame = useCallback((index: number) => {
    setFrame(index);
  }, [setFrame]);

  const nextFrame = useCallback(() => {
    if (currentFrame < totalFrames - 1) {
      setFrame(currentFrame + 1);
    }
  }, [currentFrame, totalFrames, setFrame]);

  const prevFrame = useCallback(() => {
    if (currentFrame > 0) {
      setFrame(currentFrame - 1);
    }
  }, [currentFrame, setFrame]);

  const insertFrame = useCallback((afterIndex?: number) => {
    addFrame(afterIndex);
  }, [addFrame]);

  const removeFrame = useCallback((index: number) => {
    if (totalFrames > 1) {
      deleteFrame(index);
    }
  }, [totalFrames, deleteFrame]);

  const moveFrame = useCallback((oldIndex: number, newIndex: number) => {
    reorderFrames(oldIndex, newIndex);
  }, [reorderFrames]);

  return {
    currentFrame,
    totalFrames,
    frames,
    goToFrame,
    nextFrame,
    prevFrame,
    insertFrame,
    removeFrame,
    moveFrame,
  };
}

