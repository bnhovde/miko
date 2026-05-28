import React from "react";

import styles from "./ThemeToggle.module.css";

type Props = {
  isDark: boolean;
  onToggle: () => void;
};

const ThemeToggle: React.FC<Props> = ({ isDark, onToggle }) => {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className={styles.badge} data-active={!isDark}></span>
      <span className={styles.badge} data-active={isDark}></span>
    </button>
  );
};

export default ThemeToggle;
