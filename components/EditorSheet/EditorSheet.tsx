import React from "react";
import classNames from "classnames";

import ColorPicker from "components/ColorPicker";
import Canvas from "components/Canvas";
import ToolPicker from "components/ToolPicker";
import ToolPickerSheet from "components/ToolPickerSheet";

import styles from "./EditorSheet.module.css";
import CanvasSheet from "components/CanvasSheet";
import SpritePicker from "components/SpritePicker";

const EditorSheet: React.FC = () => {
  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  return (
    <section className={editorClass}>
      <div className={styles.inner}>
        <div className={styles.colors}>
          <ColorPicker />
        </div>

        <div className={styles.canvases}>
          <div className={styles.canvas}>
            <Canvas />
            <div className={styles.toolbar}>
              <ToolPicker />
            </div>
          </div>

          <div className={styles.canvas}>
            <CanvasSheet />
            <div className={styles.toolbar}>
              <ToolPickerSheet />
            </div>
          </div>
        </div>

        <div className={styles.sprites}>
          <SpritePicker onSelect={() => {}} />
        </div>
      </div>
    </section>
  );
};

export default EditorSheet;
