const frame1 =
  "fff0;000,d6a107,8c6f5f,cfc57b,cf9d9f,78bcd9,66dd8d;0000ccc00000000bbb00000000aea0000000bbebb000000bbbbb0000000bbb0000000fbbbf00000fffgfff000f0ffgff0f00f0ffgff0f00f0fffff0f0";

const sprite = {
  id: "example",
  name: "Example sprite",
  description: "This is an example sprite",
  size: 16,
  fps: 10,
  frames: [frame1],
};

export const urlSprite = {
  n: "Example sprite",
  a: "miko",
  s: 16,
  d: 10,
  p: [
    "fff0",
    "000",
    "d6a107",
    "8c6f5f",
    "cfc57b",
    "cf9d9f",
    "78bcd9",
    "66dd8d",
  ],
  f: [
    "a4c3a6b3a7aea8b2eb2a6b5a7b3a7fb3fa5f3gf3a3faf2gf2afa2faf2gf2afa2faf4afa",
    "b2-5a7aea8b2eb2a6b5a7b3a7f-23faf2gf2af-8a",
  ],
};

const sprites = [sprite];

export default sprites;
