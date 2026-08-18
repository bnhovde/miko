import React from "react";
import classNames from "classnames";
import { CgChevronLeftR } from "react-icons/cg";

import styles from "./Footer.module.css";
import Link from "next/link";
import Shortcut from "components/Shortcut";
import Button from "components/Button";
import ButtonLink from "components/ButtonLink";
import ButtonActions from "components/ButtonActions";
import { type MenuOption } from "components/PopoverMenu/PopoverMenu";

type Props = {
  shortcuts?: {
    children: JSX.Element[] | JSX.Element | string;
    label: string;
    hotKeys: string;
    disabled?: boolean;
    isActive?: boolean;
    onToggle?: (newState: boolean) => void;
  }[];
  /** The full set of editor actions, reachable from one menu. The inline
   *  `shortcuts` row only has room for the most-used few. */
  actions?: MenuOption[];
  action?: {
    text: string;
    url: string;
  };
  button?: {
    text: string;
    onClick: () => void;
  };
};

const Footer: React.FC<Props> = ({ shortcuts, actions, action, button }) => {
  const footerClass = classNames({
    [styles["footer"]]: true,
  });

  return (
    <footer className={footerClass}>
      <div className={styles.left}>
        {actions && actions.length > 0 && <ButtonActions options={actions} />}

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
      </div>

      <div className={styles.buttons}>
        {button && <Button onClick={button.onClick}>{button.text}</Button>}
        {action && <ButtonLink href={action.url}>{action.text}</ButtonLink>}
      </div>
    </footer>
  );
};

export default Footer;
