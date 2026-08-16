import { Palette } from "types/palette";
import localStorageKeys from "constants/localStorageKeys";
import { get, getAll, remove, set } from "utils/localStorage";
import guid from "utils/guid";
import { defaultColors } from "data/palettes";

/**
 * The sentinel colour used for transparent pixels. It is always kept as the
 * first item of a palette and is never shown as a swatch.
 */
export const TRANSPARENT = "fff0";

/**
 * Black and transparent are always part of a palette: they cannot be
 * edited, removed or reordered.
 */
export const BLACK = "000";

const LOCKED_COLORS = [TRANSPARENT, BLACK];

export const isLockedColor = (hex: string): boolean =>
  LOCKED_COLORS.includes(hex);

/**
 * How many paintable swatches a palette holds. Always exactly this many:
 * transparent is not one of them, black is.
 */
export const MAX_COLORS = 10;

/**
 * The built in palette. It ships with the app rather than living in
 * localStorage, so it can never be edited away or deleted.
 */
export const DEFAULT_PALETTE_ID = "default";

export const defaultPalette: Palette = {
  id: DEFAULT_PALETTE_ID,
  name: "Default palette",
  items: defaultColors,
};

export const isDefaultPalette = (id?: string): boolean =>
  id === DEFAULT_PALETTE_ID;

const storageKey = (id: string): string =>
  `${localStorageKeys.PALETTE}-${id}`;

/**
 * Colours are stored without a leading "#" and may be 3, 4, 6 or 8 digits.
 * `<input type="color">` only speaks 6 digit hex, so convert both ways.
 */
const expand = (hex: string): string =>
  hex
    .split("")
    .map((char) => char + char)
    .join("");

export const toHexInput = (hex?: string): string => {
  const clean = (hex || "").replace("#", "").toLowerCase();

  if (clean.length === 3 || clean.length === 4) {
    return `#${expand(clean.slice(0, 3))}`;
  }

  if (clean.length >= 6) {
    return `#${clean.slice(0, 6)}`;
  }

  return "#000000";
};

export const fromHexInput = (value: string): string => {
  const clean = value.replace("#", "").toLowerCase();

  // Shorten to 3 digits when both digits of every pair match
  const isShortenable =
    clean.length === 6 &&
    clean[0] === clean[1] &&
    clean[2] === clean[3] &&
    clean[4] === clean[5];

  return isShortenable ? `${clean[0]}${clean[2]}${clean[4]}` : clean;
};

/**
 * Puts a palette into the shape the editor expects: the locked colours
 * first, no duplicates, and always exactly MAX_COLORS paintable swatches.
 * Short palettes are topped up from the built in colours.
 */
export const normalisePalette = (items: string[]): string[] => {
  const editable = items.filter(
    (item, index) => !isLockedColor(item) && items.indexOf(item) === index
  );

  const padding = defaultColors.filter(
    (color) => !isLockedColor(color) && !editable.includes(color)
  );

  return [
    ...LOCKED_COLORS,
    // The locked colours already cover one of the paintable slots
    ...[...editable, ...padding].slice(0, MAX_COLORS - 1),
  ];
};

/**
 * Storage
 */

export const getPalettes = (): Palette[] => {
  const items = getAll(localStorageKeys.PALETTE) || [];

  const saved = items
    .map((item) => {
      try {
        return JSON.parse(item) as Palette;
      } catch (e) {
        return null;
      }
    })
    .filter(
      (palette): palette is Palette => !!palette?.id && !isDefaultPalette(palette.id)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // The built in palette is always offered, and always first
  return [defaultPalette, ...saved];
};

/**
 * Saving over the built in palette creates a copy instead, so it stays
 * available untouched.
 */
export const savePalette = (palette: Palette): Palette => {
  const saved: Palette = {
    ...palette,
    id: !palette.id || isDefaultPalette(palette.id) ? guid() : palette.id,
    items: normalisePalette(palette.items),
  };

  set(storageKey(saved.id), JSON.stringify(saved));

  return saved;
};

export const createPalette = (name: string, items: string[]): Palette =>
  savePalette({
    id: guid(),
    name: name.trim() || "Untitled palette",
    items,
  });

export const deletePalette = (id: string): void => {
  if (isDefaultPalette(id)) {
    return;
  }

  remove(storageKey(id));
};

/**
 * The palette currently loaded in the editor, so it survives a reload.
 */

export const setActivePalette = (palette: Palette): void => {
  set(localStorageKeys.ACTIVE_PALETTE, JSON.stringify(palette));
};

export const getActivePalette = (): Palette | undefined => {
  const item = get(localStorageKeys.ACTIVE_PALETTE);

  if (!item) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(item) as Palette;
    return parsed?.items?.length ? parsed : undefined;
  } catch (e) {
    return undefined;
  }
};
