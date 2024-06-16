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
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Timeline from "components/Timeline";
import EditorSheet from "components/EditorSheet";
import sprites from "data/sprite";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";
import { get } from "utils/localStorage";
import localStorageKeys from "constants/localStorageKeys";
import { Spritesheet } from "types/sheet";
import { SpritePackage } from "types/package";
import EditorPackage from "components/EditorPackage";
import PackageForm from "components/PackageForm";
import html2canvas from "html2canvas";

const Home: NextPage = () => {
  const { query, push } = useRouter();
  const { state, initPackage } = useContext(EditorContext);
  const printRef = useRef();

  const showEditMode = useMemo(() => {
    return query.editMode === "true";
  }, [query.editMode]);

  const blankSpritePackage = {
    id: guid(),
    version: "2.0.0",
    name: "Untitled package",
    description: "This is a sprite package made with Miko.app",
    size: 16,
    sprites: [],
  };

  useEffect(() => {
    if (query.packageId) {
      const packageData = get(`${localStorageKeys.PACKAGE}-${query.packageId}`);
      if (packageData) {
        const parsed = JSON.parse(packageData) as SpritePackage;
        initPackage(parsed);
      }
    } else {
      initPackage(blankSpritePackage);
    }
  }, []);

  const onExport = async () => {
    const element = document.getElementById("package-body");
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
    });

    const data = canvas.toDataURL("image/png");
    const link = document.createElement("a");

    if (typeof link.download === "string") {
      link.href = data;
      link.download = "image.jpg";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  return (
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
        backUrl={query.spriteId ? "/app/my-creations" : "/"}
        action={{
          text: "Settings",
          url: query.spriteId
            ? `/app/editor/package/${query.packageId}?editMode=true`
            : `/app/editor/package?editMode=true`,
        }}
      />

      <Main padded>
        <>{showEditMode && <PackageForm />}</>
        <>{!showEditMode && <EditorPackage />}</>
      </Main>

      <Footer
        shortcuts={[
          {
            children: "⌘ + L",
            label: "Toggle labels",
            hotKeys: "cmd+l",
            disabled: state.currentFrame === 0,
            onToggle: () => {},
          },
          // {
          //   children: "→",
          //   label: "Next",
          //   hotKeys: "right",
          //   disabled:
          //     state.spriteData &&
          //     state.currentFrame === state?.spriteData?.frames.length - 1,
          //   onToggle: () => onChangeFrame(state.currentFrame + 1),
          // },
          // {
          //   children: "⌘ + D",
          //   label: "Duplicate",
          //   hotKeys: "cmd+d",
          //   onToggle: () =>
          //     onAddFrame(
          //       state.currentFrame,
          //       state.spriteData?.frames[state.currentFrame]
          //     ),
          // },
          // {
          //   children: "⌘ + F",
          //   label: "Add blank",
          //   hotKeys: "cmd+f",
          //   onToggle: () =>
          //     state.spriteData?.frames && onAddFrame(state.currentFrame),
          // },
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
          onClick: () => onExport(),
        }}
      />
    </Screen>
  );
};

export default Home;
