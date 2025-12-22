import type { NextPage } from "next";

import Header from "components/Header";
import Screen from "components/Screen";
import Head from "next/head";
import Main from "components/Main";
import Footer from "components/Footer";

import { useEffect, useMemo } from "react";
import guid from "utils/guid";
import Router, { useRouter } from "next/router";

import EditorSheet from "components/EditorSheet";
import { useSheetStore } from "../../../../src/stores/useSheetStore";
import { useEditorStore } from "../../../../src/stores/useEditorStore";
import { sheetRepository } from "../../../../src/repositories/SheetRepository";

const SheetPage: NextPage = () => {
  const router = useRouter();
  const { query, push } = router;
  const { currentSheet, loadSheet, rotateCell, flipCell, selectedSprite } =
    useSheetStore();
  const { sheetViewMode, setSheetViewMode } = useEditorStore();

  const sheetId = useMemo(() => {
    return query.sheetId ? String(query.sheetId) : undefined;
  }, [query.sheetId]);

  // View rotation helpers (similar to SheetControls)
  const rotationOrder: Array<"front" | "right" | "back" | "left"> = [
    "front",
    "right",
    "back",
    "left",
  ];

  const rotateViewLeft = () => {
    const viewMode = sheetViewMode || "2d";
    if (viewMode === "2d" || viewMode === "3d") {
      setSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex =
      (currentIndex - 1 + rotationOrder.length) % rotationOrder.length;
    setSheetViewMode(rotationOrder[nextIndex]);
  };

  const rotateViewRight = () => {
    const viewMode = sheetViewMode || "2d";
    if (viewMode === "2d" || viewMode === "3d") {
      setSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex = (currentIndex + 1) % rotationOrder.length;
    setSheetViewMode(rotationOrder[nextIndex]);
  };

  useEffect(() => {
    const loadData = async () => {
      if (sheetId) {
        const sheet = await sheetRepository.load(sheetId);
        if (sheet) {
          loadSheet(sheet);
        }
      } else {
        // Create new sheet
        const newSheetId = guid();
        const newSheet = {
          id: newSheetId,
          version: "2.0",
          name: "Untitled Sheet",
          description: "New spritesheet",
          size: 11,
          fps: 10,
          grid: ["a".repeat(11 * 11)],
          items: [],
          sprites: [],
        };

        await sheetRepository.save(newSheet);
        loadSheet(newSheet);

        // Update URL with new sheet id
        push(`/app/editor/sheet/${newSheetId}`, undefined, {
          shallow: true,
        });
      }
    };

    loadData();
  }, [sheetId, loadSheet, push]);

  return (
    <Screen scrolling>
      <Head>
        <title>Sheet Editor</title>
        <meta name="description" content="Spritesheet editor" />
        <link rel="icon" type="image/x-icon" id="favicon" />
      </Head>

      <Header
        title={currentSheet?.name || "New Sheet"}
        action={{
          text: "Edit",
          url: `/app/editor/sheet/${sheetId}?editMode=true`,
        }}
      />

      <Main padded>
        <EditorSheet />
      </Main>

      <Footer
        action={{
          text: "Share",
          url: "#",
          onClick: () => {
            // TODO: Implement sheet sharing
            console.log("Share sheet functionality coming soon!");
          },
        }}
        shortcuts={[
          {
            children: "←",
            label: "Rotate view left",
            hotKeys: "left",
            onToggle: rotateViewLeft,
          },
          {
            children: "→",
            label: "Rotate view right",
            hotKeys: "right",
            onToggle: rotateViewRight,
          },
          {
            children: "R",
            label: "Rotate cell",
            hotKeys: "r",
            disabled: !selectedSprite,
            onToggle: rotateCell,
          },
          {
            children: "X",
            label: "Flip X",
            hotKeys: "x",
            disabled: !selectedSprite,
            onToggle: () => flipCell("x"),
          },
          {
            children: "Y",
            label: "Flip Y",
            hotKeys: "y",
            disabled: !selectedSprite,
            onToggle: () => flipCell("y"),
          },
        ]}
      />
    </Screen>
  );
};

export default SheetPage;
