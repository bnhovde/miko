import React, { useEffect, useState } from "react";
import classNames from "classnames";

import Backdrop from "components/Backdrop";
import styles from "./ButtonMore.module.css";

export type Option = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  items?: { text: string; href: string; disabled?: boolean }[];
};

type Props = {
  label: string;
  disabled?: boolean;
  options?: Option[];
};

const ButtonMore: React.FC<Props> = ({ label, disabled, options = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuAnimState, setMenuAnimState] = useState<"enter" | "visible" | "exit">("exit");

  useEffect(() => {
    if (isExpanded) {
      setMenuMounted(true);
      setMenuAnimState("enter");
    } else if (menuMounted) {
      setMenuAnimState("exit");
    }
  }, [isExpanded]);

  const handleMenuAnimEnd = () => {
    if (menuAnimState === "enter") {
      setMenuAnimState("visible");
    } else if (menuAnimState === "exit") {
      setMenuMounted(false);
    }
  };

  const buttonClass = classNames({
    [styles.outer]: true,
    [styles["-disabled"]]: disabled,
    [styles["-expanded"]]: isExpanded,
  });

  const onClick = (item: Option) => {
    item.onClick?.();
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
          aria-label={label}
          aria-expanded={isExpanded}
        >
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
        </button>

        {menuMounted && (
          <div
            className={`${styles.menu} ${styles[`-${menuAnimState}`]}`}
            onAnimationEnd={handleMenuAnimEnd}
          >
            <ul>
              {options.map((item, i) => (
                <li
                  key={i}
                  className={`${styles["menu-item"]} ${menuAnimState === "enter" ? styles["-appear"] : ""}`}
                  style={{ animationDelay: `${0.1 + 0.03 * i}s` }}
                >
                  <button
                    className={styles["menu-item-button"]}
                    type="button"
                    onClick={() => onClick(item)}
                    disabled={item.disabled}
                    aria-selected={item.active}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ButtonMore;
