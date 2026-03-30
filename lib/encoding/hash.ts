/**
 * Sprite Hash Encoding
 * ====================
 *
 * A sprite frame is stored as a flat string of length gridSize² (default 121 for 11×11).
 * Each character maps to a palette index via: paletteIndex = charCode - 97
 *
 *   'a' = index 0  (transparent / first palette slot)
 *   'b' = index 1
 *   'c' = index 2
 *   ...and so on
 *
 * Example 11×11 blank frame: "aaaaaaaaaaa..." (121 × 'a')
 *
 * Palette entries are short hex color strings, e.g. ["fff0", "000", "FF5733"].
 * "fff0" is the conventional transparent slot (index 0 / 'a').
 *
 * Spritesheet grid uses the same encoding but maps characters to SpritesheetItem
 * indices instead of palette indices.
 */

import { Sprite } from "types/sprite";
import { SpritesheetItem } from "types/sheet";

/** Returns a blank hash string of all transparent pixels. */
export const getDefaultHash = (gridSize = 11): string =>
  "a".repeat(gridSize * gridSize);

/** Returns a random hash with pixels distributed across the first 10 palette slots. */
export const getRandomHash = (gridSize = 11): string => {
  const cellCount = gridSize * gridSize;
  const cells: string[] = [];
  for (let i = 0; i < cellCount; i++) {
    cells.push(String.fromCharCode(Math.floor(Math.random() * 10) + 97));
  }
  return cells.join("");
};

/** Generates a random palette of 9 entries (transparent + white + black + 6 randoms). */
export const getRandomPalette = (): string[] => [
  "fff0",
  "fff",
  "000",
  getRandomColor(),
  getRandomColor(),
  getRandomColor(),
  getRandomColor(),
  getRandomColor(),
  getRandomColor(),
];

/** Returns a random 6-digit hex color string. */
export const getRandomColor = (): string =>
  Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

/**
 * Expands a hash string into an array of hex color values using the given palette.
 * The returned array has one entry per pixel.
 */
export const getHashArray = (hash: string, colors: string[]): string[] => {
  const results: string[] = [];
  for (let i = 0; i < hash.length; i++) {
    const colorIndex = hash.charCodeAt(i) - 97;
    results.push(colors[colorIndex] ?? "fff0");
  }
  return results;
};

/**
 * Draws a single pixel or performs a flood fill on a sprite frame hash.
 * Returns the updated hash and palette (new colors are appended to the palette).
 */
export const updateHash = (
  pixelIndex: number,
  hash: string,
  spritePalette: string[],
  newColor: string,
  selectedTool: string
): { newHash: string; newPalette: string[] } => {
  const isErasing = selectedTool === "eraser";
  const isFilling = selectedTool === "fill";
  const newPalette = [...spritePalette];

  if (!isErasing && newPalette.indexOf(newColor) === -1) {
    newPalette.push(newColor);
  }

  const newColorChar = isErasing
    ? "a"
    : String.fromCharCode(newPalette.indexOf(newColor) + 97);

  const gridSize = Math.sqrt(hash.length);
  const newHash = isFilling
    ? floodFill(hash, pixelIndex, newColorChar, gridSize)
    : hash.substring(0, pixelIndex) + newColorChar + hash.substring(pixelIndex + 1);

  return { newHash, newPalette };
};

/**
 * Places or erases a sprite on a spritesheet grid cell.
 * Returns updated hash, grid, items array, and sprites array.
 */
export const updateHashSheet = (
  pixelIndex: number,
  hash: string,
  grid: string[],
  items: SpritesheetItem[],
  sprites: Sprite[],
  newSprite: Sprite | undefined,
  selectedTool: string,
  rotation?: number,
  flip?: "x" | "y" | "xy" | "yx"
): {
  newHash: string;
  newGrid: string[];
  newItems: SpritesheetItem[];
  newSprites: Sprite[];
} => {
  const isErasing = selectedTool === "eraser";
  const isFilling = selectedTool === "fill";
  const newGridString = grid[0] ?? getDefaultHash();

  const newSprites = [...sprites];
  if (newSprite && !newSprites.find((s) => s.id === newSprite.id)) {
    newSprites.push(newSprite);
  }

  const newItems = [...items];
  let itemChar: string;

  if (isErasing) {
    itemChar = "a";
  } else {
    const existingItemIndex = items.findIndex(
      (item) =>
        item.spriteId === newSprite?.id &&
        item.rotation === rotation &&
        item.flip === flip
    );

    if (existingItemIndex > -1) {
      itemChar = String.fromCharCode(existingItemIndex + 97);
    } else {
      newItems.push({
        spriteId: newSprite?.id ?? "url",
        rotation: rotation ?? 0,
        flip,
      });
      itemChar = String.fromCharCode(items.length + 97);
    }
  }

  const gridSize = Math.sqrt(newGridString.length);
  const newGridStringUpdated = isFilling
    ? floodFill(newGridString, pixelIndex, itemChar, gridSize)
    : newGridString.substring(0, pixelIndex) + itemChar + newGridString.substring(pixelIndex + 1);

  // Keep hash in sync (legacy field)
  const newHash =
    hash.substring(0, pixelIndex) + "a" + hash.substring(pixelIndex + 1);

  return { newHash, newGrid: [newGridStringUpdated], newItems, newSprites };
};

/**
 * Re-orders palette entries by frequency of use across all frames, then updates
 * the frame hashes to reflect the new palette order.
 * This keeps the most-used colours at low indices for better compression.
 */
export const optimiseFrames = (
  frames: string[],
  spritePalette: string[]
): { newFrames: string[]; newPalette: string[] } => {
  const newPalette = [...spritePalette];
  const allColors = frames.flatMap((frame) => getHashArray(frame, spritePalette));

  newPalette.sort((a, b) => {
    const aCount = allColors.filter((c) => c === a).length;
    const bCount = allColors.filter((c) => c === b).length;
    return bCount - aCount;
  });

  const newFrames = frames.map((frame) => {
    let newFrameHash = "";
    for (let i = 0; i < frame.length; i++) {
      const oldColorIndex = frame.charCodeAt(i) - 97;
      const oldColor = spritePalette[oldColorIndex] ?? "fff0";
      const newColorIndex = newPalette.indexOf(oldColor);
      newFrameHash += String.fromCharCode(newColorIndex + 97);
    }
    return newFrameHash;
  });

  return { newFrames, newPalette };
};

/**
 * BFS flood fill on a hash string.
 * Replaces all connected pixels of the same colour starting at pixelIndex.
 */
const floodFill = (
  hash: string,
  pixelIndex: number,
  newColorChar: string,
  gridSize: number
): string => {
  const targetChar = hash[pixelIndex];
  if (targetChar === newColorChar) return hash;

  const pixels = hash.split("");
  const totalPixels = gridSize * gridSize;
  const queue: number[] = [pixelIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current) || current < 0 || current >= totalPixels) continue;
    if (pixels[current] !== targetChar) continue;

    visited.add(current);
    pixels[current] = newColorChar;

    const row = Math.floor(current / gridSize);
    const col = current % gridSize;

    if (row > 0) queue.push(current - gridSize);
    if (row < gridSize - 1) queue.push(current + gridSize);
    if (col > 0) queue.push(current - 1);
    if (col < gridSize - 1) queue.push(current + 1);
  }

  return pixels.join("");
};
