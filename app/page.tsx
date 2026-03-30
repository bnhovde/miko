"use client";

import type { Metadata } from "next";
import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import { getRandomHash, getRandomPalette } from "lib/encoding/hash";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import SpritePreview from "components/SpritePreview";

export default function HomePage() {
  const router = useRouter();

  const randomSprite = useMemo(
    () => ({ hash: getRandomHash(6), palette: getRandomPalette() }),
    []
  );

  return (
    <Screen>
      <Header
        action={{ text: "My sprites", url: "/my-creations" }}
      />

      <Main centered>
        <div style={{ width: "80%", maxWidth: "48rem" }}>
          <SpritePreview
            hash={randomSprite.hash}
            palette={randomSprite.palette}
            title="Random"
            author={{ id: "123", name: "Miko" }}
          />
        </div>
      </Main>

      <Footer
        shortcuts={[
          {
            children: "⏎",
            label: "Draw",
            hotKeys: "enter",
            onToggle: () => router.push("/editor/sprite"),
          },
          {
            children: "S",
            label: "Combine",
            hotKeys: "s",
            onToggle: () => router.push("/editor/sheet"),
          },
          {
            children: "P",
            label: "Package",
            hotKeys: "p",
            onToggle: () => router.push("/editor/package"),
          },
        ]}
        action={{ text: "Draw!", url: "/editor/sprite" }}
      />
    </Screen>
  );
}
