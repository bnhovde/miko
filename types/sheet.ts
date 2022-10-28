import { Sprite } from "./sprite";

export type SpritesheetItem = {
  id: string;
  rotation?: 0 | 90 | 180 | 270;
  flip?: "x" | "y" | "xy";
  data: Sprite;
};

export type Spritesheet = {
  id: string;
  version: string;
  name: string;
  description?: string;
  author?: {
    id: string;
    name: string;
  };
  size: number;
  fps?: number;
  palette: string[];
  sprites: SpritesheetItem[];
  grid: string[];
};
