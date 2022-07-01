import React, { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import classNames from "classnames";

import styles from "./Shortcut.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  label: string;
  hotKeys: string;
  isActive?: boolean;
  disabled?: boolean;
  onToggle?: (newState: boolean) => void;
};

const Shortcut: React.FC<Props> = ({
  children,
  label,
  hotKeys,
  isActive,
  disabled,
  onToggle,
}) => {
  const [isFlasing, setIsFlashing] = useState(false);

  const onToggleHandler = useCallback(() => {
    onToggle && onToggle(!isActive);
    setIsFlashing(true);

    setTimeout(() => {
      setIsFlashing(false);
    }, 100);
  }, [onToggle, isActive]);

  useHotkeys(
    hotKeys,
    (e) => {
      e.preventDefault();
      onToggleHandler();
    },
    {
      enabled: !disabled,
    },
    [hotKeys, disabled, onToggleHandler]
  );

  const shortcutClass = classNames({
    [styles["shortcut"]]: true,
    [styles["-active"]]: isActive,
    [styles["-disabled"]]: disabled,
    [styles["-flashing"]]: isFlasing,
  });
  return (
    <button
      className={shortcutClass}
      onClick={onToggleHandler}
      disabled={disabled}
    >
      <span className={styles.badge}>{children}</span>
      <span className={styles.text}>{label}</span>
    </button>
  );
};

export default Shortcut;
