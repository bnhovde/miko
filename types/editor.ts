import { Sprite } from "./sprite";
import { Spritesheet } from "./sheet";

export type EditorState = {
  debug: boolean;
  editorType: "sprite" | "sheet";
  spriteData?: Sprite;
  sheetData?: Spritesheet;
  colors: string[];
  undoHistory: string[];
  isDrawingSprite: boolean;
  isDrawingSheet: boolean;
  currentFrame: number;
  currentColor: string;
  undoHistoryIndex: number;
  currentTool: string;
  currentSpriteTool: string;
  currentHash: string;
  currentGrid: string;
  unsavedHash: string;
  unsavedGrid: string;
  currentSheetIndex: number;
};
