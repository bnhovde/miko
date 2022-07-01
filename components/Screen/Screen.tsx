import React from "react";
import classNames from "classnames";

import styles from "./Screen.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
  scrolling?: boolean;
};

const Screen: React.FC<Props> = ({ children, scrolling }) => {
  const screenClass = classNames({
    [styles["screen"]]: true,
    [styles["-scrolling"]]: scrolling,
  });

  return <div className={screenClass}>{children}</div>;
};

export default Screen;
