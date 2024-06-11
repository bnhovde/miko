import { defaultColors } from "data/palettes";
import React from "react";
import { User } from "types/user";
import { getDefaultHash, getHashArray, getRandomPalette } from "utils/hash";

import styles from "./SpritePreview.module.css";

type Props = {
  title?: string;
  hash?: string;
  palette?: string[];
  small?: boolean;
  author?: User;
  selected?: boolean;
  onClick?: () => void;
};

const SpritePreview: React.FC<Props> = ({
  title,
  hash,
  palette,
  author,
  small,
  selected,
  onClick,
}) => {
  const hashArray = getHashArray(
    hash || getDefaultHash(),
    palette || defaultColors
  );
  const showFooter = title || author;

  return (
    <figure
      className={styles.wrapper}
      data-selected={selected}
      onClick={onClick}
    >
      <div className={styles.canvas} data-small={small}>
        <div
          className={styles.inner}
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
