import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Image from "next/image";
import Main from "components/Main";
import Footer from "components/Footer";

import EditorContext from "context/EditorContext";

import { getDefaultHash, getRandomHash } from "utils/hash";
import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useState } from "react";
import Timeline from "components/Timeline";
import Editor from "components/Editor";
import sprites from "data/sprite";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";
import { get } from "utils/localStorage";
import localStorageKeys from "constants/localStorageKeys";
import { Sprite } from "types/sprite";

const Home: NextPage = () => {
  const { query, push } = useRouter();
  const { state, onDrawEnd, loadSprite, onChangeFrame, onAddFrame } =
    useContext(EditorContext);

  const blankSprite = {
    id: guid(),
    name: "Blank sprite",
    description: "This is an example sprite",
    size: 11,
    frames: [
      "fff0;000;0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    ],
  };

  useEffect(() => {
    if (query.spriteId) {
      const spriteData = get(`${localStorageKeys.SPRITE}-${query.spriteId}`);
      if (spriteData) {
        const parsed = JSON.parse(spriteData) as Sprite;
        const TEMP_cleanParsed = {
          ...parsed,
          frames: parsed.frames.map((frame) => {
            return frame.replace(/#/gi, "");
          }),
        };
        loadSprite(TEMP_cleanParsed);
      }
    } else {
      loadSprite(blankSprite);
    }
  }, [query]);

  const onShare = () => {
    const params = `?id=${state.spriteData?.id}&name=${
      state.spriteData?.name
    }&frames=${state.spriteData?.frames.join("_")}'`;
    window.open(`/app/share${params}`, "_blank");
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
          title="New Sprite"
          backUrl={query.spriteId ? "/app/my-creations" : "/"}
          action={{
            text: "Settings",
            url: "/about",
          }}
        />

        <Main padded>
          <Editor />
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
