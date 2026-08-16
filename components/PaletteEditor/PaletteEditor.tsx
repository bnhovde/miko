import React, { useContext, useEffect, useState } from "react";

import Popover from "components/Popover";
import EditorContext from "context/EditorContext";
import { Palette as PaletteType } from "types/palette";
import ColorUtils from "utils/colors";
import {
  TRANSPARENT,
  deletePalette,
  fromHexInput,
  getPalettes,
  isDefaultPalette,
  toHexInput,
} from "utils/palette";

import styles from "./PaletteEditor.module.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const PaletteEditor: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    state,
    onAddColor,
    onUpdateColor,
    onRemoveColor,
    onRenamePalette,
    onReplacePalette,
    onLoadPalette,
    onSavePalette,
  } = useContext(EditorContext);

  const [saved, setSaved] = useState<PaletteType[]>([]);

  // Saved palettes live in localStorage, so only read them once open
  useEffect(() => {
    if (isOpen) {
      setSaved(getPalettes());
    }
  }, [isOpen]);

  const handleRandomize = () => {
    const newColors = ColorUtils.randomHexColors({
      numColors: 8,
      hRange: undefined,
      sRange: [0, 0.6],
    }) as string[];

    onReplacePalette([TRANSPARENT, "000", "fff", ...newColors], "New palette");
  };

  const handleSave = (asNew?: boolean) => {
    const palette = onSavePalette(state.paletteName, asNew);

    if (palette) {
      setSaved(getPalettes());
    }
  };

  const handleDelete = (palette: PaletteType) => {
    deletePalette(palette.id);
    setSaved(getPalettes());
  };

  const handleLoad = (palette: PaletteType) => {
    onLoadPalette(palette);
    onClose();
  };

  // The built in palette can be copied, but never overwritten or deleted
  const isBuiltIn = isDefaultPalette(state.paletteId);

  // The transparent sentinel is not a swatch the user can edit
  const swatches = state.colors
    .map((hex, index) => ({ hex, index }))
    .filter(({ hex }) => hex !== TRANSPARENT);

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      placement={{ vertical: "top", horizontal: "left" }}
      width={280}
    >
      <div className={styles.body}>
        <label className={styles.field}>
          <span className="label">Name</span>
          <input
            className={styles.input}
            type="text"
            value={state.paletteName}
            onChange={(event) => onRenamePalette(event.target.value)}
          />
        </label>

        <div className={styles.section}>
          <p className="label">Colors</p>
          <ul className={styles.swatches}>
            {swatches.map(({ hex, index }) => (
              <li key={index} className={styles.swatch}>
                <input
                  className={styles["swatch-input"]}
                  type="color"
                  value={toHexInput(hex)}
                  aria-label={`Color #${hex}`}
                  onChange={(event) =>
                    onUpdateColor(index, fromHexInput(event.target.value))
                  }
                />
                <button
                  className={styles["swatch-remove"]}
                  type="button"
                  aria-label={`Remove color #${hex}`}
                  disabled={swatches.length < 2}
                  onClick={() => onRemoveColor(index)}
                >
                  ×
                </button>
              </li>
            ))}
            <li className={styles.swatch}>
              <button
                className={styles.add}
                type="button"
                aria-label="Add color"
                onClick={() => onAddColor("808080")}
              >
                +
              </button>
            </li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.action}
            type="button"
            onClick={handleRandomize}
          >
            Randomize
          </button>
          <button
            className={`${styles.action} ${styles["-primary"]}`}
            type="button"
            onClick={() => handleSave()}
          >
            {state.paletteId && !isBuiltIn ? "Save" : "Save palette"}
          </button>
          {state.paletteId && !isBuiltIn && (
            <button
              className={styles.action}
              type="button"
              onClick={() => handleSave(true)}
            >
              Save as new
            </button>
          )}
        </div>

        {saved.length > 0 && (
          <div className={styles.section}>
            <p className="label">Saved palettes</p>
            <ul className={styles.saved}>
              {saved.map((palette) => (
                <li key={palette.id} className={styles["saved-item"]}>
                  <button
                    className={styles["saved-button"]}
                    type="button"
                    aria-selected={palette.id === state.paletteId || undefined}
                    onClick={() => handleLoad(palette)}
                  >
                    <span className={styles["saved-preview"]}>
                      {palette.items
                        .filter((hex) => hex !== TRANSPARENT)
                        .slice(0, 8)
                        .map((hex, index) => (
                          <span
                            key={index}
                            className={styles["saved-color"]}
                            style={{ background: `#${hex}` }}
                          />
                        ))}
                    </span>
                    <span className={styles["saved-name"]}>{palette.name}</span>
                  </button>
                  {!isDefaultPalette(palette.id) && (
                    <button
                      className={styles["saved-remove"]}
                      type="button"
                      aria-label={`Delete ${palette.name}`}
                      onClick={() => handleDelete(palette)}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Popover>
  );
};

export default PaletteEditor;
