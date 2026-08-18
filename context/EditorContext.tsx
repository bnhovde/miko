import React, { useReducer, useEffect, useContext, useRef } from "react";
import { useMiko, type Tool } from "@boxworld/miko";

import { EditorState, ViewMode } from "types/editor";

import localStorageKeys from "constants/localStorageKeys";
import { set } from "utils/localStorage";

import { getDefaultHash, updateHashSheet } from "utils/hash";
import { InputEvent } from "types/input";
import { Sprite } from "types/sprite";
import { defaultColors } from "data/palettes";
import { Palette } from "types/palette";
import {
  TRANSPARENT,
  defaultPalette,
  getActivePalette,
  isDefaultPalette,
  isLockedColor,
  normalisePalette,
  savePalette,
  setActivePalette,
} from "utils/palette";
import guid from "utils/guid";
import { insertAtIndex, moveToIndex } from "utils/array";
import { Spritesheet, SpritesheetItem } from "types/sheet";
import { SpritePackage } from "types/package";
import html2canvas from "html2canvas";

/**
 * Reducer
 */

enum EditorActionTypes {
  INIT_SHEET = "INIT_SHEET",
  INIT_PACKAGE = "INIT_PACKAGE",
  SET_SPRITE_META = "SET_SPRITE_META",
  CHANGE_TOOL_SHEET = "CHANGE_TOOL_SHEET",
  START_DRAWING_SHEET = "START_DRAWING_SHEET",
  DRAG_DRAWING_SHEET = "DRAG_DRAWING_SHEET",
  COMMIT_DRAWING_SHEET = "COMMIT_DRAWING_SHEET",
  REPLACE_PALETTE = "REPLACE_PALETTE",
  LOAD_PALETTE = "LOAD_PALETTE",
  RENAME_PALETTE = "RENAME_PALETTE",
  DETACH_PALETTE = "DETACH_PALETTE",
  UPDATE_PACKAGE = "UPDATE_PACKAGE",
  SELECT_SPRITE_FOR_SHEET = "SELECT_SPRITE_FOR_SHEET",
  SELECT_SHEET_CELL = "SELECT_SHEET_CELL",
  ROTATE_SHEET_CELL = "ROTATE_SHEET_CELL",
  FLIP_SHEET_CELL = "FLIP_SHEET_CELL",
  SET_SHEET_VIEW_MODE = "SET_SHEET_VIEW_MODE",
}

type UiActionPayload = {
  value?: string;
  index?: number;
  oldIndex?: number;
  active?: boolean;
  frames?: string[];
  palette?: string[];
  grid?: string[];
  newHistory?: string[];
  items?: SpritesheetItem[];
  sprite?: Sprite;
  sprites?: Sprite[];
  spritesheet?: Spritesheet;
  spritePackage?: SpritePackage;
  paletteData?: Palette;
  viewMode?: ViewMode;
};

type UiAction = {
  type: EditorActionTypes;
  payload?: UiActionPayload;
};

/**
 * What this provider still keeps for itself. Everything to do with editing a
 * sprite — frames, colours, tools, drawing, undo — comes from useMiko, so it
 * is deliberately absent here; `spriteMeta` holds only the identity fields a
 * sprite carries that the editor package has no opinion about (id, version,
 * author, description).
 */
type ProviderState = Omit<
  EditorState,
  | "spriteData"
  | "colors"
  | "currentColor"
  | "currentTool"
  | "currentFrame"
  | "currentHash"
  | "unsavedHash"
  | "undoHistory"
  | "undoHistoryIndex"
  | "isDrawingSprite"
> & {
  spriteMeta?: Sprite;
};

/** The tool names this app passes around are plain strings; the hook's are a
 *  union, so they have to be checked at the boundary. */
const isTool = (value?: string): value is Tool =>
  value === "pencil" || value === "eraser" || value === "fill";

/**
 * Stores the working palette so it survives a reload. The colours themselves
 * are owned by useMiko now, so this only writes them out.
 */
const persistPalette = (
  colors: string[],
  paletteId: string | undefined,
  paletteName: string
) => {
  setActivePalette({
    id: paletteId || "",
    name: paletteName,
    items: colors,
  });
};

/**
 * The built in palette cannot be edited, so changing its colours turns the
 * working palette into an unsaved custom one.
 */
const detach = (state: ProviderState) => ({
  paletteId: isDefaultPalette(state.paletteId) ? undefined : state.paletteId,
  paletteName: isDefaultPalette(state.paletteId)
    ? "Custom palette"
    : state.paletteName,
});

/**
 * Which saved palette is in play belongs to the editor rather than to a
 * single sprite, so it survives loading another sprite, sheet or package.
 */
const keepPalette = (state: ProviderState) => ({
  paletteId: state.paletteId,
  paletteName: state.paletteName,
});

/**
 * Reducer
 */

export const uiReducer = (
  state: ProviderState,
  action: UiAction
): ProviderState => {
  switch (action.type) {
    // The sprite half of this editor — frames, palette, tools, drawing and
    // undo — now lives in @boxworld/miko's useMiko, so the same state machine
    // runs here and for anyone embedding the editor. What is left below is
    // what a package cannot own: spritesheets, packages, and which *saved*
    // palette the working colours came from.
    case EditorActionTypes.SET_SPRITE_META:
      return {
        ...state,
        spriteMeta: action.payload?.sprite,
      };
    case EditorActionTypes.CHANGE_TOOL_SHEET:
      return {
        ...state,
        currentSpriteTool: action.payload?.value || "paint",
      };
    case EditorActionTypes.START_DRAWING_SHEET:
      return {
        ...state,
        isDrawingSheet: !!action.payload?.active,
      };
    case EditorActionTypes.DRAG_DRAWING_SHEET:
      return {
        ...state,
        unsavedGrid: (action?.payload?.grid || [])[0] || state.currentGrid,
        sheetData: state.sheetData
          ? {
              ...state.sheetData,
              grid: action?.payload?.grid || [],
              items: action?.payload?.items || [],
              sprites: action?.payload?.sprites || [],
            }
          : undefined,
      };
    case EditorActionTypes.COMMIT_DRAWING_SHEET:
      const updatedGrid = action?.payload?.grid || state.sheetData?.grid || [];
      return {
        ...state,
        isDrawingSheet: false,
        sheetData: state.sheetData
          ? {
              ...state.sheetData,
              grid: updatedGrid,
              items: action?.payload?.items || state.sheetData.items,
              sprites: action?.payload?.sprites || state.sheetData.sprites,
            }
          : undefined,
        currentGrid: updatedGrid[0] || state.currentGrid,
        unsavedGrid: "",
      };
    // The colours themselves live in useMiko; what stays here is which saved
    // palette they came from, so "save" knows whether to update or fork.
    case EditorActionTypes.REPLACE_PALETTE:
      return {
        ...state,
        // A generated palette is no longer tied to a saved one
        paletteId: undefined,
        paletteName: action.payload?.value || "Custom palette",
      };

    case EditorActionTypes.LOAD_PALETTE:
      return {
        ...state,
        paletteId: action.payload?.paletteData?.id,
        paletteName: action.payload?.paletteData?.name || "Custom palette",
      };
    case EditorActionTypes.RENAME_PALETTE:
      return {
        ...state,
        ...detach(state),
        paletteName: action.payload?.value || "Custom palette",
      };
    case EditorActionTypes.DETACH_PALETTE:
      return {
        ...state,
        ...detach(state),
      };
    case EditorActionTypes.INIT_SHEET:
      return {
        ...initialProviderState,
        ...keepPalette(state),
        spriteMeta: action.payload?.spritesheet?.sprites?.[0],
        sheetData: action.payload?.spritesheet,
        currentGrid: action.payload?.spritesheet?.grid?.[0] || getDefaultHash(),
      };
    case EditorActionTypes.INIT_PACKAGE:
      return {
        ...initialProviderState,
        ...keepPalette(state),
        packageData: action.payload?.spritePackage,
      };
    case EditorActionTypes.UPDATE_PACKAGE:
      return {
        ...state,
        packageData: action.payload?.spritePackage,
      };
    case EditorActionTypes.SELECT_SPRITE_FOR_SHEET:
      return {
        ...state,
        currentSheetSprite: action.payload?.sprite,
        currentRotation: 0,
        currentFlip: undefined,
      };
    case EditorActionTypes.SELECT_SHEET_CELL:
      // When selecting a cell, load its sprite and transformation
      const selectedItemIndex = state.sheetData?.grid?.[0]?.charCodeAt(
        action.payload?.index || 0
      );
      const itemIdx = selectedItemIndex ? selectedItemIndex - 97 : -1;
      const selectedItem =
        itemIdx >= 0 ? state.sheetData?.items?.[itemIdx] : undefined;
      const selectedSprite = selectedItem
        ? state.sheetData?.sprites?.find((s) => s.id === selectedItem.spriteId)
        : undefined;

      return {
        ...state,
        currentSheetIndex: action.payload?.index || 0,
        currentSheetSprite: selectedSprite,
        currentRotation: selectedItem?.rotation || 0,
        currentFlip: selectedItem?.flip,
      };
    case EditorActionTypes.ROTATE_SHEET_CELL:
      // Rotate the sprite at the current sheet index
      if (state.currentSheetIndex === undefined || !state.sheetData) {
        return state;
      }

      const rotateGrid = [...(state.sheetData.grid || [])];
      const rotateGridString = rotateGrid[0] || getDefaultHash();
      const rotateItemCharCode = rotateGridString.charCodeAt(
        state.currentSheetIndex
      );
      const rotateItemIndex = rotateItemCharCode - 97;

      if (
        rotateItemIndex < 0 ||
        rotateItemIndex >= (state.sheetData.items?.length || 0)
      ) {
        return state;
      }

      const rotateItems = [...(state.sheetData.items || [])];
      const currentItem = rotateItems[rotateItemIndex];
      const newRotation = ((currentItem.rotation || 0) + 90) % 360;

      // Check if an item with this sprite+rotation+flip combo already exists
      const existingItemIndex = rotateItems.findIndex(
        (item) =>
          item.spriteId === currentItem.spriteId &&
          item.rotation === newRotation &&
          item.flip === currentItem.flip
      );

      let targetItemIndex: number;
      if (existingItemIndex > -1) {
        // Reuse existing item
        targetItemIndex = existingItemIndex;
      } else {
        // Create new item
        rotateItems.push({
          spriteId: currentItem.spriteId,
          rotation: newRotation,
          flip: currentItem.flip,
        });
        targetItemIndex = rotateItems.length - 1;
      }

      // Update grid to point current cell to target item
      const newGridString = rotateGridString
        .split("")
        .map((char, idx) =>
          idx === state.currentSheetIndex
            ? String.fromCharCode(targetItemIndex + 97)
            : char
        )
        .join("");

      const updatedSheetData: Spritesheet = {
        ...state.sheetData!,
        grid: [newGridString],
        items: rotateItems,
      };

      // Save to localStorage
      if (state.sheetData?.id) {
        set(
          `${localStorageKeys.SPRITESHEET}-${state.sheetData.id}`,
          JSON.stringify(updatedSheetData)
        );
      }

      return {
        ...state,
        sheetData: updatedSheetData,
        currentGrid: newGridString,
        currentRotation: newRotation,
      };
    case EditorActionTypes.FLIP_SHEET_CELL:
      // Flip the sprite at the current sheet index
      if (state.currentSheetIndex === undefined || !state.sheetData) {
        return state;
      }

      const flipGrid = [...(state.sheetData.grid || [])];
      const flipGridString = flipGrid[0] || getDefaultHash();
      const flipItemCharCode = flipGridString.charCodeAt(
        state.currentSheetIndex
      );
      const flipItemIndex = flipItemCharCode - 97;

      if (
        flipItemIndex < 0 ||
        flipItemIndex >= (state.sheetData.items?.length || 0)
      ) {
        return state;
      }

      const flipItems = [...(state.sheetData.items || [])];
      const currentFlipItem = flipItems[flipItemIndex];

      const currentFlip = currentFlipItem.flip;
      let newFlip: "x" | "y" | "xy" | "yx" | undefined;

      if (action.payload?.value === "x") {
        if (!currentFlip) newFlip = "x";
        else if (currentFlip === "y") newFlip = "xy";
        else if (currentFlip === "xy") newFlip = "y";
        else if (currentFlip === "x") newFlip = undefined;
        else if (currentFlip === "yx") newFlip = "y";
      } else if (action.payload?.value === "y") {
        if (!currentFlip) newFlip = "y";
        else if (currentFlip === "x") newFlip = "xy";
        else if (currentFlip === "xy") newFlip = "x";
        else if (currentFlip === "y") newFlip = undefined;
        else if (currentFlip === "yx") newFlip = "x";
      }

      // Check if an item with this sprite+rotation+flip combo already exists
      const existingFlipItemIndex = flipItems.findIndex(
        (item) =>
          item.spriteId === currentFlipItem.spriteId &&
          item.rotation === currentFlipItem.rotation &&
          item.flip === newFlip
      );

      let targetFlipItemIndex: number;
      if (existingFlipItemIndex > -1) {
        // Reuse existing item
        targetFlipItemIndex = existingFlipItemIndex;
      } else {
        // Create new item
        flipItems.push({
          spriteId: currentFlipItem.spriteId,
          rotation: currentFlipItem.rotation,
          flip: newFlip,
        });
        targetFlipItemIndex = flipItems.length - 1;
      }

      // Update grid to point current cell to target item
      const newFlipGridString = flipGridString
        .split("")
        .map((char, idx) =>
          idx === state.currentSheetIndex
            ? String.fromCharCode(targetFlipItemIndex + 97)
            : char
        )
        .join("");

      const updatedFlipSheetData: Spritesheet = {
        ...state.sheetData!,
        grid: [newFlipGridString],
        items: flipItems,
      };

      // Save to localStorage
      if (state.sheetData?.id) {
        set(
          `${localStorageKeys.SPRITESHEET}-${state.sheetData.id}`,
          JSON.stringify(updatedFlipSheetData)
        );
      }

      return {
        ...state,
        sheetData: updatedFlipSheetData,
        currentGrid: newFlipGridString,
        currentFlip: newFlip,
      };
    case EditorActionTypes.SET_SHEET_VIEW_MODE:
      return {
        ...state,
        sheetViewMode: action.payload?.viewMode || "2d",
      };
    default:
      return state;
  }
};

/**
 * Create context
 */

type ContextProps = {
  state: EditorState;
  initSprite: (sprite: Sprite) => void;
  initSheet: (spritesheet: Spritesheet) => void;
  initPackage: (spritePackage: SpritePackage) => void;
  onAddFrame: (frameIndex: number, frameHash?: string) => void;
  onChangeFrame: (frame: number) => void;
  onDeleteFrame: (frame: number) => void;
  onSelectColor: (newColor?: string) => void;
  onSelectTool: (newTool: string) => void;
  onSelectToolSheet: (newTool: string) => void;
  onDrawStartSheet: (e: InputEvent) => void;
  onTouchStartSheet: (e: InputEvent) => void;
  onDrawEnd: (e: InputEvent) => void;
  onDrawChange: (frameIndex: number, isFirstClick?: boolean) => void;
  onUndo: () => void;
  onRedo: () => void;
  /** Whether there is anything to step back to / forward to. History is kept
   *  per frame, so both reset when the current frame changes. */
  canUndo: boolean;
  canRedo: boolean;
  onDrawChangeSheet: (frameIndex: number, isFirstClick?: boolean) => void;
  onReplacePalette: (newPalette: string[], name?: string) => void;
  onLoadPalette: (palette: Palette) => void;
  onRenamePalette: (newName: string) => void;
  onUpdateColor: (index: number, hex: string) => void;
  onSavePalette: (name?: string, asNew?: boolean) => Palette | undefined;
  onReorderFrames: (oldIndex: number, newIndex: number) => void;
  onChangeSprite: (newSprite: Sprite) => void;
  onChangeName: (newName: string) => void;
  onChangeSize: (newSize: number) => void;
  onUpdatePackage: (spritePackage: SpritePackage) => void;
  onSelectSpriteForSheet: (sprite: Sprite) => void;
  onSelectSheetCell: (index: number) => void;
  onRotateSheetCell: () => void;
  onFlipSheetCell: (axis: "x" | "y") => void;
  onSetSheetViewMode: (mode: ViewMode) => void;
};

const initialProviderState: ProviderState = {
  debug: false,
  spriteMeta: undefined,
  sheetData: undefined,
  paletteId: defaultPalette.id,
  paletteName: defaultPalette.name,
  isDrawingSheet: false,
  currentSpriteTool: "paint",
  currentGrid: getDefaultHash(),
  unsavedGrid: "",
  currentSheetIndex: 0,
  currentSheetSprite: undefined,
  currentRotation: 0,
  currentFlip: undefined,
  sheetViewMode: "2d",
};

const initialState: ContextProps = {
  state: {
    ...initialProviderState,
    spriteData: undefined,
    colors: defaultPalette.items,
    isDrawingSprite: false,
    currentFrame: 0,
    currentColor: "000",
    undoHistory: [],
    undoHistoryIndex: 0,
    currentTool: "pencil",
    currentHash: getDefaultHash(),
    unsavedHash: "",
  },
  initSprite: () => null,
  initSheet: () => null,
  initPackage: () => null,
  onAddFrame: () => null,
  onChangeFrame: () => null,
  onDeleteFrame: () => null,
  onSelectColor: () => null,
  onSelectTool: () => null,
  onSelectToolSheet: () => null,
  onDrawStartSheet: () => null,
  onTouchStartSheet: () => null,
  onDrawChange: () => null,
  onDrawChangeSheet: () => null,
  onDrawEnd: () => null,
  onUndo: () => null,
  onRedo: () => null,
  canUndo: false,
  canRedo: false,
  onReplacePalette: () => null,
  onLoadPalette: () => null,
  onRenamePalette: () => null,
  onUpdateColor: () => null,
  onSavePalette: () => undefined,
  onReorderFrames: () => null,
  onChangeName: () => null,
  onChangeSize: () => null,
  onChangeSprite: () => null,
  onUpdatePackage: () => null,
  onSelectSpriteForSheet: () => null,
  onSelectSheetCell: () => null,
  onRotateSheetCell: () => null,
  onFlipSheetCell: () => null,
  onSetSheetViewMode: () => null,
};

const EditorContext = React.createContext<ContextProps>(initialState);

/**
 * Provider
 */

type ProviderProps = {
  children: JSX.Element[] | JSX.Element | string;
};

export const EditorProvider: React.FC<ProviderProps> = ({ children }) => {
  const [providerState, dispatch] = useReducer(uiReducer, initialProviderState);

  // Every sprite edit runs through the same state machine the published
  // editor uses. Committed edits come back here, where this app — and only
  // this app — decides they mean "write to localStorage and redraw the
  // favicon".
  const miko = useMiko({
    colors: defaultPalette.items,
    onChange: (sprite) => {
      const id = metaRef.current?.id;
      if (!id) return;

      set(
        `${localStorageKeys.SPRITE}-${id}`,
        JSON.stringify({ ...metaRef.current, ...sprite })
      );
      setFavicon();
    },
  });

  // The identity fields useMiko doesn't model, read inside onChange without
  // making the callback depend on a re-render.
  const metaRef = useRef<Sprite | undefined>(providerState.spriteMeta);
  metaRef.current = providerState.spriteMeta;

  /**
   * The shape every component in this app already reads. The sprite half is
   * projected out of useMiko, so there is exactly one source of truth for it.
   */
  const state: EditorState = {
    ...providerState,
    spriteData: providerState.spriteMeta
      ? ({ ...providerState.spriteMeta, ...miko.sprite } as Sprite)
      : undefined,
    colors: miko.colors,
    currentColor: miko.color,
    currentTool: miko.tool,
    currentFrame: miko.frame,
    currentHash: miko.hash,
    unsavedHash: miko.draft,
    isDrawingSprite: miko.isDrawing,
    undoHistory: miko.history,
    undoHistoryIndex: miko.historyIndex,
  };

  // Expose state to window for debugging
  useEffect(() => {
    if (state.debug) {
      (window as any).state = state;
    }
  }, [state]);

  // Restore the palette that was last used in the editor
  useEffect(() => {
    const palette = getActivePalette();

    if (palette) {
      miko.setColors(palette.items);
      dispatch({
        type: EditorActionTypes.LOAD_PALETTE,
        payload: {
          paletteData: palette,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSprite = (sprite: Sprite) => {
    dispatch({
      type: EditorActionTypes.SET_SPRITE_META,
      payload: { sprite },
    });
    miko.loadSprite(sprite);
  };

  const initSheet = (spritesheet: Spritesheet) => {
    dispatch({
      type: EditorActionTypes.INIT_SHEET,
      payload: {
        spritesheet,
      },
    });

    // The sheet editor edits the sheet's first sprite in place.
    const first = spritesheet.sprites?.[0];
    if (first) miko.loadSprite(first);
  };

  const initPackage = (spritePackage: SpritePackage) =>
    dispatch({
      type: EditorActionTypes.INIT_PACKAGE,
      payload: {
        spritePackage,
      },
    });

  const onAddFrame = (frameIndex: number, frameHash?: string) =>
    miko.addFrame(frameIndex, frameHash);

  const onChangeFrame = (frameIndex?: number) => miko.setFrame(frameIndex ?? 0);

  const onDeleteFrame = (frameIndex?: number) =>
    miko.deleteFrame(frameIndex ?? state.currentFrame);

  const onSelectColor = (newColor?: string) =>
    miko.setColor(newColor || TRANSPARENT);

  const onSelectTool = (newTool?: string) =>
    miko.setTool(isTool(newTool) ? newTool : "pencil");

  const onSelectToolSheet = (newTool?: string) =>
    dispatch({
      type: EditorActionTypes.CHANGE_TOOL_SHEET,
      payload: {
        value: newTool,
      },
    });

  const onTouchStartSheet = (event: InputEvent) => {
    dispatch({
      type: EditorActionTypes.START_DRAWING_SHEET,
      payload: {
        active: true,
      },
    });
  };

  const onDrawStartSheet = (event: InputEvent) => {
    event.preventDefault();

    // Skip action for right click
    if ("button" in event && event.button === 2) {
      return;
    }

    dispatch({
      type: EditorActionTypes.START_DRAWING_SHEET,
      payload: {
        active: true,
      },
    });
  };

  const onDrawChange = (frameIndex: number, isFirstClick?: boolean) => {
    // The hook decides the rest: `draw` ignores everything outside a stroke,
    // and the fill tool acts only on the click that began one.
    if (isFirstClick) {
      miko.startDrawing(frameIndex);
    } else {
      miko.draw(frameIndex);
    }
  };

  const onDrawChangeSheet = (frameIndex: number, isFirstClick?: boolean) => {
    const isFillTool = state.currentSpriteTool === "fill";

    // For fill tool, only process on first click
    if (isFillTool && !isFirstClick) {
      return;
    }

    if (!state.isDrawingSheet && !isFirstClick) {
      return;
    }

    if (isFirstClick) {
      dispatch({
        type: EditorActionTypes.START_DRAWING_SHEET,
        payload: {
          active: true,
        },
      });
    }

    // Use currentSheetSprite if available, otherwise use the current spriteData
    const spriteToPlace = state.currentSheetSprite || state.spriteData;

    // Update sprite hash array
    const { newHash, newGrid, newItems, newSprites } = updateHashSheet(
      frameIndex,
      state.unsavedGrid || state.currentGrid || getDefaultHash(),
      state.sheetData?.grid || [],
      state.sheetData?.items || [],
      state.sheetData?.sprites || [],
      spriteToPlace,
      state.currentSpriteTool || "",
      state.currentRotation,
      state.currentFlip
    );

    dispatch({
      type: EditorActionTypes.DRAG_DRAWING_SHEET,
      payload: {
        value: newHash,
        grid: newGrid,
        items: newItems,
        sprites: newSprites,
      },
    });
  };

  const onDrawEnd = (event: InputEvent) => {
    // Prevent default if not touch event
    if (!(typeof event === "object" && "touches" in event)) {
      event.preventDefault();
    }

    // Ignore if not drawing
    if (!state.isDrawingSprite && !state.isDrawingSheet) {
      return;
    }

    // The sprite half — history, palette compaction and persistence — is the
    // hook's commit, which calls back into onChange above.
    miko.endDrawing();

    // Handle sheet draw end
    if (state.isDrawingSheet) {
      // Store sheet in localstorage
      if (state.sheetData) {
        set(
          `${localStorageKeys.SPRITESHEET}-${state.sheetData.id}`,
          JSON.stringify(state.sheetData)
        );
      }

      dispatch({
        type: EditorActionTypes.COMMIT_DRAWING_SHEET,
        payload: {
          grid: state.sheetData?.grid,
          items: state.sheetData?.items,
          sprites: state.sheetData?.sprites,
        },
      });
    }
  };

  const onReplacePalette = (newPalette: string[], name?: string) => {
    const colors = normalisePalette(newPalette);
    miko.setColors(colors);
    persistPalette(colors, undefined, name || "Custom palette");
    dispatch({
      type: EditorActionTypes.REPLACE_PALETTE,
      payload: {
        value: name,
      },
    });
  };

  const onLoadPalette = (palette: Palette) => {
    const colors = normalisePalette(palette.items);
    miko.setColors(colors);
    persistPalette(colors, palette.id, palette.name || "Custom palette");
    dispatch({
      type: EditorActionTypes.LOAD_PALETTE,
      payload: {
        paletteData: palette,
      },
    });
  };

  const onRenamePalette = (newName: string) => {
    persistPalette(
      state.colors,
      detach(providerState).paletteId,
      newName || "Custom palette"
    );
    dispatch({
      type: EditorActionTypes.RENAME_PALETTE,
      payload: {
        value: newName,
      },
    });
  };

  const onUpdateColor = (index: number, hex: string) => {
    const replaced = state.colors[index];
    // Transparent and black are fixed — the hook enforces this too, but the
    // palette must not be persisted as if something had changed.
    if (replaced === undefined || isLockedColor(replaced)) return;

    const colors = state.colors.map((color, i) => (i === index ? hex : color));
    miko.updateColor(index, hex);
    persistPalette(
      colors,
      detach(providerState).paletteId,
      detach(providerState).paletteName
    );
    dispatch({ type: EditorActionTypes.DETACH_PALETTE });
  };

  /**
   * Persists the palette currently in the editor. Without `asNew` an already
   * saved palette is updated in place, otherwise a copy is created.
   */
  const onSavePalette = (name?: string, asNew?: boolean) => {
    const paletteName = (name || state.paletteName || "").trim();
    const palette = savePalette({
      id: asNew || !state.paletteId ? guid() : state.paletteId,
      name: paletteName || "Untitled palette",
      items: state.colors,
    });

    dispatch({
      type: EditorActionTypes.LOAD_PALETTE,
      payload: {
        paletteData: palette,
      },
    });

    return palette;
  };

  const onReorderFrames = (oldIndex: number, newIndex: number) =>
    miko.reorderFrames(oldIndex, newIndex);

  const onChangeName = (newName: string) => miko.setName(newName);

  // Resizing re-lays every frame onto the new grid, keeping the pixels that
  // still fit — the hook does this and reports the result through onChange,
  // which is what writes it to storage.
  const onChangeSize = (newSize: number) => miko.setSize(newSize);

  const onChangeSprite = (newSprite: Sprite) => {
    dispatch({
      type: EditorActionTypes.SET_SPRITE_META,
      payload: { sprite: newSprite },
    });
    miko.loadSprite(newSprite);
  };

  const onUpdatePackage = (spritePackage: SpritePackage) => {
    dispatch({
      type: EditorActionTypes.UPDATE_PACKAGE,
      payload: {
        spritePackage,
      },
    });
  };

  const setFavicon = async () => {
    const element = document.getElementById("editor-canvas");
    const favicon = document.getElementById("favicon") as HTMLLinkElement;
    if (!element || !favicon) {
      return;
    }

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 1,
    });

    const data = canvas.toDataURL("image/x-icon");
    favicon.href = data;
  };

  const onSelectSpriteForSheet = (sprite: Sprite) => {
    dispatch({
      type: EditorActionTypes.SELECT_SPRITE_FOR_SHEET,
      payload: {
        sprite,
      },
    });
  };

  const onSelectSheetCell = (index: number) => {
    dispatch({
      type: EditorActionTypes.SELECT_SHEET_CELL,
      payload: {
        index,
      },
    });
  };

  const onRotateSheetCell = () => {
    dispatch({
      type: EditorActionTypes.ROTATE_SHEET_CELL,
    });
  };

  const onFlipSheetCell = (axis: "x" | "y") => {
    dispatch({
      type: EditorActionTypes.FLIP_SHEET_CELL,
      payload: {
        value: axis,
      },
    });
  };

  const onSetSheetViewMode = (mode: ViewMode) => {
    dispatch({
      type: EditorActionTypes.SET_SHEET_VIEW_MODE,
      payload: {
        viewMode: mode,
      },
    });
  };

  return (
    <EditorContext.Provider
      value={{
        state,
        initSprite,
        initSheet,
        initPackage,
        onAddFrame,
        onDeleteFrame,
        onChangeFrame,
        onSelectColor,
        onSelectTool,
        onSelectToolSheet,
        onTouchStartSheet,
        onDrawStartSheet,
        onDrawChange,
        onDrawChangeSheet,
        onDrawEnd,
        onUndo: miko.undo,
        onRedo: miko.redo,
        canUndo: miko.canUndo,
        canRedo: miko.canRedo,
        onReplacePalette,
        onLoadPalette,
        onRenamePalette,
        onUpdateColor,
        onSavePalette,
        onReorderFrames,
        onChangeName,
        onChangeSize,
        onChangeSprite,
        onUpdatePackage,
        onSelectSpriteForSheet,
        onSelectSheetCell,
        onRotateSheetCell,
        onFlipSheetCell,
        onSetSheetViewMode,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;
