import { defaultColors } from "data/palettes";
import React from "react";
import { User } from "types/user";
import { getDefaultHash, getHashArray, getRandomPalette } from "utils/hash";

import styles from "./SpritePreview.module.css";

type Props = {
  id?: string;
  title?: string;
  hash?: string;
  palette?: string[];
  small?: boolean;
  author?: User;
  selected?: boolean;
  onClick?: () => void;
  rotation?: number;
  flip?: "x" | "y" | "xy" | "yx";
};

const SpritePreview: React.FC<Props> = ({
  id,
  title,
  hash,
  palette,
  author,
  small,
  selected,
  onClick,
  rotation = 0,
  flip,
}) => {
  const hashArray = getHashArray(
    hash || getDefaultHash(),
    palette || defaultColors
  );
  const showFooter = title || author;

  // Build transform string from rotation and flip
  const getTransform = () => {
    const transforms = [];

    if (rotation) {
      transforms.push(`rotate(${rotation}deg)`);
    }

    if (flip === "x") {
      transforms.push(`scaleX(-1)`);
    } else if (flip === "y") {
      transforms.push(`scaleY(-1)`);
    } else if (flip === "xy" || flip === "yx") {
      transforms.push(`scaleX(-1) scaleY(-1)`);
    }

    return transforms.length > 0 ? transforms.join(" ") : undefined;
  };

  return (
    <figure
      className={styles.wrapper}
      data-selected={selected}
      onClick={onClick}
    >
      <div className={styles.canvas} data-small={small} id={id}>
        <div
          className={styles.inner}
          style={{
            gridTemplateColumns: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
            gridTemplateRows: `repeat(${Math.sqrt(hashArray.length)}, 1fr)`,
            transform: getTransform(),
          }}
        >
          {hashArray.map((hex, index) => (
            <div
              className={styles.pixel}
              key={index}
              style={{ background: `#${hex}` }}
            />
          ))}
        </div>
      </div>
      <>
        {showFooter && (
          <div className={styles.footer}>
            <p>
              {title && <span>{title}</span>}
              {title && author && <span>, by </span>}
              {author && <span>{author.name}</span>}
            </p>
          </div>
        )}
      </>
    </figure>
  );
};

export default SpritePreview;
