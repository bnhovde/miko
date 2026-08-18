// The miko sprite shape — palette + char-per-pixel frame strings, the same
// format the boxworld engine's format.ts calls `MikoSprite` and the
// standalone miko paint tool produces. Defined locally (not imported from
// @boxworld/engine) so this package has zero dependency on the game engine —
// sprite editing is a more general concern than boxworld levels, and a
// consumer who only wants the editor shouldn't have to pull in a WebGL
// engine to get it.
export type MikoSprite = {
  id?: string;
  version?: string;
  name: string;
  /** Pixel grid side length; each frame string is size×size chars. */
  size: number;
  /** Frame rate for multi-frame sprites (default 10). */
  fps?: number;
  /** Hex colours; entry 0 by convention is transparent ("fff0"). 3/4/6/8
   *  digit hex all accepted (4/8 carry alpha). */
  palette: string[];
  /** One string per frame; charCode-97 indexes into `palette`. */
  frames: string[];
};
