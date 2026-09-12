import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { mikoReducer, blankSprite, currentHash, type MikoState } from "../src/useMiko";

/** History entries carry the palette they were encoded against. */
const snapshot = (palette: string[], ...hashes: string[]) =>
  hashes.map((hash) => ({ hash, palette }));
import {
  DEFAULT_COLORS,
  TRANSPARENT,
  firstVisibleColor,
  getHashArray,
  isLockedColor,
  normalisePalette,
} from "../src/editing";

const initial = (overrides: Partial<MikoState> = {}): MikoState => {
  const colors = normalisePalette(DEFAULT_COLORS);
  return {
    sprite: blankSprite(2),
    frame: 0,
    colors,
    color: firstVisibleColor(colors),
    tool: "pencil",
    isDrawing: false,
    draft: "",
    history: [],
    historyIndex: 0,
    ...overrides,
  };
};

describe("frames", () => {
  it("adds a frame after the current one and selects it", () => {
    const state = initial();
    const next = mikoReducer(state, { type: "ADD_FRAME" });
    assert.equal(next.sprite.frames.length, 2);
    assert.equal(next.frame, 1);
  });

  it("keeps at least one frame — deleting the last one blanks it instead", () => {
    const state = initial();
    const next = mikoReducer(state, { type: "DELETE_FRAME", index: 0 });
    assert.equal(next.sprite.frames.length, 1);
    assert.equal(next.sprite.frames[0], "aaaa");
    assert.equal(next.frame, 0);
  });

  it("deleting a frame steps back to the previous one", () => {
    const state = initial({ sprite: { ...blankSprite(2), frames: ["aaaa", "bbbb", "cccc"] }, frame: 2 });
    const next = mikoReducer(state, { type: "DELETE_FRAME", index: 2 });
    assert.deepEqual(next.sprite.frames, ["aaaa", "bbbb"]);
    assert.equal(next.frame, 1);
  });

  it("clamps a frame change to the frames that exist", () => {
    const state = initial({ sprite: { ...blankSprite(2), frames: ["aaaa", "bbbb"] } });
    assert.equal(mikoReducer(state, { type: "SET_FRAME", index: 9 }).frame, 1);
    assert.equal(mikoReducer(state, { type: "SET_FRAME", index: -3 }).frame, 0);
  });

  it("reorders frames and follows the moved frame", () => {
    const state = initial({ sprite: { ...blankSprite(2), frames: ["aaaa", "bbbb", "cccc"] } });
    const next = mikoReducer(state, { type: "REORDER_FRAMES", from: 0, to: 2 });
    assert.deepEqual(next.sprite.frames, ["bbbb", "cccc", "aaaa"]);
    assert.equal(next.frame, 2);
  });
});

describe("palette", () => {
  it("picking a colour switches the eraser back to the pencil", () => {
    const state = initial({ tool: "eraser" });
    const next = mikoReducer(state, { type: "SET_COLOR", color: "f00" });
    assert.equal(next.tool, "pencil");
    assert.equal(next.color, "f00");
  });

  it("leaves the fill tool alone when picking a colour", () => {
    const state = initial({ tool: "fill" });
    assert.equal(mikoReducer(state, { type: "SET_COLOR", color: "f00" }).tool, "fill");
  });

  it("refuses to edit a locked swatch", () => {
    const state = initial();
    const lockedIndex = state.colors.indexOf(TRANSPARENT);
    const next = mikoReducer(state, { type: "UPDATE_COLOR", index: lockedIndex, color: "f00" });
    assert.equal(next, state, "state is returned untouched");
  });

  it("follows the edited swatch when it was the selected one", () => {
    // The default selection is black, which is locked — pick a swatch that
    // can actually be edited.
    const base = initial();
    const index = base.colors.findIndex((color) => !isLockedColor(color));
    const state = { ...base, color: base.colors[index] as string };

    const next = mikoReducer(state, { type: "UPDATE_COLOR", index, color: "abc" });
    assert.equal(next.colors[index], "abc");
    assert.equal(next.color, "abc", "keeps painting with the swatch just edited");
  });

  it("normalises a replacement palette and reselects a paintable colour", () => {
    const state = initial();
    const next = mikoReducer(state, { type: "SET_COLORS", colors: ["f00", "0f0"] });
    assert.equal(next.colors[0], TRANSPARENT, "transparent is forced into slot 0");
    assert.notEqual(next.color, TRANSPARENT, "never selects transparent");
    assert.ok(next.colors.includes("f00"));
  });
});

describe("drawing", () => {
  it("renders the draft mid-stroke and the committed frame otherwise", () => {
    const state = initial();
    assert.equal(currentHash(state), "aaaa", "no draft — reads the frame");
    assert.equal(currentHash({ ...state, draft: "abab" }), "abab");
  });

  it("commits the stroke into the current frame only", () => {
    const state = initial({
      sprite: { ...blankSprite(2), frames: ["aaaa", "bbbb"] },
      frame: 1,
      isDrawing: true,
      draft: "cccc",
    });
    const next = mikoReducer(state, {
      type: "DRAW_END",
      frames: ["aaaa", "cccc"],
      palette: [TRANSPARENT, "f00"],
      history: snapshot([TRANSPARENT, "f00"], "bbbb", "cccc"),
    });
    assert.deepEqual(next.sprite.frames, ["aaaa", "cccc"]);
    assert.equal(next.draft, "", "the draft is cleared on commit");
    assert.equal(next.isDrawing, false);
  });
});

describe("undo/redo", () => {
  const drawn = (): MikoState =>
    initial({
      sprite: { ...blankSprite(2), frames: ["cccc"], palette: [TRANSPARENT, "f00", "0f0"] },
      history: snapshot([TRANSPARENT, "f00", "0f0"], "aaaa", "bbbb", "cccc"),
      historyIndex: 2,
    });

  it("steps back through history", () => {
    const next = mikoReducer(drawn(), { type: "UNDO" });
    assert.equal(next.sprite.frames[0], "bbbb");
    assert.equal(next.historyIndex, 1);
  });

  it("steps forward again after an undo", () => {
    const next = mikoReducer(mikoReducer(drawn(), { type: "UNDO" }), { type: "REDO" });
    assert.equal(next.sprite.frames[0], "cccc");
    assert.equal(next.historyIndex, 2);
  });

  it("stops at the start of history", () => {
    const state = { ...drawn(), historyIndex: 0 };
    assert.equal(mikoReducer(state, { type: "UNDO" }), state);
  });

  it("stops at the end of history", () => {
    const state = drawn();
    assert.equal(mikoReducer(state, { type: "REDO" }), state);
  });

  it("changing frame abandons the current frame's history", () => {
    const state = { ...drawn(), sprite: { ...blankSprite(2), frames: ["cccc", "dddd"] } };
    const next = mikoReducer(state, { type: "SET_FRAME", index: 1 });
    assert.deepEqual(next.history, []);
    assert.equal(next.historyIndex, 0);
  });

  it("restores the snapshot's colours after the palette has been re-sorted", () => {
    // The sprite's palette now puts "0f0" in the slot the snapshot spent on
    // transparent — a fill is the usual way this happens, since it changes
    // colour counts enough to reorder the palette on commit.
    const state = initial({
      sprite: { ...blankSprite(2), frames: ["aaaa"], palette: ["0f0", "f00", TRANSPARENT] },
      history: snapshot([TRANSPARENT, "f00"], "abba", "aaaa"),
      historyIndex: 1,
    });

    const next = mikoReducer(state, { type: "UNDO" });
    assert.deepEqual(
      getHashArray(next.sprite.frames[0] as string, next.sprite.palette),
      [TRANSPARENT, "f00", "f00", TRANSPARENT]
    );
  });

  it("leaves the other frames readable when it restores a snapshot", () => {
    const state = initial({
      sprite: { ...blankSprite(2), frames: ["aaaa", "bbbb"], palette: ["0f0", "f00"] },
      frame: 0,
      // A snapshot from before "0f0" existed, so its chars mean something else.
      history: snapshot([TRANSPARENT, "00f"], "abba", "aaaa"),
      historyIndex: 1,
    });

    const next = mikoReducer(state, { type: "UNDO" });
    assert.deepEqual(
      getHashArray(next.sprite.frames[1] as string, next.sprite.palette),
      ["f00", "f00", "f00", "f00"],
      "frame 1 still reads as the colour it was drawn in"
    );
    assert.deepEqual(
      getHashArray(next.sprite.frames[0] as string, next.sprite.palette),
      [TRANSPARENT, "00f", "00f", TRANSPARENT]
    );
  });
});

describe("sprite", () => {
  it("loading a sprite resets frame and history", () => {
    const state = initial({ frame: 3, history: snapshot([TRANSPARENT], "aaaa"), historyIndex: 1 });
    const loaded = { ...blankSprite(3), name: "Ghost" };
    const next = mikoReducer(state, { type: "LOAD_SPRITE", sprite: loaded });
    assert.equal(next.sprite.name, "Ghost");
    assert.equal(next.frame, 0);
    assert.deepEqual(next.history, []);
  });

  it("growing keeps existing pixels anchored top-left and pads the rest", () => {
    // 2x2:  a b        3x3:  a b .
    //       b a    ->        b a .
    //                        . . .
    const state = initial({ sprite: { ...blankSprite(2), frames: ["abba"] } });
    const next = mikoReducer(state, { type: "SET_SIZE", size: 3 });
    assert.equal(next.sprite.size, 3);
    assert.deepEqual(next.sprite.frames, ["ababaaaaa"]);
  });

  it("shrinking crops to the top-left and resizes every frame", () => {
    // 3x3:  a b a       2x2:  a b
    //       a b a   ->        a b
    //       a a a
    const state = initial({
      sprite: { ...blankSprite(3), frames: ["abaabaaaa", "bbbbbbbbb"] },
    });
    const next = mikoReducer(state, { type: "SET_SIZE", size: 2 });
    assert.deepEqual(next.sprite.frames, ["abab", "bbbb"]);
  });

  it("resizing to the same size is a no-op", () => {
    const state = initial({ sprite: { ...blankSprite(2), frames: ["abba"] } });
    assert.equal(mikoReducer(state, { type: "SET_SIZE", size: 2 }), state);
  });
});
