import { create } from "zustand";
import { ViewMode } from "../../types/editor";

interface EditorStore {
  // UI State
  currentTool: "pencil" | "eraser" | "fill";
  currentSpriteTool: "select" | "paint" | "eraser" | "fill";
  currentColor: string;
  currentFrame: number;
  isDrawing: boolean;
  sheetViewMode: ViewMode;
  debug: boolean;

  // Actions
  setTool: (tool: "pencil" | "eraser" | "fill") => void;
  setSpriteTool: (tool: "select" | "paint" | "eraser" | "fill") => void;
  setColor: (color: string) => void;
  setCurrentFrame: (frame: number) => void;
  startDrawing: () => void;
  stopDrawing: () => void;
  setSheetViewMode: (mode: ViewMode) => void;
  toggleDebug: () => void;
}

export const useEditorStore = create<EditorStore>((set) => ({
  // Initial state
  currentTool: "pencil",
  currentSpriteTool: "paint",
  currentColor: "000",
  currentFrame: 0,
  isDrawing: false,
  sheetViewMode: "2d",
  debug: false,

  // Actions
  setTool: (tool) => set({ currentTool: tool }),

  setSpriteTool: (tool) => set({ currentSpriteTool: tool }),

  setColor: (color) => set({ currentColor: color }),

  setCurrentFrame: (frame) => set({ currentFrame: frame }),

  startDrawing: () => set({ isDrawing: true }),

  stopDrawing: () => set({ isDrawing: false }),

  setSheetViewMode: (mode) => set({ sheetViewMode: mode }),

  toggleDebug: () => set((state) => ({ debug: !state.debug })),
}));
