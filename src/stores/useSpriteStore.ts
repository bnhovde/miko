import { create } from 'zustand';
import { Sprite } from '../../types/sprite';
import { SpriteData } from '../core/SpriteData';
import { spriteRepository } from '../repositories/SpriteRepository';
import { optimizePalette } from '../utils/pixelOperations';

interface SpriteStore {
  // State
  currentSprite: Sprite | null;
  currentFrame: number;
  unsavedFrameData: SpriteData | null;
  undoHistory: string[];
  undoHistoryIndex: number;

  // Actions
  loadSprite: (sprite: Sprite) => void;
  setFrame: (index: number) => void;
  addFrame: (afterIndex?: number, frameHash?: string) => void;
  deleteFrame: (index: number) => void;
  reorderFrames: (oldIndex: number, newIndex: number) => void;
  
  updatePixel: (pixelIndex: number, colorIndex: number) => void;
  fillPixel: (pixelIndex: number, colorIndex: number) => void;
  commitFrame: () => Promise<void>;
  cancelFrame: () => void;
  
  undo: () => void;
  redo: () => void;
  
  updatePalette: (newPalette: string[]) => void;
  updateName: (newName: string) => void;
  optimizeFrames: () => void;
  clearFrame: () => void;
  
  reset: () => void;
}

const initialState = {
  currentSprite: null,
  currentFrame: 0,
  unsavedFrameData: null,
  undoHistory: [],
  undoHistoryIndex: 0,
};

export const useSpriteStore = create<SpriteStore>((set, get) => ({
  ...initialState,

  loadSprite: (sprite: Sprite) => {
    set({
      currentSprite: sprite,
      currentFrame: 0,
      unsavedFrameData: null,
      undoHistory: [],
      undoHistoryIndex: 0,
    });
  },

  setFrame: (index: number) => {
    const { currentSprite } = get();
    if (!currentSprite || index < 0 || index >= currentSprite.frames.length) {
      return;
    }
    set({
      currentFrame: index,
      unsavedFrameData: null,
      undoHistory: [],
      undoHistoryIndex: 0,
    });
  },

  addFrame: (afterIndex?: number, frameHash?: string) => {
    const { currentSprite, currentFrame } = get();
    if (!currentSprite) return;

    const insertIndex = afterIndex !== undefined ? afterIndex + 1 : currentFrame + 1;
    const newFrames = [...currentSprite.frames];
    // Use provided frameHash (for duplication) or create empty frame
    const hashToInsert = frameHash || 'a'.repeat(currentSprite.size * currentSprite.size);
    newFrames.splice(insertIndex, 0, hashToInsert);

    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({
      currentSprite: updatedSprite,
      currentFrame: insertIndex,
    });
  },

  deleteFrame: (index: number) => {
    const { currentSprite, currentFrame } = get();
    if (!currentSprite || currentSprite.frames.length <= 1) return;

    const newFrames = currentSprite.frames.filter((_, i) => i !== index);
    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({
      currentSprite: updatedSprite,
      currentFrame: Math.min(currentFrame, newFrames.length - 1),
    });
  },

  reorderFrames: (oldIndex: number, newIndex: number) => {
    const { currentSprite } = get();
    if (!currentSprite) return;

    const newFrames = [...currentSprite.frames];
    const [removed] = newFrames.splice(oldIndex, 1);
    newFrames.splice(newIndex, 0, removed);

    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({ currentSprite: updatedSprite });
  },

  updatePixel: (pixelIndex: number, colorIndex: number) => {
    const { currentSprite, currentFrame, unsavedFrameData } = get();
    if (!currentSprite) return;

    const frameHash = currentSprite.frames[currentFrame];
    const frameData = unsavedFrameData || SpriteData.fromHash(
      frameHash,
      currentSprite.palette,
      currentSprite.size
    );

    frameData.setPixelByIndex(pixelIndex, colorIndex);

    set({ unsavedFrameData: frameData });
  },

  fillPixel: (pixelIndex: number, colorIndex: number) => {
    const { currentSprite, currentFrame, unsavedFrameData } = get();
    if (!currentSprite) return;

    const frameHash = currentSprite.frames[currentFrame];
    const frameData = unsavedFrameData || SpriteData.fromHash(
      frameHash,
      currentSprite.palette,
      currentSprite.size
    );

    const x = pixelIndex % currentSprite.size;
    const y = Math.floor(pixelIndex / currentSprite.size);
    frameData.fill(x, y, colorIndex);

    set({ unsavedFrameData: frameData });
  },

  commitFrame: async () => {
    const { currentSprite, currentFrame, unsavedFrameData, undoHistory, undoHistoryIndex } = get();
    if (!currentSprite || !unsavedFrameData) return;

    const newHash = unsavedFrameData.toHash();
    const newFrames = [...currentSprite.frames];
    newFrames[currentFrame] = newHash;

    const updatedSprite = { ...currentSprite, frames: newFrames };
    await spriteRepository.save(updatedSprite);

    // Update undo history
    const oldHash = currentSprite.frames[currentFrame];
    const newHistory = undoHistory.slice(0, undoHistoryIndex + 1);
    newHistory.push(oldHash);

    set({
      currentSprite: updatedSprite,
      unsavedFrameData: null,
      undoHistory: newHistory,
      undoHistoryIndex: newHistory.length - 1,
    });
  },

  cancelFrame: () => {
    set({ unsavedFrameData: null });
  },

  undo: () => {
    const { currentSprite, currentFrame, undoHistory, undoHistoryIndex } = get();
    if (!currentSprite || undoHistoryIndex <= 0) return;

    const previousHash = undoHistory[undoHistoryIndex - 1];
    const newFrames = [...currentSprite.frames];
    newFrames[currentFrame] = previousHash;

    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({
      currentSprite: updatedSprite,
      undoHistoryIndex: undoHistoryIndex - 1,
    });
  },

  redo: () => {
    const { currentSprite, currentFrame, undoHistory, undoHistoryIndex } = get();
    if (!currentSprite || undoHistoryIndex >= undoHistory.length - 1) return;

    const nextHash = undoHistory[undoHistoryIndex + 1];
    const newFrames = [...currentSprite.frames];
    newFrames[currentFrame] = nextHash;

    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({
      currentSprite: updatedSprite,
      undoHistoryIndex: undoHistoryIndex + 1,
    });
  },

  updatePalette: (newPalette: string[]) => {
    const { currentSprite } = get();
    if (!currentSprite) return;

    const updatedSprite = { ...currentSprite, palette: newPalette };
    spriteRepository.save(updatedSprite);

    set({ currentSprite: updatedSprite });
  },

  updateName: (newName: string) => {
    const { currentSprite } = get();
    if (!currentSprite) return;

    const updatedSprite = { ...currentSprite, name: newName };
    spriteRepository.save(updatedSprite);

    set({ currentSprite: updatedSprite });
  },

  optimizeFrames: () => {
    const { currentSprite } = get();
    if (!currentSprite) return;

    const frameDataArray = currentSprite.frames.map(hash =>
      SpriteData.fromHash(hash, currentSprite.palette, currentSprite.size)
    );

    const { frames: optimizedFrames, palette: optimizedPalette } = optimizePalette(
      frameDataArray,
      currentSprite.palette
    );

    const updatedSprite = {
      ...currentSprite,
      frames: optimizedFrames.map(f => f.toHash()),
      palette: optimizedPalette,
    };

    spriteRepository.save(updatedSprite);
    set({ currentSprite: updatedSprite });
  },

  clearFrame: () => {
    const { currentSprite, currentFrame } = get();
    if (!currentSprite) return;

    // Create an empty frame (all transparent pixels = 'a')
    const emptyHash = 'a'.repeat(currentSprite.size * currentSprite.size);
    const newFrames = [...currentSprite.frames];
    newFrames[currentFrame] = emptyHash;

    const updatedSprite = { ...currentSprite, frames: newFrames };
    spriteRepository.save(updatedSprite);

    set({ 
      currentSprite: updatedSprite,
      unsavedFrameData: null,
    });
  },

  reset: () => set(initialState),
}));

