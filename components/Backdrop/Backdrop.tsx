import React from 'react';
import { CSSTransition } from 'react-transition-group';

import styles from './Backdrop.module.css';

type Props = {
  isVisible: boolean;
  transparent?: boolean;
  onClick?: () => void;
};

const Backdrop: React.FC<Props> = ({ isVisible, transparent, onClick }) => {
  return (
    <CSSTransition
      in={isVisible}
      unmountOnExit
      key="backdrop"
      timeout={{
        appear: 400,
        enter: 400,
        exit: 300,
      }}
      classNames={{
        enterActive: `${styles.backdrop} ${styles[`-enter`]}`,
        exitActive: `${styles.backdrop} ${styles[`-exit`]}`,
        enterDone: `${styles.backdrop} ${styles[`-visible`]}`,
        exitDone: styles[`-hidden`],
        appearActive: `${styles.backdrop} ${styles[`-enter`]}`,
        appearDone: `${styles.backdrop} ${styles[`-visible`]}`,
      }}
    >
      <span className={styles.backdrop} data-transparent={transparent}>
        {isVisible && (
          <button aria-label="Lukk" onClick={onClick} className={styles.button}></button>
        )}
      </span>
    </CSSTransition>
  );
};

export default Backdrop;
