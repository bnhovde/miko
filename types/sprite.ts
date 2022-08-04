export type Sprite = {
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
  frames: string[];
  isLegacy?: boolean;
};

export type LegacySprite = {
  id: string;
  name: string;
  description?: string;
  size: number;
  frames: string[];
};

export type CompressedSprite = {
  palette: string[];
  chunks: string[];
  frames: string[];
};

export type URLSprite = {
  n: string;
  v: string;
  a: string;
  s: number;
  d: number;
  p: string[];
  f: string[];
};

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
