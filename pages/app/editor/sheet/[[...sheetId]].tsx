import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Image from "next/image";
import Main from "components/Main";
import Footer from "components/Footer";

import EditorContext from "context/EditorContext";

import { getDefaultHash, getRandomHash, encodeUrlSprite } from "utils/hash";
import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useState } from "react";
import Timeline from "components/Timeline";
import EditorSheet from "components/EditorSheet";
import sprites from "data/sprite";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";
import { get } from "utils/localStorage";
import localStorageKeys from "constants/localStorageKeys";
import { Spritesheet } from "types/sheet";

const Home: NextPage = () => {
  const { query, push } = useRouter();
  const { state, onDrawEnd, initSheet, onChangeFrame, onAddFrame } =
    useContext(EditorContext);

  const blankSprite = {
    id: guid(),
    version: "2.0.0",
    name: "Untitled",
    description: "This is an example sprite",
    palette: ["fff0"],
    size: 11,
    fps: 10,
    frames: [
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    ],
  };

  const blankSpritesheet = {
    id: guid(),
    version: "2.0.0",
    name: "Untitled",
    description: "This is an example spritesheet",
    size: 11,
    fps: 10,
    grid: [
      "a000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    ],
    items: [
      {
        spriteId: blankSprite.id,
        rotation: 0,
      },
    ],
    sprites: [blankSprite],
  };

  useEffect(() => {
    if (query.sheetId) {
      const spriteData = get(
        `${localStorageKeys.SPRITESHEET}-${query.sheetId}`
      );
      if (spriteData) {
        const parsed = JSON.parse(spriteData) as Spritesheet;
        initSheet(parsed);
      }
    } else {
      initSheet(blankSpritesheet);
    }
  }, [query]);

  const onShare = () => {
    if (state.spriteData) {
      const { n, a, s, d, p, f } = encodeUrlSprite(state.spriteData);

      const params = `?n=${n}&a=${a}&s=${s}&d=${d}&p=${p}&f=${f}`;
      window.open(`/app/share${params}`, "_blank");
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
            content="Spritesheet animator and tilemap maker"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <Header
          title="New Spritesheet"
          backUrl={query.spriteId ? "/app/my-creations" : "/"}
          action={{
            text: "Settings",
            url: "/about",
          }}
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
              children: "⌘ + F",
              label: "Add blank",
              hotKeys: "cmd+f",
              onToggle: () =>
                state.spriteData?.frames && onAddFrame(state.currentFrame),
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
