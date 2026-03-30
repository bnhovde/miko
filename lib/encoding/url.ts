/**
 * URL Sprite Encoding
 * ===================
 *
 * Sprites are shared via URL using a compact encoding. The URLSprite format is:
 *
 *   n  – name (string)
 *   v  – version (string)
 *   a  – author name (string)
 *   s  – grid size, e.g. 11 for 11×11 (number)
 *   d  – fps / animation delay (number)
 *   p  – palette: string[] of hex colors
 *   f  – frames: run-length encoded hash strings (see below)
 *
 * Frame run-length encoding:
 *   Consecutive identical pixels are compressed to: <char><count>
 *   e.g. "aaabbc" → "a3b2c"
 *   Duplicate frames are stored as references: "z<frameIndex>" (0-based)
 *
 * The entire URLSprite JSON is then LZ-compressed and base64url-encoded for
 * the share URL: /app/share?d=<compressed>
 */

import LZString from "lz-string";
import { Sprite, URLSprite } from "types/sprite";

/**
 * Encodes a Sprite into the compact URLSprite format for URL sharing.
 * Applies duplicate-frame detection and run-length encoding on each frame.
 */
export const encodeUrlSprite = (sprite: Sprite): URLSprite => {
  const { name, palette, author, size, frames, fps } = sprite;

  const uniqueFrames = frames.reduce((sum, frame, index) => {
    const matchIndex = frames.lastIndexOf(frame);
    if (matchIndex > -1 && matchIndex !== index) {
      return [...sum, "z" + matchIndex];
    }
    return [...sum, frame];
  }, [] as string[]);

  const compressedFrames = uniqueFrames.map((frame) => {
    if (frame.startsWith("z")) return frame;

    return frame
      .split("")
      .reduce((sum, pixel) => {
        const prev = sum[sum.length - 1];
        const twoPrev = sum[sum.length - 2];

        if (prev && pixel === prev) {
          return [...sum, 2];
        } else if (prev && pixel === twoPrev && typeof prev === "number") {
          return [...sum.slice(0, -1), prev + 1];
        } else {
          return [...sum, pixel];
        }
      }, [] as (string | number)[])
      .join("");
  });

  return {
    n: name,
    v: sprite.version,
    a: author?.name ?? "Anonymous",
    s: size,
    d: fps ?? 10,
    p: palette,
    f: compressedFrames,
  };
};

/**
 * Decodes a URLSprite (from URL params) back into a full Sprite object.
 * Expands run-length encoding and resolves duplicate-frame references.
 */
export const decodeUrlSprite = (urlSprite: URLSprite): Sprite => {
  const { n, v, a, s, d, p, f } = urlSprite;
  const reg = /([0-9.]+)(?![0-9.])|([a-z]+)(?![a-z])/gi;

  const allFrames = f.map((frame) => {
    let frameArray: string[];

    if (frame.startsWith("z")) {
      const refFrame = f[parseInt(frame.substring(1))] ?? "";
      frameArray = refFrame.match(reg) ?? [];
    } else {
      frameArray = frame.match(reg) ?? [];
    }

    const frameResults: string[] = [];
    for (let i = 0; i < frameArray.length; i++) {
      const match = frameArray[i]!;
      if (/^[0-9.]+$/.test(match)) {
        const value = frameArray[i - 1] ?? "";
        const count = parseInt(match) - 1;
        frameResults.push(...Array(count).fill(value.charAt(value.length - 1)));
      } else {
        frameResults.push(match);
      }
    }

    return frameResults.join("");
  });

  return {
    id: "url",
    version: v ?? "unknown",
    name: n ?? "Untitled",
    description: `by ${a ?? "Anonymous"}`,
    size: s ?? 11,
    fps: d ?? 10,
    palette: [...p],
    frames: allFrames,
  };
};

/** Compresses a URLSprite to a single base64url-encoded string for use in URLs. */
export const compressSpriteToUrl = (sprite: Sprite): string => {
  const urlSprite = encodeUrlSprite(sprite);
  return LZString.compressToEncodedURIComponent(JSON.stringify(urlSprite));
};

/** Decompresses and decodes a URL-encoded sprite string back to a Sprite. */
export const decompressSpriteFromUrl = (data: string): Sprite | null => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(data);
    if (!decompressed) return null;
    const parsed = JSON.parse(decompressed);
    const urlSprite: URLSprite = {
      n: parsed.n,
      v: parsed.v ?? "unknown",
      a: parsed.a,
      s: parseInt(String(parsed.s)),
      d: parseInt(String(parsed.d)),
      p: String(parsed.p).split(","),
      f: String(parsed.f).split(","),
    };
    return decodeUrlSprite(urlSprite);
  } catch {
    return null;
  }
};
