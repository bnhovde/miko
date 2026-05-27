import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import Popover from "components/Popover";

import styles from "./PopoverMenu.module.css";

export type MenuOption = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
};

type Placement = {
  vertical?: "top" | "bottom";
  horizontal?: "left" | "right";
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  options: MenuOption[];
  placement?: Placement;
  width?: number;
};

const PopoverMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  options,
  placement,
  width,
}) => {
  const handleClick = (option: MenuOption) => {
    if (option.onClick) {
      option.onClick();
    }
    onClose();
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement={placement} width={width}>
      <TransitionGroup component="ul" className={styles.list}>
        {options.map((option, i) => (
          <CSSTransition
            appear
            key={i}
            timeout={400}
            classNames={{
              appear: styles.item,
              appearActive: `${styles.item} ${styles["-appear"]}`,
            }}
          >
            <li
              className={styles.item}
              style={{ animationDelay: `${0.1 + 0.03 * i}s` }}
            >
              <button
                className={styles["item-button"]}
                type="button"
                onClick={() => handleClick(option)}
                disabled={option.disabled}
                aria-selected={option.active || undefined}
              >
                {option.label}
              </button>
            </li>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </Popover>
  );
};

export default PopoverMenu;
