import React from "react";
import { MdOutlineCropDin, MdOutlineRotate90DegreesCcw } from "react-icons/md";

import ToolButton from "components/ToolButton";
import { useEditorStore } from "../../src/stores/useEditorStore";

import styles from "./SheetControls.module.css";

const SheetControls: React.FC = () => {
  const { sheetViewMode, setSheetViewMode } = useEditorStore();

  const viewMode = sheetViewMode || "2d";

  // Rotation order: front (0°) -> right (90°) -> back (180°) -> left (-90°) -> front
  const rotationOrder: Array<"front" | "right" | "back" | "left"> = [
    "front",
    "right",
    "back",
    "left",
  ];

  const rotateLeft = () => {
    if (viewMode === "2d" || viewMode === "3d") {
      setSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex =
      (currentIndex - 1 + rotationOrder.length) % rotationOrder.length;
    setSheetViewMode(rotationOrder[nextIndex]);
  };

  const rotateRight = () => {
    if (viewMode === "2d" || viewMode === "3d") {
      setSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex = (currentIndex + 1) % rotationOrder.length;
    setSheetViewMode(rotationOrder[nextIndex]);
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
          <ToolButton
            active={viewMode === "2d"}
            onClick={() => setSheetViewMode("2d")}
          >
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
