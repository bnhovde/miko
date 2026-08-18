import React, { useState } from "react";
import classNames from "classnames";

import PopoverMenu, {
  type MenuOption,
} from "components/PopoverMenu/PopoverMenu";

import styles from "./ButtonActions.module.css";

type Props = {
  label?: string;
  options: MenuOption[];
};

/**
 * Every editor action in one menu, sitting alongside the inline shortcuts it
 * overflows. On narrow screens, where the shortcut row is hidden entirely,
 * this is the only way to reach any of them.
 */
const ButtonActions: React.FC<Props> = ({ label = "Actions", options }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonClass = classNames({
    [styles["button"]]: true,
    [styles["-expanded"]]: isExpanded,
  });

  return (
    <div className={styles.outer}>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <svg
          className={styles.icon}
          width="12"
          height="10"
          viewBox="0 0 12 10"
          fill="none"
          aria-hidden
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="0" width="12" height="1.4" rx="0.7" fill="currentColor" />
          <rect y="4.3" width="12" height="1.4" rx="0.7" fill="currentColor" />
          <rect y="8.6" width="12" height="1.4" rx="0.7" fill="currentColor" />
        </svg>
        {label}
      </button>

      <PopoverMenu
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        options={options}
        // Bottom left of the page, so the menu opens upward from that corner.
        placement={{ vertical: "top", horizontal: "left" }}
        width={240}
      />
    </div>
  );
};

export default ButtonActions;
