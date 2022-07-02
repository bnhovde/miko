import { Sprite } from "./sprite";

export type EditorState = {
  debug: boolean;
  spriteData?: Sprite;
  colors: string[];
  undoHistory: string[];
  isDrawing: boolean;
  currentFrame: number;
  currentColor: string;
  undoHistoryIndex: number;
  currentTool: string;
  currentHash: string;
  unsavedHash: string;
};
