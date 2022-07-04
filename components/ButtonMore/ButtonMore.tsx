import React, { useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import classNames from "classnames";

import Backdrop from "components/Backdrop";

import styles from "./ButtonMore.module.css";

export type Option = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  items?: {
    text: string;
    href: string;
    disabled?: boolean;
  }[];
};

type Props = {
  label: string;
  disabled?: boolean;
  options?: Option[];
};

const ButtonMore: React.FC<Props> = ({ label, disabled, options = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonClass = classNames({
    [styles["outer"]]: true,
    [styles["-disabled"]]: disabled,
    [styles["-expanded"]]: isExpanded,
  });

  const ariaProps: { "aria-label"?: string; "aria-busy"?: boolean } = {};

  if (label) {
    ariaProps["aria-label"] = label;
  }

  const onClick = (item: Option) => {
    if (item.onClick) {
      item.onClick();
    }

    setIsExpanded(false);
  };

  return (
    <div className={buttonClass}>
      <Backdrop isVisible={isExpanded} onClick={() => setIsExpanded(false)} />
      <div className={styles.inner}>
        <button
          type="button"
          className={styles.button}
          disabled={disabled}
          onClick={() => setIsExpanded(!isExpanded)}
          {...ariaProps}
        >
          <>
            <svg
              className={styles.icon}
              width="4"
              height="15"
              viewBox="0 0 3 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="1.5" cy="1.5" r="1.5" fill="black" />
              <circle cx="1.5" cy="7.5" r="1.5" fill="black" />
              <circle cx="1.5" cy="13.5" r="1.5" fill="black" />
            </svg>
            <p className="sr">{label}</p>
          </>
        </button>

        <CSSTransition
          in={isExpanded}
          timeout={{
            appear: 400,
            enter: 400,
            exit: 300,
          }}
          unmountOnExit
          classNames={{
            enterActive: `${styles.menu} ${styles[`-enter`]}`,
            exitActive: `${styles.menu} ${styles[`-exit`]}`,
            enterDone: `${styles.menu} ${styles[`-visible`]}`,
            exitDone: `${styles.menu} ${styles[`-hidden`]}`,
          }}
        >
          <div className={styles.menu}>
            <TransitionGroup component="ul" in={isExpanded}>
              {options.map((item, i) => (
                <CSSTransition
                  appear
                  key={i}
                  timeout={400}
                  classNames={{
                    appear: styles["menu-item"],
                    appearActive: `${styles["menu-item"]} ${styles[`-appear`]}`,
                  }}
                >
                  <li
                    className={styles["menu-item"]}
                    style={{ animationDelay: `${0.1 + 0.03 * i}s` }}
                  >
                    <button
                      className={styles["menu-item-button"]}
                      type="button"
                      onClick={() => onClick(item)}
                      disabled={item.disabled}
                    >
                      {item.label}
                    </button>
                  </li>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default ButtonMore;
