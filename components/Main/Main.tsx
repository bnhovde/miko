import React from "react";
import classNames from "classnames";

import styles from "./Main.module.css";

type Props = {
  children: React.ReactNode;
  padded?: boolean;
  centered?: boolean;
};

const Main: React.FC<Props> = ({ children, padded, centered }) => {
  const mainClass = classNames({
    [styles["main"]]: true,
    [styles["-padded"]]: padded,
    [styles["-centered"]]: centered,
  });

  return <main className={mainClass}>{children}</main>;
};

export default Main;
