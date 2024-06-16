import React, { useState } from "react";

import styles from "./SpritePreviewPlayer.module.css";
import { Sprite } from "types/sprite";
import useInterval from "hooks/useInterval";
import classNames from "classnames";
import Frame from "components/Frame";

type Props = {
  sprite: Sprite;
  isPlaying?: boolean;
};

const SpritePreviewPlayer: React.FC<Props> = ({ sprite, isPlaying }) => {
  const [localFrame, setLocalFrame] = useState(0);
  const [delay] = useState<number>(100);

  useInterval(
    () => {
      setLocalFrame(
        localFrame >= sprite?.frames?.length - 1 ? 0 : localFrame + 1
      );
    },
    // Delay in milliseconds or null to stop it
    isPlaying ? delay : null
  );

  const wrapperClass = classNames({
    [styles["wrapper"]]: true,
    [styles["-playing"]]: isPlaying,
  });

  return (
    <figure className={wrapperClass}>
      <Frame
        hash={sprite.frames[isPlaying ? localFrame : 0]}
        palette={sprite.palette}
      />
    </figure>
  );
};

export default SpritePreviewPlayer;
