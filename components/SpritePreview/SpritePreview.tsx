import React from "react";
import { User } from "types/user";
import { getDefaultHash, getHashArray } from "utils/hash";

import styles from "./SpritePreview.module.css";

type Props = {
  title?: string;
  hash?: string;
  small?: boolean;
  author?: User;
};

const SpritePreview: React.FC<Props> = ({ title, hash, author, small }) => {
  const hashArray = getHashArray(hash || getDefaultHash());
  const showFooter = title || author;

  return (
    <figure className={styles.wrapper}>
      <div className={styles.canvas} data-small={small}>
        <div className={styles.inner}>
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
