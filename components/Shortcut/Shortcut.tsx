import React from "react";
import classNames from "classnames";

import styles from "./Shortcut.module.css";
import useKeyPressed from "hooks/useKey";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

const Shortcut: React.FC<Props> = ({
  children,
  label,
  isActive,
  disabled,
  onClick,
}) => {
  // const cmdDown = useKeyPressed((ev: KeyboardEvent) => ev.metaKey);

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
      <span className={styles.badge}>{children}</span>
      <span className={styles.text}>{label}</span>
    </button>
  );
};

export default Shortcut;
