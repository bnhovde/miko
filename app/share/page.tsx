"use client";

import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sprite } from "types/sprite";
import SpritePlayer from "components/SpritePlayer";
import { decompressSpriteFromUrl } from "lib/encoding/url";

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCopied, setIsCopied] = useState(false);

  const data = searchParams.get("d") ?? undefined;
  const spriteData: Sprite | null = data ? decompressSpriteFromUrl(data) : null;

  const copyData = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Screen>
      <Header action={{ text: "My creations", url: "/my-creations" }} />

      <Main centered>
        <div style={{ width: "100%", maxWidth: "48rem" }}>
          {spriteData ? (
            <SpritePlayer spriteData={spriteData} id="editor-canvas" />
          ) : (
            <p style={{ textAlign: "center" }}>Cannot parse sprite. Check the URL!</p>
          )}
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
            children: "⌘ + C",
            label: "Copy data",
            hotKeys: "cmd+c",
            isActive: isCopied,
            onToggle: copyData,
          },
        ]}
        action={{ text: "Let me try!", url: "/editor/sprite" }}
      />
    </Screen>
  );
}
