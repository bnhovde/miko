import React from "react";
import { User } from "types/user";
import { getDefaultHash, getHashArray } from "utils/hash";

import styles from "./Frame.module.css";

type Props = {
  hash?: string;
};

const Frame: React.FC<Props> = ({ hash }) => {
  const hashArray = getHashArray(hash || getDefaultHash());

  return (
    <div className={styles.canvas}>
      <figure className={styles.frame}>
        {hashArray.map((hex, index) => (
          <div
            className={styles.pixel}
            key={index}
            style={{ background: `#${hex}` }}
          />
        ))}
      </figure>
    </div>
  );
};

export default Frame;
