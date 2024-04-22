import React, { useContext } from "react";
import ColorButton from "components/ColorButton";

import styles from "./ColorPicker.module.css";
import EditorContext from "context/EditorContext";
import Shortcut from "components/Shortcut";
import Palette from "utils/colors";

const ColorPicker: React.FC = () => {
  const { state, onSelectColor, onReplacePalette } = useContext(EditorContext);

  const onNewPalette = () => {
    const newPalette = Palette.randomHexColors({
      numColors: 8,
      hRange: undefined,
      sRange: [0, 0.6],
    }) as string[];

    onReplacePalette(["fff0", "000", "fff", ...newPalette]);
  };

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        Palette
      </p>
      <ul className={styles.items}>
        {state.colors
          ?.filter((c) => c !== "fff0")
          .map((color, index) => (
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
