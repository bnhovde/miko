const getRandomColor = () =>
  `${Math.floor(Math.random() * 16777215).toString(16)}`;

const getRandomHash = (gridSize?: number): string => {
  const cellCount = (gridSize || 11) * (gridSize || 11);
  const cells = [];

  for (var i = 0; i < cellCount; i++) {
    cells.push(String.fromCharCode(Math.floor(Math.random() * 10) + 97));
  }

  return `fff0;${getRandomColor()},${getRandomColor()},${getRandomColor()},${getRandomColor()},${getRandomColor()},${getRandomColor()};${cells.join(
    ""
  )}`;
};

const getDefaultHash = (gridSize?: number): string => {
  const cellCount = (gridSize || 11) * (gridSize || 11);
  const cells = new Array(cellCount + 1).join("0");
  return `fff0;000;${cells}`;
};

const getHashArray = (hash: string): string[] => {
  const [bg, colors, pixels] = hash.split(";");
  const colorsArray = colors.split(",");
  const results = [];

  for (var i = 0; i < pixels.length; i++) {
    // Ignore background color
    if (pixels[i] === "0") {
      results.push(bg);
    } else {
      const colorIndex = pixels.charCodeAt(i) - 97;
      results.push(colorsArray[colorIndex]);
    }
  }

  return results;
};

const setHashBackground = (hash: string, newBg: string) => {
  const [oldBg, colors, pixels] = hash.split(";");
  return `${newBg || oldBg};${colors};${pixels}`;
};

const updateHash = (
  hash: string,
  pixelIndex: number,
  newColor: string,
  selectedTool: string
) => {
  const [bg, colors, pixels] = hash.split(";");
  const colorsArray = colors.split(",");
  const isErasing = selectedTool === "eraser";
  // const isFilling = selectedTool === "fill";

  let newPixels = "";

  // Add new color if not existing
  if (colorsArray.indexOf(newColor) === -1) {
    colorsArray.push(newColor);
  }

  // Update pixel at index
  for (var i = 0; i < pixels.length; i++) {
    newPixels +=
      i === pixelIndex
        ? isErasing
          ? 0
          : String.fromCharCode(colorsArray.indexOf(newColor) + 97)
        : pixels.charAt(i);
  }

  return `${bg};${colorsArray.join(",")};${newPixels}`;
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
  getHashArray,
  updateHash,
  setHashBackground,
};
