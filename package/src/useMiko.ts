// The editor's state machine — every sprite-editing operation the UI can
// perform, with no DOM, no storage and no framework beyond React's own
// useReducer. Ported from the miko app's EditorContext, minus the parts that
// belong to a host application: persistence, routing, spritesheets and
// packages. Those are the host's business; this hook reports finished edits
// through `onChange` and lets the host decide what they mean.

import { useCallback, useMemo, useReducer, useRef } from "react";

import {
  DEFAULT_COLORS,
  TRANSPARENT,
  firstVisibleColor,
  getDefaultHash,
  insertAtIndex,
  isLockedColor,
  keepOrResetColor,
  moveToIndex,
  normalisePalette,
  optimiseFrames,
  updateHash,
  type Tool,
} from "./editing";
import type { MikoSprite } from "./types";

export type MikoState = {
  /** The sprite as it currently stands, including committed edits. */
  sprite: MikoSprite;
  /** Index of the frame being edited. */
  frame: number;
  /** The paintable swatches. Distinct from `sprite.palette`, which is the
   *  sprite's own encoding palette and only ever holds colours actually used
   *  in its frames. */
  colors: string[];
  /** The selected swatch. */
  color: string;
  tool: Tool;
  /** True between a pointer going down and coming back up. */
  isDrawing: boolean;
  /** The in-progress hash for the current frame while a stroke is underway.
   *  Empty when nothing is being drawn — read `currentHash` instead of this. */
  draft: string;
  /** Snapshots of the current frame's hash, oldest first. */
  history: string[];
  historyIndex: number;
};

type Action =
  | { type: "LOAD_SPRITE"; sprite: MikoSprite }
  | { type: "SET_FRAME"; index: number }
  | { type: "ADD_FRAME"; index?: number; hash?: string }
  | { type: "DELETE_FRAME"; index: number }
  | { type: "REORDER_FRAMES"; from: number; to: number }
  | { type: "SET_COLOR"; color: string }
  | { type: "SET_TOOL"; tool: Tool }
  | { type: "SET_COLORS"; colors: string[] }
  | { type: "UPDATE_COLOR"; index: number; color: string }
  | { type: "DRAW_START" }
  | { type: "DRAW_MOVE"; hash: string; palette: string[] }
  | { type: "DRAW_END"; frames: string[]; palette: string[]; history: string[] }
  | { type: "SET_NAME"; name: string }
  | { type: "SET_SIZE"; size: number }
  | { type: "UNDO" }
  | { type: "REDO" };

export const blankSprite = (size = 11, name = "Untitled"): MikoSprite => ({
  name,
  size,
  palette: [TRANSPARENT],
  frames: [getDefaultHash(size)],
});

/** The hash the canvas should render: the in-progress stroke if there is one,
 *  otherwise the committed frame. */
export const currentHash = (state: MikoState): string =>
  state.draft || state.sprite.frames[state.frame] || getDefaultHash(state.sprite.size);

/** Replaces one frame, keeping every other frame untouched. */
const withFrame = (sprite: MikoSprite, index: number, hash: string): MikoSprite => ({
  ...sprite,
  frames: sprite.frames.length > 0
    ? sprite.frames.map((frame, i) => (i === index ? hash : frame))
    : [hash],
});

/** Moving to a different frame abandons the current frame's undo stack —
 *  history is per-frame, not per-sprite. */
const resetHistory = { draft: "", history: [] as string[], historyIndex: 0 };

/** Re-lays a flat hash string onto a different grid size, anchored top-left:
 *  pixels that still fit are kept, new space is transparent. A hash has no
 *  notion of rows on its own, so this has to walk the grid explicitly. */
export const resizeHash = (hash: string, oldSize: number, newSize: number): string => {
  let result = "";
  for (let row = 0; row < newSize; row++) {
    for (let col = 0; col < newSize; col++) {
      result += row < oldSize && col < oldSize ? hash[row * oldSize + col] ?? "a" : "a";
    }
  }
  return result;
};

export const mikoReducer = (state: MikoState, action: Action): MikoState => {
  switch (action.type) {
    case "LOAD_SPRITE":
      return {
        ...state,
        ...resetHistory,
        sprite: action.sprite,
        frame: 0,
        color: keepOrResetColor(state.colors, state.color),
      };

    case "SET_FRAME": {
      const frame = Math.min(Math.max(action.index, 0), state.sprite.frames.length - 1);
      return { ...state, ...resetHistory, frame };
    }

    case "ADD_FRAME": {
      const at = (action.index ?? state.sprite.frames.length - 1) + 1;
      const hash = action.hash ?? getDefaultHash(state.sprite.size);
      return {
        ...state,
        ...resetHistory,
        sprite: { ...state.sprite, frames: insertAtIndex(state.sprite.frames, at, hash) },
        frame: at,
      };
    }

    case "DELETE_FRAME": {
      // A sprite always has at least one frame; deleting the last one blanks
      // it instead of leaving a sprite that cannot be rendered.
      if (state.sprite.frames.length <= 1) {
        return {
          ...state,
          ...resetHistory,
          sprite: { ...state.sprite, frames: [getDefaultHash(state.sprite.size)] },
          frame: 0,
        };
      }

      const frames = state.sprite.frames.filter((_, i) => i !== action.index);
      return {
        ...state,
        ...resetHistory,
        sprite: { ...state.sprite, frames },
        frame: Math.max(Math.min(action.index - 1, frames.length - 1), 0),
      };
    }

    case "REORDER_FRAMES":
      return {
        ...state,
        ...resetHistory,
        sprite: {
          ...state.sprite,
          frames: moveToIndex(state.sprite.frames, action.from, action.to),
        },
        frame: action.to,
      };

    case "SET_COLOR":
      return {
        ...state,
        color: action.color,
        // Picking a colour means you want to paint with it, not erase.
        tool: state.tool === "eraser" ? "pencil" : state.tool,
      };

    case "SET_TOOL":
      return { ...state, tool: action.tool };

    case "SET_COLORS": {
      const colors = normalisePalette(action.colors);
      return { ...state, colors, color: firstVisibleColor(colors) };
    }

    case "UPDATE_COLOR": {
      const replaced = state.colors[action.index];
      if (replaced === undefined || isLockedColor(replaced)) return state;

      const colors = state.colors.map((color, i) =>
        i === action.index ? action.color : color
      );
      return {
        ...state,
        colors,
        // Keep painting with the swatch that was just edited.
        color: state.color === replaced ? action.color : state.color,
      };
    }

    case "DRAW_START":
      return { ...state, isDrawing: true };

    case "DRAW_MOVE":
      return {
        ...state,
        draft: action.hash,
        sprite: { ...state.sprite, palette: action.palette },
      };

    case "DRAW_END":
      return {
        ...state,
        isDrawing: false,
        draft: "",
        sprite: { ...state.sprite, frames: action.frames, palette: action.palette },
        history: action.history,
        historyIndex: action.history.length - 1,
      };

    case "SET_NAME":
      return { ...state, sprite: { ...state.sprite, name: action.name } };

    case "SET_SIZE": {
      const size = Math.max(1, Math.round(action.size));
      if (size === state.sprite.size) return state;
      return {
        ...state,
        ...resetHistory,
        sprite: {
          ...state.sprite,
          size,
          frames: state.sprite.frames.map((hash) =>
            resizeHash(hash, state.sprite.size, size)
          ),
        },
      };
    }

    case "UNDO": {
      if (state.historyIndex <= 0) return state;
      const historyIndex = state.historyIndex - 1;
      const hash = state.history[historyIndex] as string;
      return {
        ...state,
        historyIndex,
        draft: "",
        sprite: withFrame(state.sprite, state.frame, hash),
      };
    }

    case "REDO": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const historyIndex = state.historyIndex + 1;
      const hash = state.history[historyIndex] as string;
      return {
        ...state,
        historyIndex,
        draft: "",
        sprite: withFrame(state.sprite, state.frame, hash),
      };
    }

    default:
      return state;
  }
};

export type UseMikoOptions = {
  /** The sprite to open. Read once, on mount — call `loadSprite` to switch to
   *  a different one rather than swapping this in place, so a host storing
   *  `onChange`'s output back into it can't fight the user's own edits. */
  value?: MikoSprite;
  /** Grid dimension for a new sprite when `value` is omitted. Default 11. */
  size?: number;
  /** Swatches to start with. Normalised: transparent and black are forced in,
   *  and the list is padded to 10 paintable colours. */
  colors?: string[];
  /** Fires whenever an edit is committed — the end of a stroke, a frame
   *  added, a colour changed. Not called mid-stroke. */
  onChange?: (sprite: MikoSprite) => void;
};

export type MikoApi = MikoState & {
  /** The hash the canvas should render right now (draft or committed). */
  hash: string;
  /** The current frame's pixels as palette colours, ready to render. */
  cells: string[];
  canUndo: boolean;
  canRedo: boolean;
  loadSprite: (sprite: MikoSprite) => void;
  setFrame: (index: number) => void;
  addFrame: (index?: number, hash?: string) => void;
  deleteFrame: (index: number) => void;
  reorderFrames: (from: number, to: number) => void;
  setColor: (color: string) => void;
  setTool: (tool: Tool) => void;
  setColors: (colors: string[]) => void;
  updateColor: (index: number, color: string) => void;
  setName: (name: string) => void;
  setSize: (size: number) => void;
  /** Begin a stroke and paint the first pixel. */
  startDrawing: (pixelIndex: number) => void;
  /** Paint another pixel mid-stroke. A no-op unless a stroke is underway, and
   *  ignored entirely by the fill tool, which acts once per click. */
  draw: (pixelIndex: number) => void;
  /** End the stroke, compact the palette and commit — this is what fires
   *  `onChange`. */
  endDrawing: () => void;
  undo: () => void;
  redo: () => void;
};

export const useMiko = ({ value, size, colors, onChange }: UseMikoOptions = {}): MikoApi => {
  const [state, dispatch] = useReducer(mikoReducer, { value, size, colors }, (init) => {
    const startingColors = normalisePalette(init.colors ?? DEFAULT_COLORS);
    return {
      sprite: init.value ?? blankSprite(init.size ?? 11),
      frame: 0,
      colors: startingColors,
      color: firstVisibleColor(startingColors),
      tool: "pencil" as Tool,
      isDrawing: false,
      ...resetHistory,
    };
  });

  // Held in a ref so the paint callbacks don't need to be rebuilt on every
  // pixel — a stroke reads the freshest state without re-subscribing.
  const stateRef = useRef(state);
  stateRef.current = state;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const paint = useCallback((pixelIndex: number) => {
    const current = stateRef.current;
    const { newHash, newPalette } = updateHash(
      pixelIndex,
      currentHash(current),
      current.sprite.palette,
      current.color,
      current.tool
    );
    dispatch({ type: "DRAW_MOVE", hash: newHash, palette: newPalette });
  }, []);

  const startDrawing = useCallback(
    (pixelIndex: number) => {
      dispatch({ type: "DRAW_START" });
      paint(pixelIndex);
    },
    [paint]
  );

  const draw = useCallback(
    (pixelIndex: number) => {
      const current = stateRef.current;
      if (!current.isDrawing) return;
      // Fill acts once, on the click that started the stroke — dragging it
      // across the canvas must not flood every cell it passes over.
      if (current.tool === "fill") return;
      paint(pixelIndex);
    },
    [paint]
  );

  const endDrawing = useCallback(() => {
    const current = stateRef.current;
    if (!current.isDrawing) return;

    const committed = current.draft || currentHash(current);
    const frames = current.sprite.frames.length > 0
      ? current.sprite.frames.map((frame, i) => (i === current.frame ? committed : frame))
      : [committed];

    const { newFrames, newPalette } = optimiseFrames(frames, current.sprite.palette);

    // The first commit seeds history with the pre-stroke state so the first
    // undo has somewhere to go. Undoing and then drawing discards the
    // redo tail, as every editor does.
    const base = current.history.length === 0
      ? [current.sprite.frames[current.frame] ?? getDefaultHash(current.sprite.size)]
      : current.history.slice(0, current.historyIndex + 1);

    const history = [...base, newFrames[current.frame] ?? committed];

    dispatch({ type: "DRAW_END", frames: newFrames, palette: newPalette, history });
    onChangeRef.current?.({ ...current.sprite, frames: newFrames, palette: newPalette });
  }, []);

  // Everything below commits immediately, so each reports the resulting
  // sprite the same way a finished stroke does.
  const commit = useCallback((next: MikoSprite) => onChangeRef.current?.(next), []);

  const api = useMemo<MikoApi>(() => {
    const hash = currentHash(state);
    return {
      ...state,
      hash,
      cells: hash.split("").map((char) => {
        const index = char.charCodeAt(0) - 97;
        return state.sprite.palette[index] ?? TRANSPARENT;
      }),
      canUndo: state.historyIndex > 0,
      canRedo: state.historyIndex < state.history.length - 1,
      loadSprite: (sprite) => dispatch({ type: "LOAD_SPRITE", sprite }),
      setFrame: (index) => dispatch({ type: "SET_FRAME", index }),
      addFrame: (index, hash) => {
        dispatch({ type: "ADD_FRAME", index, hash });
        const at = (index ?? state.sprite.frames.length - 1) + 1;
        commit({
          ...state.sprite,
          frames: insertAtIndex(
            state.sprite.frames,
            at,
            hash ?? getDefaultHash(state.sprite.size)
          ),
        });
      },
      deleteFrame: (index) => {
        dispatch({ type: "DELETE_FRAME", index });
        const frames = state.sprite.frames.length <= 1
          ? [getDefaultHash(state.sprite.size)]
          : state.sprite.frames.filter((_, i) => i !== index);
        commit({ ...state.sprite, frames });
      },
      reorderFrames: (from, to) => {
        dispatch({ type: "REORDER_FRAMES", from, to });
        commit({ ...state.sprite, frames: moveToIndex(state.sprite.frames, from, to) });
      },
      setColor: (color) => dispatch({ type: "SET_COLOR", color }),
      setTool: (tool) => dispatch({ type: "SET_TOOL", tool }),
      setColors: (colors) => dispatch({ type: "SET_COLORS", colors }),
      updateColor: (index, color) => dispatch({ type: "UPDATE_COLOR", index, color }),
      setName: (name) => {
        dispatch({ type: "SET_NAME", name });
        commit({ ...state.sprite, name });
      },
      setSize: (size) => {
        dispatch({ type: "SET_SIZE", size });
        if (size === state.sprite.size) return;
        commit({
          ...state.sprite,
          size,
          frames: state.sprite.frames.map((hash) =>
            resizeHash(hash, state.sprite.size, size)
          ),
        });
      },
      startDrawing,
      draw,
      endDrawing,
      undo: () => {
        if (state.historyIndex <= 0) return;
        dispatch({ type: "UNDO" });
        const hash = state.history[state.historyIndex - 1] as string;
        commit(withFrame(state.sprite, state.frame, hash));
      },
      redo: () => {
        if (state.historyIndex >= state.history.length - 1) return;
        dispatch({ type: "REDO" });
        const hash = state.history[state.historyIndex + 1] as string;
        commit(withFrame(state.sprite, state.frame, hash));
      },
    };
  }, [state, startDrawing, draw, endDrawing, commit]);

  return api;
};
