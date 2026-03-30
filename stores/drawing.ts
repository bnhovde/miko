/**
 * Drawing store — manages the active drawing tool, selected colour,
 * and whether the user is currently holding the mouse/touch down.
 *
 * This store has no knowledge of sprite or sheet data; it only tracks
 * the user's intent (what tool, what colour, are they drawing right now).
 */

import { create } from "zustand";

export type DrawingTool = "pencil" | "eraser" | "fill";
export type SpritesheetTool = "paint" | "eraser" | "fill" | "select";

interface DrawingState {
  /** The active pixel-drawing tool. */
  currentTool: DrawingTool;
  /** The active spritesheet-placement tool. */
  currentSpriteTool: SpritesheetTool;
  /** Currently selected hex colour (without #). */
  currentColor: string;
  /** True while the user is holding down mouse/touch on the sprite canvas. */
  isDrawingSprite: boolean;
  /** True while the user is holding down mouse/touch on the sheet canvas. */
  isDrawingSheet: boolean;

  setTool: (tool: DrawingTool) => void;
  setSpriteTool: (tool: SpritesheetTool) => void;
  /** Selecting a colour also clears the eraser tool if active. */
  setColor: (color: string) => void;
  startDrawingSprite: () => void;
  startDrawingSheet: () => void;
  /** Call on mouseup / touchend — stops both sprite and sheet drawing. */
  stopDrawing: () => void;
}

export const useDrawingStore = create<DrawingState>()((set) => ({
  currentTool: "pencil",
  currentSpriteTool: "paint",
  currentColor: "000",
  isDrawingSprite: false,
  isDrawingSheet: false,

  setTool: (tool) => set({ currentTool: tool }),
  setSpriteTool: (tool) => set({ currentSpriteTool: tool }),
  setColor: (color) =>
    set((s) => ({
      currentColor: color,
      currentTool: s.currentTool === "eraser" ? "pencil" : s.currentTool,
    })),
  startDrawingSprite: () => set({ isDrawingSprite: true }),
  startDrawingSheet: () => set({ isDrawingSheet: true }),
  stopDrawing: () => set({ isDrawingSprite: false, isDrawingSheet: false }),
}));
