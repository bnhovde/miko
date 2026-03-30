"use client";

import React from "react";
import { MdOutlineCropDin, MdOutlineRotate90DegreesCcw } from "react-icons/md";

import ToolButton from "components/ToolButton";
import styles from "./SheetControls.module.css";
import { useSheetStore } from "stores/sheet";
import { ViewMode } from "types/editor";

const rotationOrder: Array<"front" | "right" | "back" | "left"> = [
  "front", "right", "back", "left",
];

const SheetControls: React.FC = () => {
  const { sheetViewMode, setViewMode } = useSheetStore();
  const viewMode = sheetViewMode ?? "2d";

  const rotateLeft = () => {
    if (viewMode === "2d" || viewMode === "3d") { setViewMode("front"); return; }
    const idx = rotationOrder.indexOf(viewMode as typeof rotationOrder[number]);
    setViewMode(rotationOrder[(idx - 1 + rotationOrder.length) % rotationOrder.length]!);
  };

  const rotateRight = () => {
    if (viewMode === "2d" || viewMode === "3d") { setViewMode("front"); return; }
    const idx = rotationOrder.indexOf(viewMode as typeof rotationOrder[number]);
    setViewMode(rotationOrder[(idx + 1) % rotationOrder.length]!);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">View Controls</p>
      <ul className={styles.controls}>
        <li>
          <ToolButton active={false} onClick={rotateLeft}>
            <MdOutlineRotate90DegreesCcw />
          </ToolButton>
        </li>
        <li>
          <ToolButton active={viewMode === "2d"} onClick={() => setViewMode("2d")}>
            <MdOutlineCropDin />
          </ToolButton>
        </li>
        <li>
          <ToolButton active={false} onClick={rotateRight}>
            <MdOutlineRotate90DegreesCcw style={{ transform: "scaleX(-1)" }} />
          </ToolButton>
        </li>
      </ul>
    </div>
  );
};

export default SheetControls;
