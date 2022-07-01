import React, { useContext, useState } from "react";
import { RiSpace } from "react-icons/ri";
import classNames from "classnames";

import Frame from "components/Frame";
import useInterval from "hooks/useInterval";

import styles from "./SpritePlayer.module.css";
import Shortcut from "components/Shortcut";
import EditorContext from "context/EditorContext";

type Props = {
  autoPlay?: boolean;
  preview?: boolean;
};

const SpritePlayer: React.FC<Props> = ({ autoPlay, preview }) => {
  const { state } = useContext(EditorContext);

  const [localFrame, setLocalFrame] = useState(state.currentFrame || 0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [delay] = useState<number>(100);

  useInterval(
    () => {
      if (state.spriteData) {
        setLocalFrame(
          localFrame >= state.spriteData?.frames?.length - 1
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
              state.spriteData?.frames[
                isPlaying ? localFrame : state.currentFrame || 0
              ]
            }
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
            disabled={!state.spriteData?.frames}
          >
            <RiSpace />
          </Shortcut>
        </div>
      )}
    </div>
  );
};

export default SpritePlayer;
