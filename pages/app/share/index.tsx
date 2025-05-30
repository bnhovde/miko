import type { NextPage } from "next";

import LZString from "utils/lz";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import { decodeUrlSprite, getRandomHash } from "utils/hash";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Sprite, URLSprite } from "types/sprite";
import SpritePlayerLarge from "components/SpritePlayerLarge";

const decompress = (data?: string | string[]): Sprite | null => {
  try {
    const decompressedString = LZString.decompressFromEncodedURIComponent(
      String(data)
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

  const spriteData = decompress(query.d);

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
        ]}
        action={{ text: "Let me try!", url: "/app/editor/sprite" }}
      />
    </Screen>
  );
};

export default Home;
