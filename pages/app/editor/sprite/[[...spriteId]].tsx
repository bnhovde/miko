import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import EditorContext from "context/EditorContext";

import { getDefaultHash, getRandomHash, encodeUrlSprite } from "utils/hash";
import { frameToSvg } from "utils/svg";
import LZString from "utils/lz";
// import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useState } from "react";
import Timeline from "components/Timeline";
import Editor from "components/Editor";
import sprites from "data/sprite";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";
import { useHotkeys } from "react-hotkeys-hook";
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
    onUndo,
    onRedo,
    canUndo,
    canRedo,
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

  const onDeleteCurrentFrame = () =>
    state.spriteData?.frames && onDeleteFrame(state.currentFrame);

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
    const svg = frameToSvg(sprite, state.currentFrame);

    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sprite.name || "sprite"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete and Save SVG live in the Actions menu now. Their shortcuts used
  // to be registered by the inline Shortcut buttons that rendered them, so
  // they have to be bound here to keep working.
  useHotkeys("cmd+e", (event) => {
    event.preventDefault();
    onDeleteCurrentFrame();
  });

  useHotkeys("cmd+s", (event) => {
    event.preventDefault();
    onSaveSvg();
  });

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
          actions={[
            {
              label: "Add blank frame  ⌘A",
              onClick: () =>
                state.spriteData?.frames && onAddFrame(state.currentFrame),
            },
            {
              label: "Duplicate frame  ⌘D",
              onClick: () =>
                onAddFrame(
                  state.currentFrame,
                  state.spriteData?.frames[state.currentFrame]
                ),
            },
            {
              label: "Delete frame  ⌘E",
              disabled:
                state.spriteData && state.spriteData.frames.length < 2,
              onClick: () => onDeleteCurrentFrame(),
            },
            {
              label: "Previous frame  ←",
              disabled: state.currentFrame === 0,
              onClick: () => onChangeFrame(state.currentFrame - 1),
            },
            {
              label: "Next frame  →",
              disabled:
                state.spriteData &&
                state.currentFrame === state.spriteData.frames.length - 1,
              onClick: () => onChangeFrame(state.currentFrame + 1),
            },
            {
              label: "Undo  ⌘Z",
              disabled: !canUndo,
              onClick: () => onUndo(),
            },
            {
              label: "Redo  ⌘⇧Z",
              disabled: !canRedo,
              onClick: () => onRedo(),
            },
            {
              label: "Save as SVG  ⌘S",
              onClick: () => onSaveSvg(),
            },
            {
              label: "Share",
              onClick: () => onShare(),
            },
          ]}
          shortcuts={[
            {
              children: "←",
              label: "Prev",
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
              children: "⌘ + Z",
              label: "Undo",
              hotKeys: "cmd+z",
              disabled: !canUndo,
              onToggle: () => onUndo(),
            },
            {
              children: "⌘ + ⇧ + Z",
              label: "Redo",
              hotKeys: "cmd+shift+z",
              disabled: !canRedo,
              onToggle: () => onRedo(),
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
