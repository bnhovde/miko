import React from "react";
import classNames from "classnames";

import styles from "./Shortcut.module.css";

type Props = {
  data: {
    key: string;
    label: string;
  };
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const Shortcut: React.FC<Props> = ({ data, isActive, disabled, onClick }) => {
  const shortcutClass = classNames({
    [styles["shortcut"]]: true,
    [styles["-active"]]: isActive,
    [styles["-disabled"]]: disabled,
  });

  const onClickHandler = () => {
    onClick && onClick();
  };

  return (
    <button
      className={shortcutClass}
      onClick={onClickHandler}
      disabled={disabled}
    >
      <span className={styles.badge}>⌘ + {data.key}</span>
      <span className={styles.text}>{data.label}</span>
    </button>
  );
};

export default Shortcut;
