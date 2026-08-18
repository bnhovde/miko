import { Sprite, URLSprite } from "types/sprite";
import { SpritesheetItem } from "types/sheet";

// The pixel-hash primitives live in @boxworld/miko now — the same code the
// published editor runs on, so there is one implementation of flood fill,
// hash expansion and palette generation rather than a copy here that can
// drift. What stays in this file is the part the package has no opinion
// about: this app's URL encoding and its spritesheet grid.
import {
  floodFill,
  getHashArray,
  getRandomPalette,
  getDefaultHash as getDefaultHashOfSize,
} from "@boxworld/miko";

const getRandomHash = (gridSize?: number): string => {
  const cellCount = (gridSize || 11) * (gridSize || 11);
  const cells = [];

  for (var i = 0; i < cellCount; i++) {
    cells.push(String.fromCharCode(Math.floor(Math.random() * 10) + 97));
  }

  return `${cells.join("")}`;
};

/** The package requires a size; almost every call site here relies on the
 *  editor's default 11x11 grid, so the optional form is kept as a wrapper. */
const getDefaultHash = (gridSize?: number): string =>
  getDefaultHashOfSize(gridSize || 11);

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

export {
  getDefaultHash,
  getRandomHash,
  getRandomPalette,
  getHashArray,
  updateHashSheet,
  encodeUrlSprite,
  decodeUrlSprite,
};
