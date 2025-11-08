import React, { useContext } from "react";
import { MdOutlineCropDin, MdOutlineRotate90DegreesCcw } from "react-icons/md";

import ToolButton from "components/ToolButton";
import EditorContext from "context/EditorContext";

import styles from "./SheetControls.module.css";

const SheetControls: React.FC = () => {
  const { state, onSetSheetViewMode } = useContext(EditorContext);

  const viewMode = state.sheetViewMode || "2d";

  // Rotation order: front (0°) -> right (90°) -> back (180°) -> left (-90°) -> front
  const rotationOrder: Array<"front" | "right" | "back" | "left"> = [
    "front",
    "right",
    "back",
    "left",
  ];

  const rotateLeft = () => {
    if (viewMode === "2d" || viewMode === "3d") {
      onSetSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex =
      (currentIndex - 1 + rotationOrder.length) % rotationOrder.length;
    onSetSheetViewMode(rotationOrder[nextIndex]);
  };

  const rotateRight = () => {
    if (viewMode === "2d" || viewMode === "3d") {
      onSetSheetViewMode("front");
      return;
    }
    const currentIndex = rotationOrder.indexOf(viewMode as any);
    const nextIndex = (currentIndex + 1) % rotationOrder.length;
    onSetSheetViewMode(rotationOrder[nextIndex]);
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
            onClick={() => onSetSheetViewMode("2d")}
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
