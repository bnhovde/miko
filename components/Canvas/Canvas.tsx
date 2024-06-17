import EditorContext from "context/EditorContext";
import React, { useContext } from "react";
import { InputEvent } from "types/input";
import { getDefaultHash, getHashArray, updateHash } from "utils/hash";

import styles from "./Canvas.module.css";

const Canvas: React.FC = () => {
  const { state, onDrawChange, onSelectColor } = useContext(EditorContext);

  const hash = state.unsavedHash || state.currentHash;
  const spritePalette = state.spriteData?.palette || [];
  const hashArray = getHashArray(hash || getDefaultHash(), spritePalette);
  // const onionHashArray = onionskinHash ? getHashArray(onionskinHash) : [];

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

      if ((state.isDrawingSprite || isFirstClick) && targetButton) {
        onDrawChange && onDrawChange(parseInt(targetButton.id), isFirstClick);
      }

      return;
    }

    // Handle non-touch
    event.preventDefault();

    // Skip action for right click
    if ("button" in event && event.button === 2) {
      console.log("skip!", event.button);
      return;
    }

    if (state.isDrawingSprite || isFirstClick) {
      onDrawChange && onDrawChange(index, isFirstClick);
    }
  };

  const onContextMenu = (event: InputEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();

    onSelectColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        {state.spriteData?.name || "New Sprite"}
      </p>
      <div className={styles.editor}>
        <div
          id="editor-canvas"
          className={styles.canvas}
          style={{
            gridTemplateColumns: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
            gridTemplateRows: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
          }}
        >
          {hashArray.map((hex, index) => (
            <button
              key={index}
              id={index.toString()}
              className={styles.pixel}
              onContextMenu={(event) => onContextMenu(event, hex)}
              onMouseOver={(event) => onMouseOver(index, event)}
              onFocus={(event) => onMouseOver(index, event)}
              onTouchMove={(event) => onMouseOver(index, event, false, true)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true, true)}
              style={{ background: `#${hex}` }}
              data-empty={hex == "fff0"}
            >
              <>
                {state.debug && (
                  <span className={styles["debug-pixel"]}>{hash[index]}</span>
                )}
              </>
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
