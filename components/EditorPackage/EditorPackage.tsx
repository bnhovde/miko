import React from "react";
import classNames from "classnames";

import SpritePicker from "components/SpritePicker";

import styles from "./EditorPackage.module.css";
import { Sprite } from "types/sprite";
import Package from "components/Package";

const EditorPackage: React.FC = () => {
  // TODO: Implement package store
  const state = { packageData: null } as any;
  const onUpdatePackage = (_data: any) => {};

  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  const handleToggleSprite = (sprite: Sprite) => {
    if (!state.packageData) return;

    // Check if sprite is already in package
    const exists = state.packageData.sprites.find((s: Sprite) => s.id === sprite.id);
    if (exists) {
      // Remove sprite
      const newSprites =
        state.packageData.sprites.filter((s: Sprite) => s.id !== sprite.id) || [];
      onUpdatePackage({ ...state.packageData, sprites: newSprites });
    } else {
      // Add sprite
      onUpdatePackage({
        ...state.packageData,
        sprites: [...state.packageData.sprites, sprite],
      });
    }
  };

  return (
    <section className={editorClass}>
      <div className={styles.inner}>
        <div className={styles.sprites}>
          <div className={styles["sprites-inner"]}>
            <SpritePicker
              selecedItems={state.packageData?.sprites}
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
