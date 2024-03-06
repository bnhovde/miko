import React, { useReducer, useEffect, useContext } from "react";

import { EditorState } from "types/editor";

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
import { insertAtIndex, moveToIndex } from "utils/array";
import { Spritesheet, SpritesheetItem } from "types/sheet";

/**
 * Reducer
 */

enum EditorActionTypes {
  INIT_SPRITE = "INIT_SPRITE",
  INIT_SHEET = "INIT_SHEET",
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
  REORDER_FRAMES = "REORDER_FRAMES",
  CHANGE_NAME = "CHANGE_NAME",
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
};

type UiAction = {
  type: EditorActionTypes;
  payload?: UiActionPayload;
};

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
        currentTool: "pencil",
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
        unsavedGrid: action.payload?.value || "",
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
      return {
        ...state,
        isDrawingSheet: false,
        // sheetData: state.sheetData
        //   ? {
        //       ...state.sheetData,
        //       grid: action?.payload?.frames || [],
        //     }
        //   : undefined,
        // undoHistory: action.payload?.newHistory || [],
        // undoHistoryIndex: (action.payload?.newHistory || []).length,
        // currentHash:
        //   (action?.payload?.frames || [])[state.currentFrame || 0] || "",
        // unsavedHash: "",
      };
    case EditorActionTypes.REPLACE_PALETTE:
      return {
        ...state,
        colors: action.payload?.palette || defaultColors,
        currentColor: "000",
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
        editorType: "sheet",
        spriteData: spriteData,
        sheetData: action.payload?.spritesheet,
        currentHash: spriteData?.frames[0] || "",
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
  onAddFrame: (frameIndex: number, frameHash?: string) => void;
  onChangeFrame: (frame: number) => void;
  onDeleteFrame: (frame: number) => void;
  onSelectColor: (newColor?: string) => void;
  onSelectTool: (newTool: string) => void;
  onSelectToolSheet: (newTool: string) => void;
  onDrawStart: (e: InputEvent) => void;
  onDrawStartSheet: (e: InputEvent) => void;
  onTouchStart: (e: InputEvent) => void;
  onTouchStartSheet: (e: InputEvent) => void;
  onDrawEnd: (e: InputEvent) => void;
  onDrawChange: (frameIndex: number) => void;
  onDrawChangeSheet: (frameIndex: number) => void;
  onReplacePalette: (newPalette: string[]) => void;
  onReorderFrames: (oldIndex: number, newIndex: number) => void;
  onChangeSprite: (newSprite: Sprite) => void;
  onChangeName: (newName: string) => void;
};

const initialState: ContextProps = {
  state: {
    editorType: "sprite",
    debug: false,
    spriteData: undefined,
    sheetData: undefined,
    colors: defaultColors,
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
  },
  initSprite: () => null,
  initSheet: () => null,
  onAddFrame: () => null,
  onChangeFrame: () => null,
  onDeleteFrame: () => null,
  onSelectColor: () => null,
  onSelectTool: () => null,
  onSelectToolSheet: () => null,
  onDrawStart: () => null,
  onDrawStartSheet: () => null,
  onTouchStart: () => null,
  onTouchStartSheet: () => null,
  onDrawChange: () => null,
  onDrawChangeSheet: () => null,
  onDrawEnd: () => null,
  onReplacePalette: () => null,
  onReorderFrames: () => null,
  onChangeName: () => null,
  onChangeSprite: () => null,
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

  const onTouchStart = (event: InputEvent) => {
    dispatch({
      type: EditorActionTypes.START_DRAWING_SPRITE,
      payload: {
        active: true,
      },
    });
  };

  const onTouchStartSheet = (event: InputEvent) => {
    dispatch({
      type: EditorActionTypes.START_DRAWING_SHEET,
      payload: {
        active: true,
      },
    });
  };

  const onDrawStart = (event: InputEvent) => {
    event.preventDefault();

    // Skip action for right click
    if ("button" in event && event.button === 2) {
      return;
    }

    dispatch({
      type: EditorActionTypes.START_DRAWING_SPRITE,
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

  const onDrawChange = (frameIndex: number) => {
    if (!state.isDrawingSprite) {
      return;
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

  const onDrawChangeSheet = (frameIndex: number) => {
    if (!state.isDrawingSheet) {
      return;
    }

    // Update sprite hash array
    const { newHash, newGrid, newItems, newSprites } = updateHashSheet(
      frameIndex,
      state.unsavedGrid || state.currentHash || getDefaultHash(),
      state.sheetData?.grid || [],
      state.sheetData?.items || [],
      state.sheetData?.sprites || [],
      state.spriteData,
      state.currentSpriteTool || ""
    );

    console.log("onDrawChangeSheet", newHash);

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
    event.preventDefault();

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
      dispatch({
        type: EditorActionTypes.COMMIT_DRAWING_SHEET,
        // payload: {
        //   newHistory: [state.currentHash, state.unsavedHash],
        //   frames: [state.currentHash, state.unsavedHash],
        // },
      });
    }
  };

  const onReplacePalette = (newPalette: string[]) => {
    dispatch({
      type: EditorActionTypes.REPLACE_PALETTE,
      payload: {
        palette: newPalette,
      },
    });
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

  const onChangeSprite = (newSprite: Sprite) => {
    dispatch({
      type: EditorActionTypes.CHANGE_SPRITE,
      payload: {
        sprite: newSprite,
      },
    });
  };

  return (
    <EditorContext.Provider
      value={{
        state,
        initSprite,
        initSheet,
        onAddFrame,
        onDeleteFrame,
        onChangeFrame,
        onSelectColor,
        onSelectTool,
        onSelectToolSheet,
        onTouchStart,
        onTouchStartSheet,
        onDrawStart,
        onDrawStartSheet,
        onDrawChange,
        onDrawChangeSheet,
        onDrawEnd,
        onReplacePalette,
        onReorderFrames,
        onChangeName,
        onChangeSprite,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;
