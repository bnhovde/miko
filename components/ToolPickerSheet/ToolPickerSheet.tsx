import React, { useContext } from "react";
import { RiCursorFill, RiBrush2Fill, RiPaintFill } from "react-icons/ri";

import ToolButton from "components/ToolButton";
import EditorContext from "context/EditorContext";

import styles from "./ToolPickerSheet.module.css";

const ToolPickerSheet: React.FC = () => {
  const { state, onSelectToolSheet } = useContext(EditorContext);

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "paint"}
            onClick={() => onSelectToolSheet("paint")}
          >
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "select"}
            onClick={() => onSelectToolSheet("select")}
          >
            <RiCursorFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "fill"}
            onClick={() => onSelectToolSheet("fill")}
            disabled
          >
            <RiPaintFill />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPickerSheet;
