import React from "react";
import classNames from "classnames";
import { CgChevronLeftR } from "react-icons/cg";

import styles from "./Header.module.css";
import Link from "next/link";

type Props = {
  title?: string;
  backUrl?: string;
  action?: {
    text: string;
    url: string;
  };
};

const Header: React.FC<Props> = ({ title, backUrl, action }) => {
  const headerClass = classNames({
    [styles["header"]]: true,
  });

  return (
    <header className={headerClass}>
      <Link href={backUrl || "/"}>
        <a className={styles.left}>
          <span className={styles.text}>
            {backUrl && <CgChevronLeftR />}
            {backUrl ? "Back" : "Miko"}
          </span>
        </a>
      </Link>
      <h1 className={styles.title}>{title && title}</h1>
      <>
        {action && (
          <Link href={action.url}>
            <a className={styles.right}>
              <span className={styles.text}>{action.text}</span>
            </a>
          </Link>
        )}
      </>
    </header>
  );
};

export default Header;
