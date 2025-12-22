/**
 * Core data structure for sprite pixel data.
 * Uses Uint8Array for efficient pixel manipulation instead of string-based hash.
 */
export class SpriteData {
  private pixels: Uint8Array;

  constructor(
    public width: number,
    public height: number,
    public palette: string[],
    pixels?: Uint8Array
  ) {
    const size = width * height;
    this.pixels = pixels || new Uint8Array(size);
  }

  /**
   * Create SpriteData from legacy hash format
   * Hash format: each character represents a palette index (a=0, b=1, etc.)
   */
  static fromHash(hash: string, palette: string[], size: number): SpriteData {
    const pixels = new Uint8Array(hash.length);
    for (let i = 0; i < hash.length; i++) {
      pixels[i] = hash.charCodeAt(i) - 97; // 'a' = 0, 'b' = 1, etc.
    }
    return new SpriteData(size, size, palette, pixels);
  }

  /**
   * Convert to legacy hash format for storage/compatibility
   */
  toHash(): string {
    let hash = "";
    for (let i = 0; i < this.pixels.length; i++) {
      hash += String.fromCharCode(this.pixels[i] + 97);
    }
    return hash;
  }

  /**
   * Get pixel color index at coordinates
   */
  getPixel(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 0; // Return transparent/empty
    }
    const index = y * this.width + x;
    return this.pixels[index];
  }

  /**
   * Set pixel color index at coordinates
   */
  setPixel(x: number, y: number, colorIndex: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return;
    }
    const index = y * this.width + x;
    this.pixels[index] = colorIndex;
  }

  /**
   * Get pixel color index by linear index
   */
  getPixelByIndex(index: number): number {
    if (index < 0 || index >= this.pixels.length) {
      return 0;
    }
    return this.pixels[index];
  }

  /**
   * Set pixel color index by linear index
   */
  setPixelByIndex(index: number, colorIndex: number): void {
    if (index < 0 || index >= this.pixels.length) {
      return;
    }
    this.pixels[index] = colorIndex;
  }

  /**
   * Flood fill starting from a position
   */
  fill(x: number, y: number, fillColor: number): void {
    const startIndex = y * this.width + x;
    if (startIndex < 0 || startIndex >= this.pixels.length) {
      return;
    }

    const targetColor = this.pixels[startIndex];

    // If target is same as fill color, nothing to do
    if (targetColor === fillColor) {
      return;
    }

    // BFS flood fill
    const queue: number[] = [startIndex];
    const visited = new Set<number>();

    while (queue.length > 0) {
      const currentIndex = queue.shift()!;

      if (
        visited.has(currentIndex) ||
        currentIndex < 0 ||
        currentIndex >= this.pixels.length
      ) {
        continue;
      }

      if (this.pixels[currentIndex] !== targetColor) {
        continue;
      }

      visited.add(currentIndex);
      this.pixels[currentIndex] = fillColor;

      // Get neighbors
      const row = Math.floor(currentIndex / this.width);
      const col = currentIndex % this.width;

      // Up
      if (row > 0) {
        queue.push(currentIndex - this.width);
      }
      // Down
      if (row < this.height - 1) {
        queue.push(currentIndex + this.width);
      }
      // Left
      if (col > 0) {
        queue.push(currentIndex - 1);
      }
      // Right
      if (col < this.width - 1) {
        queue.push(currentIndex + 1);
      }
    }
  }

  /**
   * Get hex color at position
   */
  getColor(x: number, y: number): string {
    const colorIndex = this.getPixel(x, y);
    return this.palette[colorIndex] || "fff0";
  }

  /**
   * Get hex color by index
   */
  getColorByIndex(index: number): string {
    const colorIndex = this.getPixelByIndex(index);
    return this.palette[colorIndex] || "fff0";
  }

  /**
   * Convert to array of hex colors for rendering
   */
  toColorArray(): string[] {
    const colors: string[] = [];
    for (let i = 0; i < this.pixels.length; i++) {
      colors.push(this.palette[this.pixels[i]] || "fff0");
    }
    return colors;
  }

  /**
   * Clone this sprite data
   */
  clone(): SpriteData {
    return new SpriteData(
      this.width,
      this.height,
      [...this.palette],
      new Uint8Array(this.pixels)
    );
  }

  /**
   * Check if sprite is empty (all pixels are index 0)
   */
  isEmpty(): boolean {
    for (let i = 0; i < this.pixels.length; i++) {
      if (this.pixels[i] !== 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get raw pixel data (for advanced operations)
   */
  getPixels(): Uint8Array {
    return this.pixels;
  }

  /**
   * Replace entire pixel data
   */
  setPixels(pixels: Uint8Array): void {
    if (pixels.length !== this.pixels.length) {
      throw new Error("Pixel array size mismatch");
    }
    this.pixels = new Uint8Array(pixels);
  }
}
