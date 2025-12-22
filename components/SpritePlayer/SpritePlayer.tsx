import React, { useState } from "react";
import { RiSpace } from "react-icons/ri";
import classNames from "classnames";

import Frame from "components/Frame";
import useInterval from "hooks/useInterval";

import styles from "./SpritePlayer.module.css";
import Shortcut from "components/Shortcut";
import { useSpriteStore } from "src/stores/useSpriteStore";
import { useEditorStore } from "src/stores/useEditorStore";

type Props = {
  autoPlay?: boolean;
  preview?: boolean;
};

const SpritePlayer: React.FC<Props> = ({ autoPlay, preview }) => {
  const { currentSprite } = useSpriteStore();
  const { currentFrame } = useEditorStore();

  const [localFrame, setLocalFrame] = useState(currentFrame || 0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [delay] = useState<number>(100);

  useInterval(
    () => {
      if (currentSprite) {
        setLocalFrame(
          localFrame >= currentSprite?.frames?.length - 1
            ? 0
            : localFrame + 1
        );
      }
    },
    // Delay in milliseconds or null to stop it
    isPlaying ? delay : null
  );

  const wrapperClass = classNames({
    [styles["wrapper"]]: true,
    [styles["-preview"]]: preview,
    [styles["-playing"]]: isPlaying,
  });

  return (
    <div className={wrapperClass}>
      <p className="label">Preview</p>
      <div className={styles.player}>
        <div className={styles["player-inner"]}>
          <Frame
            hash={
              currentSprite?.frames[
                isPlaying ? localFrame : currentFrame || 0
              ]
            }
            palette={currentSprite?.palette}
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
            disabled={!currentSprite?.frames}
          >
            <RiSpace />
          </Shortcut>
        </div>
      )}
    </div>
  );
};

export default SpritePlayer;
