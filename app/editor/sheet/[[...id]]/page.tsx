"use client";

import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import EditorSheet from "components/EditorSheet";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { get } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";
import { Spritesheet } from "types/sheet";
import guid from "lib/guid";
import { useSheetStore } from "stores/sheet";
import { useSpriteStore } from "stores/sprite";
import EditorLayout from "components/EditorLayout";

export default function SheetEditorPage() {
  const router = useRouter();
  const params = useParams();

  const id = params.id ? String(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;

  const { initSheet, rotateSheetCell, flipSheetCell, currentSheetSprite } = useSheetStore();
  const { currentFrame, spriteData, addFrame, changeFrame } = useSpriteStore();

  useEffect(() => {
    if (id) {
      const raw = get(`${localStorageKeys.SPRITESHEET}-${id}`);
      if (raw) {
        initSheet(JSON.parse(raw) as Spritesheet);
      }
    } else {
      const newSheet: Spritesheet = {
        id: guid(),
        version: "2.0.0",
        name: "Untitled",
        description: "This is an example spritesheet",
        size: 11,
        fps: 10,
        grid: ["0".repeat(121)],
        items: [],
        sprites: [],
      };
      initSheet(newSheet);
      router.replace(`/editor/sheet/${newSheet.id}`);
    }
  }, [id]);

  return (
    <EditorLayout>
      <Screen>
        <Header
          title="New Spritesheet"
          action={{ text: "Settings", url: "/about" }}
        />

        <Main padded>
          <EditorSheet />
        </Main>

        <Footer
          shortcuts={[
            {
              children: "←",
              label: "Previous",
              hotKeys: "left",
              disabled: currentFrame === 0,
              onToggle: () => changeFrame(currentFrame - 1),
            },
            {
              children: "→",
              label: "Next",
              hotKeys: "right",
              disabled:
                spriteData != null &&
                currentFrame === (spriteData.frames.length - 1),
              onToggle: () => changeFrame(currentFrame + 1),
            },
            {
              children: "⌘ + D",
              label: "Duplicate",
              hotKeys: "cmd+d",
              onToggle: () =>
                addFrame(currentFrame, spriteData?.frames[currentFrame]),
            },
            {
              children: "⌘ + F",
              label: "Add blank",
              hotKeys: "cmd+f",
              onToggle: () => spriteData?.frames && addFrame(currentFrame),
            },
            {
              children: "R",
              label: "Rotate",
              hotKeys: "r",
              disabled: !currentSheetSprite,
              onToggle: rotateSheetCell,
            },
            {
              children: "H",
              label: "Flip H",
              hotKeys: "h",
              disabled: !currentSheetSprite,
              onToggle: () => flipSheetCell("x"),
            },
            {
              children: "V",
              label: "Flip V",
              hotKeys: "v",
              disabled: !currentSheetSprite,
              onToggle: () => flipSheetCell("y"),
            },
          ]}
          button={{ text: "Share", onClick: () => {} }}
        />
      </Screen>
    </EditorLayout>
  );
}
