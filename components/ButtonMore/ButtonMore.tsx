import React, { useState } from "react";
import classNames from "classnames";

import PopoverMenu, { type MenuOption } from "components/PopoverMenu/PopoverMenu";

import styles from "./ButtonMore.module.css";

type Props = {
  label: string;
  disabled?: boolean;
  options?: MenuOption[];
};

const ButtonMore: React.FC<Props> = ({ label, disabled, options = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const buttonClass = classNames({
    [styles["outer"]]: true,
    [styles["-disabled"]]: disabled,
    [styles["-expanded"]]: isExpanded,
  });

  return (
    <div className={buttonClass}>
      <button
        type="button"
        className={styles.button}
        disabled={disabled}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={label}
      >
        <svg
          className={styles.icon}
          width="4"
          height="15"
          viewBox="0 0 3 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" />
          <circle cx="1.5" cy="7.5" r="1.5" fill="currentColor" />
          <circle cx="1.5" cy="13.5" r="1.5" fill="currentColor" />
        </svg>
        <p className="sr">{label}</p>
      </button>

      <PopoverMenu
        isOpen={isExpanded}
        onClose={() => setIsExpanded(false)}
        options={options}
      />
    </div>
  );
};

export default ButtonMore;
