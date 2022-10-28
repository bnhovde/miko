import React from "react";
import classNames from "classnames";

import Timeline from "components/Timeline";
import ColorPicker from "components/ColorPicker";
import Canvas from "components/Canvas";
import SpritePlayer from "components/SpritePlayer";
import ToolPicker from "components/ToolPicker";
import ToolPickerSprite from "components/ToolPickerSprite";

import styles from "./EditorSprite.module.css";
import CanvasSprite from "components/CanvasSprite";
import SpritePicker from "components/SpritePicker";

const EditorSprite: React.FC = () => {
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
            <CanvasSprite />
            <div className={styles.toolbar}>
              <ToolPickerSprite />
            </div>
          </div>
        </div>

        <div className={styles.sprites}>
          <SpritePicker />
        </div>
      </div>
    </section>
  );
};

export default EditorSprite;
