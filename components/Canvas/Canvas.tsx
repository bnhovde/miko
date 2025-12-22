import React from "react";
import { useSpriteStore } from "../../src/stores/useSpriteStore";
import { useEditorStore } from "../../src/stores/useEditorStore";
import { SpriteData } from "../../src/core/SpriteData";
import { getDefaultHash } from "utils/hash";

import styles from "./Canvas.module.css";

const Canvas: React.FC = () => {
  const { currentSprite, currentFrame, unsavedFrameData, updatePixel, fillPixel } = useSpriteStore();
  const { currentTool, currentColor, isDrawing, startDrawing, setColor } = useEditorStore();

  // Get current frame data
  const frameHash = currentSprite?.frames[currentFrame] || getDefaultHash();
  const frameData = unsavedFrameData || SpriteData.fromHash(
    frameHash,
    currentSprite?.palette || [],
    currentSprite?.size || 11
  );
  
  const hashArray = frameData.toColorArray();

  const onMouseOver = (
    index: number,
    event: React.MouseEvent | React.TouchEvent,
    isFirstClick?: boolean
  ) => {
    // Handle touch events
    if ("touches" in event) {
      const touch = event.touches[0];
      const targetButton = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if ((isDrawing || isFirstClick) && targetButton) {
        handlePixelAction(parseInt(targetButton.id), isFirstClick);
      }
      return;
    }

    // Handle mouse events
    event.preventDefault();

    // Skip right click
    if ("button" in event && event.button === 2) {
      return;
    }

    if (isDrawing || isFirstClick) {
      handlePixelAction(index, isFirstClick);
    }
  };

  const handlePixelAction = (pixelIndex: number, isFirstClick?: boolean) => {
    if (!currentSprite) return;

    if (isFirstClick) {
      startDrawing();
    }

    // For fill tool, only process on first click
    if (currentTool === "fill" && !isFirstClick) {
      return;
    }

    // Get or add color to palette
    let colorIndex = currentSprite.palette.indexOf(currentColor);
    if (colorIndex === -1 && currentTool !== "eraser") {
      // Color not in palette - this will be handled when committing
      colorIndex = currentSprite.palette.length;
    }

    // Apply tool action
    if (currentTool === "eraser") {
      updatePixel(pixelIndex, 0); // 0 = transparent
    } else if (currentTool === "fill") {
      const finalIndex = colorIndex === -1 ? 0 : colorIndex;
      fillPixel(pixelIndex, finalIndex);
    } else {
      // Pencil tool
      const finalIndex = colorIndex === -1 ? 0 : colorIndex;
      updatePixel(pixelIndex, finalIndex);
    }
  };

  const onContextMenu = (event: React.MouseEvent, hex: string) => {
    event.preventDefault();
    event.stopPropagation();
    setColor(hex);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        {currentSprite?.name || "New Sprite"}
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
              onTouchMove={(event) => onMouseOver(index, event, false)}
              onMouseDown={(event) => onMouseOver(index, event, true)}
              onTouchStart={(event) => onMouseOver(index, event, true)}
              style={{ background: `#${hex}` }}
              data-empty={hex === "fff0"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
