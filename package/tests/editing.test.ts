import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  floodFill,
  updateHash,
  getHashArray,
  getDefaultHash,
  getRandomPalette,
  optimiseFrames,
} from "../src/editing";

describe("getDefaultHash", () => {
  it("returns a blank hash (all slot-0) sized to the grid", () => {
    assert.equal(getDefaultHash(3), "aaaaaaaaa");
    assert.equal(getDefaultHash(1), "a");
  });
});

describe("getHashArray", () => {
  it("expands each char into its palette color, offset from 'a'", () => {
    const palette = ["fff0", "f00", "0f0"];
    assert.deepEqual(getHashArray("aba", palette), ["fff0", "f00", "fff0"]);
  });

  it("falls back to slot 0 for an out-of-range char rather than crashing", () => {
    const palette = ["fff0", "f00"];
    // 'z' is far past the 2-color palette.
    assert.deepEqual(getHashArray("z", palette), ["fff0"]);
  });
});

describe("getRandomPalette", () => {
  it("always puts transparent in slot 0, per the shared convention", () => {
    assert.equal(getRandomPalette()[0], "fff0");
  });

  it("returns 9 slots", () => {
    assert.equal(getRandomPalette().length, 9);
  });
});

describe("floodFill", () => {
  it("replaces the contiguous region of the target color, 4-connected", () => {
    // 3x3 grid:
    //   a a b
    //   a a b
    //   b b b
    // The four 'a's (top-left 2x2) are 4-connected to each other but not to
    // anything else, so only they flip.
    const hash = "aabaabbbb";
    const next = floodFill(hash, 0, "c", 3);
    assert.equal(next, "ccbccbbbb");
  });

  it("is a no-op when the target color already matches the fill color", () => {
    const hash = "aaaa";
    assert.equal(floodFill(hash, 0, "a", 2), hash);
  });

  it("stays within a real square grid's boundary (no wraparound)", () => {
    // 2x2: fill from top-left; top-right differs, so only one cell changes.
    const hash = "abbb";
    const next = floodFill(hash, 0, "c", 2);
    assert.equal(next, "cbbb");
  });
});

describe("updateHash", () => {
  const palette = ["fff0", "f00", "0f0"];

  it("pencil paints a single pixel and adds a new color to the palette if needed", () => {
    const hash = getDefaultHash(2); // "aaaa"
    const { newHash, newPalette } = updateHash(0, hash, palette, "00f", "pencil");
    assert.equal(newPalette.at(-1), "00f");
    assert.equal(newHash[0], String.fromCharCode(newPalette.indexOf("00f") + 97));
    assert.equal(newHash.slice(1), "aaa", "only the painted pixel changes");
  });

  it("pencil reuses an existing palette slot instead of duplicating it", () => {
    const hash = getDefaultHash(2);
    const { newPalette } = updateHash(0, hash, palette, "f00", "pencil");
    assert.equal(newPalette.length, palette.length, "no duplicate color added");
  });

  it("eraser always paints the transparent (fff0) slot", () => {
    const hash = "bbbb"; // all painted 'f00' (slot 1 -> 'b')
    const { newHash, newPalette } = updateHash(0, hash, palette, "f00", "eraser");
    assert.equal(newHash[0], String.fromCharCode(newPalette.indexOf("fff0") + 97));
  });

  it("eraser adds a transparent slot if the palette is somehow missing one", () => {
    const noTransparent = ["f00", "0f0"];
    const { newPalette } = updateHash(0, "aa", noTransparent, "f00", "eraser");
    assert.ok(newPalette.includes("fff0"));
  });

  it("fill floods the contiguous region instead of a single pixel", () => {
    const hash = getDefaultHash(2); // "aaaa", all one color
    const { newHash } = updateHash(0, hash, palette, "f00", "fill");
    assert.equal(newHash, newHash[0]!.repeat(4), "the whole uniform grid fills");
  });
});

describe("optimiseFrames", () => {
  it("moves the most-used colour into the lowest slot", () => {
    const palette = ["fff0", "f00", "0f0"];
    // "0f0" (slot 2) covers six pixels, "f00" (slot 1) two, transparent none.
    const { newPalette } = optimiseFrames(["cccc", "ccbb"], palette);
    assert.deepEqual(newPalette, ["0f0", "f00", "fff0"]);
  });

  it("counts across every frame, not just the first", () => {
    const palette = ["fff0", "f00", "0f0"];
    // Frame 1 alone would put "f00" first; frames 2 and 3 outvote it.
    const { newPalette } = optimiseFrames(["bbbb", "cccc", "cccc"], palette);
    assert.equal(newPalette[0], "0f0");
  });

  it("rewrites the frames so the pixels look identical afterwards", () => {
    const palette = ["fff0", "f00", "0f0"];
    const frames = ["abca", "cccb"];
    const before = frames.map((frame) => getHashArray(frame, palette));

    const { newFrames, newPalette } = optimiseFrames(frames, palette);
    const after = newFrames.map((frame) => getHashArray(frame, newPalette));

    assert.deepEqual(after, before, "compaction is never a visual change");
  });

  it("keeps unused palette colours rather than dropping them", () => {
    const palette = ["fff0", "f00", "0f0"];
    const { newPalette } = optimiseFrames(["bbbb"], palette);
    assert.equal(newPalette.length, 3);
    assert.ok(newPalette.includes("0f0"));
  });

  it("maps a char pointing past the palette down to slot 0", () => {
    const { newFrames } = optimiseFrames(["zzzz"], ["fff0", "f00"]);
    assert.equal(newFrames[0], "aaaa", "corrupt data decodes, it does not crash");
  });
});
