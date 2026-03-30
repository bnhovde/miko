"use client";

import React from "react";

import styles from "./Package.module.css";
import Frame from "components/Frame";
import { usePackageStore } from "stores/package";

const Package: React.FC = () => {
  const { packageData } = usePackageStore();
  const sprites = packageData?.sprites ?? [];

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.body}
        id="package-body"
        data-has-items={sprites.length > 0}
        style={{
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(1, 1fr)",
        }}
      >
        {sprites.map((sprite) =>
          sprite.frames.map((frame) => (
            <Frame key={frame} hash={frame} palette={sprite.palette} />
          ))
        )}
      </div>
    </div>
  );
};

export default Package;
