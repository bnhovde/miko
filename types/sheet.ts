import { Sprite } from "./sprite";

export type SpritesheetItem = {
  id: string;
  spriteId: string;
  rotation?: number;
  flip?: "x" | "y" | "xy" | "yx";
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
  items: SpritesheetItem[];
  sprites: Sprite[];
  grid: string[];
};

export type URLSheet = {
  n: string;
  v: string;
  a: string;
  s: number;
  d: number;
  p: string[];
  f: string[];
};
