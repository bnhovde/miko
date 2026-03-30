"use client";

import React from "react";
import classNames from "classnames";

import SpritePicker from "components/SpritePicker";
import Package from "components/Package";

import styles from "./EditorPackage.module.css";
import { usePackageStore } from "stores/package";
import { Sprite } from "types/sprite";

const EditorPackage: React.FC = () => {
  const { packageData, updatePackage } = usePackageStore();

  const handleToggleSprite = (sprite: Sprite) => {
    if (!packageData) return;
    const exists = packageData.sprites.find((s) => s.id === sprite.id);
    const newSprites = exists
      ? packageData.sprites.filter((s) => s.id !== sprite.id)
      : [...packageData.sprites, sprite];
    updatePackage({ ...packageData, sprites: newSprites });
  };

  return (
    <section className={classNames(styles.editor)}>
      <div className={styles.inner}>
        <div className={styles.sprites}>
          <div className={styles["sprites-inner"]}>
            <SpritePicker
              selecedItems={packageData?.sprites}
              onSelect={handleToggleSprite}
            />
          </div>
        </div>

        <div className={styles.package}>
          <p className="label">Preview</p>
          <div className={styles["package-inner"]}>
            <Package />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorPackage;
