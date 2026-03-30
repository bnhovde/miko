"use client";

import React from "react";
import ColorButton from "components/ColorButton";

import styles from "./ColorPicker.module.css";
import Shortcut from "components/Shortcut";
import { randomHexColors } from "lib/palette";
import { useSpriteStore } from "stores/sprite";
import { useDrawingStore } from "stores/drawing";

const ColorPicker: React.FC = () => {
  const { colors, replacePalette } = useSpriteStore();
  const { currentColor, setColor } = useDrawingStore();

  const onNewPalette = () => {
    const newPalette = randomHexColors({ numColors: 8, sRange: [0, 0.6] });
    replacePalette(["fff0", "000", "fff", ...newPalette]);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        Palette
      </p>
      <ul className={styles.items}>
        {colors
          .filter((c) => c !== "fff0")
          .map((color, index) => (
            <li key={index} className={styles.item}>
              <ColorButton
                hex={color}
                active={currentColor === color}
                onClick={setColor}
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
