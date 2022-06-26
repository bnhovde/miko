import React from "react";
import classNames from "classnames";
import { CgChevronLeftR } from "react-icons/cg";

import styles from "./Footer.module.css";
import Link from "next/link";
import Shortcut from "components/Shortcut";
import Button from "components/Button";
import ButtonLink from "components/ButtonLink";

type Props = {
  shortcuts?: {
    key: string;
    label: string;
  }[];
  action?: {
    text: string;
    url: string;
  };
};

const Footer: React.FC<Props> = ({ shortcuts, action }) => {
  const footerClass = classNames({
    [styles["footer"]]: true,
  });

  return (
    <footer className={footerClass}>
      <>
        {shortcuts && (
          <ul className={styles.shortcuts}>
            {shortcuts.map((s) => (
              <li key={s.key}>
                <Shortcut data={s} />
              </li>
            ))}
          </ul>
        )}
      </>

      <>{action && <ButtonLink href={action.url}>{action.text}</ButtonLink>}</>
    </footer>
  );
};

export default Footer;
