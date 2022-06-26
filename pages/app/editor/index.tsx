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
import { useContext, useMemo, useState } from "react";
import Timeline from "components/Timeline";
import Editor from "components/Editor";
import sprites from "data/sprite";

const Home: NextPage = () => {
  const { onDrawEnd } = useContext(EditorContext);

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
          backUrl="/"
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
            { key: "N", label: "New frame" },
            { key: "D", label: "Duplicate frame" },
          ]}
        />
      </Screen>
    </div>
  );
};

export default Home;
