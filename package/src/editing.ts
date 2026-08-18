// Pure pixel-editing operations — no React, no DOM. Mutate a sprite's
// char-indexed pixel hash (one frame string); the state machine that drives
// them lives in useMiko.ts. Kept framework-free so this logic is trivially
// unit-testable and reusable outside the React components.

export type Tool = "pencil" | "eraser" | "fill";

/** The sentinel colour for transparent pixels. Always palette slot 0, never
 *  offered as a paintable swatch. */
export const TRANSPARENT = "fff0";

/** Transparent and black are always present and cannot be edited, removed or
 *  reordered — every sprite needs somewhere to erase to and something to
 *  outline with. */
export const LOCKED_COLORS = [TRANSPARENT, "000"];

/** How many swatches a palette holds, transparent excluded. */
export const MAX_COLORS = 10;

export const DEFAULT_COLORS = [
  TRANSPARENT,
  "000",
  "fff",
  "FCE288",
  "6FCF97",
  "2D9CDB",
  "56CCF2",
  "219653",
  "F2994A",
  "EB5757",
  "c0c0c0",
];

export const isLockedColor = (hex: string): boolean =>
  LOCKED_COLORS.includes(hex);

/** Expand a char-indexed pixel hash into an array of palette colors. Each
 *  character in `hash` is an index into `palette` (offset from 'a'). */
export const getHashArray = (hash: string, palette: string[]): string[] => {
  const results: string[] = [];
  for (let i = 0; i < hash.length; i++) {
    const colorIndex = hash.charCodeAt(i) - 97;
    results.push(palette[colorIndex] ?? palette[0] ?? "fff0");
  }
  return results;
};

/** A blank hash (every cell at palette slot 0) for a square grid of `size`. */
export const getDefaultHash = (size: number): string => "a".repeat(size * size);

export const getRandomColor = (): string =>
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

/** Slot 0 is always "fff0" (transparent) — the convention the whole miko/
 *  boxworld ecosystem relies on. */
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

/** Flood fill (BFS) from a starting pixel, replacing the contiguous region
 *  of the target color with `newColorChar`. */
export const floodFill = (
  hash: string,
  pixelIndex: number,
  newColorChar: string,
  gridSize: number
): string => {
  const targetChar = hash.charAt(pixelIndex);
  if (targetChar === newColorChar) return hash;

  const pixels = hash.split("");
  const totalPixels = gridSize * gridSize;
  const queue: number[] = [pixelIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentIndex = queue.shift()!;
    if (visited.has(currentIndex) || currentIndex < 0 || currentIndex >= totalPixels) continue;
    if (pixels[currentIndex] !== targetChar) continue;

    visited.add(currentIndex);
    pixels[currentIndex] = newColorChar;

    const row = Math.floor(currentIndex / gridSize);
    const col = currentIndex % gridSize;
    if (row > 0) queue.push(currentIndex - gridSize);
    if (row < gridSize - 1) queue.push(currentIndex + gridSize);
    if (col > 0) queue.push(currentIndex - 1);
    if (col < gridSize - 1) queue.push(currentIndex + 1);
  }

  return pixels.join("");
};

/** Apply a tool at `pixelIndex`, returning the updated hash and palette. The
 *  palette grows if a genuinely new color is painted. The eraser paints the
 *  "fff0" (transparent) slot, adding it if the palette somehow lacks one. */
export const updateHash = (
  pixelIndex: number,
  hash: string,
  palette: string[],
  newColor: string,
  tool: Tool
): { newHash: string; newPalette: string[] } => {
  const isErasing = tool === "eraser";
  const isFilling = tool === "fill";

  const newPalette = [...palette];
  if (newPalette.indexOf(newColor) === -1) newPalette.push(newColor);
  if (isErasing && newPalette.indexOf("fff0") === -1) newPalette.unshift("fff0");

  const newColorChar = String.fromCharCode(
    newPalette.indexOf(isErasing ? "fff0" : newColor) + 97
  );

  const gridSize = Math.sqrt(hash.length);
  const newHash = isFilling
    ? floodFill(hash, pixelIndex, newColorChar, gridSize)
    : hash
        .split("")
        .map((c, i) => (i === pixelIndex ? newColorChar : c))
        .join("");

  return { newHash, newPalette };
};

/** The first swatch that can actually be painted with — used whenever the
 *  selected colour disappears out from under the user. */
export const firstVisibleColor = (colors: string[]): string =>
  colors.find((color) => color !== TRANSPARENT) ?? "000";

/** Keeps painting with the selected colour when the new palette still holds
 *  it, otherwise falls back to the first paintable swatch. */
export const keepOrResetColor = (colors: string[], currentColor: string): string =>
  colors.includes(currentColor) && currentColor !== TRANSPARENT
    ? currentColor
    : firstVisibleColor(colors);

/** Puts a palette into the shape the editor expects: locked colours first,
 *  no duplicates, and always exactly MAX_COLORS paintable swatches. Short
 *  palettes are topped up from `fallback`. */
export const normalisePalette = (
  items: string[],
  fallback: string[] = DEFAULT_COLORS
): string[] => {
  const editable = items.filter(
    (item, index) => !isLockedColor(item) && items.indexOf(item) === index
  );

  const padding = fallback.filter(
    (color) => !isLockedColor(color) && !editable.includes(color)
  );

  return [
    ...LOCKED_COLORS,
    // The locked colours already cover one of the paintable slots.
    ...[...editable, ...padding].slice(0, MAX_COLORS - 1),
  ];
};

/** Re-sorts a sprite's palette by how often each colour is actually used and
 *  rewrites every frame to match, so the most common colours occupy the
 *  lowest slots. Called on commit — purely a compaction, never a visual
 *  change. */
export const optimiseFrames = (
  frames: string[],
  spritePalette: string[]
): { newFrames: string[]; newPalette: string[] } => {
  const newPalette = [...spritePalette];

  const allColors = frames.reduce(
    (sum, frame) => [...sum, ...getHashArray(frame, spritePalette)],
    [] as string[]
  );

  newPalette.sort((a, b) => {
    const aCount = allColors.filter((c) => c === a).length;
    const bCount = allColors.filter((c) => c === b).length;
    return bCount - aCount;
  });

  const newFrames = frames.map((frame) => {
    let newFrameHash = "";
    for (let i = 0; i < frame.length; i++) {
      const oldColorIndex = frame.charCodeAt(i) - 97;
      const oldColor = spritePalette[oldColorIndex];
      // A char pointing past the palette is corrupt data; fall back to slot 0
      // rather than emitting a char below 'a' that nothing can decode.
      const newColorIndex = oldColor === undefined ? 0 : newPalette.indexOf(oldColor);
      newFrameHash += String.fromCharCode(Math.max(newColorIndex, 0) + 97);
    }
    return newFrameHash;
  });

  return { newFrames, newPalette };
};

export const insertAtIndex = <T,>(arr: T[], index: number, newItem: T): T[] => [
  ...arr.slice(0, index),
  newItem,
  ...arr.slice(index),
];

export const moveToIndex = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  if (item === undefined) return arr;
  next.splice(to, 0, item);
  return next;
};
