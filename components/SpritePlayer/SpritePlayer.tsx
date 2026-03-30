"use client";

import React, { useState } from "react";
import { RiSpace } from "react-icons/ri";
import classNames from "classnames";

import Frame from "components/Frame";
import useInterval from "hooks/useInterval";
import Shortcut from "components/Shortcut";
import { useSpriteStore } from "stores/sprite";
import { Sprite } from "types/sprite";

import styles from "./SpritePlayer.module.css";

type Props = {
  /**
   * When provided, the player shows this sprite instead of reading from the
   * sprite store. Used on the share page to display a URL-decoded sprite.
   */
  spriteData?: Sprite;
  /** DOM id to set on the player inner div. Useful for html2canvas capture. */
  id?: string;
  /** Hides the play/pause control and renders a smaller compact preview. */
  preview?: boolean;
};

/**
 * Animated sprite player.
 *
 * - With no props: reads the current sprite from the sprite store (editor).
 * - With `spriteData` prop: displays that sprite directly (share page).
 */
const SpritePlayer: React.FC<Props> = ({ spriteData: propSprite, id, preview }) => {
  const storeSprite = useSpriteStore((s) => s.spriteData);
  const storeFrame = useSpriteStore((s) => s.currentFrame);

  // When called with explicit spriteData, use it; otherwise fall back to store.
  const sprite = propSprite ?? storeSprite;
  const isStandalone = !!propSprite;

  const [localFrame, setLocalFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(isStandalone);

  useInterval(
    () => {
      if (sprite) {
        setLocalFrame((f) => (f >= (sprite.frames.length - 1) ? 0 : f + 1));
      }
    },
    isPlaying ? 100 : null
  );

  const displayFrame = isPlaying
    ? localFrame
    : isStandalone ? 0 : (storeFrame ?? 0);

  const wrapperClass = classNames({
    [styles.wrapper]: true,
    [styles["-preview"]]: preview,
    [styles["-playing"]]: isPlaying,
    [styles["-large"]]: isStandalone,
  });

  return (
    <div className={wrapperClass}>
      <p className="label">{isStandalone ? (sprite?.name ?? "Untitled") : "Preview"}</p>
      <div className={styles.player}>
        <div className={styles["player-inner"]} id={id}>
          <Frame
            hash={sprite?.frames[displayFrame]}
            palette={sprite?.palette}
          />
        </div>
      </div>
      {!preview && (
        <div className={styles.actions}>
          <Shortcut
            label="play/pause"
            hotKeys="space"
            onToggle={(newState) => setIsPlaying(newState)}
            isActive={isPlaying}
            disabled={!sprite?.frames}
          >
            <RiSpace />
          </Shortcut>
        </div>
      )}
    </div>
  );
};

export default SpritePlayer;
