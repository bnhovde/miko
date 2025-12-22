import { Sprite } from "../../types/sprite";
import { Spritesheet } from "../../types/sheet";

/**
 * Migration utilities for handling data format changes across versions
 */

export const CURRENT_VERSION = "2.0";

/**
 * Migrate sprite data from old format to current format
 */
export function migrateSprite(data: any): Sprite {
  const version = data.version || "1.0";

  if (version === "1.0") {
    // Version 1.0: hash-based string format
    // Version 2.0: same format but with explicit version
    return {
      ...data,
      version: CURRENT_VERSION,
      // Data structure stays the same for now (hash strings)
      // The SpriteData class handles conversion internally
    };
  }

  if (version === CURRENT_VERSION) {
    return data as Sprite;
  }

  // Unknown version, try to use as-is
  console.warn(`Unknown sprite version: ${version}`);
  return {
    ...data,
    version: CURRENT_VERSION,
  };
}

/**
 * Migrate spritesheet data from old format to current format
 */
export function migrateSpritesheet(data: any): Spritesheet {
  const version = data.version || "1.0";

  if (version === "1.0") {
    // Version 1.0: grid-based string format
    return {
      ...data,
      version: CURRENT_VERSION,
      // Ensure grid is an array
      grid: Array.isArray(data.grid) ? data.grid : [data.grid || ""],
      items: data.items || [],
      sprites: data.sprites || [],
    };
  }

  if (version === CURRENT_VERSION) {
    return data as Spritesheet;
  }

  // Unknown version
  console.warn(`Unknown spritesheet version: ${version}`);
  return {
    ...data,
    version: CURRENT_VERSION,
    grid: Array.isArray(data.grid) ? data.grid : [data.grid || ""],
    items: data.items || [],
    sprites: data.sprites || [],
  };
}

/**
 * Check if data needs migration
 */
export function needsMigration(data: any): boolean {
  const version = data?.version || "1.0";
  return version !== CURRENT_VERSION;
}

/**
 * Get migration info for debugging
 */
export function getMigrationInfo(data: any): {
  fromVersion: string;
  toVersion: string;
  needsMigration: boolean;
} {
  const fromVersion = data?.version || "1.0";
  return {
    fromVersion,
    toVersion: CURRENT_VERSION,
    needsMigration: fromVersion !== CURRENT_VERSION,
  };
}
