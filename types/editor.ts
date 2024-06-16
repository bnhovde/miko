import { Sprite } from "./sprite";
import { Spritesheet } from "./sheet";
import { SpritePackage } from "./package";

export type EditorState = {
  debug: boolean;
  spriteData?: Sprite;
  sheetData?: Spritesheet;
  packageData?: SpritePackage;
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
