import React from "react";
import classNames from "classnames";

import styles from "./ToolButton.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  square?: boolean;
  active?: boolean;
  disabled?: boolean;
  rotation?: number;
  onClick: () => void;
};

const ToolButton: React.FC<Props> = ({
  children,
  square,
  active,
  disabled,
  rotation,
  onClick,
}) => {
  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-square"]]: square,
    [styles["-active"]]: active,
    [styles["-disabled"]]: disabled,
  });

  const inlineStyle = {
    transform: rotation ? `rotate(${rotation}deg)` : undefined,
  };

  return (
    <button
      className={buttonClass}
      onClick={() => {
        onClick();
        console.log("Button clicked");
      }}
      disabled={disabled}
    >
      <div className={styles.icon} style={inlineStyle}>
        {children}
      </div>
    </button>
  );
};

export default ToolButton;
