import React from "react";
import classNames from "classnames";

import styles from "./Button.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  full?: boolean;
  secondary?: boolean;
  disabled?: boolean;
  small?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const Button: React.FC<Props> = ({
  children,
  full,
  small,
  secondary,
  onClick,
  ...props
}) => {
  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-secondary"]]: secondary,
    [styles["-full"]]: full,
    [styles["-small"]]: small,
  });

  return (
    <button className={buttonClass} onClick={onClick} {...props}>
      <span>{children}</span>
    </button>
  );
};

export default Button;
