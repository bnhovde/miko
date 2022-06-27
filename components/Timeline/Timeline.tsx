import React, { useContext } from "react";
import { FiPlus, FiCopy, FiTrash2 } from "react-icons/fi";

import Frame from "components/Frame";

import styles from "./Timeline.module.css";
import EditorContext from "context/EditorContext";
import useKeyPressed from "hooks/useKey";

const Timeline: React.FC = () => {
  const { state, onAddFrame, onChangeFrame, onDeleteFrame } =
    useContext(EditorContext);

  const cmdDown = useKeyPressed((ev: KeyboardEvent) => ev.metaKey);
  const shiftDown = useKeyPressed((ev: KeyboardEvent) => ev.shiftKey);

  const onFrameClickHandler = (frame: number) => {
    onChangeFrame(frame);
    if (cmdDown) {
      onAddFrame(state.spriteData?.frames[frame]);
    } else if (shiftDown) {
      onDeleteFrame(frame);
    } else {
      onChangeFrame(frame);
    }
  };

  const onAddFrameHandler = () => {
    const lastFrame = state.spriteData?.frames[frames.length - 1];
    if (shiftDown) {
      onAddFrame(lastFrame);
    } else {
      onAddFrame();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <span className={styles.line} aria-hidden />
        <ul className={styles.timeline}>
          {state.spriteData?.frames.map((f, i) => (
            <li
              key={`${i}-${f}`}
              className={styles.item}
              data-active={state.currentFrame === i}
            >
              <button
                className={styles.button}
                onClick={() => onFrameClickHandler(i)}
              >
                <Frame hash={f} />
              </button>
              <div
                className={styles.overlay}
                data-visible={shiftDown || cmdDown}
              >
                <>{cmdDown && <FiCopy />}</>
                <>{shiftDown && <FiTrash2 />}</>
              </div>
            </li>
          ))}
          <li className={styles.item} data-empty>
            <button
              className={styles.button}
              onClick={() => onAddFrameHandler()}
            >
              <FiPlus />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Timeline;
