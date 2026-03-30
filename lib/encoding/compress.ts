/**
 * Sprite Compression
 * ==================
 *
 * Compresses a Sprite into a CompressedSprite for storage or transmission.
 * The algorithm has three passes:
 *
 *  1. Duplicate frame detection — identical frames become "z<frameIndex>" references.
 *  2. Common substring extraction — shared substrings across frames are extracted
 *     into a `chunks` array and replaced with "x<chunkIndex>x" tokens.
 *  3. Run-length encoding — each frame's repeated characters are compressed
 *     (see compressString in lib/string.ts).
 *
 * Chunk optimisation recursively applies the same process to the chunks array.
 */

import { CompressedSprite, Sprite } from "types/sprite";
import { compressString } from "lib/string";

/**
 * Finds the longest common substrings between two strings.
 * Returns all maximal-length common substrings (there may be ties).
 * Minimum returned length: 1 character.
 */
const longestCommonSubstrings = (a: string, b: string): string[] => {
  const m = a.length;
  const n = b.length;
  let maxLen = 0;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  const results = new Set<string>();

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1;
        if (dp[i]![j]! > maxLen) {
          maxLen = dp[i]![j]!;
          results.clear();
          results.add(a.substring(i - maxLen, i));
        } else if (dp[i]![j] === maxLen) {
          results.add(a.substring(i - maxLen, i));
        }
      } else {
        dp[i]![j] = 0;
      }
    }
  }

  return [...results];
};

/** Compresses a Sprite into its CompressedSprite representation. */
export const compressSprite = (sprite: Sprite): CompressedSprite => {
  const palette = sprite.palette;
  let chunks: string[] = [];

  // Pass 1: deduplicate frames
  const uniqueCompressedFrames = sprite.frames.reduce((sum, frame, index) => {
    const matchIndex = sprite.frames.indexOf(frame, index + 1);
    if (matchIndex > -1 && matchIndex !== index) {
      return [...sum, "z" + (matchIndex + 1)];
    }
    return [...sum, compressString(frame)];
  }, [] as string[]);

  // Pass 2: extract common substrings into chunks
  const diffedFrames = uniqueCompressedFrames.reduce((sum, frame, index) => {
    if (frame.startsWith("z")) return [...sum, frame];

    // Replace already-known chunks
    for (const chunk of chunks) {
      if (frame.includes(chunk)) {
        frame = frame.replace(chunk, `x${chunks.indexOf(chunk)}x`);
      }
    }

    // Find new common substrings with subsequent frames
    const otherFrames = uniqueCompressedFrames.slice(index);
    const newMatches = otherFrames
      .flatMap((other) => longestCommonSubstrings(frame, other))
      .filter((match) => {
        return (
          match !== frame &&
          !match.match(/z/) &&
          match.length > 8 &&
          !chunks.includes(match)
        );
      })
      .filter((match, i, arr) => arr.indexOf(match) === i)
      .sort((a, b) => b.length - a.length);

    for (const newChunk of newMatches) {
      if (frame.includes(newChunk)) {
        chunks.push(newChunk);
        frame = frame.replace(newChunk, `x${chunks.indexOf(newChunk)}x`);
      }
    }

    return [...sum, frame];
  }, [] as string[]);

  // Pass 3: optimise chunks by finding common substrings within them
  const diffedChunks = chunks.reduce((sum, chunk, index) => {
    const otherChunks = chunks.slice(index);
    const newMatches = otherChunks
      .flatMap((other) => longestCommonSubstrings(chunk, other))
      .filter((match) => match !== chunk && match.length > 7)
      .filter((match, i, arr) => arr.indexOf(match) === i)
      .sort((a, b) => b.length - a.length);

    for (const newChunk of newMatches) {
      if (chunk.includes(newChunk)) {
        if (!chunks.includes(newChunk)) chunks.push(newChunk);
        chunk = chunk.replace(newChunk, `y${chunks.indexOf(newChunk)}y`);
      }
    }

    return [...sum, chunk];
  }, [] as string[]);

  return {
    palette,
    chunks: [...diffedChunks, ...chunks.slice(diffedChunks.length)],
    frames: diffedFrames,
  };
};
