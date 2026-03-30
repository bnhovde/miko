/**
 * Sheet store — owns the currently-loaded spritesheet, its grid, items,
 * and the selected cell's sprite + transformation state.
 *
 * Drawing follows the same two-phase model as the sprite store:
 *   1. While dragging: `updateDrag` mutates `unsavedGrid` for live preview.
 *   2. On mouseup:     `commitDraw` persists the grid to localStorage.
 */

import { create } from "zustand";
import { Sprite } from "types/sprite";
import { Spritesheet, SpritesheetItem } from "types/sheet";
import { ViewMode } from "types/editor";
import { getDefaultHash, updateHashSheet } from "lib/encoding/hash";
import { set as lsSet } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";

interface SheetState {
  sheetData: Spritesheet | undefined;
  /** The saved grid string (matches sheetData.grid[0]). */
  currentGrid: string;
  /** Live grid updated on every drag before committing. */
  unsavedGrid: string;
  /** Index of the cell that was last clicked (for rotate/flip). */
  currentSheetIndex: number;
  /** The sprite currently selected in the sprite picker for painting. */
  currentSheetSprite: Sprite | undefined;
  currentRotation: number;
  currentFlip: "x" | "y" | "xy" | "yx" | undefined;
  sheetViewMode: ViewMode;

  initSheet: (sheet: Spritesheet) => void;
  selectSpriteForSheet: (sprite: Sprite) => void;
  selectSheetCell: (index: number) => void;
  rotateSheetCell: () => void;
  flipSheetCell: (axis: "x" | "y") => void;
  setViewMode: (mode: ViewMode) => void;

  /** Called on every drag cell — updates unsavedGrid for live preview. */
  updateDrag: (cellIndex: number, tool: string) => void;
  /** Called on mouseup — persists sheet to localStorage. */
  commitDraw: () => void;
}

export const useSheetStore = create<SheetState>()((set, get) => ({
  sheetData: undefined,
  currentGrid: getDefaultHash(),
  unsavedGrid: "",
  currentSheetIndex: 0,
  currentSheetSprite: undefined,
  currentRotation: 0,
  currentFlip: undefined,
  sheetViewMode: "2d",

  initSheet: (sheet) =>
    set({
      sheetData: sheet,
      currentGrid: sheet.grid[0] ?? getDefaultHash(),
      unsavedGrid: "",
      currentSheetIndex: 0,
      currentSheetSprite: sheet.sprites?.[0],
      currentRotation: 0,
      currentFlip: undefined,
      sheetViewMode: "2d",
    }),

  selectSpriteForSheet: (sprite) =>
    set({ currentSheetSprite: sprite, currentRotation: 0, currentFlip: undefined }),

  selectSheetCell: (index) => {
    const { sheetData } = get();
    if (!sheetData) return;

    const gridChar = (sheetData.grid[0] ?? "")[index];
    const itemIdx = gridChar ? gridChar.charCodeAt(0) - 97 : -1;
    const item = itemIdx >= 0 ? sheetData.items[itemIdx] : undefined;
    const sprite = item
      ? sheetData.sprites?.find((s) => s.id === item.spriteId)
      : undefined;

    set({
      currentSheetIndex: index,
      currentSheetSprite: sprite,
      currentRotation: item?.rotation ?? 0,
      currentFlip: item?.flip,
    });
  },

  rotateSheetCell: () => {
    const s = get();
    if (!s.sheetData) return;

    const gridString = s.sheetData.grid[0] ?? getDefaultHash();
    const itemCharCode = gridString.charCodeAt(s.currentSheetIndex);
    const itemIndex = itemCharCode - 97;
    if (itemIndex < 0 || itemIndex >= s.sheetData.items.length) return;

    const items = [...s.sheetData.items];
    const current = items[itemIndex]!;
    const newRotation = ((current.rotation ?? 0) + 90) % 360;

    const existingIdx = items.findIndex(
      (it) =>
        it.spriteId === current.spriteId &&
        it.rotation === newRotation &&
        it.flip === current.flip
    );

    let targetIdx: number;
    if (existingIdx > -1) {
      targetIdx = existingIdx;
    } else {
      items.push({ spriteId: current.spriteId, rotation: newRotation, flip: current.flip });
      targetIdx = items.length - 1;
    }

    const newGridString = gridString
      .split("")
      .map((ch, i) =>
        i === s.currentSheetIndex ? String.fromCharCode(targetIdx + 97) : ch
      )
      .join("");

    const updated: Spritesheet = { ...s.sheetData, grid: [newGridString], items };
    lsSet(`${localStorageKeys.SPRITESHEET}-${s.sheetData.id}`, JSON.stringify(updated));

    set({ sheetData: updated, currentGrid: newGridString, currentRotation: newRotation });
  },

  flipSheetCell: (axis) => {
    const s = get();
    if (!s.sheetData) return;

    const gridString = s.sheetData.grid[0] ?? getDefaultHash();
    const itemCharCode = gridString.charCodeAt(s.currentSheetIndex);
    const itemIndex = itemCharCode - 97;
    if (itemIndex < 0 || itemIndex >= s.sheetData.items.length) return;

    const items = [...s.sheetData.items];
    const current = items[itemIndex]!;
    const currentFlip = current.flip;

    let newFlip: "x" | "y" | "xy" | "yx" | undefined;
    if (axis === "x") {
      if (!currentFlip) newFlip = "x";
      else if (currentFlip === "y") newFlip = "xy";
      else if (currentFlip === "xy") newFlip = "y";
      else if (currentFlip === "x") newFlip = undefined;
      else if (currentFlip === "yx") newFlip = "y";
    } else {
      if (!currentFlip) newFlip = "y";
      else if (currentFlip === "x") newFlip = "xy";
      else if (currentFlip === "xy") newFlip = "x";
      else if (currentFlip === "y") newFlip = undefined;
      else if (currentFlip === "yx") newFlip = "x";
    }

    const existingIdx = items.findIndex(
      (it) =>
        it.spriteId === current.spriteId &&
        it.rotation === current.rotation &&
        it.flip === newFlip
    );

    let targetIdx: number;
    if (existingIdx > -1) {
      targetIdx = existingIdx;
    } else {
      items.push({ spriteId: current.spriteId, rotation: current.rotation, flip: newFlip });
      targetIdx = items.length - 1;
    }

    const newGridString = gridString
      .split("")
      .map((ch, i) =>
        i === s.currentSheetIndex ? String.fromCharCode(targetIdx + 97) : ch
      )
      .join("");

    const updated: Spritesheet = { ...s.sheetData, grid: [newGridString], items };
    lsSet(`${localStorageKeys.SPRITESHEET}-${s.sheetData.id}`, JSON.stringify(updated));

    set({ sheetData: updated, currentGrid: newGridString, currentFlip: newFlip });
  },

  setViewMode: (mode) => set({ sheetViewMode: mode }),

  updateDrag: (cellIndex, tool) => {
    const s = get();
    if (!s.sheetData) return;

    const spriteToPlace = s.currentSheetSprite;
    const { newHash, newGrid, newItems, newSprites } = updateHashSheet(
      cellIndex,
      s.unsavedGrid || s.currentGrid || getDefaultHash(),
      s.sheetData.grid,
      s.sheetData.items,
      s.sheetData.sprites ?? [],
      spriteToPlace,
      tool,
      s.currentRotation,
      s.currentFlip
    );

    set({
      unsavedGrid: newGrid[0] ?? s.currentGrid,
      sheetData: {
        ...s.sheetData,
        grid: newGrid,
        items: newItems,
        sprites: newSprites,
      },
    });
  },

  commitDraw: () => {
    const s = get();
    if (!s.sheetData) return;

    lsSet(
      `${localStorageKeys.SPRITESHEET}-${s.sheetData.id}`,
      JSON.stringify(s.sheetData)
    );

    set({
      currentGrid: s.sheetData.grid[0] ?? s.currentGrid,
      unsavedGrid: "",
    });
  },
}));
