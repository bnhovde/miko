import React from "react";
import classNames from "classnames";

import ColorPicker from "components/ColorPicker";
import Canvas from "components/Canvas";
import ToolPicker from "components/ToolPicker";
import ToolPickerSheet from "components/ToolPickerSheet";

import styles from "./EditorSheet.module.css";
import CanvasSheet from "components/CanvasSheet";
import SpritePicker from "components/SpritePicker";
import SheetControls from "components/SheetControls";
import Toolbar from "components/Toolbar";
import { useSheetStore } from "src/stores/useSheetStore";

const EditorSheet: React.FC = () => {
  const { selectedSprite, selectSprite } = useSheetStore();

  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  return (
    <section className={editorClass}>
      <div className={styles.inner}>
        <div className={styles.sprites}>
          <SpritePicker
            onSelect={selectSprite}
            selecedItems={
              selectedSprite ? [selectedSprite] : []
            }
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
