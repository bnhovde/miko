import React, { useReducer, useEffect, useContext } from "react";

import { EditorState, ViewMode } from "types/editor";

import localStorageKeys from "constants/localStorageKeys";
import { set } from "utils/localStorage";

import {
  getDefaultHash,
  optimiseFrames,
  updateHash,
  updateHashSheet,
} from "utils/hash";
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
  INIT_SPRITE = "INIT_SPRITE",
  INIT_SHEET = "INIT_SHEET",
  INIT_PACKAGE = "INIT_PACKAGE",
  CHANGE_SPRITE = "CHANGE_SPRITE",
  ADD_FRAME = "ADD_FRAME",
  DELETE_FRAME = "DELETE_FRAME",
  CHANGE_FRAME = "CHANGE_FRAME",
  CHANGE_COLOR = "CHANGE_COLOR",
  CHANGE_TOOL = "CHANGE_TOOL",
  CHANGE_TOOL_SHEET = "CHANGE_TOOL_SHEET",
  START_DRAWING_SPRITE = "START_DRAWING_SPRITE",
  START_DRAWING_SHEET = "START_DRAWING_SHEET",
  DRAG_DRAWING = "DRAG_DRAWING",
  DRAG_DRAWING_SHEET = "DRAG_DRAWING_SHEET",
  COMMIT_DRAWING = "COMMIT_DRAWING",
  COMMIT_DRAWING_SHEET = "COMMIT_DRAWING_SHEET",
  REPLACE_PALETTE = "REPLACE_PALETTE",
  LOAD_PALETTE = "LOAD_PALETTE",
  RENAME_PALETTE = "RENAME_PALETTE",
  UPDATE_COLOR = "UPDATE_COLOR",
  REORDER_FRAMES = "REORDER_FRAMES",
  CHANGE_NAME = "CHANGE_NAME",
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
 * The first colour that is actually paintable, used whenever the selected
 * swatch disappears from under the user.
 */
const firstVisibleColor = (colors: string[]): string =>
  colors.find((color) => color !== TRANSPARENT) || "000";

/**
 * Stores the working palette so it survives a reload, and returns the
 * palette part of the new state.
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

  return { colors, paletteId, paletteName };
};

/**
 * The built in palette cannot be edited, so changing its colours turns the
 * working palette into an unsaved custom one.
 */
const detach = (state: EditorState) => ({
  paletteId: isDefaultPalette(state.paletteId) ? undefined : state.paletteId,
  paletteName: isDefaultPalette(state.paletteId)
    ? "Custom palette"
    : state.paletteName,
});

/**
 * Keeps painting with the selected colour when the new palette still holds
 * it, otherwise falls back to the first paintable swatch.
 */
const keepOrResetColor = (colors: string[], currentColor: string): string =>
  colors.includes(currentColor) && currentColor !== TRANSPARENT
    ? currentColor
    : firstVisibleColor(colors);

/**
 * The palette belongs to the editor rather than to a single sprite, so it
 * survives loading another sprite, sheet or package.
 */
const keepPalette = (state: EditorState) => ({
  colors: state.colors,
  paletteId: state.paletteId,
  paletteName: state.paletteName,
  currentColor: state.currentColor,
});

/**
 * Reducer
 */

export const uiReducer = (
  state: EditorState,
  action: UiAction
): EditorState => {
  switch (action.type) {
    case EditorActionTypes.INIT_SPRITE:
      return {
        ...initialState.state,
        ...keepPalette(state),
        spriteData: action.payload?.sprite,
        currentHash: action.payload?.sprite?.frames[0] || "",
      };
    case EditorActionTypes.CHANGE_SPRITE:
      return {
        ...state,
        spriteData: action.payload?.sprite,
        currentHash: action.payload?.sprite?.frames[0] || "",
      };
    case EditorActionTypes.CHANGE_FRAME:
      return {
        ...state,
        currentFrame: action.payload?.index || 0,
        currentHash:
          state?.spriteData?.frames[action.payload?.index || 0] || "",
        unsavedHash: "",
        undoHistory: [],
        undoHistoryIndex: 0,
      };
    case EditorActionTypes.ADD_FRAME:
      return {
        ...state,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: insertAtIndex<string>(
                state.spriteData?.frames || [],
                (action.payload?.index !== undefined
                  ? action.payload?.index
                  : state.spriteData?.frames?.length || 0) + 1,
                action.payload?.value || getDefaultHash()
              ),
            }
          : undefined,
        currentFrame:
          (action.payload?.index !== undefined
            ? action.payload?.index
            : state.spriteData?.frames?.length || 0) + 1,
        currentHash: action.payload?.value || getDefaultHash(),
        unsavedHash: "",
        undoHistory: [],
        undoHistoryIndex: 0,
      };
    case EditorActionTypes.DELETE_FRAME:
      const newFrames = [
        ...(state.spriteData?.frames || []).filter(
          (_hash: string, index: number) => index !== action.payload?.index
        ),
      ];

      const newFrameIndex =
        action.payload?.index !== undefined
          ? Math.max(action.payload?.index - 1, 0)
          : state.spriteData?.frames?.length || 0;

      return {
        ...state,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: newFrames,
            }
          : undefined,
        currentFrame: newFrameIndex,
        currentHash: state?.spriteData?.frames[newFrameIndex] || "",
        unsavedHash: "",
        undoHistory: [],
        undoHistoryIndex: 0,
      };
    case EditorActionTypes.CHANGE_COLOR:
      return {
        ...state,
        currentColor: action.payload?.value || "fff0",
        currentTool:
          state.currentTool === "eraser" ? "pencil" : state.currentTool,
      };
    case EditorActionTypes.CHANGE_TOOL:
      return {
        ...state,
        currentTool: action.payload?.value || "pencil",
      };
    case EditorActionTypes.CHANGE_TOOL_SHEET:
      return {
        ...state,
        currentSpriteTool: action.payload?.value || "paint",
      };
    case EditorActionTypes.START_DRAWING_SPRITE:
      return {
        ...state,
        isDrawingSprite: !!action.payload?.active,
      };
    case EditorActionTypes.START_DRAWING_SHEET:
      return {
        ...state,
        isDrawingSheet: !!action.payload?.active,
      };
    case EditorActionTypes.DRAG_DRAWING:
      return {
        ...state,
        unsavedHash: action.payload?.value || "",
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              palette: action?.payload?.palette || [],
            }
          : undefined,
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
    case EditorActionTypes.COMMIT_DRAWING:
      return {
        ...state,
        isDrawingSprite: false,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: action?.payload?.frames || [],
              palette: action?.payload?.palette || [],
            }
          : undefined,
        undoHistory: action.payload?.newHistory || [],
        undoHistoryIndex: (action.payload?.newHistory || []).length,
        currentHash:
          (action?.payload?.frames || [])[state.currentFrame || 0] || "",
        unsavedHash: "",
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
    case EditorActionTypes.REPLACE_PALETTE:
      const replacedColors = normalisePalette(
        action.payload?.palette || defaultColors
      );
      return {
        ...state,
        // A generated palette is no longer tied to a saved one
        ...persistPalette(
          replacedColors,
          undefined,
          action.payload?.value || "Custom palette"
        ),
        currentColor: firstVisibleColor(replacedColors),
      };

    case EditorActionTypes.LOAD_PALETTE:
      const loadedColors = normalisePalette(
        action.payload?.paletteData?.items || defaultColors
      );
      return {
        ...state,
        ...persistPalette(
          loadedColors,
          action.payload?.paletteData?.id,
          action.payload?.paletteData?.name || "Custom palette"
        ),
        currentColor: keepOrResetColor(loadedColors, state.currentColor),
      };
    case EditorActionTypes.RENAME_PALETTE:
      return {
        ...state,
        ...persistPalette(
          state.colors,
          detach(state).paletteId,
          action.payload?.value || "Custom palette"
        ),
      };
    case EditorActionTypes.UPDATE_COLOR:
      const updatedIndex = action.payload?.index ?? -1;
      const updatedColor = action.payload?.value || "000";
      const replacedColor = state.colors[updatedIndex];

      // Transparent and black are fixed
      if (
        updatedIndex < 0 ||
        replacedColor === undefined ||
        isLockedColor(replacedColor)
      ) {
        return state;
      }

      return {
        ...state,
        ...persistPalette(
          state.colors.map((color, index) =>
            index === updatedIndex ? updatedColor : color
          ),
          detach(state).paletteId,
          detach(state).paletteName
        ),
        // Keep painting with the swatch that was just edited
        currentColor:
          state.currentColor === replacedColor
            ? updatedColor
            : state.currentColor,
      };
    case EditorActionTypes.REORDER_FRAMES:
      const newIndex =
        action.payload?.index !== undefined
          ? action.payload?.index
          : state.spriteData?.frames?.length || 0;

      const oldIndex =
        action.payload?.oldIndex !== undefined
          ? action.payload?.oldIndex
          : state.spriteData?.frames?.length || 0;

      const reorderedFrames = moveToIndex<string>(
        state.spriteData?.frames || [],
        oldIndex,
        newIndex
      );
      return {
        ...state,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: reorderedFrames,
            }
          : undefined,
        currentFrame: newIndex,
        currentHash: reorderedFrames[newIndex],
        unsavedHash: "",
        undoHistory: [],
        undoHistoryIndex: 0,
      };
    case EditorActionTypes.CHANGE_NAME:
      return {
        ...state,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              name: action?.payload?.value || "Blank frame",
            }
          : undefined,
      };
    case EditorActionTypes.INIT_SHEET:
      const spriteData = action.payload?.spritesheet?.sprites?.[0];
      return {
        ...initialState.state,
        ...keepPalette(state),
        spriteData: spriteData,
        sheetData: action.payload?.spritesheet,
        currentHash: spriteData?.frames[0] || "",
        currentGrid: action.payload?.spritesheet?.grid?.[0] || getDefaultHash(),
      };
    case EditorActionTypes.INIT_PACKAGE:
      return {
        ...initialState.state,
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

const initialState: ContextProps = {
  state: {
    debug: false,
    spriteData: undefined,
    sheetData: undefined,
    colors: defaultPalette.items,
    paletteId: defaultPalette.id,
    paletteName: defaultPalette.name,
    isDrawingSprite: false,
    isDrawingSheet: false,
    currentFrame: 0,
    currentColor: "000",
    undoHistory: [],
    undoHistoryIndex: 0,
    currentTool: "pencil",
    currentSpriteTool: "paint",
    currentHash: getDefaultHash(),
    currentGrid: getDefaultHash(),
    unsavedHash: "",
    unsavedGrid: "",
    currentSheetIndex: 0,
    currentSheetSprite: undefined,
    currentRotation: 0,
    currentFlip: undefined,
    sheetViewMode: "2d",
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
  const [state, dispatch] = useReducer(uiReducer, initialState.state);

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
      dispatch({
        type: EditorActionTypes.LOAD_PALETTE,
        payload: {
          paletteData: palette,
        },
      });
    }
  }, []);

  const getCurrentFrameHash = () => {
    return state.spriteData?.frames[state.currentFrame] || getDefaultHash();
  };

  const getUpdatedSpriteFrames = (editedIndex: number, newHash: string) => {
    const hasFrames = state.spriteData && state.spriteData?.frames?.length > 0;

    if (hasFrames) {
      return state.spriteData?.frames.map((frame: string, index: number) => {
        if (index === editedIndex) {
          return newHash;
        }

        return frame;
      });
    } else {
      return [newHash];
    }
  };

  const initSprite = (sprite: Sprite) =>
    dispatch({
      type: EditorActionTypes.INIT_SPRITE,
      payload: {
        sprite,
      },
    });

  const initSheet = (spritesheet: Spritesheet) =>
    dispatch({
      type: EditorActionTypes.INIT_SHEET,
      payload: {
        spritesheet,
      },
    });

  const initPackage = (spritePackage: SpritePackage) =>
    dispatch({
      type: EditorActionTypes.INIT_PACKAGE,
      payload: {
        spritePackage,
      },
    });

  const onAddFrame = (frameIndex: number, frameHash?: string) =>
    dispatch({
      type: EditorActionTypes.ADD_FRAME,
      payload: {
        value: frameHash,
        index: frameIndex,
      },
    });

  const onChangeFrame = (frameIndex?: number) =>
    dispatch({
      type: EditorActionTypes.CHANGE_FRAME,
      payload: {
        index: frameIndex,
      },
    });

  const onDeleteFrame = (frameIndex?: number) =>
    dispatch({
      type: EditorActionTypes.DELETE_FRAME,
      payload: {
        index: frameIndex,
      },
    });

  const onSelectColor = (newColor?: string) =>
    dispatch({
      type: EditorActionTypes.CHANGE_COLOR,
      payload: {
        value: newColor,
      },
    });

  const onSelectTool = (newTool?: string) =>
    dispatch({
      type: EditorActionTypes.CHANGE_TOOL,
      payload: {
        value: newTool,
      },
    });

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
    const isFillTool = state.currentTool === "fill";

    // For fill tool, only process on first click
    if (isFillTool && !isFirstClick) {
      return;
    }

    if (!state.isDrawingSprite && !isFirstClick) {
      console.log("not drawing");
      return;
    }

    if (isFirstClick) {
      console.log("START_DRAWING_SPRITE");
      dispatch({
        type: EditorActionTypes.START_DRAWING_SPRITE,
        payload: {
          active: true,
        },
      });
    }

    const { newHash, newPalette } = updateHash(
      frameIndex,
      state.unsavedHash || state.currentHash || getDefaultHash(),
      state.spriteData?.palette || [],
      state.currentColor || "",
      state.currentTool || ""
    );

    dispatch({
      type: EditorActionTypes.DRAG_DRAWING,
      payload: {
        value: newHash,
        palette: newPalette,
      },
    });
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

    // Handle sprite draw end
    if (state.isDrawingSprite) {
      // Handle history changes
      const isFirstPaint = state.undoHistory.length === 0;
      const isChangingHistory =
        state.undoHistoryIndex !== state.undoHistory.length;
      let newHistory = [...state.undoHistory, state.unsavedHash];

      if (isFirstPaint) {
        newHistory = [getCurrentFrameHash() || "", state.unsavedHash];
      }

      if (isChangingHistory) {
        newHistory = [
          ...state.undoHistory.slice(0, state.undoHistoryIndex + 1),
          state.unsavedHash,
        ];
      }

      // Get updated frames including the current change
      const updatedFrames =
        getUpdatedSpriteFrames(state.currentFrame, state.unsavedHash) || [];

      // TO-DO: Update palette and hashes by most used colors
      const { newFrames, newPalette } = optimiseFrames(
        updatedFrames,
        state.spriteData?.palette || []
      );

      // Store sprite in localstorage
      set(
        `${localStorageKeys.SPRITE}-${state.spriteData?.id}`,
        JSON.stringify({
          ...state.spriteData,
          frames: newFrames,
          palette: newPalette,
        })
      );

      // Update favicon
      setFavicon();

      dispatch({
        type: EditorActionTypes.COMMIT_DRAWING,
        payload: {
          newHistory,
          frames: newFrames,
          palette: newPalette,
        },
      });
    }

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
    dispatch({
      type: EditorActionTypes.REPLACE_PALETTE,
      payload: {
        palette: newPalette,
        value: name,
      },
    });
  };

  const onLoadPalette = (palette: Palette) => {
    dispatch({
      type: EditorActionTypes.LOAD_PALETTE,
      payload: {
        paletteData: palette,
      },
    });
  };

  const onRenamePalette = (newName: string) => {
    dispatch({
      type: EditorActionTypes.RENAME_PALETTE,
      payload: {
        value: newName,
      },
    });
  };

  const onUpdateColor = (index: number, hex: string) => {
    dispatch({
      type: EditorActionTypes.UPDATE_COLOR,
      payload: {
        index,
        value: hex,
      },
    });
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

  const onReorderFrames = (oldIndex: number, newIndex: number) => {
    dispatch({
      type: EditorActionTypes.REORDER_FRAMES,
      payload: {
        index: newIndex,
        oldIndex,
      },
    });
  };

  const onChangeName = (newName: string) => {
    dispatch({
      type: EditorActionTypes.CHANGE_NAME,
      payload: {
        value: newName,
      },
    });
  };

  const onChangeSize = (newSize: number) => {
    if (!state.spriteData) return;
    const oldSize = state.spriteData.size;
    const resizeHash = (hash: string): string => {
      let result = "";
      for (let row = 0; row < newSize; row++) {
        for (let col = 0; col < newSize; col++) {
          result +=
            row < oldSize && col < oldSize ? hash[row * oldSize + col] : "a";
        }
      }
      return result;
    };
    const newFrames = state.spriteData.frames.map(resizeHash);
    const newSprite = { ...state.spriteData, size: newSize, frames: newFrames };
    set(
      `${localStorageKeys.SPRITE}-${state.spriteData.id}`,
      JSON.stringify(newSprite)
    );
    dispatch({
      type: EditorActionTypes.CHANGE_SPRITE,
      payload: { sprite: newSprite },
    });
  };

  const onChangeSprite = (newSprite: Sprite) => {
    dispatch({
      type: EditorActionTypes.CHANGE_SPRITE,
      payload: {
        sprite: newSprite,
      },
    });
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
