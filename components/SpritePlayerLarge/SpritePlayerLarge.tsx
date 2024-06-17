import React, { useContext, useState } from "react";
import { FaPause, FaPlay } from "react-icons/fa";
import classNames from "classnames";

import Frame from "components/Frame";
import useInterval from "hooks/useInterval";

import styles from "./SpritePlayerLarge.module.css";
import Shortcut from "components/Shortcut";
import EditorContext from "context/EditorContext";
import { Sprite } from "types/sprite";
import { RiSpace } from "react-icons/ri";

type Props = {
  id?: string;
  spriteData?: Sprite;
};

const SpritePlayerLarge: React.FC<Props> = ({ spriteData, id }) => {
  const { state } = useContext(EditorContext);

  const [localFrame, setLocalFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [delay] = useState<number>(100);

  useInterval(
    () => {
      if (spriteData) {
        setLocalFrame(
          localFrame >= spriteData?.frames?.length - 1 ? 0 : localFrame + 1
        );
      }
    },
    // Delay in milliseconds or null to stop it
    isPlaying ? delay : null
  );

  const wrapperClass = classNames({
    [styles["wrapper"]]: true,
    [styles["-playing"]]: isPlaying,
  });

  return (
    <div className={wrapperClass}>
      <p className="label">{spriteData?.name}</p>
      <div className={styles.player}>
        <div className={styles["player-inner"]} id={id}>
          <Frame
            hash={spriteData?.frames[isPlaying ? localFrame : 0]}
            palette={spriteData?.palette}
            debug={state.debug}
          />
        </div>
      </div>

      <div className={styles.actions}>
        <Shortcut
          label="play/pause"
          hotKeys="space"
          onToggle={(newState) => setIsPlaying(newState)}
          isActive={isPlaying}
          disabled={!spriteData?.frames}
        >
          <RiSpace />
        </Shortcut>
      </div>
    </div>
  );
};

export default SpritePlayerLarge;
