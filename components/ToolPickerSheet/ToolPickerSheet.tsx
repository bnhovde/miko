import React, { useContext } from "react";
import {
  RiCursorFill,
  RiBrush2Fill,
  RiPaintFill,
  RiEraserFill,
} from "react-icons/ri";
import { MdRotateRight, MdFlip } from "react-icons/md";

import ToolButton from "components/ToolButton";
import EditorContext from "context/EditorContext";

import styles from "./ToolPickerSheet.module.css";

const ToolPickerSheet: React.FC = () => {
  const {
    state,
    onSelectToolSheet,
    onRotateSelectedSprite,
    onFlipSelectedSprite,
  } = useContext(EditorContext);

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
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
            active={state.currentSpriteTool === "paint"}
            onClick={() => onSelectToolSheet("paint")}
          >
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            active={state.currentSpriteTool === "eraser"}
            onClick={() => onSelectToolSheet("eraser")}
          >
            <RiEraserFill />
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
        <li className={styles.item}>
          <ToolButton
            onClick={() => onRotateSelectedSprite()}
            disabled={!state.currentSheetSprite}
          >
            <MdRotateRight />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            onClick={() => onFlipSelectedSprite("x")}
            disabled={!state.currentSheetSprite}
          >
            <MdFlip />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton
            onClick={() => onFlipSelectedSprite("y")}
            disabled={!state.currentSheetSprite}
            rotation={90}
          >
            <MdFlip />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPickerSheet;
