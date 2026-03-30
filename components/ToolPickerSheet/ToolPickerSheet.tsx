"use client";

import React from "react";
import {
  RiCursorFill,
  RiBrush2Fill,
  RiPaintFill,
  RiEraserFill,
} from "react-icons/ri";
import { MdRotateRight, MdFlip } from "react-icons/md";

import ToolButton from "components/ToolButton";
import styles from "./ToolPickerSheet.module.css";
import { useDrawingStore } from "stores/drawing";
import { useSheetStore } from "stores/sheet";

const ToolPickerSheet: React.FC = () => {
  const { currentSpriteTool, setSpriteTool } = useDrawingStore();
  const { currentSheetSprite, rotateSheetCell, flipSheetCell } = useSheetStore();

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton active={currentSpriteTool === "select"} onClick={() => setSpriteTool("select")}>
            <RiCursorFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton active={currentSpriteTool === "paint"} onClick={() => setSpriteTool("paint")}>
            <RiBrush2Fill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton active={currentSpriteTool === "eraser"} onClick={() => setSpriteTool("eraser")}>
            <RiEraserFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton active={currentSpriteTool === "fill"} onClick={() => setSpriteTool("fill")}>
            <RiPaintFill />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton onClick={rotateSheetCell} disabled={!currentSheetSprite}>
            <MdRotateRight />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton onClick={() => flipSheetCell("x")} disabled={!currentSheetSprite}>
            <MdFlip />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton onClick={() => flipSheetCell("y")} disabled={!currentSheetSprite} rotation={90}>
            <MdFlip />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPickerSheet;
