import React from "react";
import classNames from "classnames";

import styles from "./ColorButton.module.css";

type Props = {
  hex?: string;
  small?: boolean;
  active?: boolean;
  withBorder?: boolean;
  onClick?: (hex?: string) => void;
};

const ColorButton: React.FC<Props> = ({
  hex,
  small,
  active,
  withBorder,
  onClick,
}) => {
  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-small"]]: small,
    [styles["-active"]]: active,
    [styles["-with-border"]]: withBorder,
  });

  return (
    <button
      className={buttonClass}
      style={{ background: `${hex}` }}
      onClick={() => onClick && onClick(hex)}
    >
      <div className={styles.inner}>{hex}</div>
    </button>
  );
};

export default ColorButton;
