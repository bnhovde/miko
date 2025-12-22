import { create } from "zustand";
import { Spritesheet } from "../../types/sheet";
import { Sprite } from "../../types/sprite";
import { SheetData } from "../core/SheetData";
import { sheetRepository } from "../repositories/SheetRepository";

interface SheetStore {
  // State
  currentSheet: Spritesheet | null;
  unsavedSheetData: SheetData | null;
  selectedCellIndex: number;
  selectedSprite: Sprite | null;
  cellRotation: number;
  cellFlip: "x" | "y" | "xy" | "yx" | undefined;

  // Actions
  loadSheet: (sheet: Spritesheet) => void;
  selectCell: (index: number) => void;
  selectSprite: (sprite: Sprite | null) => void;

  updateCell: (index: number, spriteId: string | null) => void;
  rotateCell: () => void;
  flipCell: (axis: "x" | "y") => void;

  commitSheet: () => Promise<void>;
  cancelSheet: () => void;

  updateName: (newName: string) => void;

  reset: () => void;
}

const initialState = {
  currentSheet: null,
  unsavedSheetData: null,
  selectedCellIndex: 0,
  selectedSprite: null,
  cellRotation: 0,
  cellFlip: undefined,
};

export const useSheetStore = create<SheetStore>((set, get) => ({
  ...initialState,

  loadSheet: (sheet: Spritesheet) => {
    set({
      currentSheet: sheet,
      unsavedSheetData: null,
      selectedCellIndex: 0,
      selectedSprite: null,
      cellRotation: 0,
      cellFlip: undefined,
    });
  },

  selectCell: (index: number) => {
    const { currentSheet, unsavedSheetData } = get();
    if (!currentSheet) return;

    const sheetData =
      unsavedSheetData ||
      SheetData.fromGrid(
        currentSheet.grid[0] || "",
        currentSheet.items || [],
        currentSheet.sprites || [],
        currentSheet.size
      );

    const cell = sheetData.getCellByIndex(index);

    set({
      selectedCellIndex: index,
      cellRotation: cell?.rotation || 0,
      cellFlip: cell?.flip,
    });
  },

  selectSprite: (sprite: Sprite | null) => {
    set({
      selectedSprite: sprite,
      cellRotation: 0,
      cellFlip: undefined,
    });
  },

  updateCell: (index: number, spriteId: string | null) => {
    const {
      currentSheet,
      unsavedSheetData,
      selectedSprite,
      cellRotation,
      cellFlip,
    } = get();
    if (!currentSheet) return;

    const sheetData =
      unsavedSheetData ||
      SheetData.fromGrid(
        currentSheet.grid[0] || "",
        currentSheet.items || [],
        currentSheet.sprites || [],
        currentSheet.size
      );

    if (spriteId === null) {
      sheetData.removeCellByIndex(index);
    } else {
      // Add sprite to sheet if not already present
      if (selectedSprite) {
        sheetData.addSprite(selectedSprite);
      }
      sheetData.setCellByIndex(index, spriteId, cellRotation, cellFlip);
    }

    set({ unsavedSheetData: sheetData });
  },

  rotateCell: () => {
    const { cellRotation } = get();
    const newRotation = (cellRotation + 90) % 360;
    set({ cellRotation: newRotation });
  },

  flipCell: (axis: "x" | "y") => {
    const { cellFlip } = get();

    let newFlip: "x" | "y" | "xy" | "yx" | undefined = axis;

    if (cellFlip === axis) {
      newFlip = undefined;
    } else if (cellFlip && cellFlip !== axis) {
      newFlip = cellFlip.includes(axis)
        ? cellFlip
        : (`${cellFlip}${axis}` as "xy" | "yx");
    }

    set({ cellFlip: newFlip });
  },

  commitSheet: async () => {
    const { currentSheet, unsavedSheetData } = get();
    if (!currentSheet || !unsavedSheetData) return;

    const { gridString, items } = unsavedSheetData.toGrid();
    const sprites = Array.from(unsavedSheetData.sprites.values());

    const updatedSheet: Spritesheet = {
      ...currentSheet,
      grid: [gridString],
      items,
      sprites,
    };

    await sheetRepository.save(updatedSheet);

    set({
      currentSheet: updatedSheet,
      unsavedSheetData: null,
    });
  },

  cancelSheet: () => {
    set({ unsavedSheetData: null });
  },

  updateName: (newName: string) => {
    const { currentSheet } = get();
    if (!currentSheet) return;

    const updatedSheet = { ...currentSheet, name: newName };
    sheetRepository.save(updatedSheet);

    set({ currentSheet: updatedSheet });
  },

  reset: () => set(initialState),
}));
