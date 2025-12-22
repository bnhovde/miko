import { Sprite } from "../../types/sprite";
import localStorageKeys from "../../constants/localStorageKeys";
import { migrateSprite } from "./migrations";

/**
 * Repository for sprite data persistence
 * Handles storage, retrieval, and migrations
 */
export class SpriteRepository {
  /**
   * Save a sprite to localStorage
   */
  async save(sprite: Sprite): Promise<void> {
    try {
      const key = `${localStorageKeys.SPRITE}-${sprite.id}`;
      const data = JSON.stringify(sprite);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error("Failed to save sprite:", error);
      throw new Error("Failed to save sprite");
    }
  }

  /**
   * Load a sprite from localStorage with automatic migration
   */
  async load(id: string): Promise<Sprite | null> {
    try {
      const key = `${localStorageKeys.SPRITE}-${id}`;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      const migrated = migrateSprite(parsed);

      // If migration occurred, save the updated version
      if (parsed.version !== migrated.version) {
        await this.save(migrated);
      }

      return migrated;
    } catch (error) {
      console.error("Failed to load sprite:", error);
      return null;
    }
  }

  /**
   * List all sprites
   */
  async list(): Promise<Sprite[]> {
    const sprites: Sprite[] = [];
    const prefix = localStorageKeys.SPRITE;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix + "-")) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const migrated = migrateSprite(parsed);
              sprites.push(migrated);
            } catch (error) {
              console.error(`Failed to parse sprite ${key}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to list sprites:", error);
    }

    return sprites;
  }

  /**
   * Delete a sprite
   */
  async delete(id: string): Promise<void> {
    try {
      const key = `${localStorageKeys.SPRITE}-${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to delete sprite:", error);
      throw new Error("Failed to delete sprite");
    }
  }

  /**
   * Check if a sprite exists
   */
  async exists(id: string): Promise<boolean> {
    const key = `${localStorageKeys.SPRITE}-${id}`;
    return localStorage.getItem(key) !== null;
  }
}

// Singleton instance
export const spriteRepository = new SpriteRepository();
