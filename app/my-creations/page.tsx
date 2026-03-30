"use client";

import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import { useEffect, useState } from "react";
import { getAll, remove } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";
import { Sprite } from "types/sprite";
import { Spritesheet } from "types/sheet";
import { useRouter } from "next/navigation";
import SpriteGrid from "components/SpriteGrid";
import { encodeUrlSprite } from "lib/encoding/url";

type Creation = (Sprite | Spritesheet) & { type: "sprite" | "sheet" };

export default function MyCreationsPage() {
  const router = useRouter();
  const [creations, setCreations] = useState<Creation[]>([]);

  useEffect(() => {
    const spriteItems = getAll(localStorageKeys.SPRITE);
    const sprites = spriteItems
      .flatMap((item) => {
        try {
          return [{ ...(JSON.parse(item) as Sprite), type: "sprite" as const }];
        } catch {
          return [];
        }
      });

    const sheetItems = getAll(localStorageKeys.SPRITESHEET);
    const sheets = sheetItems
      .flatMap((item) => {
        try {
          return [{ ...(JSON.parse(item) as Spritesheet), type: "sheet" as const }];
        } catch {
          return [];
        }
      });

    setCreations([...sprites, ...sheets].sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const handleView = (id: string, type: "sprite" | "sheet") => {
    router.push(type === "sprite" ? `/editor/sprite/${id}` : `/editor/sheet/${id}`);
  };

  const handleShare = (id: string) => {
    const creation = creations.find((item) => item.id === id);
    if (creation?.type === "sprite") {
      const { n, a, s, d, p, f } = encodeUrlSprite(creation as Sprite);
      window.open(`/share?n=${n}&a=${a}&s=${s}&d=${d}&p=${p}&f=${f}`, "_blank");
    }
  };

  const handleDelete = (id: string, type: "sprite" | "sheet") => {
    const key = type === "sprite"
      ? `${localStorageKeys.SPRITE}-${id}`
      : `${localStorageKeys.SPRITESHEET}-${id}`;
    remove(key);
    setCreations((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Screen scrolling>
      <Header
        title="My Creations"
        action={{ text: "Edit", url: "/my-creations?edit=true" }}
      />

      <Main centered padded>
        <SpriteGrid
          creations={creations}
          onView={handleView}
          onShare={handleShare}
          onDelete={handleDelete}
        />
      </Main>

      <Footer
        shortcuts={[
          {
            children: "⏎",
            label: "Draw",
            hotKeys: "enter",
            onToggle: () => router.push("/editor/sprite"),
          },
        ]}
        action={{ text: "Draw!", url: "/editor/sprite" }}
      />
    </Screen>
  );
}
