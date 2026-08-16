import React, { useContext, useState } from "react";
import ColorButton from "components/ColorButton";

import styles from "./ColorPicker.module.css";
import EditorContext from "context/EditorContext";
import Shortcut from "components/Shortcut";
import PaletteEditor from "components/PaletteEditor";
import { TRANSPARENT } from "utils/palette";

const ColorPicker: React.FC = () => {
  const { state, onSelectColor } = useContext(EditorContext);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className={styles.wrapper}>
      <p className="label" data-desktop>
        {state.paletteName || "Palette"}
      </p>
      <ul className={styles.items}>
        {state.colors
          ?.filter((c) => c !== TRANSPARENT)
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
        <Shortcut
          label="edit palette"
          hotKeys="cmd+c"
          isActive={isEditing}
          onToggle={() => setIsEditing(!isEditing)}
        >
          ⌘ + C
        </Shortcut>
        <PaletteEditor isOpen={isEditing} onClose={() => setIsEditing(false)} />
      </div>
    </div>
  );
};

export default ColorPicker;
