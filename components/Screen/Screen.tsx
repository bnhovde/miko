import React from "react";
import classNames from "classnames";

import styles from "./Screen.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
};

const Screen: React.FC<Props> = ({ children }) => {
  const screenClass = classNames({
    [styles["screen"]]: true,
  });

  return <div className={screenClass}>{children}</div>;
};

export default Screen;
