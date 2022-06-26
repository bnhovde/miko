import React, { useContext } from "react";
import { RiMarkPenLine, RiEraserLine, RiPaintFill } from "react-icons/ri";

import ToolButton from "components/ToolButton";

import styles from "./ToolPicker.module.css";
import EditorContext from "context/EditorContext";

const ToolPicker: React.FC = () => {
  const { state, onSelectTool } = useContext(EditorContext);

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton
            active={state.currentTool === "pencil"}
            inUse={state.currentTool === "pencil" && state.isDrawing}
            onClick={() => onSelectTool("pencil")}
          >
            <RiMarkPenLine />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentTool === "eraser"}
            inUse={state.currentTool === "eraser" && state.isDrawing}
            onClick={() => onSelectTool("eraser")}
          >
            <RiEraserLine />
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

export default ToolPicker;
