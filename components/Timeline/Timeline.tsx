import React, { useContext, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";

import styles from "./Timeline.module.css";
import EditorContext from "context/EditorContext";
import useKeyPressed from "hooks/useKey";
import Item from "./Item";
import useDrop from "hooks/useDrop";

const Timeline: React.FC = () => {
  const { state, onAddFrame, onChangeFrame, onDeleteFrame, onReorderFrames } =
    useContext(EditorContext);

  const dropRef = useRef<HTMLUListElement>(null);
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [draggedOverIndex, setDraggedOverIndex] = useState(-1);

  const onDrop = () => {
    onReorderFrames(draggedIndex, draggedOverIndex);

    console.log(
      "draggedIndex, draggedOverIndex: ",
      draggedIndex,
      draggedOverIndex
    );
    onDragEnd();
  };

  const onDragEnd = () => {
    setDraggedIndex(-1);
    setDraggedOverIndex(-1);
  };

  const { isZoneActive } = useDrop({
    ref: dropRef,
    onDrop,
  });

  const cmdDown = useKeyPressed((ev: KeyboardEvent) => ev.metaKey);
  const shiftDown = useKeyPressed((ev: KeyboardEvent) => ev.shiftKey);

  const onlyOneFrame =
    state.spriteData?.frames && state.spriteData?.frames?.length < 2;

  const onFrameClickHandler = (frame: number) => {
    if (cmdDown) {
      onAddFrame(frame, state.spriteData?.frames[frame]);
    } else if (shiftDown && !onlyOneFrame) {
      onDeleteFrame(frame);
    } else {
      onChangeFrame(frame);
    }
  };

  const onAddFrameHandler = () => {
    onAddFrame(
      state.spriteData?.frames?.length !== undefined
        ? state.spriteData?.frames?.length - 1
        : 0
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <span className={styles.line} aria-hidden />
        <ul className={styles.timeline} ref={dropRef}>
          {state.spriteData?.frames.map((f, i) => (
            <Item
              key={`${i}-${f}`}
              order={i}
              hash={f}
              isActive={isZoneActive}
              isSelected={state.currentFrame === i}
              shiftDown={shiftDown}
              cmdDown={cmdDown}
              draggedIndex={draggedIndex}
              draggedOverIndex={draggedOverIndex}
              onDragStart={() => setDraggedIndex(i)}
              onDragOver={() => setDraggedOverIndex(i)}
              onDragEnd={onDragEnd}
              onClick={onFrameClickHandler}
            />
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
