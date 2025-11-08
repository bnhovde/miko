import React, { useContext } from "react";
import classNames from "classnames";

import ColorPicker from "components/ColorPicker";
import Canvas from "components/Canvas";
import ToolPicker from "components/ToolPicker";
import ToolPickerSheet from "components/ToolPickerSheet";

import styles from "./EditorSheet.module.css";
import CanvasSheet from "components/CanvasSheet";
import SpritePicker from "components/SpritePicker";
import EditorContext from "context/EditorContext";

const EditorSheet: React.FC = () => {
  const { state, onSelectSpriteForSheet } = useContext(EditorContext);

  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  return (
    <section className={editorClass}>
      <div className={styles.inner}>
        <div className={styles.colors}>
          <SpritePicker
            onSelect={onSelectSpriteForSheet}
            selecedItems={
              state.currentSheetSprite ? [state.currentSheetSprite] : []
            }
          />
        </div>

        <div className={styles.canvases}>
          <div className={styles.canvas}>
            <CanvasSheet />
            <div className={styles.toolbar}>
              <ToolPickerSheet />
            </div>
          </div>
        </div>

        <div className={styles.sprites}></div>
      </div>
    </section>
  );
};

export default EditorSheet;
