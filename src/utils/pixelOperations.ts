import { SpriteData } from "../core/SpriteData";

/**
 * Pure utility functions for pixel operations
 * These are easily testable and can be used across the app
 */

/**
 * Flood fill algorithm for pixel arrays
 */
export function floodFill(
  pixels: Uint8Array,
  width: number,
  height: number,
  startX: number,
  startY: number,
  fillColor: number
): Uint8Array {
  const result = new Uint8Array(pixels);
  const startIndex = startY * width + startX;

  if (startIndex < 0 || startIndex >= pixels.length) {
    return result;
  }

  const targetColor = pixels[startIndex];

  if (targetColor === fillColor) {
    return result;
  }

  const queue: number[] = [startIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentIndex = queue.shift()!;

    if (
      visited.has(currentIndex) ||
      currentIndex < 0 ||
      currentIndex >= pixels.length
    ) {
      continue;
    }

    if (result[currentIndex] !== targetColor) {
      continue;
    }

    visited.add(currentIndex);
    result[currentIndex] = fillColor;

    const row = Math.floor(currentIndex / width);
    const col = currentIndex % width;

    // Add neighbors
    if (row > 0) queue.push(currentIndex - width); // Up
    if (row < height - 1) queue.push(currentIndex + width); // Down
    if (col > 0) queue.push(currentIndex - 1); // Left
    if (col < width - 1) queue.push(currentIndex + 1); // Right
  }

  return result;
}

/**
 * Optimize palette by removing unused colors and reordering by usage
 */
export function optimizePalette(
  frames: SpriteData[],
  currentPalette: string[]
): { frames: SpriteData[]; palette: string[] } {
  // Count color usage across all frames
  const colorUsage = new Map<number, number>();

  frames.forEach((frame) => {
    const pixels = frame.getPixels();
    for (let i = 0; i < pixels.length; i++) {
      const colorIndex = pixels[i];
      colorUsage.set(colorIndex, (colorUsage.get(colorIndex) || 0) + 1);
    }
  });

  // Sort colors by usage (most used first)
  const sortedIndices = Array.from(colorUsage.keys()).sort(
    (a, b) => (colorUsage.get(b) || 0) - (colorUsage.get(a) || 0)
  );

  // Build new palette (always keep index 0 for transparent)
  const newPalette = [currentPalette[0]]; // Keep transparent
  const indexMap = new Map<number, number>();
  indexMap.set(0, 0);

  sortedIndices.forEach((oldIndex) => {
    if (oldIndex !== 0 && colorUsage.get(oldIndex)! > 0) {
      indexMap.set(oldIndex, newPalette.length);
      newPalette.push(currentPalette[oldIndex]);
    }
  });

  // Remap all frames to new palette
  const newFrames = frames.map((frame) => {
    const oldPixels = frame.getPixels();
    const newPixels = new Uint8Array(oldPixels.length);

    for (let i = 0; i < oldPixels.length; i++) {
      const oldIndex = oldPixels[i];
      newPixels[i] = indexMap.get(oldIndex) || 0;
    }

    return new SpriteData(frame.width, frame.height, newPalette, newPixels);
  });

  return { frames: newFrames, palette: newPalette };
}

/**
 * Create an empty sprite data
 */
export function createEmptySprite(size: number, palette: string[]): SpriteData {
  return new SpriteData(size, size, palette);
}

/**
 * Copy a region from one sprite to another
 */
export function copyRegion(
  source: SpriteData,
  target: SpriteData,
  srcX: number,
  srcY: number,
  width: number,
  height: number,
  destX: number,
  destY: number
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcPixelX = srcX + x;
      const srcPixelY = srcY + y;
      const destPixelX = destX + x;
      const destPixelY = destY + y;

      if (
        srcPixelX >= 0 &&
        srcPixelX < source.width &&
        srcPixelY >= 0 &&
        srcPixelY < source.height &&
        destPixelX >= 0 &&
        destPixelX < target.width &&
        destPixelY >= 0 &&
        destPixelY < target.height
      ) {
        const colorIndex = source.getPixel(srcPixelX, srcPixelY);
        target.setPixel(destPixelX, destPixelY, colorIndex);
      }
    }
  }
}
