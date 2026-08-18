// The whole editor, one component.
export { Miko, type MikoProps } from "./Miko";

// Or compose it yourself.
export { MikoProvider, useMikoContext, type MikoProviderProps } from "./MikoContext";
export { MikoCanvas, type MikoCanvasProps } from "./components/MikoCanvas";
export { MikoToolbar, type MikoToolbarProps } from "./components/MikoToolbar";
export { MikoPalette, type MikoPaletteProps } from "./components/MikoPalette";
export { MikoTimeline, type MikoTimelineProps } from "./components/MikoTimeline";
export { MikoPreview, type MikoPreviewProps } from "./components/MikoPreview";

// Or bring your own UI entirely.
export {
  useMiko,
  mikoReducer,
  blankSprite,
  currentHash,
  type MikoApi,
  type MikoState,
  type UseMikoOptions,
} from "./useMiko";

// The pure editing primitives underneath all of it.
export {
  floodFill,
  updateHash,
  getHashArray,
  getDefaultHash,
  getRandomPalette,
  getRandomColor,
  normalisePalette,
  optimiseFrames,
  firstVisibleColor,
  keepOrResetColor,
  isLockedColor,
  insertAtIndex,
  moveToIndex,
  TRANSPARENT,
  LOCKED_COLORS,
  MAX_COLORS,
  DEFAULT_COLORS,
  type Tool,
} from "./editing";

export type { MikoSprite } from "./types";
