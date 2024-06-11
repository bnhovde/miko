import React from "react";
import { defaultColors } from "data/palettes";
import { getDefaultHash, getHashArray } from "utils/hash";

import styles from "./Frame.module.css";

type Props = {
  hash?: string;
  palette?: string[];
  debug?: boolean;
};

const Frame: React.FC<Props> = ({ hash, palette, debug }) => {
  const hashArray = getHashArray(
    hash || getDefaultHash(),
    palette || defaultColors
  );

  return (
    <div className={styles.canvas}>
      <figure
        className={styles.frame}
        style={{
          gridTemplateColumns: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
          gridTemplateRows: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
        }}
      >
        {hashArray.map((hex, index) => (
          <div
            className={styles.pixel}
            key={index}
            style={{ background: `#${hex}` }}
          >
            <>
              {debug && (
                <span className={styles["pixel-debug"]}>{hash?.[index]}</span>
              )}
            </>
          </div>
        ))}
      </figure>
    </div>
  );
};

export default Frame;
