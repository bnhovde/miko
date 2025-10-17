import SpritePreview from "components/SpritePreview";
import EditorContext from "context/EditorContext";
import React, { useContext } from "react";
import { InputEvent } from "types/input";
import { getSpriteArray } from "utils/sprite";

import styles from "./CanvasSheet.module.css";
import { getDefaultHash } from "utils/hash";

const CanvasSheet: React.FC = () => {
  const { state, onDrawChangeSheet, onSelectSheetCell } =
    useContext(EditorContext);

  const hash = state.unsavedGrid || state.currentGrid;
  const gridItems = state.sheetData?.items || [];
  const hashArray = getSpriteArray(hash || getDefaultHash(), gridItems);

  const onMouseOver = (
    index: number,
    event: InputEvent,
    isFirstClick?: boolean,
    isTouch?: boolean
  ) => {
    // Check for touch
    if (isTouch && typeof event === "object" && "touches" in event) {
      // Handle touch move event
      const touch = event.touches[0];
      const targetButton = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if (targetButton) {
        const targetIndex = parseInt(targetButton.id);
        if ((state.isDrawingSheet || isFirstClick) && !isNaN(targetIndex)) {
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

    if (state.isDrawingSheet || isFirstClick) {
      handleCellAction(index, isFirstClick);
    }
  };

  const handleCellAction = (index: number, isFirstClick?: boolean) => {
    if (state.currentSpriteTool === "select") {
      // Select tool: just select the cell
      onSelectSheetCell && onSelectSheetCell(index);
    } else {
      // Paint/Eraser tool: modify the grid
      onDrawChangeSheet && onDrawChangeSheet(index, isFirstClick);
    }
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Sheet {state.isDrawingSheet && " - drawing"}</p>
      <div className={styles.editor}>
        <div className={styles.canvas}>
          {hashArray?.map((item, index) => (
            <button
              key={index}
              id={index.toString()}
              className={styles.pixel}
              onMouseOver={(event) => onMouseOver(index, event)}
              onFocus={(event) => onMouseOver(index, event)}
              onTouchMove={(event) => onMouseOver(index, event, false, true)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true, true)}
              data-active={state.currentSheetIndex === index}
              data-empty={!item}
            >
              {item && (
                <SpritePreview
                  hash={
                    state.sheetData?.sprites?.find(
                      (s) => s.id === item.spriteId
                    )?.frames[0]
                  }
                  palette={
                    state.sheetData?.sprites?.find(
                      (s) => s.id === item.spriteId
                    )?.palette
                  }
                  rotation={item.rotation}
                  flip={item.flip}
                />
              )}
              <>
                {state.debug && (
                  <span className={styles["debug-pixel"]}>{hash[index]}</span>
                )}
              </>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasSheet;
