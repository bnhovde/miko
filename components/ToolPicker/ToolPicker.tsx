"use client";

import React from "react";
import { RiMarkPenLine, RiEraserLine, RiPaintFill } from "react-icons/ri";

import ToolButton from "components/ToolButton";
import styles from "./ToolPicker.module.css";
import { useDrawingStore } from "stores/drawing";

const ToolPicker: React.FC = () => {
  const { currentTool, setTool } = useDrawingStore();

  return (
    <div className={styles.wrapper}>
      <p className="label">Tools</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ToolButton active={currentTool === "pencil"} onClick={() => setTool("pencil")}>
            <RiMarkPenLine />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton active={currentTool === "eraser"} onClick={() => setTool("eraser")}>
            <RiEraserLine />
          </ToolButton>
        </li>
        <li className={styles.item}>
          <ToolButton active={currentTool === "fill"} onClick={() => setTool("fill")}>
            <RiPaintFill />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default ToolPicker;
