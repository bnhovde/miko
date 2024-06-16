import React, { useContext } from "react";
import classNames from "classnames";

import SpritePicker from "components/SpritePicker";

import styles from "./EditorPackage.module.css";
import EditorContext from "context/EditorContext";
import { Sprite } from "types/sprite";
import Package from "components/Package";

const EditorPackage: React.FC = () => {
  const { state, onUpdatePackage } = useContext(EditorContext);

  const editorClass = classNames({
    [styles["editor"]]: true,
  });

  const handleToggleSprite = (sprite: Sprite) => {
    if (!state.packageData) return;

    // Check if sprite is already in package
    const exists = state.packageData.sprites.find((s) => s.id === sprite.id);
    if (exists) {
      // Remove sprite
      const newSprites =
        state.packageData.sprites.filter((s) => s.id !== sprite.id) || [];
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
          <p className="label">Sprites</p>
          <div className={styles["sprites-inner"]}>
            <SpritePicker
              selecedItems={state.packageData?.sprites}
              onSelect={handleToggleSprite}
            />
          </div>
        </div>

        <div className={styles.package}>
          <div className={styles["package-inner"]}>
            <Package />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorPackage;
