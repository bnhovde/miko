"use client";

import React from "react";
import { InputEvent } from "types/input";
import { getDefaultHash, getHashArray } from "lib/encoding/hash";
import { useSpriteStore } from "stores/sprite";
import { useDrawingStore } from "stores/drawing";

import styles from "./Canvas.module.css";

const Canvas: React.FC = () => {
  const { spriteData, unsavedHash, currentHash, updateDrag, commitDraw } =
    useSpriteStore();
  const { isDrawingSprite, startDrawingSprite, currentTool, setColor } =
    useDrawingStore();

  const hash = unsavedHash || currentHash;
  const hashArray = getHashArray(hash || getDefaultHash(), spriteData?.palette ?? []);

  const handlePixel = (index: number, isFirstClick?: boolean) => {
    const isFill = currentTool === "fill";
    if (isFill && !isFirstClick) return;
    if (!isDrawingSprite && !isFirstClick) return;

    if (isFirstClick) startDrawingSprite();
    updateDrag(index, currentTool);
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
      if ((isDrawingSprite || isFirstClick) && target) {
        handlePixel(parseInt(target.id), isFirstClick);
      }
      return;
    }

    event.preventDefault();
    if ("button" in event && event.button === 2) return;
    handlePixel(index, isFirstClick);
  };

  const onContextMenu = (event: InputEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();
    setColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        {spriteData?.name ?? "New Sprite"}
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
              onContextMenu={(e) => onContextMenu(e, hex)}
              onMouseOver={(e) => onMouseOver(index, e)}
              onFocus={(e) => onMouseOver(index, e)}
              onTouchMove={(e) => onMouseOver(index, e, false, true)}
              onMouseDown={(e) => onMouseOver(index, e, true)}
              onTouchStart={(e) => onMouseOver(index, e, true, true)}
              style={{ backgroundColor: `#${hex}` }}
              data-empty={hex === "fff0"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
