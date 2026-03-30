"use client";

import React from "react";
import classNames from "classnames";

import SpritePicker from "components/SpritePicker";
import SheetControls from "components/SheetControls";
import CanvasSheet from "components/CanvasSheet";
import ToolPickerSheet from "components/ToolPickerSheet";
import Toolbar from "components/Toolbar";

import styles from "./EditorSheet.module.css";
import { useSheetStore } from "stores/sheet";

const EditorSheet: React.FC = () => {
  const { selectSpriteForSheet, currentSheetSprite } = useSheetStore();

  return (
    <section className={classNames(styles.editor)}>
      <div className={styles.inner}>
        <div className={styles.sprites}>
          <SpritePicker
            onSelect={selectSpriteForSheet}
            selecedItems={currentSheetSprite ? [currentSheetSprite] : []}
          />
        </div>

        <div className={styles.canvas}>
          <CanvasSheet />
        </div>

        <div className={styles.controls}>
          <SheetControls />
        </div>
      </div>

      <Toolbar>
        <ToolPickerSheet />
      </Toolbar>
    </section>
  );
};

export default EditorSheet;
