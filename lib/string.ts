/**
 * String utility functions used for sprite frame encoding.
 */

/**
 * Produces a diff-encoded string by comparing two same-length strings.
 * Pixels that match the reference string are replaced with run-length
 * encoded "-" markers, reducing the size of the diff.
 */
export const diffStrings = (string: string, compareString: string): string => {
  const result = string.split("").reduce((sum, pixel, index) => {
    const prev = sum[sum.length - 1];
    const mirror = compareString[index];

    if (mirror === pixel) {
      if (prev !== undefined && typeof prev === "number") {
        return [...sum.slice(0, -1), prev + 1];
      } else if (prev === "-") {
        return [...sum, 2];
      } else {
        return [...sum, "-"];
      }
    } else {
      return [...sum, pixel];
    }
  }, [] as (string | number)[]);

  return result.join("");
};

/**
 * Run-length encodes a string by replacing consecutive identical characters
 * with the character followed by the count.
 * e.g. "aaabbc" → "a3b2c"
 */
export const compressString = (string: string): string => {
  const result = string.split("").reduce((sum, pixel) => {
    const prev = sum[sum.length - 1];
    const twoPrev = sum[sum.length - 2];

    if (prev && pixel === prev) {
      return [...sum, 2];
    } else if (prev && pixel === twoPrev && typeof prev === "number") {
      return [...sum.slice(0, -1), prev + 1];
    } else {
      return [...sum, pixel];
    }
  }, [] as (string | number)[]);

  return result.join("");
};
