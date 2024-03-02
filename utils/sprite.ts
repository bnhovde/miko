import { SpritesheetItem } from "types/sheet";

const getSpriteArray = (
  spritehash?: string,
  spriteItems?: SpritesheetItem[]
): (SpritesheetItem | null)[] => {
  const results = [] as (SpritesheetItem | null)[];

  if (!spritehash || !spriteItems) {
    return results;
  }

  for (var i = 0; i < spritehash.length; i++) {
    const spriteIndex = spritehash.charCodeAt(i) - 97;
    const match = spriteItems[spriteIndex];

    if (match) {
      results.push(spriteItems[spriteIndex]);
    } else {
      results.push(null);
    }
  }

  return results;
};

export { getSpriteArray };
