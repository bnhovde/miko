import { Sprite } from "./sprite";

export type SpritePackage = {
  id: string;
  version: string;
  name: string;
  description?: string;
  author?: {
    id: string;
    name: string;
  };
  size: number;
  sprites: Sprite[];
};
