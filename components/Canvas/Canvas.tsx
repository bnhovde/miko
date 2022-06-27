import EditorContext from "context/EditorContext";
import React, { useContext } from "react";
import { InputEvent } from "types/input";
import { getDefaultHash, getHashArray, updateHash } from "utils/hash";

import styles from "./Canvas.module.css";

const Canvas: React.FC = () => {
  const { state, onDrawStart, onTouchStart, onDrawChange, onSelectColor } =
    useContext(EditorContext);

  const hash = state.unsavedHash || state.currentHash;
  const hashArray = getHashArray(hash || getDefaultHash());
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

    if (state.isDrawing || isFirstClick) {
      const newHash = updateHash(
        hash || getDefaultHash(),
        index,
        state.currentColor || "",
        state.currentTool || ""
      );
      onDrawChange && onDrawChange(newHash);
    }
  };

  const onContextMenu = (event: InputEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();

    onSelectColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Canvas {state.isDrawing && " - drawing"}</p>
      <div className={styles.editor}>
        <div
          className={styles.canvas}
          onMouseDown={onDrawStart}
          onTouchStart={onTouchStart}
        >
          {hashArray.map((hex, index) => (
            <button
              key={index}
              className={styles.pixel}
              onContextMenu={(event) => onContextMenu(event, hex)}
              onMouseOver={(event) => onMouseOver(index, event)}
              onFocus={(event) => onMouseOver(index, event)}
              onTouchMove={(event) => onMouseOver(index, event, false, true)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true, true)}
              style={{ background: `${hex}` }}
            >
              {/* {onionHashArray[index] && (
                <div
                  className={styles["onion-skin"]}
                  style={{ background: `${onionHashArray[index]}` }}
                ></div>
              )} */}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
