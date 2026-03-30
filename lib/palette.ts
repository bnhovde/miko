/**
 * Colour palette utilities.
 * Provides random palette generation using perceptually-spaced HSV sampling.
 */

type HSV = [number, number, number];
type RGB = [number, number, number];
type XYZ = [number, number, number];

interface PaletteOptions {
  numColors?: number;
  hRange?: [number, number];
  sRange?: [number, number];
  vRange?: [number, number];
  exclude?: HSV[];
}

const hsvToXyz = ([h, s, v]: HSV): XYZ => {
  const angle = h * Math.PI * 2;
  return [Math.sin(angle) * s * v, Math.cos(angle) * s * v, v];
};

const distSq = ([ax, ay, az]: XYZ, [bx, by, bz]: XYZ): number =>
  (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;

const hsvToRgb = ([h, s, v]: HSV): RGB => {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const vv = Math.round(255 * v);
  const pp = Math.round(255 * p);
  const qq = Math.round(255 * q);
  const tt = Math.round(255 * t);
  switch (i % 6) {
    case 0: return [vv, tt, pp];
    case 1: return [qq, vv, pp];
    case 2: return [pp, vv, tt];
    case 3: return [pp, qq, vv];
    case 4: return [tt, pp, vv];
    default: return [vv, pp, qq];
  }
};

const rgbToHex = ([r, g, b]: RGB): string =>
  ((r << 16) + (g << 8) + b).toString(16).padStart(6, "0");

/**
 * Generates `numColors` HSV colours that are as perceptually distinct as possible
 * within the given HSV ranges, avoiding the `exclude` colours.
 */
export const randomHSVPalette = (options: PaletteOptions = {}): HSV[] => {
  const {
    numColors = 10,
    hRange = [0, 1],
    sRange = [0, 1],
    vRange = [0, 1],
    exclude = [[0, 0, 0], [0, 0, 1]],
  } = options;

  const rand = (min: number, max: number) => min + Math.random() * (max - min);
  const points: XYZ[] = exclude.map(hsvToXyz);
  const result: HSV[] = [];

  while (result.length < numColors) {
    let bestHSV: HSV = [0, 0, 0];
    let bestXYZ: XYZ = [0, 0, 0];
    let bestDist = 0;

    for (let i = 0; i < 20; i++) {
      const hsv: HSV = [rand(hRange[0], hRange[1]), rand(sRange[0], sRange[1]), rand(vRange[0], vRange[1])];
      const xyz = hsvToXyz(hsv);
      const minDist = points.reduce((min, p) => Math.min(min, distSq(xyz, p)), 10);
      if (minDist > bestDist) {
        bestHSV = hsv;
        bestXYZ = xyz;
        bestDist = minDist;
      }
    }

    points.push(bestXYZ);
    result.push(bestHSV);
  }

  return result;
};

/**
 * Generates `numColors` random hex colours within the given hue and saturation ranges.
 */
export const randomHexColors = (options: {
  numColors?: number;
  hRange?: [number, number];
  sRange?: [number, number];
}): string[] =>
  randomHSVPalette(options).map((hsv) => rgbToHex(hsvToRgb(hsv)));
