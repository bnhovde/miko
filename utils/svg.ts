import { Sprite } from "types/sprite";
import { getHashArray } from "utils/hash";
import guid from "utils/guid";

type Rect = { x: number; y: number; width: number; height: number; hex: string };

const rectsForFrame = (frame: string, palette: string[], size: number): Rect[] => {
  const hashArray = getHashArray(frame, palette);
  const rectList: Rect[] = [];
  const lastRect = new Map<string, Rect>();
  for (let row = 0; row < size; row++) {
    let col = 0;
    while (col < size) {
      const hex = hashArray[row * size + col];
      if (!hex || (hex.length === 4 && hex[3] === "0")) { col++; continue; }
      let width = 1;
      while (col + width < size && hashArray[row * size + col + width] === hex) width++;
      const key = `${col},${width},${hex}`;
      const prev = lastRect.get(key);
      if (prev && prev.y + prev.height === row) {
        prev.height++;
      } else {
        const rect: Rect = { x: col, y: row, width, height: 1, hex };
        rectList.push(rect);
        lastRect.set(key, rect);
      }
      col += width;
    }
  }
  return rectList;
};

const rectsToString = (rects: Rect[]): string =>
  rects.map((r) => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="#${r.hex}"/>`).join("");

// Single static image of one frame (used by the sprite editor's "Save SVG").
export const frameToSvg = (sprite: Sprite, frameIndex: number): string => {
  const frame = sprite.frames[frameIndex];
  const size = sprite.size || Math.sqrt(frame.length);
  const rects = rectsForFrame(frame, sprite.palette, size);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><style>rect{shape-rendering:crispEdges}</style>${rectsToString(rects)}</svg>`;
};

// All frames packed side by side as a strip (used by the share page's "Copy SVG").
// fps has no geometric representation, so it's the one bit of metadata worth keeping.
export const spriteToSvg = (sprite: Sprite): string => {
  const size = sprite.size || Math.sqrt(sprite.frames[0].length);
  const groups = sprite.frames.map((frame, i) => {
    const rects = rectsForFrame(frame, sprite.palette, size);
    return `<svg x="${i * size}" y="0" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rectsToString(rects)}</svg>`;
  });
  const totalWidth = size * sprite.frames.length;
  const fpsAttr = sprite.frames.length > 1 ? ` data-fps="${sprite.fps || 10}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${size}"${fpsAttr}><style>rect{shape-rendering:crispEdges}</style>${groups.join("")}</svg>`;
};

// Reconstructs a Sprite by rasterizing <rect> elements back onto a pixel grid.
// Works for single-frame exports (frameToSvg) and multi-frame strips (spriteToSvg),
// and degrades gracefully for hand-made pixel-art SVGs that never went through Miko.
export const svgToSprite = (svgText: string, name: string): Sprite | null => {
  try {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    if (doc.getElementsByTagName("parsererror").length) return null;

    const root = doc.documentElement;
    if (root.nodeName.toLowerCase() !== "svg") return null;

    const nestedSvgs = Array.from(root.children).filter(
      (el) => el.tagName.toLowerCase() === "svg"
    );
    const frameGroups = nestedSvgs.length > 0 ? nestedSvgs : [root];

    const sizeOf = (el: Element): number => {
      const viewBox = el.getAttribute("viewBox");
      const parts = viewBox ? viewBox.trim().split(/\s+/).map(Number) : [];
      const width = parts[2] || Number(el.getAttribute("width")) || 0;
      const height = parts[3] || Number(el.getAttribute("height")) || 0;
      return Math.round(Math.max(width, height));
    };
    const size = Math.max(...frameGroups.map(sizeOf), 0);
    if (!size) return null;

    const palette: string[] = ["fff0"];
    const paletteIndex = new Map<string, number>([["fff0", 0]]);

    const frames = frameGroups.map((group) => {
      const grid = new Array(size * size).fill("a");
      Array.from(group.getElementsByTagName("rect")).forEach((rect) => {
        const x = Math.round(Number(rect.getAttribute("x") || 0));
        const y = Math.round(Number(rect.getAttribute("y") || 0));
        const width = Math.round(Number(rect.getAttribute("width") || 1));
        const height = Math.round(Number(rect.getAttribute("height") || 1));
        const hex = (rect.getAttribute("fill") || "#000").replace("#", "");

        let index = paletteIndex.get(hex);
        if (index === undefined) {
          index = palette.length;
          paletteIndex.set(hex, index);
          palette.push(hex);
        }
        const char = String.fromCharCode(97 + index);

        for (let row = Math.max(y, 0); row < y + height && row < size; row++) {
          for (let col = Math.max(x, 0); col < x + width && col < size; col++) {
            grid[row * size + col] = char;
          }
        }
      });
      return grid.join("");
    });

    const fps = parseInt(root.getAttribute("data-fps") || "", 10) || 10;

    return {
      id: guid(),
      version: "3.0.0",
      name,
      size,
      fps,
      palette,
      frames,
    };
  } catch (e) {
    return null;
  }
};
