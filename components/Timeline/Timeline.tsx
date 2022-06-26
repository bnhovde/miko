import React, { useContext } from "react";
import { FiPlus, FiCopy, FiTrash2 } from "react-icons/fi";

import Frame from "components/Frame";

import styles from "./Timeline.module.css";
import EditorContext from "context/EditorContext";

const Timeline: React.FC = () => {
  const { state, onAddFrame, onChangeFrame } = useContext(EditorContext);

  const onFrameClickHandler = (frame: number) => {
    onChangeFrame(frame);
    // if (cmdDown) {
    //   onAddFrame(frames[frame]);
    // } else if (shiftDown) {
    //   onDeleteFrame(frame);
    // } else {
    //   onChangeFrame(frame);
    // }
  };

  const onAddFrameHandler = () => {
    // const lastFrame = frames[frames.length - 1];
    // if (shiftDown) {
    //   onAddFrame(lastFrame);
    // } else {
    onAddFrame();
    // }
  };

  return (
    <div className={styles.wrapper}>
      <p className="label">Timeline</p>
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
