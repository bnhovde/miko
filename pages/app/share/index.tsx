import type { NextPage } from "next";

import LZString from "utils/lz";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import { decodeUrlSprite, getHashArray, getRandomHash } from "utils/hash";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Sprite, URLSprite } from "types/sprite";
import SpritePlayerLarge from "components/SpritePlayerLarge";

const decompress = (data?: string | string[]): Sprite | null => {
  try {
    const decompressedString = LZString.decompressFromEncodedURIComponent(
      String(data),
    );
    if (decompressedString) {
      const spriteData = JSON.parse(decompressedString);
      const { n, v, a, s, d, p, f } = spriteData;

      const urlSprite = {
        n: n as string,
        v: v || "unknown",
        a: a as string,
        s: parseInt(String(s)) as number,
        d: parseInt(String(d)) as number,
        p: String(p).split(","),
        f: String(f).split(","),
      };

      return decodeUrlSprite(urlSprite);
    }

    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const Home: NextPage = () => {
  const router = useRouter();
  const { query } = router;
  const [isCopied, setIsCopied] = useState(false);
  const [isSvgCopied, setIsSvgCopied] = useState(false);

  const spriteData = decompress(query.d);

  const copySvg = async (sprite: Sprite | null) => {
    if (!sprite) return;
    const size = Math.sqrt(sprite.frames[0].length);
    const groups = sprite.frames.map((frame, i) => {
      const hashArray = getHashArray(frame, sprite.palette);
      type Rect = { x: number; y: number; width: number; height: number; hex: string };
      const rectList: Rect[] = [];
      const lastRect = new Map<string, Rect>();
      for (let row = 0; row < size; row++) {
        let col = 0;
        while (col < size) {
          const hex = hashArray[row * size + col];
          if (hex.length === 4 && hex[3] === "0") { col++; continue; }
          let width = 1;
          while (col + width < size && hashArray[row * size + col + width] === hex) width++;
          const key = `${col},${width},${hex}`;
          const prev = lastRect.get(key);
          if (prev && prev.y + prev.height === row) {
            prev.height++;
          } else {
            const rect: Rect = { x: col, y: row, width, height: 1, hex };
            rectList.push(rect);
            lastRect.set(key, rect);
          }
          col += width;
        }
      }
      const rects = rectList.map(r => `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="#${r.hex}"/>`);
      return `<svg x="${i * size}" y="0" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rects.join("")}</svg>`;
    });
    const totalWidth = size * sprite.frames.length;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${size}"><style>rect { shape-rendering: crispEdges; }</style>${groups.join("")}</svg>`;
    try {
      await navigator.clipboard.writeText(svg);
      setIsSvgCopied(true);
    } catch (err) {
      console.error("Failed to copy SVG: ", err);
    }
  };

  const copyData = async (data?: string | string[]) => {
    try {
      await navigator.clipboard.writeText(String(data));
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <Screen>
      <Head>
        <title>{`${spriteData?.name} - Miko.app`}</title>
        <meta name="description" content="Pixel editor" />
        <link rel="icon" type="image/x-icon" id="favicon" />
      </Head>

      <Header
        action={{
          text: "My creations",
          url: "/app/my-creations",
        }}
      />

      <Main centered>
        <div
          style={{
            width: "100%",
            maxWidth: "48rem",
          }}
        >
          <>
            {spriteData && (
              <SpritePlayerLarge spriteData={spriteData} id="editor-canvas" />
            )}
          </>
          <>
            {!spriteData && (
              <p style={{ textAlign: "center" }}>
                Cannot parse sprite. Check the URL!
              </p>
            )}
          </>
        </div>
      </Main>

      <Footer
        shortcuts={[
          {
            children: "L",
            label: "Login",
            hotKeys: "l",
            onToggle: () => router.push("/app/login"),
          },
          {
            children: "⏎",
            label: "Draw",
            hotKeys: "enter",
            onToggle: () => router.push("/app/editor/sprite"),
          },
          {
            children: "⌘ + C",
            label: "Copy data",
            hotKeys: "cmd+c",
            isActive: isCopied,
            onToggle: () => copyData(query.d),
          },
          {
            children: "SVG",
            label: "Copy SVG",
            hotKeys: "s",
            isActive: isSvgCopied,
            onToggle: () => copySvg(spriteData),
          },
        ]}
        action={{ text: "Let me try!", url: "/app/editor/sprite" }}
      />
    </Screen>
  );
};

export default Home;
