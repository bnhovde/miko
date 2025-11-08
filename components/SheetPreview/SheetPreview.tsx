import React, { useState } from "react";
import { Spritesheet } from "types/sheet";
import Frame from "components/Frame";
import useInterval from "hooks/useInterval";

import styles from "./SheetPreview.module.css";

type Props = {
  sheet: Spritesheet;
  isPlaying?: boolean;
};

const SheetPreview: React.FC<Props> = ({ sheet, isPlaying }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [delay] = useState<number>(sheet.fps ? 1000 / sheet.fps : 100);

  useInterval(
    () => {
      // Cycle through frames for all sprites
      const maxFrames = Math.max(
        ...sheet.sprites.map((s) => s.frames?.length || 1)
      );
      setFrameIndex(frameIndex >= maxFrames - 1 ? 0 : frameIndex + 1);
    },
    isPlaying ? delay : null
  );

  // Get grid dimensions (assuming grid is square)
  const gridSize = Math.sqrt(sheet.grid.length);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {sheet.grid.map((cellId, index) => {
          if (!cellId || cellId === "") {
            return <div key={index} className={styles.empty} />;
          }

          // Find the sprite for this cell
          const item = sheet.items.find((item) => item.spriteId === cellId);
          const sprite = sheet.sprites.find((s) => s.id === cellId);

          if (!sprite) {
            return <div key={index} className={styles.empty} />;
          }

          // Get the current frame for animation
          const currentFrame = isPlaying
            ? sprite.frames[frameIndex % (sprite.frames?.length || 1)]
            : sprite.frames[0];

          // Build transform string from rotation and flip
          const getTransform = () => {
            const transforms = [];

            if (item?.rotation) {
              transforms.push(`rotate(${item.rotation}deg)`);
            }

            if (item?.flip === "x") {
              transforms.push(`scaleX(-1)`);
            } else if (item?.flip === "y") {
              transforms.push(`scaleY(-1)`);
            } else if (item?.flip === "xy" || item?.flip === "yx") {
              transforms.push(`scaleX(-1) scaleY(-1)`);
            }

            return transforms.length > 0 ? transforms.join(" ") : undefined;
          };

          return (
            <div
              key={index}
              className={styles.cell}
              style={{ transform: getTransform() }}
            >
              <Frame hash={currentFrame} palette={sprite.palette} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SheetPreview;
