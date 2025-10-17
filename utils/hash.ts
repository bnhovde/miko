import { Sprite, URLSprite } from "types/sprite";
import { diffStrings } from "./string";
import { SpritesheetItem } from "types/sheet";

export const getRandomColor = () =>
  `${Math.floor(Math.random() * 16777215).toString(16)}`;

const getRandomHash = (gridSize?: number): string => {
  const cellCount = (gridSize || 11) * (gridSize || 11);
  const cells = [];

  for (var i = 0; i < cellCount; i++) {
    cells.push(String.fromCharCode(Math.floor(Math.random() * 10) + 97));
  }

  return `${cells.join("")}`;
};

const getRandomPalette = (): string[] => {
  return [
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
};

const getDefaultHash = (gridSize?: number): string => {
  const cellCount = (gridSize || 11) * (gridSize || 11);
  const cells = new Array(cellCount + 1).join("a");
  return cells;
};

const getHashArray = (hash: string, colors: string[]): string[] => {
  const results = [];

  for (var i = 0; i < hash.length; i++) {
    const colorIndex = hash.charCodeAt(i) - 97;
    results.push(colors[colorIndex]);
  }

  return results;
};

const decodeUrlSprite = (urlSprite: URLSprite): Sprite => {
  const { n, v, a, s, d, p, f } = urlSprite;

  const colorArray = [...p];
  const reg = /([0-9.]+)(?![0-9.])|([a-z]+)(?![a-z])/gi;

  const allFrames = f.map((frame, index) => {
    let frameArray = frame.match(reg) || [];
    const frameResults = [];

    if (frame.startsWith("z")) {
      const refFrame = f[parseInt(frame.substring(1))];
      frameArray = refFrame.match(reg) || [];
    }

    for (var i = 0; i < frameArray.length; i++) {
      const match = frameArray[i];
      if (match.match(/[0-9.]+/)) {
        const value = frameArray[i - 1];
        const count = parseInt(match) - 1;
        const valueArr = Array(count).fill(value.charAt(value.length - 1));
        frameResults.push(...valueArr);
      } else {
        frameResults.push(match);
      }
    }

    return frameResults.join("");
  });

  return {
    id: "url",
    version: v || "unknown",
    name: n || "Untitled",
    description: `by ${a || "Anonymous"}`,
    size: s || 11,
    fps: d || 10,
    palette: colorArray,
    frames: allFrames,
  };
};

const encodeUrlSprite = (sprite: Sprite): URLSprite => {
  const { name, palette, author, size, frames, fps } = sprite;

  const uniqueFrames = frames.reduce((sum, frame, index) => {
    const matchIndex = frames.lastIndexOf(frame);

    if (matchIndex > -1 && matchIndex !== index) {
      return [...sum, "z" + matchIndex];
    }
    return [...sum, frame];
  }, [] as string[]);

  const compressedFrames = uniqueFrames.reduce((sum, frame) => {
    // Ignore cloned frames
    if (frame.startsWith("z")) {
      return [...sum, frame];
    }

    const compressedPixels = frame.split("").reduce((sum, pixel) => {
      const prevVal = sum[sum.length - 1];
      const twoPrevVal = sum[sum.length - 2];

      // Check if previous pixel is the same color
      if (prevVal && pixel === prevVal) {
        return [...sum, 2];

        // Check if match AND previous pixel is numeric
      } else if (
        prevVal &&
        pixel === twoPrevVal &&
        typeof prevVal === "number"
      ) {
        return [...sum.slice(0, sum.length - 1), prevVal + 1];

        // Add new color
      } else {
        return [...sum, pixel];
      }
    }, [] as (string | number)[]);

    return [...sum, compressedPixels.join("")];
  }, [] as string[]);

  return {
    n: name,
    v: sprite.version,
    a: author?.name || "Anonymous",
    s: size,
    d: fps || 10,
    p: palette,
    f: compressedFrames,
  };
};

const updateHash = (
  pixelIndex: number,
  hash: string,
  spritePalette: string[],
  newColor: string,
  selectedTool: string
) => {
  const isErasing = selectedTool === "eraser";
  const isFilling = selectedTool === "fill";

  let newHash = "";
  const newPalette = [...spritePalette];

  // Add new color if not existing
  if (newPalette.indexOf(newColor) === -1) {
    newPalette.push(newColor);
  }

  const newColorChar = isErasing
    ? "a"
    : String.fromCharCode(newPalette.indexOf(newColor) + 97);

  // Handle fill tool with flood fill algorithm
  if (isFilling) {
    const gridSize = Math.sqrt(hash.length);
    newHash = floodFill(hash, pixelIndex, newColorChar, gridSize);
  } else {
    // Update single pixel at index (pencil/eraser)
    for (var i = 0; i < hash.length; i++) {
      newHash += i === pixelIndex ? newColorChar : hash.charAt(i);
    }
  }

  return { newHash, newPalette };
};

const updateHashSheet = (
  pixelIndex: number,
  hash: string,
  grid: string[],
  items: SpritesheetItem[],
  sprites: Sprite[],
  newSprite: Sprite | undefined,
  selectedTool: string,
  rotation?: number,
  flip?: "x" | "y" | "xy" | "yx"
) => {
  const isErasing = selectedTool === "eraser";
  const isFilling = selectedTool === "fill";

  let newHash = "";
  let newGridString = grid[0] || getDefaultHash();

  // Add new sprite to sprites if not existing
  let newSprites = [...sprites];
  if (newSprite && !newSprites.find((sprite) => sprite.id === newSprite?.id)) {
    newSprites.push(newSprite);
  }

  // Add new item to items and update grid string
  let newItems = [...items];

  let itemChar: string;

  if (isErasing) {
    // Eraser: set to 'a' (empty)
    itemChar = "a";
  } else {
    // Check if there's already an item with same sprite, rotation, and flip
    const existingItemIndex = items.findIndex(
      (item) =>
        item.spriteId === newSprite?.id &&
        item.rotation === rotation &&
        item.flip === flip
    );

    if (existingItemIndex > -1) {
      // Use existing item
      itemChar = String.fromCharCode(existingItemIndex + 97);
    } else {
      // Create new item with transformation
      newItems.push({
        spriteId: newSprite?.id || "url",
        rotation: rotation || 0,
        flip: flip,
      });
      itemChar = String.fromCharCode(items.length + 97);
    }
  }

  // Handle fill tool with flood fill algorithm
  let newGridStringUpdated: string;
  if (isFilling) {
    const gridSize = Math.sqrt(newGridString.length);
    newGridStringUpdated = floodFill(
      newGridString,
      pixelIndex,
      itemChar,
      gridSize
    );
  } else {
    // Update single cell at pixelIndex (paint/eraser)
    newGridStringUpdated = "";
    for (var i = 0; i < newGridString.length; i++) {
      newGridStringUpdated +=
        i === pixelIndex ? itemChar : newGridString.charAt(i);
    }
  }

  // Update hash (kept for backward compatibility but may not be needed)
  for (var i = 0; i < hash.length; i++) {
    newHash += i === pixelIndex ? "a" : hash.charAt(i);
  }

  return { newHash, newGrid: [newGridStringUpdated], newItems, newSprites };
};

const optimiseFrames = (frames: string[], spritePalette: string[]) => {
  const newPalette = [...spritePalette] as string[];

  const allColors = frames.reduce(
    (sum, frame) => [...sum, ...getHashArray(frame, spritePalette)],
    [] as string[]
  );

  // Sort palette by use
  newPalette.sort((a, b) => {
    const aCount = allColors.filter((c) => c === a).length;
    const bCount = allColors.filter((c) => c === b).length;
    return bCount - aCount;
  });

  const newFrames = frames.map((frame) => {
    let newFrameHash = "";
    for (var i = 0; i < frame.length; i++) {
      const oldColorIndex = frame.charCodeAt(i) - 97;
      const oldColor = spritePalette[oldColorIndex];
      const newColorIndex = newPalette.indexOf(oldColor);
      const newCharacter = String.fromCharCode(newColorIndex + 97);

      newFrameHash += newCharacter;
    }
    return newFrameHash;
  });

  return { newFrames, newPalette };
};

/**
 * Flood fill algorithm for sprite pixels
 * @param hash - The current hash string representing the sprite
 * @param pixelIndex - The starting pixel index to fill from
 * @param newColorChar - The new color character to fill with
 * @param gridSize - The size of the grid (default 11x11 = 121 pixels)
 * @returns The new hash string with flood fill applied
 */
const floodFill = (
  hash: string,
  pixelIndex: number,
  newColorChar: string,
  gridSize: number = 11
): string => {
  const targetChar = hash.charAt(pixelIndex);

  // If the newColor is same as the existing, return the original hash
  if (targetChar === newColorChar) {
    return hash;
  }

  // Convert hash string to array for easier manipulation
  const pixels = hash.split("");
  const totalPixels = gridSize * gridSize;

  // BFS queue for flood fill
  const queue: number[] = [pixelIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentIndex = queue.shift()!;

    // Skip if already visited or out of bounds
    if (
      visited.has(currentIndex) ||
      currentIndex < 0 ||
      currentIndex >= totalPixels
    ) {
      continue;
    }

    // Skip if not the target color
    if (pixels[currentIndex] !== targetChar) {
      continue;
    }

    // Mark as visited and fill
    visited.add(currentIndex);
    pixels[currentIndex] = newColorChar;

    // Get row and column
    const row = Math.floor(currentIndex / gridSize);
    const col = currentIndex % gridSize;

    // Add neighbors (up, down, left, right)
    // Up
    if (row > 0) {
      queue.push(currentIndex - gridSize);
    }
    // Down
    if (row < gridSize - 1) {
      queue.push(currentIndex + gridSize);
    }
    // Left
    if (col > 0) {
      queue.push(currentIndex - 1);
    }
    // Right
    if (col < gridSize - 1) {
      queue.push(currentIndex + 1);
    }
  }

  return pixels.join("");
};

export {
  getDefaultHash,
  getRandomHash,
  getRandomPalette,
  getHashArray,
  updateHash,
  updateHashSheet,
  encodeUrlSprite,
  decodeUrlSprite,
  optimiseFrames,
};
