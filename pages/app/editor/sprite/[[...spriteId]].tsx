import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import EditorContext from "context/EditorContext";

import { getDefaultHash, getRandomHash, encodeUrlSprite } from "utils/hash";
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
      initSprite({
        id: guid(),
        version: "3.0.0",
        name: "Untitled",
        description: "This is an example sprite",
        palette: ["fff0"],
        size: 11,
        fps: 10,
        frames: ["a".repeat(11 * 11)],
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

  return (
    <div
      onMouseUp={onDrawEnd}
      onTouchEnd={onDrawEnd}
      onTouchCancel={onDrawEnd}
      onMouseLeave={onDrawEnd}
    >
      <Screen>
        <Head>
          <title>Miko.app</title>
          <meta
            name="description"
            content="Sprite animator and tilemap maker"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header
          backUrl={query.spriteId ? "/app/my-creations" : "/"}
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
          button={{
            text: "Share",
            onClick: () => onShare(),
          }}
        />
      </Screen>
    </div>
  );
};

export default Home;
