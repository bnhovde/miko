import { CompressedSprite, Sprite } from "types/sprite";
import { longestCommonSubstring } from "string-algorithms";
import { compressString } from "./string";

// Compress a sprite by:

// 1: Find any duplicate frames
//    -> Loop through all frames
//    -> If a following frame is the same as the current frame:
//      -> replace duplicate frame with [z[frameIndex]]

// 2. Find the longest common substring of all frames with length > 2
//    -> Compress this substring
//    -> Add to chunks array as [i]
//    -> Remove from frames, replace with ref (x[i])

// 3: Compress all frames by replacing repeating characters with [c][i]

const compressSprite = (sprite: Sprite): CompressedSprite => {
  const palette = sprite.palette;
  let chunks = [] as string[];
  let frames = [] as string[];

  const uniqueCompressedFrames = sprite.frames.reduce((sum, frame, index) => {
    const matchIndex = sprite.frames.indexOf(frame, index + 1);

    if (matchIndex > -1 && matchIndex !== index) {
      return [...sum, "z" + (matchIndex + 1)];
    }
    return [...sum, compressString(frame)];
  }, [] as string[]);

  const diffedFrames = uniqueCompressedFrames.reduce((sum, frame, index) => {
    // Ignore cloned frames
    if (frame.startsWith("z")) {
      return [...sum, frame];
    }

    // Check for matches in chunks
    const chunkMatches = chunks.filter((c) => frame.includes(c));

    if (chunkMatches.length > 0) {
      for (let chunk of chunkMatches) {
        if (frame.includes(chunk)) {
          frame = frame.replace(chunk, `x${chunks.indexOf(chunk)}x`);
        }
      }
    }

    // Check for matches in frames
    const otherFrames = uniqueCompressedFrames.slice(index);
    const frameMatches = otherFrames
      .reduce((sum, otherFrame) => {
        const matches = longestCommonSubstring([frame, otherFrame]) as string[];

        const filteredMatches = matches.filter((match) => {
          const isCurrentFrame = match !== frame;
          const isClone = !match.match(/z/);
          const isLong = match.length > 8;
          const isNotInChunks = !chunks.includes(match);

          return isCurrentFrame && isClone && isLong && isNotInChunks;
        });

        const uniqueMatches = filteredMatches.filter(
          (match) => !sum.includes(match)
        );

        if (uniqueMatches.length > 0) {
          return [...sum, ...uniqueMatches];
        }

        return sum;
      }, [] as string[])
      .sort((a, b) => b.length - a.length);

    if (frameMatches.length > 0) {
      for (let newChunk of frameMatches) {
        if (frame.includes(newChunk)) {
          // Add newChunk to all chunks
          chunks.push(newChunk);
          frame = frame.replace(newChunk, `x${chunks.indexOf(newChunk)}x`);
        }
      }
      return [...sum, frame];
    }

    return [...sum, frame];
  }, [] as string[]);

  // Final step, optimise chunks
  const diffedChunks = chunks.reduce((sum, chunk, index) => {
    const otherChunks = chunks.slice(index);
    const chunkMatches = otherChunks
      .reduce((sum, otherChunk) => {
        const matches = longestCommonSubstring([chunk, otherChunk]) as string[];

        const filteredMatches = matches.filter((match) => {
          const isCurrentChunk = match !== chunk;
          const isLong = match.length > 7;

          return isCurrentChunk && isLong;
        });

        const uniqueMatches = filteredMatches.filter(
          (match) => !sum.includes(match)
        );

        if (uniqueMatches.length > 0) {
          return [...sum, ...uniqueMatches];
        }

        return sum;
      }, [] as string[])
      .sort((a, b) => b.length - a.length);

    if (chunkMatches.length > 0) {
      for (let newChunk of chunkMatches) {
        if (chunk.includes(newChunk)) {
          // Add newChunk to all chunks
          if (!chunks.includes(newChunk)) {
            chunks.push(newChunk);
          }
          chunk = chunk.replace(newChunk, `y${chunks.indexOf(newChunk)}y`);
        }
      }
      return [...sum, chunk];
    }

    return [...sum, chunk];
  }, [] as string[]);

  const combinedChunks = [
    ...diffedChunks,
    ...chunks.slice(diffedChunks.length),
  ];

  return {
    palette,
    chunks: combinedChunks,
    frames: diffedFrames,
  };
};

export { compressSprite };
