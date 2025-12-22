import { Spritesheet } from "../../types/sheet";
import localStorageKeys from "../../constants/localStorageKeys";
import { migrateSpritesheet } from "./migrations";

/**
 * Repository for spritesheet data persistence
 * Handles storage, retrieval, and migrations
 */
export class SheetRepository {
  /**
   * Save a spritesheet to localStorage
   */
  async save(sheet: Spritesheet): Promise<void> {
    try {
      const key = `${localStorageKeys.SPRITESHEET}-${sheet.id}`;
      const data = JSON.stringify(sheet);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error("Failed to save spritesheet:", error);
      throw new Error("Failed to save spritesheet");
    }
  }

  /**
   * Load a spritesheet from localStorage with automatic migration
   */
  async load(id: string): Promise<Spritesheet | null> {
    try {
      const key = `${localStorageKeys.SPRITESHEET}-${id}`;
      const data = localStorage.getItem(key);

      if (!data) {
        return null;
      }

      const parsed = JSON.parse(data);
      const migrated = migrateSpritesheet(parsed);

      // If migration occurred, save the updated version
      if (parsed.version !== migrated.version) {
        await this.save(migrated);
      }

      return migrated;
    } catch (error) {
      console.error("Failed to load spritesheet:", error);
      return null;
    }
  }

  /**
   * List all spritesheets
   */
  async list(): Promise<Spritesheet[]> {
    const sheets: Spritesheet[] = [];
    const prefix = localStorageKeys.SPRITESHEET;

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix + "-")) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const parsed = JSON.parse(data);
              const migrated = migrateSpritesheet(parsed);
              sheets.push(migrated);
            } catch (error) {
              console.error(`Failed to parse spritesheet ${key}:`, error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to list spritesheets:", error);
    }

    return sheets;
  }

  /**
   * Delete a spritesheet
   */
  async delete(id: string): Promise<void> {
    try {
      const key = `${localStorageKeys.SPRITESHEET}-${id}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Failed to delete spritesheet:", error);
      throw new Error("Failed to delete spritesheet");
    }
  }

  /**
   * Check if a spritesheet exists
   */
  async exists(id: string): Promise<boolean> {
    const key = `${localStorageKeys.SPRITESHEET}-${id}`;
    return localStorage.getItem(key) !== null;
  }
}

// Singleton instance
export const sheetRepository = new SheetRepository();
