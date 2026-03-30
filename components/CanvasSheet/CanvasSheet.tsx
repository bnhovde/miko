"use client";

import React from "react";
import SpritePreview from "components/SpritePreview";
import { InputEvent } from "types/input";
import { getSpriteArray } from "lib/sprite";
import { getDefaultHash } from "lib/encoding/hash";
import { useSheetStore } from "stores/sheet";
import { useDrawingStore } from "stores/drawing";

import styles from "./CanvasSheet.module.css";

const CanvasSheet: React.FC = () => {
  const {
    sheetData,
    unsavedGrid,
    currentGrid,
    isDrawingSheet: _isDrawingSheet,
    currentSheetIndex,
    sheetViewMode,
    selectSheetCell,
    updateDrag,
    startDrawingSheet: _startDrawing,
  } = useSheetStore();
  const { isDrawingSheet, startDrawingSheet, currentSpriteTool } = useDrawingStore();

  const hash = unsavedGrid || currentGrid;
  const hashArray = getSpriteArray(hash || getDefaultHash(), sheetData?.items ?? []);

  const getCanvasTransform = () => {
    switch (sheetViewMode ?? "2d") {
      case "3d": return "rotateX(40deg) rotateZ(30deg)";
      case "front": return "rotateX(40deg) rotateZ(0deg)";
      case "right": return "rotateX(40deg) rotateZ(90deg)";
      case "back": return "rotateX(40deg) rotateZ(180deg)";
      case "left": return "rotateX(40deg) rotateZ(-90deg)";
      default: return "none";
    }
  };

  const handleCellAction = (index: number, isFirstClick?: boolean) => {
    if (currentSpriteTool === "select") {
      selectSheetCell(index);
    } else {
      if (isFirstClick) startDrawingSheet();
      updateDrag(index, currentSpriteTool);
    }
  };

  const onMouseOver = (
    index: number,
    event: InputEvent,
    isFirstClick?: boolean,
    isTouch?: boolean
  ) => {
    if (isTouch && typeof event === "object" && "touches" in event) {
      const touch = event.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target) {
        const targetIndex = parseInt(target.id);
        if ((isDrawingSheet || isFirstClick) && !isNaN(targetIndex)) {
          handleCellAction(targetIndex, isFirstClick);
        }
      }
      return;
    }

    event.preventDefault();
    if ("button" in event && event.button === 2) return;
    if (isDrawingSheet || isFirstClick) handleCellAction(index, isFirstClick);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Sheet</p>
      <div className={styles.editor}>
        <div
          className={styles.canvas}
          style={{ transform: getCanvasTransform() }}
        >
          {hashArray.map((item, index) => (
            <button
              key={index}
              id={index.toString()}
              className={styles.pixel}
              onMouseOver={(e) => onMouseOver(index, e)}
              onFocus={(e) => onMouseOver(index, e)}
              onTouchMove={(e) => onMouseOver(index, e, false, true)}
              onMouseDown={(e) => onMouseOver(index, e, true)}
              onTouchStart={(e) => onMouseOver(index, e, true, true)}
              data-active={currentSheetIndex === index}
              data-empty={!item}
            >
              {item && (
                <SpritePreview
                  hash={
                    sheetData?.sprites?.find((s) => s.id === item.spriteId)
                      ?.frames[0]
                  }
                  palette={
                    sheetData?.sprites?.find((s) => s.id === item.spriteId)
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
