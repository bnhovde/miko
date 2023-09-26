import SpritePreview from "components/SpritePreview";
import EditorContext from "context/EditorContext";
import React, { useContext } from "react";
import { InputEvent } from "types/input";
import { getDefaultHash, getHashArray, updateHash } from "utils/hash";

import styles from "./CanvasSprite.module.css";

const CanvasSprite: React.FC = () => {
  const { state, onDrawStart, onTouchStart, onDrawChange, onSelectColor } =
    useContext(EditorContext);

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

    if (state.isDrawing || isFirstClick) {
      onDrawChange && onDrawChange(index);
    }
  };

  const onContextMenu = (event: InputEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();

    onSelectColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Sprite {state.isDrawing && " - drawing"}</p>
      <div className={styles.editor}>
        <div
          className={styles.canvas}
          onMouseDown={onDrawStart}
          onTouchStart={onTouchStart}
        >
          {state.sheetData?.sprites.map((sprite, index) => (
            <button
              key={index}
              className={styles.pixel}
              // onContextMenu={(event) => onContextMenu(event, hex)}
              onMouseOver={(event) => onMouseOver(index, event)}
              onFocus={(event) => onMouseOver(index, event)}
              onTouchMove={(event) => onMouseOver(index, event, false, true)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true, true)}
              data-empty={!!sprite.data}
              data-active={state.currentSheetIndex === index}
            >
              <SpritePreview
                hash={sprite.data.frames[0]}
                palette={sprite.data.palette}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CanvasSprite;
