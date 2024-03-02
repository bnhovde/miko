import React, { useContext } from "react";
import { RiCursorFill, RiBrush2Fill, RiPaintFill } from "react-icons/ri";

import ToolButton from "components/ToolButton";

import styles from "./ToolPickerSprite.module.css";
import EditorContext from "context/EditorContext";

const ToolPickerSprite: React.FC = () => {
  const { state, onSelectSpriteTool } = useContext(EditorContext);

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "paint"}
            inUse={state.currentSpriteTool === "paint" && state.isDrawing}
            onClick={() => onSelectSpriteTool("paint")}
          >
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "select"}
            inUse={state.currentSpriteTool === "select" && state.isDrawing}
            onClick={() => onSelectSpriteTool("select")}
          >
            <RiCursorFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "fill"}
            inUse={state.currentSpriteTool === "fill" && state.isDrawing}
            onClick={() => onSelectSpriteTool("fill")}
            disabled
          >
            <RiPaintFill />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPickerSprite;
