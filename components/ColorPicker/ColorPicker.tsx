import React, { useContext } from "react";
import ColorButton from "components/ColorButton";

import styles from "./ColorPicker.module.css";
import EditorContext from "context/EditorContext";
import Shortcut from "components/Shortcut";
import Palette from "utils/colors";
import { defaultColors } from "data/palettes";
import { getRandomColor } from "utils/hash";

const ColorPicker: React.FC = () => {
  const { state, onSelectColor, onReplacePalette } = useContext(EditorContext);

  const onNewPalette = () => {
    const newPalette = Palette.randomHexColors({
      numColors: 8,
      hRange: undefined,
      sRange: [0, 0.6],
    }) as string[];

    onReplacePalette(newPalette);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Palette</p>
      <ul className={styles.items}>
        <li className={styles.item}>
          <ColorButton
            hex={"000"}
            active={state.currentColor === "000"}
            onClick={onSelectColor}
          />
        </li>
        <li className={styles.item}>
          <ColorButton
            hex={"fff"}
            active={state.currentColor === "fff"}
            onClick={onSelectColor}
          />
        </li>
        {state.colors?.map((color, index) => (
          <li key={index} className={styles.item}>
            <ColorButton
              hex={color}
              active={state.currentColor === color}
              onClick={onSelectColor}
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
