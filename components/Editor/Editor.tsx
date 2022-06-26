import React, { useContext } from "react";
import classNames from "classnames";
import { InputEvent } from "types/input";

import styles from "./Editor.module.css";
import Timeline from "components/Timeline";
import ColorPicker from "components/ColorPicker";
import Canvas from "components/Canvas";
import SpritePlayer from "components/SpritePlayer";
import ToolPicker from "components/ToolPicker";
import EditorContext from "context/EditorContext";

const Editor: React.FC = () => {
  const {
    state,
    onAddFrame,
    onChangeFrame,
    onDeleteFrame,
    onDrawStart,
    onDrawChange,
    onSelectColor,
    onSelectTool,
  } = useContext(EditorContext);

  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  return (
    <section className={editorClass}>
      <div className={styles.timeline}>
        <Timeline />
      </div>
      <div className={styles.body}>
        <div className={styles.colors}>
          <div className={styles["colors-inner"]}>
            <ColorPicker />
          </div>
        </div>

        <div className={styles.canvas}>
          <Canvas />

          <div className={styles.toolbar}>
            <ToolPicker />
          </div>
        </div>
        <div className={styles.preview}>
          <div className={styles["preview-inner"]}>
            <SpritePlayer />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Editor;
