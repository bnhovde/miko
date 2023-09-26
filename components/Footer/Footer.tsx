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
    children: JSX.Element[] | JSX.Element | string;
    label: string;
    hotKeys: string;
    disabled?: boolean;
    isActive?: boolean;
    onToggle?: (newState: boolean) => void;
  }[];
  action?: {
    text: string;
    url: string;
  };
  button?: {
    text: string;
    onClick: () => void;
  };
};

const Footer: React.FC<Props> = ({ shortcuts, action, button }) => {
  const footerClass = classNames({
    [styles["footer"]]: true,
  });

  return (
    <footer className={footerClass}>
      <>
        {shortcuts && (
          <ul className={styles.shortcuts}>
            {shortcuts.map((s) => (
              <li key={s.label}>
                <Shortcut
                  label={s.label}
                  hotKeys={s.hotKeys}
                  disabled={s.disabled}
                  isActive={s.isActive}
                  onToggle={s.onToggle}
                >
                  {s.children}
                </Shortcut>
              </li>
            ))}
          </ul>
        )}
      </>

      <>{button && <Button onClick={button.onClick}>{button.text}</Button>}</>
      <>{action && <ButtonLink href={action.url}>{action.text}</ButtonLink>}</>
    </footer>
  );
};

export default Footer;
