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
  // const isFilling = selectedTool === "fill";

  let newHash = "";
  const newPalette = [...spritePalette];

  // Add new color if not existing
  if (newPalette.indexOf(newColor) === -1) {
    newPalette.push(newColor);
  }

  // Update pixel at index
  for (var i = 0; i < hash.length; i++) {
    newHash +=
      i === pixelIndex
        ? isErasing
          ? "a"
          : String.fromCharCode(newPalette.indexOf(newColor) + 97)
        : hash.charAt(i);
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
  selectedTool: string
) => {
  const isErasing = selectedTool === "eraser";
  // const isFilling = selectedTool === "fill";

  let newHash = "";
  const newGrid = [...grid];

  // Add new sprite to sprites if not existing
  let newSprites = [...sprites];
  if (newSprite && !newSprites.find((sprite) => sprite.id === newSprite?.id)) {
    newSprites.push(newSprite);
  }

  // Add new item to items and newGrid
  let newItems = [...items];
  const itemIndex = items.findIndex((item) => item.spriteId === newSprite?.id);
  if (itemIndex) {
    // Convert index to alplhanumerical so that a-z can be used
    newGrid[pixelIndex] = String.fromCharCode(itemIndex + 97);
  } else {
    newItems.push({
      spriteId: newSprite?.id || "url",
      rotation: 0,
    });
    newGrid[pixelIndex] = String.fromCharCode(items.length + 97);
  }

  // Update hash
  for (var i = 0; i < hash.length; i++) {
    newHash += i === pixelIndex ? "a" : hash.charAt(i);
  }

  return { newHash, newGrid, newItems, newSprites };
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

// const floodFill = (pixels: string, pixelIndex: number, newColor: string) => {
//   const currentCol = pixels[pixelIndex];

//   // If the newColor is same as the existing, return the original image.
//   if(currentCol === newColor){
//       return pixels;
//   }

//   //Other wise call the fill function which will fill in the existing image.
//   fill(image, sr, sc, newColor, current);

//   //Return the image once it is filled
//   return image;
// };

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
