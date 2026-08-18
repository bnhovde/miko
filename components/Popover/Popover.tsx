import React, { useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import classNames from "classnames";

import Backdrop from "components/Backdrop";

import styles from "./Popover.module.css";

type Placement = {
  vertical?: "top" | "bottom";
  horizontal?: "left" | "right";
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  placement?: Placement;
  width?: number;
  className?: string;
  children: React.ReactNode;
};

const Popover: React.FC<Props> = ({
  isOpen,
  onClose,
  placement = { vertical: "bottom", horizontal: "right" },
  width = 300,
  className,
  children,
}) => {
  // A menu opened with the keyboard has to be dismissable with it too.
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const outerClass = classNames(styles.outer, {
    [styles["-expanded"]]: isOpen,
  });

  const popoverClass = classNames(
    styles.popover,
    styles[`-${placement.vertical || "bottom"}`],
    styles[`-${placement.horizontal || "right"}`],
    className
  );

  return (
    <div className={outerClass}>
      <Backdrop isVisible={isOpen} onClick={onClose} transparent />
      <div className={styles.inner}>
        <CSSTransition
          in={isOpen}
          timeout={{ appear: 400, enter: 400, exit: 300 }}
          unmountOnExit
          classNames={{
            enterActive: `${popoverClass} ${styles["-enter"]}`,
            exitActive: `${popoverClass} ${styles["-exit"]}`,
            enterDone: `${popoverClass} ${styles["-visible"]}`,
            exitDone: `${popoverClass} ${styles["-hidden"]}`,
          }}
        >
          <div className={popoverClass} style={{ width }}>
            {children}
          </div>
        </CSSTransition>
      </div>
    </div>
  );
};

export default Popover;
