import React, { useContext, useEffect, useState } from "react";
import ColorButton from "components/ColorButton";

import styles from "./SpritePicker.module.css";
import EditorContext from "context/EditorContext";
import { Sprite } from "types/sprite";
import { getAll } from "utils/localStorage";
import localStorageKeys from "constants/localStorageKeys";
import SpritePreview from "components/SpritePreview";

type Props = {
  onSelect: (sprite: Sprite) => void;
  selecedItems?: Sprite[];
};

const SpritePicker: React.FC<Props> = ({ onSelect, selecedItems }) => {
  const [sprites, setSprites] = useState<Sprite[]>([]);

  useEffect(() => {
    const items = getAll(localStorageKeys.SPRITE);
    const sprites = items?.map((item) => JSON.parse(item)) as Sprite[];

    if (sprites) {
      setSprites(sprites);
    }
  }, []);

  return (
    <div className={styles.wrapper}>
      <ul className={styles.items}>
        {sprites?.map((sprite) => (
          <li key={sprite.id} className={styles.item}>
            <div className={styles.inner}>
              <button className={styles.button}>
                <div className={styles.sprite}>
                  <SpritePreview
                    hash={sprite.frames[0]}
                    palette={sprite.palette}
                    selected={selecedItems?.some((s) => s.id === sprite.id)}
                    onClick={() => onSelect(sprite)}
                  />
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SpritePicker;
