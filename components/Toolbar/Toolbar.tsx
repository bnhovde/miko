import React from "react";
import classNames from "classnames";

import styles from "./Toolbar.module.css";

type Props = {
  children: JSX.Element[] | JSX.Element | string;
};

const Toolbar: React.FC<Props> = ({ children }) => {
  const toolbarClass = classNames({
    [styles["wrapper"]]: true,
  });

  return (
    <div className={toolbarClass}>
      <div className={styles.inner}>{children}</div>
    </div>
  );
};

export default Toolbar;
