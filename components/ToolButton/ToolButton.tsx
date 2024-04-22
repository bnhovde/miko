import React from "react";
import classNames from "classnames";

import styles from "./ToolButton.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  square?: boolean;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const ToolButton: React.FC<Props> = ({
  children,
  square,
  active,
  disabled,
  onClick,
}) => {
  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-square"]]: square,
    [styles["-active"]]: active,
    [styles["-disabled"]]: disabled,
  });

  return (
    <button
      className={buttonClass}
      onClick={() => {
        onClick();
        console.log("Button clicked");
      }}
      disabled={disabled}
    >
      <div className={styles.icon}>{children}</div>
    </button>
  );
};

export default ToolButton;
