import { Sprite, URLSprite } from "types/sprite";
import { diffStrings } from "./string";

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

  const allFrames = f.map((frame) => {
    const frameArray = frame.match(reg) || [];
    const frameResults = [];

    console.log(frameArray);

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

  const allColors = [] as string[];

  // Pick out colors in use
  for (const frame of frames) {
    for (const pixel of frame) {
      const colorIndex = pixel.charCodeAt(0) - 97;
      allColors.push(palette[colorIndex]);
    }
  }

  const uniqueColorsSortedByUse = [] as string[];
  for (const color of allColors) {
    if (uniqueColorsSortedByUse.indexOf(color) === -1) {
      uniqueColorsSortedByUse.push(color);
    }
  }

  uniqueColorsSortedByUse.sort((a, b) => {
    const aCount = allColors.filter((c) => c === a).length;
    const bCount = allColors.filter((c) => c === b).length;
    return bCount - aCount;
  });

  const compressedFrames = frames.reduce((sum, frame) => {
    const compressedPixels = frame.split("").reduce((sum, pixel) => {
      const oldColorIndex = pixel.charCodeAt(0) - 97;
      const oldColor = palette[oldColorIndex];
      const newColorIndex = uniqueColorsSortedByUse.indexOf(oldColor);
      const newCharacter = String.fromCharCode(newColorIndex + 97);

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
        return [...sum, newCharacter];
      }
    }, [] as (string | number)[]);

    return [...sum, compressedPixels.join("")];
  }, [] as string[]);

  // const diffedFrames = compressedFrames.map((frame, index) => {
  //   const prevFrame = compressedFrames[index - 1];
  //   if (prevFrame) {
  //     return diffStrings(frame, prevFrame);
  //   }
  //   return frame;
  // });

  return {
    n: name,
    v: sprite.version,
    a: author?.name || "Anonymous",
    s: size,
    d: fps || 10,
    p: uniqueColorsSortedByUse,
    f: compressedFrames,
  };
};

const updateHash = (
  hash: string,
  spritePalette: string[],
  pixelIndex: number,
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
  encodeUrlSprite,
  decodeUrlSprite,
};
