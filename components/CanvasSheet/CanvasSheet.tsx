import SpritePreview from "components/SpritePreview";
import React from "react";
import { useSheetStore } from "../../src/stores/useSheetStore";
import { useEditorStore } from "../../src/stores/useEditorStore";
import { SheetData } from "../../src/core/SheetData";
import { getSpriteArray } from "utils/sprite";
import { getDefaultHash } from "utils/hash";

import styles from "./CanvasSheet.module.css";

const CanvasSheet: React.FC = () => {
  const {
    currentSheet,
    unsavedSheetData,
    selectedCellIndex,
    selectedSprite,
    cellRotation,
    cellFlip,
    updateCell,
    selectCell,
  } = useSheetStore();

  const {
    currentSpriteTool,
    isDrawing,
    startDrawing,
    sheetViewMode,
  } = useEditorStore();

  const gridString = currentSheet?.grid[0] || getDefaultHash();
  const sheetData = unsavedSheetData || SheetData.fromGrid(
    gridString,
    currentSheet?.items || [],
    currentSheet?.sprites || [],
    currentSheet?.size || 11
  );
  
  const hashArray = getSpriteArray(gridString, currentSheet?.items || []);

  // Get transform based on view mode
  const getCanvasTransform = () => {
    const mode = sheetViewMode || "2d";

    switch (mode) {
      case "2d":
        return "none";
      case "3d":
        return "rotateX(40deg) rotateZ(30deg)";
      case "front":
        return "rotateX(40deg) rotateZ(0deg)";
      case "right":
        return "rotateX(40deg) rotateZ(90deg)";
      case "back":
        return "rotateX(40deg) rotateZ(180deg)";
      case "left":
        return "rotateX(40deg) rotateZ(-90deg)";
      default:
        return "none";
    }
  };

  const onMouseOver = (
    index: number,
    event: React.MouseEvent | React.TouchEvent,
    isFirstClick?: boolean
  ) => {
    // Check for touch
    if ("touches" in event) {
      const touch = event.touches[0];
      const targetButton = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if (targetButton) {
        const targetIndex = parseInt(targetButton.id);
        if ((isDrawing || isFirstClick) && !isNaN(targetIndex)) {
          handleCellAction(targetIndex, isFirstClick);
        }
      }
      return;
    }

    // Handle non-touch
    event.preventDefault();

    // Skip action for right click
    if ("button" in event && event.button === 2) {
      return;
    }

    if (isDrawing || isFirstClick) {
      handleCellAction(index, isFirstClick);
    }
  };

  const handleCellAction = (index: number, isFirstClick?: boolean) => {
    if (currentSpriteTool === "select") {
      // Select tool: just select the cell
      selectCell(index);
      return;
    }

    if (isFirstClick) {
      startDrawing();
    }

    // For fill tool, only process on first click
    if (currentSpriteTool === "fill" && !isFirstClick) {
      return;
    }

    // Paint/Eraser/Fill tool: modify the grid
    if (currentSpriteTool === "eraser") {
      updateCell(index, null);
    } else if (selectedSprite && (currentSpriteTool === "paint" || currentSpriteTool === "fill")) {
      updateCell(index, selectedSprite.id);
    }
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">
        Sheet {currentSheet?.name || ""}
      </p>
      <div className={styles.editor}>
        <div
          className={styles.canvas}
          style={{ transform: getCanvasTransform() }}
        >
          {hashArray?.map((item, index) => (
            <button
              key={index}
              id={index.toString()}
              className={styles.pixel}
              onMouseOver={(event) => onMouseOver(index, event)}
              onTouchMove={(event) => onMouseOver(index, event, false)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true)}
              data-active={selectedCellIndex === index}
              data-empty={!item}
            >
              {item && (
                <SpritePreview
                  hash={
                    currentSheet?.sprites?.find((s) => s.id === item.spriteId)
                      ?.frames[0]
                  }
                  palette={
                    currentSheet?.sprites?.find((s) => s.id === item.spriteId)
                      ?.palette
                  }
                  rotation={item.rotation}
                  flip={item.flip}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasSheet;
