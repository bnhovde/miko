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
  const { query, push, isReady, basePath } = useRouter();
  const { state, initPackage } = useContext(EditorContext);
  const printRef = useRef();

  const showEditMode = useMemo(() => {
    return query.editMode === "true";
  }, [query.editMode]);

  const blankSpritePackage = {
    id: guid(),
    version: "2.0.0",
    name: "Untitled package",
    description: "This is a sprite package made with Mikro Paint",
    size: 11,
    sprites: [],
  };

  useEffect(() => {
    // `query` is empty on the first render after a reload: this route is an
    // optional catch-all, and a statically exported page has no server to
    // fill the params in — Next populates them on the client, and isReady
    // is how it says so. Without this the id reads as undefined on that
    // first pass and the "nothing requested" branch below replaces what you
    // reloaded with a blank one.
    if (!isReady) return;
    if (query.packageId) {
      const packageData = get(`${localStorageKeys.PACKAGE}-${query.packageId}`);
      if (packageData) {
        const parsed = JSON.parse(packageData) as SpritePackage;
        initPackage(parsed);
      }
    } else {
      initPackage(blankSpritePackage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.packageId, isReady]);

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
      // Set filename to package name

      link.href = data;
      link.download = state?.packageData?.name
        ? `${state.packageData.name}.png`
        : `package.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(data);
    }
  };

  return (
    <Screen scrolling>
      <Head>
        <title>Mikro Paint</title>
        <meta
          name="description"
          content="Spritesheet animator and tilemap maker"
        />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/favicon.svg`} id="favicon" />
      </Head>

      <Header
        title={state.packageData?.name || "New Package"}
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
          text: "Export",
          onClick: () => onExport(),
        }}
      />
    </Screen>
  );
};

export default Home;
