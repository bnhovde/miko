import { Sprite } from "../../types/sprite";
import { SpritesheetItem } from "../../types/sheet";

export type CellData = {
  spriteId: string;
  rotation?: number;
  flip?: "x" | "y" | "xy" | "yx";
};

/**
 * Core data structure for sprite sheet grid.
 * Manages a grid of sprite references with transformations.
 */
export class SheetData {
  private cells: Map<string, CellData>;

  constructor(
    public gridSize: number,
    public sprites: Map<string, Sprite>,
    cells?: Map<string, CellData>
  ) {
    this.cells = cells || new Map();
  }

  /**
   * Create SheetData from legacy grid format
   * Grid format: string array where each character represents a sprite index
   */
  static fromGrid(
    gridString: string,
    items: Array<{ spriteId: string; rotation?: number; flip?: string }>,
    sprites: Sprite[],
    gridSize: number
  ): SheetData {
    const cells = new Map<string, CellData>();
    const spriteMap = new Map<string, Sprite>();

    // Build sprite map
    sprites.forEach((sprite) => {
      spriteMap.set(sprite.id, sprite);
    });

    // Parse grid string
    for (let i = 0; i < gridString.length; i++) {
      const char = gridString[i];
      const itemIndex = char.charCodeAt(0) - 97; // 'a' = 0, 'b' = 1, etc.

      // Skip empty cells ('a' = empty)
      if (itemIndex === 0 || itemIndex >= items.length) {
        continue;
      }

      const item = items[itemIndex];
      if (!item || !item.spriteId) {
        continue;
      }

      const x = i % gridSize;
      const y = Math.floor(i / gridSize);
      const key = `${x},${y}`;

      cells.set(key, {
        spriteId: item.spriteId,
        rotation: item.rotation,
        flip: item.flip as any,
      });
    }

    return new SheetData(gridSize, spriteMap, cells);
  }

  /**
   * Convert to legacy grid format for storage
   */
  toGrid(): {
    gridString: string;
    items: SpritesheetItem[];
  } {
    const items: SpritesheetItem[] = [];
    const itemIndexMap = new Map<string, number>();

    // Build grid string
    let gridString = "";
    const totalCells = this.gridSize * this.gridSize;

    for (let i = 0; i < totalCells; i++) {
      const x = i % this.gridSize;
      const y = Math.floor(i / this.gridSize);
      const cell = this.getCell(x, y);

      if (!cell) {
        gridString += "a"; // Empty cell
        continue;
      }

      // Create unique key for this cell configuration
      const cellKey = `${cell.spriteId}:${cell.rotation || 0}:${
        cell.flip || ""
      }`;

      let itemIndex = itemIndexMap.get(cellKey);
      if (itemIndex === undefined) {
        // Add new item
        items.push({
          spriteId: cell.spriteId,
          rotation: cell.rotation,
          flip: cell.flip as "x" | "y" | "xy" | "yx" | undefined,
        });
        itemIndex = items.length;
        itemIndexMap.set(cellKey, itemIndex);
      }

      gridString += String.fromCharCode(itemIndex + 97);
    }

    return { gridString, items };
  }

  /**
   * Get cell data at coordinates
   */
  getCell(x: number, y: number): CellData | null {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
      return null;
    }
    const key = `${x},${y}`;
    return this.cells.get(key) || null;
  }

  /**
   * Get cell data by linear index
   */
  getCellByIndex(index: number): CellData | null {
    const x = index % this.gridSize;
    const y = Math.floor(index / this.gridSize);
    return this.getCell(x, y);
  }

  /**
   * Set cell data at coordinates
   */
  setCell(
    x: number,
    y: number,
    spriteId: string,
    rotation?: number,
    flip?: "x" | "y" | "xy" | "yx"
  ): void {
    if (x < 0 || x >= this.gridSize || y < 0 || y >= this.gridSize) {
      return;
    }
    const key = `${x},${y}`;
    this.cells.set(key, { spriteId, rotation, flip });
  }

  /**
   * Set cell data by linear index
   */
  setCellByIndex(
    index: number,
    spriteId: string,
    rotation?: number,
    flip?: "x" | "y" | "xy" | "yx"
  ): void {
    const x = index % this.gridSize;
    const y = Math.floor(index / this.gridSize);
    this.setCell(x, y, spriteId, rotation, flip);
  }

  /**
   * Remove cell at coordinates
   */
  removeCell(x: number, y: number): void {
    const key = `${x},${y}`;
    this.cells.delete(key);
  }

  /**
   * Remove cell by linear index
   */
  removeCellByIndex(index: number): void {
    const x = index % this.gridSize;
    const y = Math.floor(index / this.gridSize);
    this.removeCell(x, y);
  }

  /**
   * Get sprite for a cell
   */
  getSprite(x: number, y: number): Sprite | null {
    const cell = this.getCell(x, y);
    if (!cell) {
      return null;
    }
    return this.sprites.get(cell.spriteId) || null;
  }

  /**
   * Add or update a sprite in the sheet
   */
  addSprite(sprite: Sprite): void {
    this.sprites.set(sprite.id, sprite);
  }

  /**
   * Check if sheet is empty
   */
  isEmpty(): boolean {
    return this.cells.size === 0;
  }

  /**
   * Clone this sheet data
   */
  clone(): SheetData {
    const newCells = new Map(this.cells);
    const newSprites = new Map(this.sprites);
    return new SheetData(this.gridSize, newSprites, newCells);
  }

  /**
   * Get all cells as array
   */
  getAllCells(): Array<{ x: number; y: number; cell: CellData }> {
    const result: Array<{ x: number; y: number; cell: CellData }> = [];
    this.cells.forEach((cell, key) => {
      const [x, y] = key.split(",").map(Number);
      result.push({ x, y, cell });
    });
    return result;
  }
}
