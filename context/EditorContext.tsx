import React, { useReducer, useEffect, useContext } from "react";

import { EditorState } from "types/editor";

import localStorageKeys from "constants/localStorageKeys";
import { get, set } from "utils/localStorage";
import guid from "utils/guid";

import { getDefaultHash, getHashArray, updateHash } from "utils/hash";
import { InputEvent } from "types/input";
import { Sprite } from "types/sprite";
import { defaultColors } from "data/palettes";
import { insertAtIndex, moveToIndex } from "utils/array";

/**
 * Reducer
 */

enum EditorActionTypes {
  LOAD_SPRITE = "LOAD_SPRITE",
  ADD_FRAME = "ADD_FRAME",
  DELETE_FRAME = "DELETE_FRAME",
  CHANGE_FRAME = "CHANGE_FRAME",
  CHANGE_COLOR = "CHANGE_COLOR",
  CHANGE_TOOL = "CHANGE_TOOL",
  START_DRAWING = "START_DRAWING",
  DRAG_DRAWING = "DRAG_DRAWING",
  COMMIT_DRAWING = "COMMIT_DRAWING",
  REPLACE_PALETTE = "REPLACE_PALETTE",
  REORDER_FRAMES = "REORDER_FRAMES",
}

type UiActionPayload = {
  value?: string;
  index?: number;
  oldIndex?: number;
  active?: boolean;
  frames?: string[];
  palette?: string[];
  newHistory?: string[];
  sprite?: Sprite;
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
    case EditorActionTypes.LOAD_SPRITE:
      return {
        ...initialState.state,
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
      return {
        ...state,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: newFrames,
            }
          : undefined,
        currentFrame: (newFrames.length || 0) - 1,
        currentHash:
          state?.spriteData?.frames[(newFrames.length || 0) - 1] || "",
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
    case EditorActionTypes.START_DRAWING:
      return {
        ...state,
        isDrawing: !!action.payload?.active,
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
    case EditorActionTypes.COMMIT_DRAWING:
      return {
        ...state,
        isDrawing: false,
        spriteData: state.spriteData
          ? {
              ...state.spriteData,
              frames: action?.payload?.frames || [],
            }
          : undefined,
        undoHistory: action.payload?.newHistory || [],
        undoHistoryIndex: (action.payload?.newHistory || []).length,
        currentHash: state.unsavedHash,
        unsavedHash: "",
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
    default:
      return state;
  }
};

/**
 * Create context
 */

type ContextProps = {
  state: EditorState;
  loadSprite: (sprite: Sprite) => void;
  onAddFrame: (frameIndex: number, frameHash?: string) => void;
  onChangeFrame: (frame: number) => void;
  onDeleteFrame: (frame: number) => void;
  onSelectColor: (newColor?: string) => void;
  onSelectTool: (newTool: string) => void;
  onDrawStart: (e: InputEvent) => void;
  onTouchStart: (e: InputEvent) => void;
  onDrawEnd: (e: InputEvent) => void;
  onDrawChange: (frameIndex: number) => void;
  onReplacePalette: (newPalette: string[]) => void;
  onReorderFrames: (oldIndex: number, newIndex: number) => void;
};

const initialState: ContextProps = {
  state: {
    debug: true,
    spriteData: undefined,
    colors: defaultColors,
    isDrawing: false,
    currentFrame: 0,
    currentColor: "000",
    undoHistory: [],
    undoHistoryIndex: 0,
    currentTool: "pencil",
    currentHash: getDefaultHash(),
    unsavedHash: "",
  },
  loadSprite: () => null,
  onAddFrame: () => null,
  onChangeFrame: () => null,
  onDeleteFrame: () => null,
  onSelectColor: () => null,
  onSelectTool: () => null,
  onTouchStart: () => null,
  onDrawStart: () => null,
  onDrawEnd: () => null,
  onDrawChange: () => null,
  onReplacePalette: () => null,
  onReorderFrames: () => null,
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

  const loadSprite = (sprite: Sprite) =>
    dispatch({
      type: EditorActionTypes.LOAD_SPRITE,
      payload: {
        sprite,
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

  const onTouchStart = (event: InputEvent) => {
    dispatch({
      type: EditorActionTypes.START_DRAWING,
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
      type: EditorActionTypes.START_DRAWING,
      payload: {
        active: true,
      },
    });
  };

  const onDrawChange = (frameIndex: number) => {
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

  const onDrawEnd = (event: InputEvent) => {
    event.preventDefault();

    // Ignore if not drawing
    if (!state.isDrawing) {
      return;
    }

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

    // TO-DO: Update palette and hashes by most used colors

    const newFrames = getUpdatedSpriteFrames(
      state.currentFrame,
      state.unsavedHash
    );

    // Store sprite in localstorage
    set(
      `${localStorageKeys.SPRITE}-${state.spriteData?.id}`,
      JSON.stringify({
        ...state.spriteData,
        frames: newFrames,
      })
    );

    dispatch({
      type: EditorActionTypes.COMMIT_DRAWING,
      payload: {
        newHistory,
        frames: newFrames,
      },
    });
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

  return (
    <EditorContext.Provider
      value={{
        state,
        loadSprite,
        onAddFrame,
        onDeleteFrame,
        onChangeFrame,
        onSelectColor,
        onSelectTool,
        onTouchStart,
        onDrawStart,
        onDrawChange,
        onDrawEnd,
        onReplacePalette,
        onReorderFrames,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorContext;
