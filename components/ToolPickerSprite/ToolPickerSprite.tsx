import React, { useContext } from "react";
import { RiCursorFill, RiBrush2Fill, RiPaintFill } from "react-icons/ri";

import ToolButton from "components/ToolButton";

import styles from "./ToolPickerSprite.module.css";
import EditorContext from "context/EditorContext";

const ToolPickerSprite: React.FC = () => {
  const { state, onSelectTool } = useContext(EditorContext);

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton
            active={state.currentTool === "select"}
            inUse={state.currentTool === "select" && state.isDrawing}
            onClick={() => onSelectTool("select")}
          >
            <RiCursorFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentTool === "paint"}
            inUse={state.currentTool === "paint" && state.isDrawing}
            onClick={() => onSelectTool("paint")}
          >
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentTool === "fill"}
            inUse={state.currentTool === "fill" && state.isDrawing}
            onClick={() => onSelectTool("fill")}
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
