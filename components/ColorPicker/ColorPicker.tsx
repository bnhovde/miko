import React from "react";
import ColorButton from "components/ColorButton";

import styles from "./ColorPicker.module.css";
import Shortcut from "components/Shortcut";
import Palette from "utils/colors";
import { useSpriteStore } from "src/stores/useSpriteStore";
import { useEditorStore } from "src/stores/useEditorStore";

const ColorPicker: React.FC = () => {
  const { currentSprite, updatePalette } = useSpriteStore();
  const { currentColor, setColor } = useEditorStore();

  const onNewPalette = () => {
    const newPalette = Palette.randomHexColors({
      numColors: 8,
      hRange: undefined,
      sRange: [0, 0.6],
    }) as string[];

    updatePalette(["fff0", "000", "fff", ...newPalette]);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        Palette
      </p>
      <ul className={styles.items}>
        {currentSprite?.palette
          ?.filter((c) => c !== "fff0")
          .map((color, index) => (
            <li key={index} className={styles.item}>
              <ColorButton
                hex={color}
                active={currentColor === color}
                onClick={(hex) => hex && setColor(hex)}
              />
            </li>
          ))}
      </ul>
      <div className={styles.footer}>
        <Shortcut label="randomize" hotKeys="cmd+c" onToggle={onNewPalette}>
          ⌘ + C
        </Shortcut>
      </div>
    </div>
  );
};

export default ColorPicker;
