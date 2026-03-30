import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import EditorContext from "context/EditorContext";

import { getDefaultHash, getRandomHash, getHashArray, encodeUrlSprite } from "utils/hash";
import LZString from "utils/lz";
// import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useState } from "react";
import Timeline from "components/Timeline";
import Editor from "components/Editor";
import sprites from "data/sprite";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";
import { get } from "utils/localStorage";
import localStorageKeys from "constants/localStorageKeys";
import { Sprite } from "types/sprite";
import SpriteForm from "components/SpriteForm";

const Home: NextPage = () => {
  const { query, push } = useRouter();

  const {
    state,
    onDrawEnd,
    initSprite,
    onChangeFrame,
    onAddFrame,
    onDeleteFrame,
  } = useContext(EditorContext);

  const spriteId = useMemo(() => {
    return query.spriteId ? String(query.spriteId) : undefined;
  }, [query.spriteId]);

  const showEditMode = useMemo(() => {
    return query.editMode === "true";
  }, [query.editMode]);

  useEffect(() => {
    if (spriteId) {
      const spriteData = get(`${localStorageKeys.SPRITE}-${spriteId}`);
      if (spriteData) {
        const parsed = JSON.parse(spriteData) as Sprite;
        initSprite(parsed);
      }
    } else {
      const spriteId = guid();

      initSprite({
        id: spriteId,
        version: "3.0.0",
        name: "Untitled",
        description: "This is an example sprite",
        palette: ["fff0"],
        size: 11,
        fps: 10,
        frames: ["a".repeat(11 * 11)],
      });

      // Update URL with new sprite id
      push(`/app/editor/sprite/${spriteId}`, undefined, {
        shallow: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spriteId]);

  const onShare = () => {
    if (state.spriteData) {
      const urlSprite = encodeUrlSprite(state.spriteData);
      const params = JSON.stringify(urlSprite);
      const compressedParams = LZString.compressToEncodedURIComponent(params);

      window.open(`/app/share?d=${compressedParams}`, "_blank");
    }
  };

  const onSaveSvg = () => {
    if (!state.spriteData) return;
    const sprite = state.spriteData;
    const frame = sprite.frames[state.currentFrame];
    const size = sprite.size || Math.sqrt(frame.length);
    const hashArray = getHashArray(frame, sprite.palette);

    type Rect = { x: number; y: number; width: number; height: number; hex: string };
    const rectList: Rect[] = [];
    const lastRect = new Map<string, Rect>();
    for (let row = 0; row < size; row++) {
      let col = 0;
      while (col < size) {
        const hex = hashArray[row * size + col];
        if (!hex || (hex.length === 4 && hex[3] === "0")) { col++; continue; }
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
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><style>rect { shape-rendering: crispEdges; }</style>${rects.join("")}</svg>`;

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sprite.name || "sprite"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      onMouseUp={onDrawEnd}
      onTouchEnd={onDrawEnd}
      onTouchCancel={onDrawEnd}
      onMouseLeave={onDrawEnd}
    >
      <Screen>
        <Head>
          <title>{state?.spriteData?.name} - Miko.app</title>
          <meta
            name="description"
            content="Sprite animator and tilemap maker"
          />
          <link rel="icon" type="image/x-icon" id="favicon" />
        </Head>

        <Header
          action={{
            text: "Settings",
            url: query.spriteId
              ? `/app/editor/sprite/${query.spriteId}?editMode=true`
              : `/app/editor/sprite?editMode=true`,
          }}
        />

        <Main padded>
          <>{showEditMode && <SpriteForm />}</>
          <>{!showEditMode && <Editor />}</>
        </Main>

        <Footer
          button={{
            text: "Share",
            onClick: () => onShare(),
          }}
          shortcuts={[
            {
              children: "←",
              label: "Previous",
              hotKeys: "left",
              disabled: state.currentFrame === 0,
              onToggle: () => onChangeFrame(state.currentFrame - 1),
            },
            {
              children: "→",
              label: "Next",
              hotKeys: "right",
              disabled:
                state.spriteData &&
                state.currentFrame === state?.spriteData?.frames.length - 1,
              onToggle: () => onChangeFrame(state.currentFrame + 1),
            },
            {
              children: "⌘ + A",
              label: "Add blank",
              hotKeys: "cmd+a",
              onToggle: () =>
                state.spriteData?.frames && onAddFrame(state.currentFrame),
            },
            {
              children: "⌘ + D",
              label: "Duplicate",
              hotKeys: "cmd+d",
              onToggle: () =>
                onAddFrame(
                  state.currentFrame,
                  state.spriteData?.frames[state.currentFrame]
                ),
            },
            {
              children: "⌘ + E",
              label: "Delete",
              hotKeys: "cmd+e",
              onToggle: () =>
                state.spriteData?.frames && onDeleteFrame(state.currentFrame),
            },
            {
              children: "⌘ + S",
              label: "Save SVG",
              hotKeys: "cmd+s",
              onToggle: () => onSaveSvg(),
            },
            // {
            //   children: "⇧ + ←",
            //   label: "Shift left",
            //   hotKeys: "shift+left",
            //   disabled: !state.currentHash,
            //   onToggle: () => onChangeFrame(state.currentFrame - 1),
            // },
            // {
            //   children: "⇧ + →",
            //   label: "Shift right",
            //   hotKeys: "shift+right",
            //   disabled: !state.currentHash,
            //   onToggle: () => onChangeFrame(state.currentFrame + 1),
            // },
          ]}
        />
      </Screen>
    </div>
  );
};

export default Home;
