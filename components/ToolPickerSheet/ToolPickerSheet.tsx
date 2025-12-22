import React from "react";
import {
  RiCursorFill,
  RiBrush2Fill,
  RiPaintFill,
  RiEraserFill,
} from "react-icons/ri";
import { MdRotateRight, MdFlip } from "react-icons/md";

import ToolButton from "components/ToolButton";
import { useEditorStore } from "../../src/stores/useEditorStore";
import { useSheetManager } from "../../src/hooks/useSheetManager";

import styles from "./ToolPickerSheet.module.css";

const ToolPickerSheet: React.FC = () => {
  const { currentSpriteTool, setSpriteTool } = useEditorStore();
  const { selectedSprite, handleRotate, handleFlip } = useSheetManager();

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton
            active={currentSpriteTool === "select"}
            onClick={() => setSpriteTool("select")}
          >
            <RiCursorFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={currentSpriteTool === "paint"}
            onClick={() => setSpriteTool("paint")}
          >
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={currentSpriteTool === "eraser"}
            onClick={() => setSpriteTool("eraser")}
          >
            <RiEraserFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={currentSpriteTool === "fill"}
            onClick={() => setSpriteTool("fill")}
          >
            <RiPaintFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            onClick={() => handleRotate()}
            disabled={!selectedSprite}
          >
            <MdRotateRight />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            onClick={() => handleFlip("x")}
            disabled={!selectedSprite}
          >
            <MdFlip />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            onClick={() => handleFlip("y")}
            disabled={!selectedSprite}
          >
            <MdFlip style={{ transform: "rotate(90deg)" }} />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPickerSheet;
