import { Sprite } from "./sprite";

export type SpritesheetItem = {
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
  grid: string[];
  items: SpritesheetItem[];
  sprites: Sprite[];
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
