import React from "react";

import styles from "./Package.module.css";
import Frame from "components/Frame";

const Package: React.FC = () => {
  // TODO: Implement package store
  const state = { packageData: null } as any;

  const spritesToDraw = state.packageData?.sprites || [];
  const framesToDraw = spritesToDraw.reduce((acc: string[], sprite: any) => {
    return [...acc, ...sprite.frames];
  }, [] as string[]);

  const longestSprite = spritesToDraw.reduce((acc: number, sprite: any) => {
    return sprite.frames.length > acc ? sprite.frames.length : acc;
  }, 0);

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.body}
        id="package-body"
        data-has-items={framesToDraw.length > 0}
        style={{
          gridTemplateColumns: `repeat(12, 1fr)`,
          gridTemplateRows: `repeat(1, 1fr)`,
        }}
      >
        {spritesToDraw.map((sprite: any) => {
          // Paint all frames of the sprite
          return sprite.frames.map((frame: string) => (
            <Frame key={frame} hash={frame} palette={sprite.palette} />
          ));
        })}
      </div>
    </div>
  );
};

export default Package;
