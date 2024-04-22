import SpritePreview from "components/SpritePreview";
import EditorContext from "context/EditorContext";
import React, { useContext } from "react";
import { InputEvent } from "types/input";
import { getSpriteArray } from "utils/sprite";

import styles from "./CanvasSheet.module.css";
import { getDefaultHash } from "utils/hash";

const CanvasSheet: React.FC = () => {
  const {
    state,
    onDrawStartSheet,
    onTouchStartSheet,
    onDrawChangeSheet,
    onSelectColor,
  } = useContext(EditorContext);

  const hash = state.unsavedGrid || state.currentGrid;
  const gridItems = state.sheetData?.items || [];
  const hashArray = getSpriteArray(hash || getDefaultHash(), gridItems);
  // const onionHashArray = onionskinHash ? getHashArray(onionskinHash) : [];

  const onMouseOver = (
    index: number,
    event: InputEvent,
    isFirstClick?: boolean,
    isTouch?: boolean
  ) => {
    if (!isTouch) {
      event.preventDefault();
    }

    // Skip action for right click
    if ("button" in event && event.button === 2) {
      console.log("skip!", event.button);
      return;
    }

    if (state.isDrawingSheet || isFirstClick) {
      onDrawChangeSheet && onDrawChangeSheet(index);
    }
  };

  const onContextMenu = (event: InputEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();

    onSelectColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Sheet {state.isDrawingSheet && " - drawing"}</p>
      <div className={styles.editor}>
        <div
          className={styles.canvas}
          onMouseDown={onDrawStartSheet}
          onTouchStart={onTouchStartSheet}
        >
          {hashArray?.map((item, index) => (
            <button
              key={index}
              className={styles.pixel}
              // onContextMenu={(event) => onContextMenu(event, hex)}
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
