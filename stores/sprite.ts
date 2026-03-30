/**
 * Sprite store — owns the currently-loaded sprite, its frames, palette,
 * undo history, and the "unsaved" (in-flight drag) hash.
 *
 * Drawing operations work in two phases:
 *   1. While dragging: `updateDrag` mutates `unsavedHash` for live preview.
 *   2. On mouseup:     `commitDraw` moves the unsaved hash into the frame array,
 *                       persists to localStorage, and records undo history.
 */

import { create } from "zustand";
import { Sprite } from "types/sprite";
import { defaultColors } from "data/palettes";
import {
  getDefaultHash,
  updateHash,
  optimiseFrames,
} from "lib/encoding/hash";
import { insertAtIndex, moveToIndex } from "lib/array";
import { set as lsSet } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";

interface SpriteState {
  /** The currently open sprite (undefined when no sprite is loaded). */
  spriteData: Sprite | undefined;
  /** Available palette colours (the "drawer" palette, not the sprite palette). */
  colors: string[];
  /** Index of the frame currently shown in the canvas. */
  currentFrame: number;
  /** The saved hash for the current frame (matches spriteData.frames[currentFrame]). */
  currentHash: string;
  /** Live hash updated on every drag pixel before committing. */
  unsavedHash: string;
  /** Undo history for the current frame — array of hash strings. */
  undoHistory: string[];
  undoHistoryIndex: number;

  /** Load a sprite into the editor, resetting all transient state. */
  initSprite: (sprite: Sprite) => void;
  /** Replace the current sprite without resetting frame/history. */
  changeSprite: (sprite: Sprite) => void;
  changeName: (name: string) => void;
  changeFrame: (frameIndex: number) => void;
  addFrame: (atIndex: number, hash?: string) => void;
  deleteFrame: (frameIndex: number) => void;
  reorderFrames: (from: number, to: number) => void;
  replacePalette: (palette: string[]) => void;

  /** Called on every drag pixel — updates unsavedHash for live preview. */
  updateDrag: (pixelIndex: number, tool: string) => void;
  /** Called on mouseup — commits unsavedHash, persists, records undo. */
  commitDraw: () => void;
}

const resetFrameState = {
  unsavedHash: "",
  undoHistory: [] as string[],
  undoHistoryIndex: 0,
};

export const useSpriteStore = create<SpriteState>()((set, get) => ({
  spriteData: undefined,
  colors: defaultColors,
  currentFrame: 0,
  currentHash: getDefaultHash(),
  unsavedHash: "",
  undoHistory: [],
  undoHistoryIndex: 0,

  initSprite: (sprite) =>
    set({
      spriteData: sprite,
      currentFrame: 0,
      currentHash: sprite.frames[0] ?? getDefaultHash(),
      colors: defaultColors,
      ...resetFrameState,
    }),

  changeSprite: (sprite) =>
    set({
      spriteData: sprite,
      currentHash: sprite.frames[0] ?? getDefaultHash(),
    }),

  changeName: (name) =>
    set((s) =>
      s.spriteData ? { spriteData: { ...s.spriteData, name } } : {}
    ),

  changeFrame: (frameIndex) =>
    set((s) => ({
      currentFrame: frameIndex,
      currentHash: s.spriteData?.frames[frameIndex] ?? getDefaultHash(),
      ...resetFrameState,
    })),

  addFrame: (atIndex, hash) =>
    set((s) => {
      if (!s.spriteData) return {};
      const newHash = hash ?? getDefaultHash();
      const newFrames = insertAtIndex(s.spriteData.frames, atIndex + 1, newHash);
      return {
        spriteData: { ...s.spriteData, frames: newFrames },
        currentFrame: atIndex + 1,
        currentHash: newHash,
        ...resetFrameState,
      };
    }),

  deleteFrame: (frameIndex) =>
    set((s) => {
      if (!s.spriteData) return {};
      const newFrames = s.spriteData.frames.filter((_, i) => i !== frameIndex);
      const newFrame = Math.max(frameIndex - 1, 0);
      return {
        spriteData: { ...s.spriteData, frames: newFrames },
        currentFrame: newFrame,
        currentHash: newFrames[newFrame] ?? getDefaultHash(),
        ...resetFrameState,
      };
    }),

  reorderFrames: (from, to) =>
    set((s) => {
      if (!s.spriteData) return {};
      const newFrames = moveToIndex(s.spriteData.frames, from, to);
      return {
        spriteData: { ...s.spriteData, frames: newFrames },
        currentFrame: to,
        currentHash: newFrames[to] ?? getDefaultHash(),
        ...resetFrameState,
      };
    }),

  replacePalette: (palette) =>
    set({ colors: palette, currentHash: getDefaultHash() }),

  updateDrag: (pixelIndex, tool) => {
    const s = get();
    if (!s.spriteData) return;

    const { currentColor } = useDrawingStoreRef();

    const { newHash, newPalette } = updateHash(
      pixelIndex,
      s.unsavedHash || s.currentHash || getDefaultHash(),
      s.spriteData.palette,
      currentColor,
      tool
    );

    set({
      unsavedHash: newHash,
      spriteData: { ...s.spriteData, palette: newPalette },
    });
  },

  commitDraw: () => {
    const s = get();
    if (!s.spriteData || !s.unsavedHash) return;

    const { undoHistory, undoHistoryIndex, currentFrame, unsavedHash } = s;
    const baseHash = s.spriteData.frames[currentFrame] ?? getDefaultHash();

    const isFirstPaint = undoHistory.length === 0;
    const isBranchingHistory = undoHistoryIndex !== undoHistory.length;

    let newHistory: string[];
    if (isFirstPaint) {
      newHistory = [baseHash, unsavedHash];
    } else if (isBranchingHistory) {
      newHistory = [...undoHistory.slice(0, undoHistoryIndex + 1), unsavedHash];
    } else {
      newHistory = [...undoHistory, unsavedHash];
    }

    const updatedFrames = s.spriteData.frames.map((f, i) =>
      i === currentFrame ? unsavedHash : f
    );
    const { newFrames, newPalette } = optimiseFrames(updatedFrames, s.spriteData.palette);

    const updatedSprite = { ...s.spriteData, frames: newFrames, palette: newPalette };
    lsSet(`${localStorageKeys.SPRITE}-${s.spriteData.id}`, JSON.stringify(updatedSprite));

    set({
      spriteData: updatedSprite,
      currentHash: newFrames[currentFrame] ?? getDefaultHash(),
      unsavedHash: "",
      undoHistory: newHistory,
      undoHistoryIndex: newHistory.length,
    });
  },
}));

// Circular import avoidance: access drawing store state at call time, not at module load.
const useDrawingStoreRef = () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useDrawingStore } = require("stores/drawing") as typeof import("stores/drawing");
  return useDrawingStore.getState();
};
