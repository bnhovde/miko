import React, { useEffect, useState } from "react";
import styles from "./Backdrop.module.css";

type Props = {
  isVisible: boolean;
  transparent?: boolean;
  onClick?: () => void;
};

/**
 * Full-screen backdrop overlay with enter/exit CSS animations.
 * Unmounts from DOM after the exit animation completes.
 */
const Backdrop: React.FC<Props> = ({ isVisible, transparent, onClick }) => {
  const [mounted, setMounted] = useState(isVisible);
  const [animState, setAnimState] = useState<"enter" | "visible" | "exit">(
    isVisible ? "visible" : "exit"
  );

  useEffect(() => {
    if (isVisible) {
      setMounted(true);
      setAnimState("enter");
    } else if (mounted) {
      setAnimState("exit");
    }
  }, [isVisible]);

  const handleAnimationEnd = () => {
    if (animState === "enter") {
      setAnimState("visible");
    } else if (animState === "exit") {
      setMounted(false);
    }
  };

  if (!mounted) return null;

  return (
    <span
      className={`${styles.backdrop} ${styles[`-${animState}`]}`}
      data-transparent={transparent}
      onAnimationEnd={handleAnimationEnd}
    >
      {isVisible && (
        <button aria-label="Lukk" onClick={onClick} className={styles.button} />
      )}
    </span>
  );
};

export default Backdrop;
