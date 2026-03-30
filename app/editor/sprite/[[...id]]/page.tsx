"use client";

import Header from "components/Header";
import Screen from "components/Screen";
import Main from "components/Main";
import Footer from "components/Footer";
import Editor from "components/Editor";
import SpriteForm from "components/SpriteForm";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { get } from "lib/storage";
import localStorageKeys from "constants/localStorageKeys";
import { Sprite } from "types/sprite";
import guid from "lib/guid";
import { compressSpriteToUrl } from "lib/encoding/url";
import { useSpriteStore } from "stores/sprite";
import EditorLayout from "components/EditorLayout";

export default function SpriteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params.id ? String(Array.isArray(params.id) ? params.id[0] : params.id) : undefined;
  const showEditMode = searchParams.get("editMode") === "true";

  const { spriteData, currentFrame, initSprite, addFrame, changeFrame, deleteFrame } =
    useSpriteStore();

  useEffect(() => {
    if (id) {
      const raw = get(`${localStorageKeys.SPRITE}-${id}`);
      if (raw) {
        initSprite(JSON.parse(raw) as Sprite);
      }
    } else {
      const newId = guid();
      initSprite({
        id: newId,
        version: "3.0.0",
        name: "Untitled",
        description: "This is an example sprite",
        palette: ["fff0"],
        size: 11,
        fps: 10,
        frames: ["a".repeat(11 * 11)],
      });
      router.replace(`/editor/sprite/${newId}`);
    }
  }, [id]);

  const onShare = () => {
    if (spriteData) {
      const compressed = compressSpriteToUrl(spriteData);
      window.open(`/share?d=${compressed}`, "_blank");
    }
  };

  return (
    <EditorLayout>
      <Screen>
        <Header
          action={{
            text: "Settings",
            url: id
              ? `/editor/sprite/${id}?editMode=true`
              : `/editor/sprite?editMode=true`,
          }}
        />

        <Main padded>
          {showEditMode ? <SpriteForm /> : <Editor />}
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
              children: "⌘ + A",
              label: "Add blank",
              hotKeys: "cmd+a",
              onToggle: () => spriteData?.frames && addFrame(currentFrame),
            },
            {
              children: "⌘ + D",
              label: "Duplicate",
              hotKeys: "cmd+d",
              onToggle: () =>
                addFrame(currentFrame, spriteData?.frames[currentFrame]),
            },
            {
              children: "⌘ + E",
              label: "Delete",
              hotKeys: "cmd+e",
              onToggle: () => spriteData?.frames && deleteFrame(currentFrame),
            },
          ]}
          button={{ text: "Share", onClick: onShare }}
        />
      </Screen>
    </EditorLayout>
  );
}
