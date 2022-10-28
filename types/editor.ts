import { Sprite } from "./sprite";
import { Spritesheet } from "./sheet";

export type EditorState = {
  debug: boolean;
  spriteData?: Sprite;
  sheetData?: Spritesheet;
  colors: string[];
  undoHistory: string[];
  isDrawing: boolean;
  currentFrame: number;
  currentColor: string;
  undoHistoryIndex: number;
  currentTool: string;
  currentHash: string;
  unsavedHash: string;
  currentSheetIndex: number;
};
