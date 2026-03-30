import { SpritesheetItem } from "types/sheet";

/**
 * Converts a spritesheet grid hash string into an ordered array of SpritesheetItems.
 * Each character in the hash maps to an item index: charCode - 97.
 * Returns null for empty cells (index < 0 or no matching item).
 */
export const getSpriteArray = (
  spritehash?: string,
  spriteItems?: SpritesheetItem[]
): (SpritesheetItem | null)[] => {
  if (!spritehash || !spriteItems) return [];

  const results: (SpritesheetItem | null)[] = [];
  for (let i = 0; i < spritehash.length; i++) {
    const spriteIndex = spritehash.charCodeAt(i) - 97;
    results.push(spriteItems[spriteIndex] ?? null);
  }
  return results;
};
